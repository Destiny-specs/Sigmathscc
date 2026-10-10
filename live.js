const { Server } = require('socket.io')
const crypto = require('crypto')
const games = new Map()
const newPin = () => { let p; do { p = String(100000 + Math.floor(Math.random() * 900000)) } while (games.has(p)); return p }
const board = g => [...g.players.values()].sort((a, b) => b.score - a.score).map((p, i) => ({ name: p.name, score: p.score, rank: i + 1, streak: p.streak, av: p.av }))
const names = g => [...g.players.values()].map(p => p.name)
const avs = g => [...g.players.values()].map(p => p.av || '')
const cleanAv = v => { const a = String(v || '').split('.').map(Number); const lim = [13, 9, 8, 6, 10, 8]; return a.length === 6 && a.every((n, i) => Number.isInteger(n) && n >= 0 && n < lim[i]) ? a.join('.') : '' }
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
  const io = new Server(server)
  const room = g => 'g' + g.pin
  const left = g => Math.max(1, Math.ceil((g.time * 1000 - (Date.now() - g.t0)) / 1000))
  const isJackpot = g => g.questions.length >= 3 && g.i === g.questions.length - 1
  const miss = p => { if (p.shieldOn && p.streak > 0) p.saved = true; else p.streak = 0 }
  const qpayload = (g, p) => { const q = g.questions[g.i]; return { index: g.i, total: g.questions.length, q: q.q, type: q.type, options: q.options || [], time: left(g), answered: p ? p.choice != null : false, streak: p ? p.streak : 0, jackpot: isJackpot(g), pu: p ? p.pu : null, dbl: p ? p.doubleOn : false, shd: p ? p.shieldOn : false, hasHint: !!q.hint, hinted: p ? p.hinted : false, hint: p && p.hinted ? q.hint : '' } }

  function reveal(g) {
    if (g.state !== 'question') return
    clearTimeout(g.timer)
    g.state = 'reveal'
    const q = g.questions[g.i]
    const counts = [0, 0, 0, 0]
    for (const p of g.players.values()) { if (p.choice != null && q.type !== 'text') counts[p.choice]++; if (!p.ok) miss(p) }
    const lb = board(g)
    for (const p of g.players.values()) {
      p.last = { answered: p.choice != null, correct: p.ok, points: p.gained, score: p.score, streak: p.streak, bonus: p.bonus, saved: p.saved, doubled: p.doubleOn && p.ok, jackpot: isJackpot(g), pu: p.pu, top: lb.slice(0, 5), rank: lb.find(x => x.name === p.name).rank }
      if (p.sid) io.to(p.sid).emit('result', p.last)
    }
    g.lastReveal = { type: q.type, answerText: q.type === 'text' ? q.accepted[0] : q.options[q.answer], correctCount: [...g.players.values()].filter(p => p.ok).length, total: g.players.size, answer: q.answer, explanation: q.explanation || '', counts, top: lb.slice(0, 5), last: g.i === g.questions.length - 1 }
    io.to(g.host).emit('reveal', g.lastReveal)
  }

  function ask(g) {
    g.state = 'question'
    g.t0 = Date.now()
    for (const p of g.players.values()) { p.choice = null; p.gained = 0; p.bonus = 0; p.last = null; p.hinted = false; p.doubleOn = false; p.saved = false; p.shieldOn = false; p.ok = false }
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
        game = { pin: newPin(), host: socket.id, teacher: d.teacher_id, questions: qs, time: Math.min(60, Math.max(5, +d.time || 20)), players: new Map(), state: 'lobby', i: 0, created: Date.now() }
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
    })

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

    socket.on('host:start', () => { if (isHost && game.state === 'lobby' && game.players.size) ask(game) })

    socket.on('host:next', () => {
      if (!isHost) return
      if (game.state === 'question') return reveal(game)
      if (game.state !== 'reveal') return
      if (game.i >= game.questions.length - 1) {
        game.state = 'ended'
        io.to(room(game)).emit('final', board(game))
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
      p.sid = socket.id; game = g; me = p.pid
      socket.join(room(g))
      ack({ ok: true, name: p.name })
      if (g.state === 'question') socket.emit('question', qpayload(g, p))
      else if (g.state === 'reveal' && p.last) socket.emit('result', p.last)
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
      if (correct) {
        const frac = Math.min((Date.now() - game.t0) / 1000 / game.time, 1)
        p.streak++
        p.bonus = Math.min(p.streak - 1, 5) * 100
        let pts = Math.round(1000 * (1 - frac / 2) * (p.hinted ? 0.7 : 1)) + p.bonus
        if (p.doubleOn) pts *= 2
        if (isJackpot(game)) pts *= 2
        p.gained = pts
        p.score += pts
      }
      if (ack) ack(true)
      const all = [...game.players.values()]
      io.to(game.host).emit('answered', { count: all.filter(x => x.choice != null).length, total: all.length })
      if (all.every(x => x.choice != null)) reveal(game)
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
      if (g.state === 'lobby') { g.players.delete(me); io.to(g.host).emit('lobby', names(g), avs(g)) } else p.sid = null
    })
  })

  setInterval(() => { for (const [k, g] of games) if (Date.now() - g.created > 3 * 3600 * 1000) games.delete(k) }, 600000).unref()
}
