const PAT = process.env.SUPABASE_PAT
const REF = 'diawzahtftuxoqycktiv'
if (!PAT) { console.error('Set SUPABASE_PAT env var'); process.exit(1) }

async function check() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions`, {
    headers: { 'Authorization': `Bearer ${PAT}` }
  })
  const functions = await res.json()
  console.log(`Deployed functions (${functions.length}):`)
  functions.forEach(f => {
    console.log(`  ${f.slug} — status: ${f.status}, version: ${f.version}`)
  })
}

check().catch(e => console.error('Error:', e.message))
