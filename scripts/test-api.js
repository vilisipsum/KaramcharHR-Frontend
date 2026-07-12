// Try Supabase Management API and Platform API
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const REF = 'diawzahtftuxoqycktiv'
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY env var'); process.exit(1) }

async function test(endpoint, label) {
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY
      }
    })
    const text = await res.text()
    console.log(`${label}: HTTP ${res.status} ${text.slice(0, 200)}`)
  } catch (e) {
    console.log(`${label}: Error - ${e.message}`)
  }
}

async function run() {
  // Management API
  await test(`https://api.supabase.com/v1/projects/${REF}`, 'Management API - project info')
  
  // Platform API - health
  await test(`https://${REF}.supabase.co/rest/v1/`, 'REST API root')

  // Check if we can query an existing table via REST
  await test(`https://${REF}.supabase.co/rest/v1/organizations?limit=1`, 'REST API - organizations table')
  
  // Try auth API
  await test(`https://${REF}.supabase.co/auth/v1/user`, 'Auth API - user info')
}

run().catch(e => console.log('Fatal:', e.message))
