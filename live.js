const { Server } = require('socket.io')
const crypto = require('crypto')
const games = new Map()
const newPin = () => { let p; do { p = String(100000 + Math.floor(Math.random() * 900000)) } while (games.has(p)); return p }
const board = g => [...g.players.values()].sort((a, b) => b.score - a.score).map((p, i) => ({ name: p.name, score: p.score, rank: i + 1, streak: p.streak, av: p.av }))
const awards = g => {
  const ps = [...g.players.values()], n = g.questions.length, out = [], used = new Set()
  const pick = (key, title, icon, score, min, detail) => {
    const c = ps.filter(p => !used.has(p.pid) && score(p) >= min).sort((a, b) => score(b) - score(a))[0]
    if (c) { used.add(c.pid); out.push({ key, title, icon, name: c.name, av: c.av, detail: detail(c) }) }
  }
  pick('streak', 'Streak Master', 'flame', p => p.maxStreak || 0, 3, p => p.maxStreak + ' in a row')
  pick('speed', 'Speed Demon', 'bolt', p => (p.correct || 0) >= 2 ? 100000 - p.tsum / p.correct : -1, 0, p => (p.tsum / p.correct / 1000).toFixed(1) + 's average')
  pick('comeback', 'Comeback Kid', 'up', p => (p.worst || 0) - (p.rank || 0), 2, p => 'climbed ' + ((p.worst || 0) - (p.rank || 0)) + ' places')
  pick('brain', 'Brain', 'bulb', p => (p.correct || 0) / n, 0.6, p => Math.round(100 * (p.correct || 0) / n) + '% correct')
  if (g.mode === 'boss') {
    if (g.lastHit && g.result === 'win') out.unshift({ key: 'lasthit', title: 'Last Hit', icon: 'star', name: g.lastHit.name, av: g.lastHit.av, detail: 'dealt the final blow (' + g.lastHit.dmg + ' damage)' })
    if (g.biggest) out.unshift({ key: 'biggest', title: 'Biggest Hit', icon: 'flame', name: g.biggest.name, av: g.biggest.av, detail: g.biggest.dmg + ' damage in one hit' })
  }
  return out
}
const BOSSES = [
  { id: 'slime', name: 'Slime King', av: '10.0.0.0.3.0' },
  { id: 'zombie', name: 'Zombie Lord', av: '11.0.0.0.2.0' },
  { id: 'robot', name: 'Robo Overlord', av: '3.0.0.0.0.2' },
  { id: 'alien', name: 'Cosmic Wizard', av: '2.6.0.0.4.0' },
  { id: 'dragon', name: 'Dragon Emperor', av: '1.0.0.0.3.0' }
]
const LOOT = {
  slime: ['Slime Crown', 'Gooey Gem', 'Jiggle Trophy', 'Swamp Shield', 'Royal Goo Star'],
  zombie: ['Grave Crown', 'Cursed Gem', 'Bone Trophy', 'Necro Shield', 'Ghost Star'],
  robot: ['Chrome Crown', 'Power Core', 'Circuit Trophy', 'Steel Shield', 'Golden Bolt Star'],
  alien: ['Star Crown', 'Comet Shard', 'Galaxy Trophy', 'Moon Shield', 'Void Star'],
  dragon: ['Flame Crown', 'Ember Gem', 'Emperor Trophy', 'Scale Shield', 'Phoenix Star']
}
const RAR_W = [55, 28, 13, 4]
const rollRar = min => { let r = Math.random() * 100, i = 0; while (i < 3 && (r -= RAR_W[i]) >= 0) i++; return Math.max(i, min || 0) }
function lootFor(g, result) {
  if (result !== 'win' || !g.boss) return null
  const names = LOOT[g.boss.id] || LOOT.dragon
  const by = {}, list = []
  for (const p of g.players.values()) {
    const min = g.lastHit && g.lastHit.name === p.name ? 3 : g.biggest && g.biggest.name === p.name ? 2 : 0
    const k = Math.floor(Math.random() * names.length)
    const it = { n: names[k], r: rollRar(min), k }
    by[p.name] = it
    list.push({ who: p.name, av: p.av, ...it })
  }
  return { by, drops: list.sort((a, b) => b.r - a.r).slice(0, 3) }
}
const phaseOf = b => b.hp > b.max * 0.66 ? 1 : b.hp > b.max * 0.33 ? 2 : 3
const bossState = g => g.mode === 'boss' && g.boss ? { id: g.boss.id, name: g.boss.name, av: g.boss.av, hp: Math.max(0, g.boss.hp), max: g.boss.max, hearts: g.hearts, phase: phaseOf(g.boss), cs: g.cs || 0 } : null
const names = g => [...g.players.values()].map(p => p.name)
const avs = g => [...g.players.values()].map(p => p.av || '')
const AV_LIM = [13, 9, 8, 6, 10, 8, 11, 9, 12, 8, 10, 11, 11, 8]
const cleanAv = v => { const a = String(v || '').split('.').map(Number); return (a.length === 6 || a.length === 14) && a.every((n, i) => Number.isInteger(n) && n >= 0 && n < AV_LIM[i]) ? a.join('.') : '' }
const norm = v => String(v).toLowerCase().replace(/[\s,]/g, '')
const matches = (v, acc) => acc.some(a => { const x = norm(a), y = norm(v); if (x === y) return true; const nx = Number(x), ny = Number(y); return x !== '' && y !== '' && Number.isFinite(nx) && Number.isFinite(ny) && Math.abs(nx - ny) < 1e-9 })
const cleanQ = x => {
  if (!x || typeof x.q !== 'string' || !x.q.trim()) return null
  const base = { q: x.q.slice(0, 300), explanation: String(x.explanation || '').slice(0, 300), hint: String(x.hint || '').slice(0, 200) }
  if (x.type === 'text') {
    const acc = (Array.isArray(x.accepted) ? x.accepted : []).map(a => String(a).slice(0, 60)).filter(a => a.trim()).slice(0, 6)
    return acc.length ? { ...base, type: 'text', accepted: acc } : null
  }
  const n = x.type === 'tf' ? 2 : 4
  if (!Array.isArray(x.options) || x.options.length !== n || !Number.isInteger(x.answer) || x.answer < 0 || x.answer >= n) return null
  return { ...base, type: x.type === 'tf' ? 'tf' : 'mc', options: x.options.map(o => String(o).slice(0, 120)), answer: x.answer }
}

module.exports = function attachLive(server, verifyTeacher) {
  const io = new Server(server, { pingInterval: 10000, pingTimeout: 40000 })
  const room = g => 'g' + g.pin
  const left = g => Math.max(1, Math.ceil((g.time * 1000 - (Date.now() - g.t0)) / 1000))
  const isJackpot = g => g.questions.length >= 3 && g.i === g.questions.length - 1
  const miss = p => { if (p.shieldOn && p.streak > 0) p.saved = true; else p.streak = 0 }
  const qpayload = (g, p) => { const q = g.questions[g.i]; return { index: g.i, total: g.questions.length, q: q.q, type: q.type, options: q.options || [], time: left(g), answered: p ? p.choice != null : false, streak: p ? p.streak : 0, jackpot: isJackpot(g), boss: bossState(g), pu: p ? p.pu : null, dbl: p ? p.doubleOn : false, shd: p ? p.shieldOn : false, hasHint: !!q.hint, hinted: p ? p.hinted : false, hint: p && p.hinted ? q.hint : '' } }

  function reveal(g) {
    if (g.state !== 'question') return
    clearTimeout(g.timer)
    g.state = 'reveal'
    const q = g.questions[g.i]
    const counts = [0, 0, 0, 0]
    for (const p of g.players.values()) { if (p.choice != null && q.type !== 'text') counts[p.choice]++; if (!p.ok) miss(p) }
    const lb = board(g)
    for (const e of lb) {
      const p = [...g.players.values()].find(x => x.name === e.name)
      e.delta = p.rank ? p.rank - e.rank : 0
      p.delta = e.delta; p.rank = e.rank; p.worst = Math.max(p.worst || 0, e.rank)
    }
    const callouts = []
    if (lb.length > 1 && g.leader && lb[0].name !== g.leader) callouts.push(lb[0].name + ' takes the lead!')
    g.leader = lb[0] ? lb[0].name : null
    const climber = lb.filter(e => e.delta >= 3).sort((a, b) => b.delta - a.delta)[0]
    if (climber) callouts.push(climber.name + ' jumped up ' + climber.delta + ' places!')
    if (lb.length > 1 && lb[0].score > 0 && lb[0].score - lb[1].score <= 150) callouts.push('Only ' + (lb[0].score - lb[1].score) + ' points between 1st and 2nd!')
    const shout = callouts.slice(0, 2)
    const dmgOf = p => g.mode === 'boss' && p.crit ? Math.round(p.gained * 1.5) : p.gained
    let bossInfo = null
    if (g.mode === 'boss') {
      const ps = [...g.players.values()]
      const hits = ps.filter(p => p.ok && p.gained > 0).sort((a, b) => (a.at || 0) - (b.at || 0))
      let total = 0
      const before = phaseOf(g.boss)
      for (const p of hits) {
        const dm = dmgOf(p)
        total += dm
        if (!g.biggest || dm > g.biggest.dmg) g.biggest = { name: p.name, av: p.av, dmg: dm }
        if (g.boss.hp > 0 && g.boss.hp - dm <= 0) g.lastHit = { name: p.name, av: p.av, dmg: dm }
        g.boss.hp -= dm
      }
      const okN = ps.filter(p => p.ok).length
      const major = ps.length >= 2 && okN / ps.length >= 0.6
      g.cs = major ? (g.cs || 0) + 1 : 0
      const special = okN === 0 ? null : isJackpot(g) ? 'orb' : (g.cs >= 3 && g.cs % 3 === 0) ? 'orb' : major ? 'beam' : null
      const struck = g.boss.hp > 0 && okN < ps.length / 2
      if (struck) g.hearts--
      g.result = g.boss.hp <= 0 ? 'win' : g.hearts <= 0 ? 'lose' : (g.i >= g.questions.length - 1 ? 'lose' : null)
      bossInfo = { ...bossState(g), phaseUp: g.boss.hp > 0 && phaseOf(g.boss) > before ? phaseOf(g.boss) : 0, struck, total, result: g.result, lastHit: g.lastHit, special, jackpot: isJackpot(g), aura: Math.min(3, Math.floor(g.cs / 2)), crits: hits.filter(p => p.crit).length, hits: hits.slice(0, 10).map(p => ({ name: p.name, av: p.av, dmg: dmgOf(p), crit: !!p.crit })), more: Math.max(0, hits.length - 10) }
    }
    for (const p of g.players.values()) {
      p.last = { answered: p.choice != null, correct: p.ok, points: p.gained, score: p.score, streak: p.streak, bonus: p.bonus, saved: p.saved, doubled: p.doubleOn && p.ok, jackpot: isJackpot(g), pu: p.pu, boss: bossInfo, dmg: dmgOf(p), crit: !!p.crit, top: lb.slice(0, 5), rank: lb.find(x => x.name === p.name).rank, delta: p.delta, callouts: shout, first: g.first }
      if (p.sid) io.to(p.sid).emit('result', p.last)
    }
    g.lastReveal = { type: q.type, answerText: q.type === 'text' ? q.accepted[0] : q.options[q.answer], correctCount: [...g.players.values()].filter(p => p.ok).length, total: g.players.size, boss: bossInfo, answer: q.answer, explanation: q.explanation || '', counts, top: lb.slice(0, 5), callouts: shout, first: g.first, last: g.i === g.questions.length - 1 }
    io.to(g.host).emit('reveal', g.lastReveal)
  }

  const readyPayload = g => ({ index: g.i, total: g.questions.length, jackpot: isJackpot(g), boss: bossState(g), ms: Math.max(300, 3000 - (Date.now() - (g.readyAt || Date.now()))) })

  function ask(g) {
    g.state = 'ready'
    g.readyAt = Date.now()
    io.to(room(g)).emit('ready', readyPayload(g))
    g.timer = setTimeout(() => startQ(g), 3000)
  }

  function startQ(g) {
    g.state = 'question'
    g.t0 = Date.now()
    g.first = null
    for (const p of g.players.values()) { p.choice = null; p.gained = 0; p.bonus = 0; p.last = null; p.hinted = false; p.doubleOn = false; p.saved = false; p.shieldOn = false; p.ok = false; p.crit = false }
    io.to(g.host).emit('question', qpayload(g, null))
    for (const p of g.players.values()) if (p.sid) io.to(p.sid).emit('question', qpayload(g, p))
    g.timer = setTimeout(() => reveal(g), g.time * 1000 + 500)
  }

  io.on('connection', socket => {
    let game = null, isHost = false, me = null

    socket.on('host:create', async (d, ack) => {
      try {
        if (!(await verifyTeacher(d && d.teacher_id))) return ack({ ok: false, error: 'Teachers only.' })
        const qs = (d.questions || []).slice(0, 30).map(cleanQ).filter(Boolean)
        if (!qs.length) return ack({ ok: false, error: 'No valid questions.' })
        game = { pin: newPin(), host: socket.id, teacher: d.teacher_id, questions: qs, time: Math.min(60, Math.max(5, +d.time || 20)), players: new Map(), state: 'lobby', i: 0, created: Date.now(), mode: d.mode === 'boss' ? 'boss' : 'classic', diff: ['easy', 'normal', 'hard'].includes(d.diff) ? d.diff : 'normal' }
        games.set(game.pin, game)
        isHost = true
        socket.join(room(game))
        ack({ ok: true, pin: game.pin })
      } catch (e) { ack({ ok: false, error: 'Could not create game.' }) }
    })

    socket.on('host:rejoin', async (d, ack) => {
      const g = games.get(String((d && d.pin) || ''))
      if (!g || g.teacher !== d.teacher_id || !(await verifyTeacher(d.teacher_id))) return ack({ ok: false })
      clearTimeout(g.hostTimer)
      g.host = socket.id; game = g; isHost = true
      socket.join(room(g))
      ack({ ok: true })
      socket.emit('lobby', names(g), avs(g))
      if (g.state === 'question') {
        socket.emit('question', qpayload(g, null))
        const all = [...g.players.values()]
        socket.emit('answered', { count: all.filter(x => x.choice != null).length, total: all.length })
      } else if (g.state === 'reveal' && g.lastReveal) socket.emit('reveal', g.lastReveal)
      else if (g.state === 'ready') socket.emit('ready', readyPayload(g))
    })

    socket.on('host:sync', () => { if (isHost && game && game.state === 'lobby') socket.emit('lobby', names(game), avs(game)) })

    socket.on('host:lock', d => { if (isHost) game.locked = !!(d && d.locked) })

    socket.on('host:kick', d => {
      if (!isHost || game.state !== 'lobby') return
      for (const [pid, p] of game.players) {
        if (p.name === (d && d.name)) {
          if (p.sid) io.to(p.sid).emit('ended', 'You were removed by the teacher.')
          game.players.delete(pid)
          io.to(game.host).emit('lobby', names(game), avs(game))
          break
        }
      }
    })

    socket.on('host:start', (d, ack) => {
      const reply = r => { if (typeof ack === 'function') ack(r) }
      if (!isHost || !game) return reply({ ok: false, error: 'This game is no longer running (the server may have restarted). Create a new game.' })
      if (game.state !== 'lobby') return reply({ ok: false, error: 'The game already started.' })
      if (!game.players.size) return reply({ ok: false, error: 'Wait for at least one student to join.' })
      if (game.mode === 'boss') {
        const tg = { easy: 0.5, normal: 0.7, hard: 0.9 }[game.diff]
        const b = BOSSES[Math.floor(Math.random() * BOSSES.length)]
        const max = Math.max(500, Math.round(game.players.size * game.questions.length * 750 * tg / 100) * 100)
        game.boss = { ...b, max, hp: max }
        game.hearts = 3
        game.result = null
        game.lastHit = null
        game.biggest = null
        game.cs = 0
      }
      ask(game)
      reply({ ok: true })
    })

    socket.on('host:next', () => {
      if (!isHost) return
      if (game.state === 'question') return reveal(game)
      if (game.state !== 'reveal') return
      if (game.i >= game.questions.length - 1 || game.result) {
        game.state = 'ended'
        const fres = game.mode === 'boss' ? (game.result || (game.boss && game.boss.hp <= 0 ? 'win' : 'lose')) : null
        io.to(room(game)).emit('final', board(game), awards(game), game.mode === 'boss' ? { ...bossState(game), result: fres, lastHit: game.lastHit, biggest: game.biggest, loot: lootFor(game, fres) } : null)
        games.delete(game.pin)
      } else { game.i++; ask(game) }
    })

    socket.on('player:join', (d, ack) => {
      const g = games.get(String((d && d.pin) || '').trim())
      const name = String((d && d.name) || '').replace(/[<>]/g, '').trim().slice(0, 20)
      if (!g) return ack({ ok: false, error: 'Game not found. Check the code.' })
      if (g.state !== 'lobby') return ack({ ok: false, error: 'This game already started.' })
      if (g.locked) return ack({ ok: false, error: 'The teacher locked this game.' })
      if (!name) return ack({ ok: false, error: 'Enter a name.' })
      if ([...g.players.values()].some(p => p.name.toLowerCase() === name.toLowerCase())) return ack({ ok: false, error: 'That name is taken.' })
      if (g.players.size >= 100) return ack({ ok: false, error: 'Game is full.' })
      const pid = crypto.randomBytes(8).toString('hex')
      g.players.set(pid, { pid, sid: socket.id, name, av: cleanAv(d.av), score: 0, choice: null, gained: 0, streak: 0, bonus: 0, last: null, pu: { double: 1, shield: 1, hint: 1 }, hinted: false, doubleOn: false, saved: false, shieldOn: false, ok: false })
      game = g; me = pid
      socket.join(room(g))
      io.to(g.host).emit('lobby', names(g), avs(g))
      ack({ ok: true, name, pid, pin: g.pin })
    })

    socket.on('player:rejoin', (d, ack) => {
      const g = games.get(String((d && d.pin) || ''))
      const p = g && g.players.get(d.pid)
      if (!p) return ack({ ok: false })
      clearTimeout(p.dropTimer)
      p.sid = socket.id; game = g; me = p.pid
      socket.join(room(g))
      ack({ ok: true, name: p.name })
      if (g.state === 'lobby') io.to(g.host).emit('lobby', names(g), avs(g))
      if (g.state === 'question') socket.emit('question', qpayload(g, p))
      else if (g.state === 'reveal' && p.last) socket.emit('result', p.last)
      else if (g.state === 'ready') socket.emit('ready', readyPayload(g))
    })

    socket.on('player:answer', (d, ack) => {
      const p = game && me && game.players.get(me)
      if (!p || game.state !== 'question' || p.choice != null || !d) return ack && ack(false)
      const q = game.questions[game.i]
      let val, correct
      if (q.type === 'text') {
        val = String(d.text || '').trim().slice(0, 60)
        if (!val) return ack && ack(false)
        correct = matches(val, q.accepted)
      } else {
        if (!Number.isInteger(d.choice) || d.choice < 0 || d.choice >= q.options.length) return ack && ack(false)
        val = d.choice
        correct = val === q.answer
      }
      p.choice = val
      p.ok = correct
      p.at = Date.now() - game.t0
      if (correct) {
        const frac = Math.min((Date.now() - game.t0) / 1000 / game.time, 1)
        p.streak++
        if (!game.first) game.first = { name: p.name, av: p.av, ms: Date.now() - game.t0 }
        p.correct = (p.correct || 0) + 1
        p.tsum = (p.tsum || 0) + (Date.now() - game.t0)
        p.maxStreak = Math.max(p.maxStreak || 0, p.streak)
        p.bonus = Math.min(p.streak - 1, 5) * 100
        let pts = Math.round(1000 * (1 - frac / 2) * (p.hinted ? 0.7 : 1)) + p.bonus
        if (p.doubleOn) pts *= 2
        if (isJackpot(game)) pts *= 2
        p.gained = pts
        p.crit = frac <= 0.25
        p.score += pts
      }
      if (ack) ack(true)
      const all = [...game.players.values()]
      io.to(game.host).emit('answered', { count: all.filter(x => x.choice != null).length, total: all.length, name: p.name, av: p.av })
      const online = all.filter(x => x.sid)
      if (online.length && online.every(x => x.choice != null)) reveal(game)
    })

    socket.on('player:power', (d, ack) => {
      const p = game && me && game.players.get(me)
      const t = d && d.type
      const ok = p && game.state === 'question' && ((t === 'double' && p.choice == null && p.pu.double > 0 && !p.doubleOn) || (t === 'shield' && p.pu.shield > 0 && !p.shieldOn && p.streak > 0))
      if (!ok) return ack && ack({ ok: false })
      if (t === 'double') { p.pu.double--; p.doubleOn = true } else { p.pu.shield--; p.shieldOn = true }
      if (ack) ack({ ok: true, pu: p.pu })
    })

    socket.on('player:hint', (d, ack) => {
      const p = game && me && game.players.get(me)
      const q = game && game.questions[game.i]
      if (!p || game.state !== 'question' || p.choice != null || p.hinted || p.pu.hint < 1 || !q.hint) return ack && ack({ ok: false })
      p.pu.hint--; p.hinted = true
      if (ack) ack({ ok: true, hint: q.hint, pu: p.pu })
    })

    socket.on('disconnect', () => {
      const g = game
      if (!g) return
      if (isHost) {
        if (g.host !== socket.id) return
        g.hostTimer = setTimeout(() => {
          clearTimeout(g.timer)
          io.to(room(g)).emit('ended', 'The teacher left the game.')
          games.delete(g.pin)
        }, 60000)
        return
      }
      const p = me && g.players.get(me)
      if (!p || p.sid !== socket.id) return
      p.sid = null
      if (g.state === 'lobby') {
        // keep the student in the lobby for a while so a short connection drop does not remove them
        clearTimeout(p.dropTimer)
        p.dropTimer = setTimeout(() => {
          if (g.players.get(p.pid) === p && !p.sid && g.state === 'lobby') { g.players.delete(p.pid); io.to(g.host).emit('lobby', names(g), avs(g)) }
        }, 120000)
      }
    })
  })

  setInterval(() => { for (const [k, g] of games) if (Date.now() - g.created > 3 * 3600 * 1000) games.delete(k) }, 600000).unref()
}
