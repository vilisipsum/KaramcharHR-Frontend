const { Client } = require('pg')

async function main() {
  const PROJECT_REF = 'diawzahtftuxoqycktiv'
  const PASSWORD = process.argv[2]
  if (!PASSWORD) { console.log('Need password'); process.exit(1) }

  // Try direct connection
  const connStr = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`
  console.log(`Connecting to ${PROJECT_REF}...`)
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    console.log('✓ Connected!')

    const fs = require('fs')
    const path = require('path')
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', 'full_schema.sql'), 'utf8')

    console.log('Running migrations...')
    await client.query(sql)
    console.log('✓ All tables created')

    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
    )
    console.log(`\n${tables.rows.length} tables:`)
    tables.rows.forEach(t => console.log(`  - ${t.table_name}`))

    await client.end()
  } catch (err) {
    console.error('✗', err.message)
    process.exit(1)
  }
}

main()
