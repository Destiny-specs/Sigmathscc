const { Server } = require('socket.io')
const games = new Map()
const newPin = () => { let p; do { p = String(100000 + Math.floor(Math.random() * 900000)) } while (games.has(p)); return p }
const board = g => [...g.players.values()].sort((a, b) => b.score - a.score).map((p, i) => ({ name: p.name, score: p.score, rank: i + 1 }))

module.exports = function attachLive(server, verifyTeacher) {
  const io = new Server(server)
  const room = g => 'g' + g.pin

  function reveal(g) {
    if (g.state !== 'question') return
    clearTimeout(g.timer)
    g.state = 'reveal'
    const q = g.questions[g.i]
    const counts = [0, 0, 0, 0]
    for (const p of g.players.values()) if (p.choice != null) counts[p.choice]++
    const lb = board(g)
    for (const [sid, p] of g.players) {
      io.to(sid).emit('result', { answered: p.choice != null, correct: p.choice === q.answer, points: p.gained, score: p.score, rank: lb.find(x => x.name === p.name).rank })
    }
    io.to(g.host).emit('reveal', { answer: q.answer, explanation: q.explanation || '', counts, top: lb.slice(0, 5), last: g.i === g.questions.length - 1 })
  }

  function ask(g) {
    g.state = 'question'
    g.t0 = Date.now()
    for (const p of g.players.values()) { p.choice = null; p.gained = 0 }
    const q = g.questions[g.i]
    io.to(room(g)).emit('question', { index: g.i, total: g.questions.length, q: q.q, options: q.options, time: g.time })
    g.timer = setTimeout(() => reveal(g), g.time * 1000 + 500)
  }

  io.on('connection', socket => {
    let game = null, isHost = false

    socket.on('host:create', async (d, ack) => {
      try {
        if (!(await verifyTeacher(d && d.teacher_id))) return ack({ ok: false, error: 'Teachers only.' })
        const qs = (d.questions || []).slice(0, 30).filter(x => x && typeof x.q === 'string' && Array.isArray(x.options) && x.options.length === 4 && Number.isInteger(x.answer) && x.answer >= 0 && x.answer <= 3)
          .map(x => ({ q: x.q.slice(0, 300), options: x.options.map(o => String(o).slice(0, 120)), answer: x.answer, explanation: String(x.explanation || '').slice(0, 300) }))
        if (!qs.length) return ack({ ok: false, error: 'No valid questions.' })
        game = { pin: newPin(), host: socket.id, questions: qs, time: Math.min(60, Math.max(5, +d.time || 20)), players: new Map(), state: 'lobby', i: 0, created: Date.now() }
        games.set(game.pin, game)
        isHost = true
        socket.join(room(game))
        ack({ ok: true, pin: game.pin })
      } catch (e) { ack({ ok: false, error: 'Could not create game.' }) }
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
      g.players.set(socket.id, { name, score: 0, choice: null, gained: 0 })
      game = g
      socket.join(room(g))
      io.to(g.host).emit('lobby', [...g.players.values()].map(p => p.name))
      ack({ ok: true, name })
    })

    socket.on('player:answer', (d, ack) => {
      const p = game && game.players.get(socket.id)
      if (!p || game.state !== 'question' || p.choice != null || !Number.isInteger(d && d.choice) || d.choice < 0 || d.choice > 3) return
      p.choice = d.choice
      if (d.choice === game.questions[game.i].answer) {
        const frac = Math.min((Date.now() - game.t0) / 1000 / game.time, 1)
        p.gained = Math.round(1000 * (1 - frac / 2))
        p.score += p.gained
      }
      if (ack) ack(true)
      const all = [...game.players.values()]
      io.to(game.host).emit('answered', { count: all.filter(x => x.choice != null).length, total: all.length })
      if (all.every(x => x.choice != null)) reveal(game)
    })

    socket.on('disconnect', () => {
      if (!game) return
      if (isHost) {
        clearTimeout(game.timer)
        io.to(room(game)).emit('ended', 'The teacher left the game.')
        games.delete(game.pin)
      } else if (game.state === 'lobby') {
        game.players.delete(socket.id)
        io.to(game.host).emit('lobby', [...game.players.values()].map(p => p.name))
      }
    })
  })

  setInterval(() => { for (const [k, g] of games) if (Date.now() - g.created > 3 * 3600 * 1000) games.delete(k) }, 600000).unref()
}