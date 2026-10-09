const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://twrhlvxahohgifnxpfgz.supabase.co'
const supabaseKey = 'sb_publishable_Ltg6excwVaIdUHODhkvgbA_u1qCTILT'

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase