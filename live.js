const { Server } = require('socket.io')
const crypto = require('crypto')
const games = new Map()
const newPin = () => { let p; do { p = String(100000 + Math.floor(Math.random() * 900000)) } while (games.has(p)); return p }
const board = g => [...g.players.values()].sort((a, b) => b.score - a.score).map((p, i) => ({ name: p.name, score: p.score, rank: i + 1, streak: p.streak }))
const names = g => [...g.players.values()].map(p => p.name)

module.exports = function attachLive(server, verifyTeacher) {
  const io = new Server(server)
  const room = g => 'g' + g.pin
  const left = g => Math.max(1, Math.ceil((g.time * 1000 - (Date.now() - g.t0)) / 1000))
  const qpayload = (g, p) => { const q = g.questions[g.i]; return { index: g.i, total: g.questions.length, q: q.q, options: q.options, time: left(g), answered: p ? p.choice != null : false, streak: p ? p.streak : 0 } }

  function reveal(g) {
    if (g.state !== 'question') return
    clearTimeout(g.timer)
    g.state = 'reveal'
    const q = g.questions[g.i]
    const counts = [0, 0, 0, 0]
    for (const p of g.players.values()) { if (p.choice != null) counts[p.choice]++; else p.streak = 0 }
    const lb = board(g)
    for (const p of g.players.values()) {
      p.last = { answered: p.choice != null, correct: p.choice === q.answer, points: p.gained, score: p.score, streak: p.streak, bonus: p.bonus, rank: lb.find(x => x.name === p.name).rank }
      if (p.sid) io.to(p.sid).emit('result', p.last)
    }
    g.lastReveal = { answer: q.answer, explanation: q.explanation || '', counts, top: lb.slice(0, 5), last: g.i === g.questions.length - 1 }
    io.to(g.host).emit('reveal', g.lastReveal)
  }

  function ask(g) {
    g.state = 'question'
    g.t0 = Date.now()
    for (const p of g.players.values()) { p.choice = null; p.gained = 0; p.bonus = 0; p.last = null }
    io.to(room(g)).emit('question', qpayload(g, null))
    g.timer = setTimeout(() => reveal(g), g.time * 1000 + 500)
  }

  io.on('connection', socket => {
    let game = null, isHost = false, me = null

    socket.on('host:create', async (d, ack) => {
      try {
        if (!(await verifyTeacher(d && d.teacher_id))) return ack({ ok: false, error: 'Teachers only.' })
        const qs = (d.questions || []).slice(0, 30).filter(x => x && typeof x.q === 'string' && Array.isArray(x.options) && x.options.length === 4 && Number.isInteger(x.answer) && x.answer >= 0 && x.answer <= 3)
          .map(x => ({ q: x.q.slice(0, 300), options: x.options.map(o => String(o).slice(0, 120)), answer: x.answer, explanation: String(x.explanation || '').slice(0, 300) }))
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
      socket.emit('lobby', names(g))
      if (g.state === 'question') {
        socket.emit('question', qpayload(g, null))
        const all = [...g.players.values()]
        socket.emit('answered', { count: all.filter(x => x.choice != null).length, total: all.length })
      } else if (g.state === 'reveal' && g.lastReveal) socket.emit('reveal', g.lastReveal)
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
      if (!name) return ack({ ok: false, error: 'Enter a name.' })
      if ([...g.players.values()].some(p => p.name.toLowerCase() === name.toLowerCase())) return ack({ ok: false, error: 'That name is taken.' })
      if (g.players.size >= 100) return ack({ ok: false, error: 'Game is full.' })
      const pid = crypto.randomBytes(8).toString('hex')
      g.players.set(pid, { pid, sid: socket.id, name, score: 0, choice: null, gained: 0, streak: 0, bonus: 0, last: null })
      game = g; me = pid
      socket.join(room(g))
      io.to(g.host).emit('lobby', names(g))
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
      const ok = p && game.state === 'question' && p.choice == null && Number.isInteger(d && d.choice) && d.choice >= 0 && d.choice <= 3
      if (!ok) return ack && ack(false)
      p.choice = d.choice
      if (d.choice === game.questions[game.i].answer) {
        const frac = Math.min((Date.now() - game.t0) / 1000 / game.time, 1)
        p.streak++
        p.bonus = Math.min(p.streak - 1, 5) * 100
        p.gained = Math.round(1000 * (1 - frac / 2)) + p.bonus
        p.score += p.gained
      } else p.streak = 0
      if (ack) ack(true)
      const all = [...game.players.values()]
      io.to(game.host).emit('answered', { count: all.filter(x => x.choice != null).length, total: all.length })
      if (all.every(x => x.choice != null)) reveal(game)
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
      if (g.state === 'lobby') { g.players.delete(me); io.to(g.host).emit('lobby', names(g)) } else p.sid = null
    })
  })

  setInterval(() => { for (const [k, g] of games) if (Date.now() - g.created > 3 * 3600 * 1000) games.delete(k) }, 600000).unref()
}