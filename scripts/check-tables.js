const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const REF = 'diawzahtftuxoqycktiv'
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY env var'); process.exit(1) }
const BASE = `https://${REF}.supabase.co`

const tables = [
  'organizations', 'profiles', 'employees', 'departments', 'designations', 'employee_documents',
  'salary_structures', 'employee_salaries', 'payroll_runs', 'payroll_items',
  'pf_records', 'esi_records', 'professional_tax_records', 'tds_records', 'bank_transfer_files',
  'shifts', 'employee_shifts', 'attendance', 'leave_types', 'leave_balances', 'leave_requests', 'holidays', 'attendance_regularizations',
  'job_openings', 'candidates', 'interviews', 'offer_letters', 'appraisal_cycles', 'performance_reviews', 'kpis', 'trainings', 'employee_trainings'
]

async function check() {
  let existing = 0
  let missing = 0
  for (const t of tables) {
    const res = await fetch(`${BASE}/rest/v1/${t}?limit=1`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    })
    if (res.ok || res.status === 200 || res.status === 206) {
      console.log(`  ✓ ${t}`)
      existing++
    } else if (res.status === 404) {
      const body = await res.json()
      if (body.code === 'PGRST205') {
        console.log(`  ✗ ${t} — NOT FOUND`)
        missing++
      } else {
        console.log(`  ? ${t} — ${res.status} ${(await res.text()).slice(0, 60)}`)
        missing++
      }
    } else {
      console.log(`  ? ${t} — ${res.status} ${(await res.text()).slice(0, 60)}`)
    }
  }
  console.log(`\n${existing} tables exist, ${missing} missing`)
}

check().catch(e => console.error('Error:', e.message))
