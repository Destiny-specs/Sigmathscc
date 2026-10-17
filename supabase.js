// Database connection. The keys are NOT stored in the code anymore.
// Set SUPABASE_URL and SUPABASE_KEY (the *secret* key) in Render's Environment settings,
// and in a local .env file for testing on your own computer.
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY. Add them in Render > Environment (or in your local .env file).')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

module.exports = supabase
