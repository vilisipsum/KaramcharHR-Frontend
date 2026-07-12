const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://diawzahtftuxoqycktiv.supabase.co',
  'sb_publishable_BNkdZ0q07ZgpMZZO9X5t0w_e8g7tBzJ'
)

async function main() {
  // Check if tables exist
  const { data, error } = await supabase.from('organizations').select('*').limit(1)
  if (error && error.message?.includes('relation') || error?.message?.includes('does not exist')) {
    console.log('TABLES_MISSING')
  } else if (error) {
    console.log('CHECK_ERROR:', error.message)
  } else {
    console.log('TABLES_EXIST')
  }

  // Try service role approach via raw query
  // Check auth health
  const { data: authData, error: authError } = await supabase.auth.getSession()
  console.log('AUTH:', authError?.message || 'OK')
}

main()
