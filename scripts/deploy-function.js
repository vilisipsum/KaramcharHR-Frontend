// Deploy edge function via Supabase Management API
const PAT = process.env.SUPABASE_PAT
const REF = 'diawzahtftuxoqycktiv'

if (!PAT) { console.error('Set SUPABASE_PAT env var'); process.exit(1) }

async function deploy() {
  const fs = require('fs')
  const path = require('path')

  const funcPath = path.join(__dirname, '..', 'supabase', 'functions', 'process-payroll', 'index.ts')
  const code = fs.readFileSync(funcPath, 'utf8')

  console.log(`Deploying process-payroll (${code.length} bytes)...`)

  // First check if function exists
  const listRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions`, {
    headers: { 'Authorization': `Bearer ${PAT}` }
  })
  const functions = await listRes.json()
  console.log('Existing functions:', functions.length)

  // Look for existing function
  const existing = functions.find(f => f.slug === 'process-payroll' || f.name === 'process-payroll')
  const method = existing ? 'PATCH' : 'POST'
  const url = existing
    ? `https://api.supabase.com/v1/projects/${REF}/functions/${existing.id}`
    : `https://api.supabase.com/v1/projects/${REF}/functions`

  const deployRes = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: 'process-payroll',
      name: 'process-payroll',
      body: code,
      verify_jwt: false
    })
  })

  const result = await deployRes.json()
  if (deployRes.ok) {
    console.log('✓ Deployed! Function ID:', result.id)
    console.log('  URL:', result.url || 'not available')
  } else {
    console.log('✗ Deploy failed:', deployRes.status, JSON.stringify(result, null, 2))
  }
}

deploy().catch(e => console.error('Error:', e.message))
