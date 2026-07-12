const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const REF = 'diawzahtftuxoqycktiv'
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY env var'); process.exit(1) }
const BASE = `https://${REF}.supabase.co`

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`
}

async function check() {
  // Count tables
  const res = await fetch(`${BASE}/rest/v1/organizations?select=count&limit=0`, { headers })
  const orgs = await res.json()

  const lt = await fetch(`${BASE}/rest/v1/leave_types?select=count&limit=0`, { headers })
  const leaveTypes = await lt.json()

  const hol = await fetch(`${BASE}/rest/v1/holidays?select=count&limit=0`, { headers })
  const holidays = await hol.json()

  console.log(`Organizations:  ${orgs.length} rows`)
  console.log(`Leave types:    ${leaveTypes.length} rows`)
  console.log(`Holidays:       ${holidays.length} rows`)
}

check().catch(e => console.error('Error:', e.message))
