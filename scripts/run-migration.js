const fs = require('fs')
const path = require('path')

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PROJECT_URL = 'diawzahtftuxoqycktiv'
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY env var'); process.exit(1) }

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
const files = [
  '001_initial_schema.sql',
  '002_payroll_compliance.sql',
  '003_attendance_leave.sql',
  '004_recruitment_performance.sql',
  '005_rls_policies.sql',
  '006_seed_data.sql'
]

async function run() {
  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log(`Running ${file} (${sql.length} bytes)...`)

    const res = await fetch(`https://${PROJECT_URL}.supabase.co/pg/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    })

    const text = await res.text()
    if (res.ok) {
      console.log(`  OK: ${file}`)
    } else if (res.status === 404) {
      console.log(`  /pg/v1/sql not available (404). Trying via supabase-js REST API...`)
      console.log(`  Response: ${text.slice(0, 200)}`)
      return
    } else {
      console.log(`  FAILED (${res.status}): ${text.slice(0, 300)}`)
      return
    }
  }
  console.log('\nAll migrations completed!')
}

run().catch(e => console.error('Error:', e.message))
