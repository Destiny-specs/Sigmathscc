const express = require('express')
const app = express()
const path = require('path')
const supabase = require('./supabase')
const bcrypt = require('bcryptjs')
const SALT_ROUNDS = 10

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public', 'html')))

// ============ redirect old URLs to new folder structure ============
app.get('/quizzes.html', (req, res) => {
  res.redirect('/quizzes/');
});
app.get('/lessons.html', (req, res) => {
  res.redirect('/lessons/');
});
// =======================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'))
})

// Sign up
const TEACHER_ACCESS_CODE = process.env.TEACHER_ACCESS_CODE
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function isValidCustomCode(code) {
  // 4-10 chars, letters and numbers only (matches the charset used for random codes)
  return /^[A-Z0-9]{4,10}$/.test(code)
}

app.post('/signup', async (req, res) => {
  try {
    const { full_name, email, password, role, class_code, teacher_code } = req.body
    if (!full_name || !email || !password || !role)
      return res.json({ success: false, message: 'All fields are required.' })

    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).single()
    if (existing) return res.json({ success: false, message: 'Email already registered.' })

    if (role === 'student') {
      if (!class_code) return res.json({ success: false, message: 'Class code is required.' })
      const { data: classData } = await supabase
        .from('classes').select('id').eq('class_code', class_code).single()
      if (!classData) return res.json({ success: false, message: 'Invalid class code.' })
    }

    if (role === 'teacher') {
      if (!teacher_code || teacher_code !== TEACHER_ACCESS_CODE)
        return res.json({ success: false, message: 'Invalid teacher access code.' })
    }

    if (role === 'admin') {
      if (!teacher_code || teacher_code !== ADMIN_ACCESS_CODE)
        return res.json({ success: false, message: 'Invalid admin access code.' })
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    let newClassCode = role === 'student' ? class_code : null

    if (role === 'teacher') {
      let code, isUnique = false
      while (!isUnique) {
        code = generateClassCode()
        const { data: clash } = await supabase.from('classes').select('id').eq('class_code', code).single()
        if (!clash) isUnique = true
      }
      newClassCode = code
    }

    const { data, error } = await supabase
      .from('users').insert([{ full_name, email, password: hashed, role, class_code: newClassCode }]).select().single()
    if (error) return res.json({ success: false, message: 'Could not create account. Please try again.' })

    if (role === 'teacher') {
      await supabase.from('classes').insert([{ class_code: newClassCode, teacher_id: data.id, class_name: full_name + "'s Class" }])
    }

    const { password: _, ...safeUser } = data
    res.json({ success: true, user: safeUser })
  } catch (err) {
    console.error('SIGNUP ERROR:', err.message)
    res.json({ success: false, message: 'Something went wrong. Please try again.' })
  }
})

// Log in
app.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password || !role)
      return res.json({ success: false, message: 'All fields are required.' })

    const { data, error } = await supabase
      .from('users').select('*').eq('email', email).eq('role', role).single()
    if (error || !data) return res.json({ success: false, message: 'Invalid email, password, or role.' })

    const match = await bcrypt.compare(password, data.password)
    if (!match) return res.json({ success: false, message: 'Invalid email, password, or role.' })

    const { password: _, ...safeUser } = data
    res.json({ success: true, user: safeUser })
  } catch (err) {
    console.error('LOGIN ERROR:', err.message)
    res.json({ success: false, message: 'Something went wrong. Please try again.' })
  }
})

// Regenerate (or set a custom) class code
app.post('/regenerate-class-code', async (req, res) => {
  try {
    const { teacher_id, custom_code } = req.body
    if (!teacher_id) return res.json({ success: false, message: 'Missing teacher ID.' })

    const { data: teacher } = await supabase.from('users').select('*').eq('id', teacher_id).eq('role', 'teacher').single()
    if (!teacher) return res.json({ success: false, message: 'Teacher not found.' })

    let code
    if (custom_code) {
      code = custom_code.trim().toUpperCase()
      if (!isValidCustomCode(code))
        return res.json({ success: false, message: 'Class code must be 4-10 letters/numbers only.' })

      const { data: clash } = await supabase.from('classes').select('id').eq('class_code', code).neq('teacher_id', teacher_id).single()
      if (clash) return res.json({ success: false, message: 'That class code is already taken. Try another.' })
    } else {
      let isUnique = false
      while (!isUnique) {
        code = generateClassCode()
        const { data: clash } = await supabase.from('classes').select('id').eq('class_code', code).single()
        if (!clash) isUnique = true
      }
    }

    const { data: classUpdateData, error: classUpdateError } = await supabase
      .from('classes').update({ class_code: code }).eq('teacher_id', teacher_id).select()
    if (classUpdateError) return res.json({ success: false, message: 'Failed to update class code.' })

    await supabase.from('users').update({ class_code: code }).eq('id', teacher_id)

    if (!classUpdateData || classUpdateData.length === 0) {
      const { error: insertError } = await supabase
        .from('classes').insert([{ class_code: code, teacher_id, class_name: teacher.full_name + "'s Class" }])
      if (insertError) return res.json({ success: false, message: 'Failed to create class record.' })
    }

    res.json({ success: true, class_code: code })
  } catch (err) {
    console.error('REGEN CODE ERROR:', err.message)
    res.json({ success: false, message: 'Something went wrong. Please try again.' })
  }
})

// Teacher data
app.get('/teacher-data', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) return res.json({ students: [], avgScore: null })

    const { data: teacher } = await supabase.from('users').select('*').eq('email', email).single()
    if (!teacher) return res.json({ students: [], avgScore: null })

    const { data: classData } = await supabase.from('classes').select('*').eq('teacher_id', teacher.id).single()
    const class_code = classData?.class_code || null
    const { data: students } = await supabase.from('users').select('*').eq('role', 'student').eq('class_code', class_code)

    let avgScore = null
    if (students && students.length > 0) {
      const studentIds = students.map(s => s.id)
      const { data: quizzes } = await supabase.from('quiz_results').select('score, total').in('user_id', studentIds)
      if (quizzes && quizzes.length > 0) {
        const totalPct = quizzes.reduce((sum, q) => sum + (q.score / q.total * 100), 0)
        avgScore = Math.round(totalPct / quizzes.length)
      }
    }

    const safeStudents = (students || []).map(({ password, ...rest }) => rest)
    res.json({ class_code, students: safeStudents, avgScore })
  } catch (err) {
    console.error('TEACHER DATA ERROR:', err.message)
    res.json({ students: [], avgScore: null })
  }
})

// Teacher — single student detail
app.get('/teacher-student-detail', async (req, res) => {
  try {
    const { teacher_id, student_id } = req.query
    if (!teacher_id || !student_id) return res.status(400).json({ error: 'Missing parameters.' })

    const { data: teacher } = await supabase.from('users').select('class_code').eq('id', teacher_id).eq('role', 'teacher').single()
    const { data: student } = await supabase.from('users').select('*').eq('id', student_id).eq('role', 'student').single()

    if (!teacher || !student || student.class_code !== teacher.class_code)
      return res.status(403).json({ error: 'Not authorized to view this student.' })

    const { data: quizzes } = await supabase
      .from('quiz_results').select('*').eq('user_id', student_id).order('created_at', { ascending: false })

    const totalQuizzes = quizzes ? quizzes.length : 0
    const avgScore = totalQuizzes > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.score / q.total * 100), 0) / totalQuizzes) : 0

    const { password: _, ...safeStudent } = student
    res.json({
      student: safeStudent,
      totalQuizzes,
      avgScore,
      recentQuizzes: (quizzes || []).slice(0, 10),
      // Oldest-to-newest, for plotting a score trend chart
      history: (quizzes || []).slice().reverse()
    })
  } catch (err) {
    console.error('STUDENT DETAIL ERROR:', err.message)
    res.status(500).json({ error: 'Failed to load student data.' })
  }
})

// Remove a student from the teacher's class (student keeps their account, just leaves the class)
app.post('/remove-student', async (req, res) => {
  try {
    const { teacher_id, student_id } = req.body
    if (!teacher_id || !student_id) return res.json({ success: false, message: 'Missing parameters.' })

    const { data: teacher } = await supabase.from('users').select('class_code').eq('id', teacher_id).eq('role', 'teacher').single()
    const { data: student } = await supabase.from('users').select('class_code').eq('id', student_id).eq('role', 'student').single()

    if (!teacher || !student || student.class_code !== teacher.class_code)
      return res.status(403).json({ success: false, message: 'Not authorized to remove this student.' })

    const { error } = await supabase.from('users').update({ class_code: null }).eq('id', student_id)
    if (error) throw error

    res.json({ success: true })
  } catch (err) {
    console.error('REMOVE STUDENT ERROR:', err.message)
    res.json({ success: false, message: 'Failed to remove student.' })
  }
})

// Mute/unmute a student in class chat
app.post('/toggle-mute', async (req, res) => {
  try {
    const { teacher_id, admin_id, student_id } = req.body
    if ((!teacher_id && !admin_id) || !student_id) return res.json({ success: false, message: 'Missing parameters.' })

    const { data: student } = await supabase.from('users').select('class_code, is_muted').eq('id', student_id).eq('role', 'student').single()
    if (!student) return res.status(403).json({ success: false, message: 'Not authorized to moderate this student.' })

    let authorized = false
    if (admin_id) {
      authorized = await requireAdmin(admin_id)
    } else if (teacher_id) {
      const { data: teacher } = await supabase.from('users').select('class_code').eq('id', teacher_id).eq('role', 'teacher').single()
      authorized = !!teacher && student.class_code === teacher.class_code
    }
    if (!authorized) return res.status(403).json({ success: false, message: 'Not authorized to moderate this student.' })

    const newMuted = !student.is_muted
    const { error } = await supabase.from('users').update({ is_muted: newMuted }).eq('id', student_id)
    if (error) throw error

    res.json({ success: true, is_muted: newMuted })
  } catch (err) {
    console.error('TOGGLE MUTE ERROR:', err.message)
    res.json({ success: false, message: 'Failed to update mute status.' })
  }
})

// Teacher — topic breakdown
app.get('/teacher-topic-breakdown', async (req, res) => {
  try {
    const { teacher_id } = req.query
    if (!teacher_id) return res.json([])

    const { data: teacher } = await supabase.from('users').select('class_code').eq('id', teacher_id).eq('role', 'teacher').single()
    if (!teacher?.class_code) return res.json([])

    const { data: students } = await supabase.from('users').select('id').eq('role', 'student').eq('class_code', teacher.class_code)
    if (!students || students.length === 0) return res.json([])

    const { data: quizzes } = await supabase.from('quiz_results').select('topic, score, total').in('user_id', students.map(s => s.id))
    if (!quizzes || quizzes.length === 0) return res.json([])

    const byTopic = {}
    quizzes.forEach(q => {
      if (!byTopic[q.topic]) byTopic[q.topic] = { topic: q.topic, totalPct: 0, count: 0 }
      byTopic[q.topic].totalPct += (q.score / q.total) * 100
      byTopic[q.topic].count += 1
    })

    const result = Object.values(byTopic).map(t => ({
      topic: t.topic,
      avgScore: Math.round(t.totalPct / t.count),
      attempts: t.count
    })).sort((a, b) => a.avgScore - b.avgScore)

    res.json(result)
  } catch (err) {
    console.error('TOPIC BREAKDOWN ERROR:', err.message)
    res.json([])
  }
})

// Announcements
app.post('/announcements', async (req, res) => {
  try {
    const { teacher_id, message, topic } = req.body
    if (!teacher_id) return res.json({ success: false, message: 'Missing teacher ID.' })
    if (!message || !message.trim()) return res.json({ success: false, message: 'Announcement cannot be empty.' })

    const { data: teacher } = await supabase.from('users').select('class_code, full_name').eq('id', teacher_id).eq('role', 'teacher').single()
    if (!teacher?.class_code) return res.json({ success: false, message: 'No class found for this teacher.' })

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ teacher_id, class_code: teacher.class_code, message: message.trim(), teacher_name: teacher.full_name, topic: topic && topic.trim() ? topic.trim() : null }])
      .select().single()

    if (error) return res.json({ success: false, message: 'Failed to post announcement.' })
    res.json({ success: true, announcement: data })
  } catch (err) {
    console.error('POST ANNOUNCEMENT ERROR:', err.message)
    res.json({ success: false, message: 'Something went wrong. Please try again.' })
  }
})

app.get('/announcements/teacher', async (req, res) => {
  try {
    const { teacher_id } = req.query
    if (!teacher_id) return res.json([])

    const { data: teacher } = await supabase.from('users').select('class_code').eq('id', teacher_id).eq('role', 'teacher').single()
    if (!teacher?.class_code) return res.json([])

    const { data } = await supabase.from('announcements').select('*').eq('class_code', teacher.class_code).order('created_at', { ascending: false })
    res.json(data || [])
  } catch (err) {
    console.error('GET ANNOUNCEMENTS ERROR:', err.message)
    res.json([])
  }
})

app.get('/announcements/latest', async (req, res) => {
  try {
    const { user_id } = req.query
    if (!user_id) return res.json(null)

    const { data: student } = await supabase.from('users').select('class_code').eq('id', user_id).single()

    const { data: classAnnouncement } = student?.class_code
      ? await supabase.from('announcements').select('*').eq('class_code', student.class_code).order('created_at', { ascending: false }).limit(1).single()
      : { data: null }

    const { data: broadcast } = await supabase
      .from('announcements').select('*').is('class_code', null)
      .order('created_at', { ascending: false }).limit(1).single()

    let latest = classAnnouncement || null
    if (broadcast && (!latest || new Date(broadcast.created_at) > new Date(latest.created_at))) {
      latest = broadcast
    }

    res.json(latest)
  } catch (err) {
    res.json(null)
  }
})

app.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { teacher_id } = req.body
    if (!teacher_id) return res.status(400).json({ success: false, message: 'Missing teacher ID.' })

    const { data: announcement } = await supabase.from('announcements').select('teacher_id').eq('id', id).single()
    if (!announcement || announcement.teacher_id !== teacher_id)
      return res.status(403).json({ success: false, message: 'Not authorized.' })

    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) return res.json({ success: false, message: 'Failed to delete announcement.' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE ANNOUNCEMENT ERROR:', err.message)
    res.json({ success: false, message: 'Something went wrong. Please try again.' })
  }
})

// AI Tutor
const Groq = require('groq-sdk')
let groq

app.post('/ask-ai', async (req, res) => {
  try {
    const { messages } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.json({ success: false, answer: 'Invalid request.' })
    }

    if (!process.env.GROQ_API_KEY) {
      return res.json({ success: false, answer: 'AI tutor is not configured.' })
    }

    const cleanMessages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    if (cleanMessages.length === 0) {
      return res.json({ success: false, answer: 'Invalid request.' })
    }

    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }

    const chat = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are SigMath's math tutor for junior high school students (Grades 7-10).
- Reply in English, in a friendly and encouraging tone. Keep answers short.
- Only help with math and studying math. If asked about anything else, politely steer back to math.
- If a student asks for an answer, give it, then briefly explain the steps so they learn how to do it.
- Show steps as short numbered lines, one step per line.
- Write math between dollar signs, for example $2x + 5 = 17$. Do not use tables, headings, or code blocks. You may use **bold** for key terms.
- Do not greet the student after the first message and do not write long introductions.
- If you are not sure about an answer, say so instead of guessing.`
        },
        ...cleanMessages
      ]
    })

    res.json({ success: true, answer: chat.choices[0].message.content })
  } catch (err) {
    console.error('AI ERROR:', err.message)
    res.json({ success: false, answer: 'The AI tutor is temporarily unavailable. Please try again in a moment.' })
  }
})

// 🔥 NEW: Lessons endpoints for Basic Foundation
app.get('/lessons', async (req, res) => {
  try {
    const grade = req.query.grade || 'grade8'
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade_level', grade)
      .order('order', { ascending: true })
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('LESSONS ERROR:', err.message)
    res.json([])
  }
})

// Get all lessons completed by a user
app.get('/completed-lessons', async (req, res) => {
  try {
    const { user_id } = req.query
    if (!user_id) return res.json([])
    const { data, error } = await supabase
      .from('completed_lessons')
      .select('lesson_id')
      .eq('user_id', user_id)
    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('COMPLETED LESSONS ERROR:', err.message)
    res.json([])
  }
})

// Mark a lesson as complete and award 25 XP
app.post('/lesson-complete', async (req, res) => {
  try {
    const { user_id, lesson_id } = req.body
    if (!user_id || !lesson_id) {
      return res.json({ success: false, message: 'Missing user_id or lesson_id.' })
    }

    const { data: existing } = await supabase
      .from('completed_lessons')
      .select('id')
      .eq('user_id', user_id)
      .eq('lesson_id', lesson_id)
      .single()
    if (existing) {
      return res.json({ success: false, message: 'Lesson already completed.' })
    }

    const { error: insertError } = await supabase
      .from('completed_lessons')
      .insert([{ user_id, lesson_id }])
    if (insertError) throw insertError

    const { data: userData } = await supabase
      .from('users')
      .select('xp')
      .eq('id', user_id)
      .single()
    const currentXP = userData?.xp || 0
    const newXP = currentXP + 25
    await supabase
      .from('users')
      .update({ xp: newXP })
      .eq('id', user_id)

    res.json({ success: true, xpEarned: 25 })
  } catch (err) {
    console.error('LESSON COMPLETE ERROR:', err.message)
    res.json({ success: false, message: 'Failed to complete lesson.' })
  }
})

// Sidebar – no dark‑mode button, just clean navigation
app.get('/sidebar', (req, res) => {
  const { role } = req.query
  if (role === 'admin') {
    return res.send(`
      <div class="sidebar-logo"><span class="logo-icon">∑</span> SigMath</div>
      <button class="sidebar-btn" onclick="location.href='/admin.html'"><i class="ti ti-home"></i> Dashboard</button>
      <button class="sidebar-btn" onclick="location.href='/chat.html'"><i class="ti ti-messages"></i> Class Chat</button>
      <button class="sidebar-btn" onclick="logout()" style="margin-top:auto"><i class="ti ti-logout"></i> Log Out</button>
    `)
  }
  if (role === 'teacher') {
    return res.send(`
      <div class="sidebar-logo"><span class="logo-icon">∑</span> SigMath</div>
      <button class="sidebar-btn" onclick="location.href='/teacher.html'"><i class="ti ti-home"></i> Dashboard</button>
      <button class="sidebar-btn" onclick="location.href='/lessons/'"><i class="ti ti-book"></i> Lessons</button>
      <button class="sidebar-btn" onclick="location.href='/teacher-students.html'"><i class="ti ti-users"></i> Students</button>
      <button class="sidebar-btn" onclick="location.href='/chat.html'"><i class="ti ti-messages"></i> Class Chat</button>
      <button class="sidebar-btn" onclick="location.href='/teacher-profile.html'"><i class="ti ti-user"></i> Profile</button>
      <button class="sidebar-btn" onclick="location.href='/private-chat.html'"><i class="ti ti-user-circle"></i> Private Chat</button>
      <button class="sidebar-btn" onclick="logout()" style="margin-top:auto"><i class="ti ti-logout"></i> Log Out</button>
    `)
  }
  res.send(`
    <div class="sidebar-logo"><span class="logo-icon">∑</span> SigMath</div>
    <button class="sidebar-btn" onclick="location.href='/dashboard.html'"><i class="ti ti-home"></i> Dashboard</button>
    <button class="sidebar-btn" onclick="location.href='/lessons/'"><i class="ti ti-book"></i> Lessons</button>
    <button class="sidebar-btn" onclick="location.href='/quizzes/'"><i class="ti ti-pencil"></i> Quizzes</button>
    <button class="sidebar-btn" onclick="location.href='/flashcards.html'"><i class="ti ti-cards"></i> Flashcards</button>
    <button class="sidebar-btn" onclick="location.href='/games.html'"><i class="ti ti-device-gamepad"></i> Games</button>
    <button class="sidebar-btn" onclick="location.href='/aitutor.html'"><i class="ti ti-robot"></i> AI Tutor</button>
    <button class="sidebar-btn" onclick="location.href='/chat.html'"><i class="ti ti-messages"></i> Class Chat</button>
    <button class="sidebar-btn" onclick="location.href='/private-chat.html'"><i class="ti ti-user-circle"></i> Private Chat</button>
    <button class="sidebar-btn" onclick="location.href='/leaderboard.html'"><i class="ti ti-trophy"></i> Leaderboard</button>
    <button class="sidebar-btn" onclick="location.href='/profile.html'"><i class="ti ti-user"></i> Profile</button>
    <button class="sidebar-btn" onclick="logout()" style="margin-top:auto"><i class="ti ti-logout"></i> Log Out</button>
  `)
})

app.get('/bottomnav', (req, res) => {
  const { role } = req.query
  if (role === 'admin') {
    return res.send(`
      <nav class="bottom-nav" id="bottomNav">
        <button class="bottom-nav-btn" onclick="location.href='/admin.html'"><i class="ti ti-home"></i><span>Home</span></button>
        <button class="bottom-nav-btn" onclick="location.href='/chat.html'"><i class="ti ti-messages"></i><span>Chat</span></button>
        <button class="bottom-nav-btn" onclick="logout()"><i class="ti ti-logout"></i><span>Log Out</span></button>
      </nav>
    `)
  }
  if (role === 'teacher') {
    return res.send(`
      <nav class="bottom-nav" id="bottomNav" style="overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch;">
        <button class="bottom-nav-btn" onclick="location.href='/teacher.html'"><i class="ti ti-home"></i><span>Home</span></button>
        <button class="bottom-nav-btn" onclick="location.href='/lessons/'"><i class="ti ti-book"></i><span>Lessons</span></button>
        <button class="bottom-nav-btn" onclick="location.href='/teacher-students.html'"><i class="ti ti-users"></i><span>Students</span></button>
        <button class="bottom-nav-btn" onclick="location.href='/chat.html'"><i class="ti ti-messages"></i><span>Class</span></button>
        <button class="bottom-nav-btn" onclick="location.href='/teacher-profile.html'"><i class="ti ti-user"></i><span>Profile</span></button>
        <button class="bottom-nav-btn" onclick="location.href='/private-chat.html'"><i class="ti ti-user-circle"></i><span>Private</span></button>
      </nav>
    `)
  }
  res.send(`
    <nav class="bottom-nav" id="bottomNav">
      <button class="bottom-nav-btn" onclick="location.href='/dashboard.html'"><i class="ti ti-home"></i><span>Home</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/lessons/'"><i class="ti ti-book"></i><span>Lessons</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/quizzes/'"><i class="ti ti-pencil"></i><span>Quizzes</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/games.html'"><i class="ti ti-device-gamepad"></i><span>Games</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/flashcards.html'"><i class="ti ti-cards"></i><span>Flashcards</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/aitutor.html'"><i class="ti ti-robot"></i><span>AI Tutor</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/chat.html'"><i class="ti ti-messages"></i><span>Class</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/private-chat.html'"><i class="ti ti-user-circle"></i><span>Private</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/leaderboard.html'"><i class="ti ti-trophy"></i><span>Ranks</span></button>
      <button class="bottom-nav-btn" onclick="location.href='/profile.html'"><i class="ti ti-user"></i><span>Profile</span></button>
    </nav>
  `)
})

// Badges helper
function computeBadges(totalQuizzes, avgScore, xp, streak, uniqueTopics) {
  const earned = []
  if (totalQuizzes >= 1) earned.push('first_quiz')
  if (avgScore === 100) earned.push('perfect_score')
  if (totalQuizzes >= 5) earned.push('quiz_5')
  if (xp >= 400) earned.push('level_5')
  if (streak >= 3) earned.push('streak_3')
  if (streak >= 7) earned.push('streak_7')
  if (uniqueTopics >= 8) earned.push('all_topics')
  return earned
}

// Leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const { user_id } = req.query
    if (!user_id) return res.json([])

    const { data: me } = await supabase.from('users').select('class_code').eq('id', user_id).single()
    if (!me?.class_code) return res.json([])

    const { data: students } = await supabase
      .from('users').select('id, full_name, xp, streak, badges')
      .eq('role', 'student').eq('class_code', me.class_code)
      .order('xp', { ascending: false }).limit(20)

    res.json(students || [])
  } catch (err) {
    console.error('LEADERBOARD ERROR:', err.message)
    res.json([])
  }
})

// Student stats
app.get('/student-stats', async (req, res) => {
  try {
    const { user_id } = req.query
    if (!user_id) return res.json({ totalQuizzes: 0, avgScore: 0, uniqueTopics: 0, xp: 0, streak: 0, badges: [] })

    const { data: quizzes } = await supabase.from('quiz_results').select('*').eq('user_id', user_id)
    const { data: userData } = await supabase.from('users').select('xp, streak, last_active, badges').eq('id', user_id).single()

    const totalQuizzes = quizzes ? quizzes.length : 0
    const avgScore = totalQuizzes > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.score / q.total * 100), 0) / totalQuizzes) : 0
    const uniqueTopics = quizzes ? [...new Set(quizzes.map(q => q.topic))].length : 0
    const xp = userData?.xp || 0
    const streak = userData?.streak || 0
    const badges = computeBadges(totalQuizzes, avgScore, xp, streak, uniqueTopics)

    await supabase.from('users').update({ badges }).eq('id', user_id)
    res.json({ totalQuizzes, avgScore, uniqueTopics, xp, streak, badges })
  } catch (err) {
    console.error('STUDENT STATS ERROR:', err.message)
    res.json({ totalQuizzes: 0, avgScore: 0, uniqueTopics: 0, xp: 0, streak: 0, badges: [] })
  }
})

// Recent quizzes
app.get('/recent-quizzes', async (req, res) => {
  try {
    const { user_id } = req.query
    if (!user_id) return res.json([])

    const { data } = await supabase.from('quiz_results').select('*').eq('user_id', user_id)
      .order('created_at', { ascending: false }).limit(5)
    res.json(data || [])
  } catch (err) {
    console.error('RECENT QUIZZES ERROR:', err.message)
    res.json([])
  }
})

// Save quiz
app.post('/save-quiz', async (req, res) => {
  try {
    const { user_id, topic, score, total } = req.body
    if (!user_id || !topic || score === undefined || !total)
      return res.json({ success: false, message: 'Missing quiz data.' })

    await supabase.from('quiz_results').insert([{ user_id, topic, score, total }])

    const { data: userData } = await supabase.from('users').select('xp, streak, last_active').eq('id', user_id).single()
    const currentXP = userData?.xp || 0
    const currentStreak = userData?.streak || 0
    const lastActive = userData?.last_active
    const pct = Math.round((score / total) * 100)
    const xpEarned = pct === 100 ? 30 : pct >= 80 ? 20 : 10
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    let newStreak = currentStreak
    if (lastActive === yesterday) newStreak = currentStreak + 1
    else if (lastActive !== today) newStreak = 1

    await supabase.from('users').update({ xp: currentXP + xpEarned, streak: newStreak, last_active: today }).eq('id', user_id)
    res.json({ success: true, xpEarned })
  } catch (err) {
    console.error('SAVE QUIZ ERROR:', err.message)
    res.json({ success: false, message: 'Failed to save quiz results.' })
  }
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err.message)
  res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again.' })
})

// Get user's class code
app.get('/user-class', async (req, res) => {
  try {
    const { user_id } = req.query
    if (!user_id) return res.json({ class_code: null })
    const { data, error } = await supabase
      .from('users')
      .select('class_code')
      .eq('id', user_id)
      .single()
    if (error) throw error
    res.json({ class_code: data?.class_code || null })
  } catch (err) {
    console.error('USER CLASS ERROR:', err.message)
    res.json({ class_code: null })
  }
})

// ===================== CHAT SYSTEM =====================

app.get('/messages', async (req, res) => {
  try {
    const { class_code, limit = 50 } = req.query
    if (!class_code) return res.json([])

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('class_code', class_code)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    const messages = data || []
    const senderIds = [...new Set(messages.map(m => m.sender_id))]
    if (senderIds.length > 0) {
      const { data: senders } = await supabase.from('users').select('id, is_muted').in('id', senderIds)
      const muteMap = Object.fromEntries((senders || []).map(s => [s.id, !!s.is_muted]))
      messages.forEach(m => { m.sender_muted = !!muteMap[m.sender_id] })
    }

    res.json(messages)
  } catch (err) {
    console.error('MESSAGES ERROR:', err.message)
    res.json([])
  }
})

app.post('/messages', async (req, res) => {
  try {
    const { sender_id, sender_name, class_code, message } = req.body
    if (!sender_id || !sender_name || !class_code || !message) {
      return res.json({ success: false, message: 'Missing required fields.' })
    }
    if (message.trim().length === 0) {
      return res.json({ success: false, message: 'Message cannot be empty.' })
    }

    const { data: sender } = await supabase.from('users').select('is_muted').eq('id', sender_id).single()
    if (sender?.is_muted) {
      return res.json({ success: false, message: 'You have been muted by your teacher and cannot send messages.' })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, sender_name, class_code, message: message.trim() }])
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: data })
  } catch (err) {
    console.error('SEND MESSAGE ERROR:', err.message)
    res.json({ success: false, message: 'Failed to send message.' })
  }
})

app.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { user_id, teacher_id, admin_id } = req.body
    if (!user_id && !teacher_id && !admin_id) return res.status(400).json({ success: false, message: 'Missing user ID.' })

    const { data: msg } = await supabase.from('messages').select('sender_id, class_code').eq('id', id).single()
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' })

    let authorized = msg.sender_id === user_id
    if (!authorized && teacher_id) {
      const { data: teacher } = await supabase.from('users').select('class_code').eq('id', teacher_id).eq('role', 'teacher').single()
      authorized = !!teacher && teacher.class_code === msg.class_code
    }
    if (!authorized && admin_id) {
      authorized = await requireAdmin(admin_id)
    }
    if (!authorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message.' })
    }

    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE MESSAGE ERROR:', err.message)
    res.json({ success: false, message: 'Failed to delete message.' })
  }
})

// ===================== PRIVATE CHAT =====================

app.get('/classmates', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.json([]);

    const { data: user } = await supabase
      .from('users')
      .select('class_code, role')
      .eq('id', user_id)
      .single();

    if (!user?.class_code) return res.json([]);

    if (user.role === 'teacher') {
      // Teacher's contact list: their own students
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'student')
        .eq('class_code', user.class_code)
        .neq('id', user_id)
        .order('full_name');
      if (error) throw error;
      return res.json(data || []);
    }

    // Student's contact list: classmates + their teacher
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'student')
      .eq('class_code', user.class_code)
      .neq('id', user_id)
      .order('full_name');
    if (studentsError) throw studentsError;

    const { data: teacher } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'teacher')
      .eq('class_code', user.class_code)
      .single();

    const contacts = teacher
      ? [{ ...teacher, is_teacher: true }, ...(students || [])]
      : (students || []);

    res.json(contacts);
  } catch (err) {
    console.error('CLASSMATES ERROR:', err.message);
    res.json([]);
  }
});

app.get('/direct-messages', async (req, res) => {
  try {
    const { user_id, other_user_id, limit = 50 } = req.query;
    if (!user_id || !other_user_id) return res.json([]);

    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user_id},receiver_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},receiver_id.eq.${user_id})`)
      .order('created_at', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('DIRECT MESSAGES ERROR:', err.message);
    res.json([]);
  }
});

app.post('/direct-messages', async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;
    if (!sender_id || !receiver_id || !message) {
      return res.json({ success: false, message: 'Missing required fields.' });
    }
    if (message.trim().length === 0) {
      return res.json({ success: false, message: 'Message cannot be empty.' });
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([{ sender_id, receiver_id, message: message.trim() }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: data });
  } catch (err) {
    console.error('SEND DIRECT MESSAGE ERROR:', err.message);
    res.json({ success: false, message: 'Failed to send message.' });
  }
});

app.post('/direct-messages/read', async (req, res) => {
  try {
    const { user_id, other_user_id } = req.body;
    if (!user_id || !other_user_id) {
      return res.json({ success: false, message: 'Missing user IDs.' });
    }

    const { error } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', user_id)
      .eq('sender_id', other_user_id)
      .is('read_at', null);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('MARK READ ERROR:', err.message);
    res.json({ success: false });
  }
});

// ============ ADMIN ============

async function requireAdmin(admin_id) {
  const { data } = await supabase.from('users').select('id, role').eq('id', admin_id).eq('role', 'admin').single()
  return !!data
}

app.get('/admin-stats', async (req, res) => {
  try {
    const { admin_id } = req.query
    if (!(await requireAdmin(admin_id))) return res.status(403).json({ error: 'Not authorized.' })

    const [{ count: teacherCount }, { count: studentCount }, { count: classCount }, { count: quizCount }] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('classes').select('id', { count: 'exact', head: true }),
      supabase.from('quiz_results').select('id', { count: 'exact', head: true }),
    ])

    res.json({
      teacherCount: teacherCount || 0,
      studentCount: studentCount || 0,
      classCount: classCount || 0,
      quizCount: quizCount || 0
    })
  } catch (err) {
    console.error('ADMIN STATS ERROR:', err.message)
    res.status(500).json({ error: 'Failed to load stats.' })
  }
})

app.get('/admin-teachers', async (req, res) => {
  try {
    const { admin_id } = req.query
    if (!(await requireAdmin(admin_id))) return res.status(403).json({ error: 'Not authorized.' })

    const { data: teachers, error } = await supabase
      .from('users').select('id, full_name, email, class_code').eq('role', 'teacher').order('full_name')
    if (error) throw error

    const withCounts = await Promise.all((teachers || []).map(async t => {
      const { count } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('class_code', t.class_code)
      return { ...t, studentCount: count || 0 }
    }))

    res.json(withCounts)
  } catch (err) {
    console.error('ADMIN TEACHERS ERROR:', err.message)
    res.status(500).json({ error: 'Failed to load teachers.' })
  }
})

app.get('/admin-students', async (req, res) => {
  try {
    const { admin_id } = req.query
    if (!(await requireAdmin(admin_id))) return res.status(403).json({ error: 'Not authorized.' })

    const { data: students, error } = await supabase
      .from('users').select('id, full_name, email, class_code, xp').eq('role', 'student').order('full_name')
    if (error) throw error

    const { data: classes } = await supabase.from('classes').select('class_code, class_name')
    const classMap = Object.fromEntries((classes || []).map(c => [c.class_code, c.class_name]))

    res.json((students || []).map(s => ({ ...s, class_name: classMap[s.class_code] || null })))
  } catch (err) {
    console.error('ADMIN STUDENTS ERROR:', err.message)
    res.status(500).json({ error: 'Failed to load students.' })
  }
})

// Delete a teacher (their class dissolves, students become classless) or a student (account fully removed)
app.post('/admin-remove-user', async (req, res) => {
  try {
    const { admin_id, target_id, target_role } = req.body
    if (!(await requireAdmin(admin_id))) return res.status(403).json({ success: false, message: 'Not authorized.' })
    if (!target_id || !target_role) return res.json({ success: false, message: 'Missing parameters.' })

    if (target_role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('class_code').eq('id', target_id).eq('role', 'teacher').single()
      if (!teacher) return res.json({ success: false, message: 'Teacher not found.' })

      if (teacher.class_code) {
        await supabase.from('users').update({ class_code: null }).eq('role', 'student').eq('class_code', teacher.class_code)
        await supabase.from('classes').delete().eq('class_code', teacher.class_code)
      }
      await supabase.from('users').delete().eq('id', target_id)
    } else if (target_role === 'student') {
      await supabase.from('users').delete().eq('id', target_id)
    } else {
      return res.json({ success: false, message: 'Invalid target role.' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('ADMIN REMOVE USER ERROR:', err.message)
    res.json({ success: false, message: 'Failed to remove user.' })
  }
})

// Site-wide announcement, visible to every class (class_code left null)
app.post('/admin-broadcast', async (req, res) => {
  try {
    const { admin_id, message } = req.body
    if (!(await requireAdmin(admin_id))) return res.status(403).json({ success: false, message: 'Not authorized.' })
    if (!message || !message.trim()) return res.json({ success: false, message: 'Message cannot be empty.' })

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ teacher_id: admin_id, class_code: null, message: message.trim(), teacher_name: 'SigMath Admin' }])
      .select().single()

    if (error) throw error
    res.json({ success: true, announcement: data })
  } catch (err) {
    console.error('ADMIN BROADCAST ERROR:', err.message)
    res.json({ success: false, message: 'Failed to post broadcast.' })
  }
})

const PORT = process.env.PORT || 3000
const normA = v => String(v).toLowerCase().replace(/[\s,]/g, '')
const sameA = (v, a) => { const p = normA(a), q = normA(v); if (p === q) return true; const np = Number(p), nq = Number(q); return p !== '' && q !== '' && Number.isFinite(np) && Number.isFinite(nq) && Math.abs(np - nq) < 1e-9 }

app.post('/live/generate', async (req, res) => {
  try {
    const { teacher_id, topic, grade, count, qtype } = req.body
    const { data: u } = await supabase.from('users').select('role').eq('id', teacher_id).single()
    if (!u || (u.role !== 'teacher' && u.role !== 'admin')) return res.json({ success: false, message: 'Teachers only.' })
    if (!topic || !String(topic).trim()) return res.json({ success: false, message: 'Enter a topic.' })
    if (!process.env.GROQ_API_KEY) return res.json({ success: false, message: 'AI is not configured.' })
    if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const n = Math.min(Math.max(parseInt(count) || 5, 3), 15)
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
    const typeRule = qtype === 'mix' ? 'Use a mix: about three quarters multiple choice and one quarter true/false.' : 'Use only multiple choice questions.'
    const r = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You write math quiz questions. Reply with ONLY a JSON array and no other text.' },
        { role: 'user', content: `Write ${n} questions for ${String(grade).slice(0, 30)} students on this topic: ${String(topic).slice(0, 200)}. ${typeRule} Formats: multiple choice {"type":"mc","q":"...","options":["...","...","...","..."],"answer":0,"explanation":"one short sentence","hint":"a short nudge that does not give away the answer"} where answer is the index (0-3) of the single correct option; true/false {"type":"tf","q":"a statement","options":["True","False"],"answer":0,"explanation":"...","hint":"..."}. Write math in plain text like x^2 + 3x, with no LaTeX.` }
      ]
    })
    const text = r.choices[0].message.content || ''
    const m = text.match(/\[[\s\S]*\]/)
    const arr = JSON.parse(m ? m[0] : text)
    const okq = x => x && x.type !== 'text' && typeof x.q === 'string' && (x.type === 'text' ? Array.isArray(x.accepted) && x.accepted.length > 0 : Array.isArray(x.options) && x.options.length === (x.type === 'tf' ? 2 : 4) && Number.isInteger(x.answer) && x.answer >= 0 && x.answer < x.options.length)
    const shape = x => {
      const t = x.type === 'text' ? 'text' : x.type === 'tf' ? 'tf' : 'mc'
      const ans = t === 'text' ? String(x.accepted[0]) : String(x.options[x.answer])
      const hint = String(x.hint || '')
      const o = { type: t, q: x.q, explanation: String(x.explanation || ''), hint: ans.length >= 3 && hint.includes(ans) ? '' : hint }
      if (t === 'text') o.accepted = x.accepted.map(String).slice(0, 6)
      else { o.options = x.options.map(String); o.answer = x.answer }
      return o
    }
    const questions = arr.filter(okq).slice(0, n).map(shape)
    if (!questions.length) return res.json({ success: false, message: 'AI returned no valid questions. Try again.' })
    let checked = questions
    let note = ''
    try {
      const v = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You solve math quiz questions. Reply with ONLY a JSON array.' },
          { role: 'user', content: 'Solve each question carefully on your own. For multiple choice and true/false give the 0-based index of the correct option. For typed answer give the final answer as a string. Return one value per question, in order.\n' + JSON.stringify(questions.map(x => ({ type: x.type, q: x.q, options: x.options }))) }
        ]
      })
      const vt = v.choices[0].message.content || ''
      const vm = vt.match(/\[[\s\S]*\]/)
      const idx = JSON.parse(vm ? vm[0] : vt)
      checked = questions.filter((x, i) => x.type === 'text' ? x.accepted.some(a => sameA(idx[i], a)) : idx[i] === x.answer)
      const removed = questions.length - checked.length
      if (removed) note = removed + ' question(s) were removed because a second AI check disagreed with the answer key.'
    } catch (e) {
      note = 'Could not double-check the answers automatically. Please review every answer carefully.'
    }
    checked = checked.map(x => ({ ...x, explanation: /oops|correction|actually|wait|mistake|let me/i.test(x.explanation) ? '' : x.explanation }))
    if (!checked.length) return res.json({ success: false, message: 'The AI could not produce reliable questions. Try again.' })
    res.json({ success: true, questions: checked, note })
  } catch (err) {
    console.error('LIVE GENERATE ERROR:', err.message)
    res.json({ success: false, message: 'Could not generate questions. Try again.' })
  }
})

const server = require('http').createServer(app)
require('./live')(server, async id => {
  if (!id) return false
  const { data } = await supabase.from('users').select('role').eq('id', id).single()
  return !!data && (data.role === 'teacher' || data.role === 'admin')
})
server.listen(PORT, () => {
  console.log('SigMath is running on port ' + PORT)
})