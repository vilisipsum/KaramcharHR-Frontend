const { Client } = require('pg')

async function main() {
  const PROJECT_REF = 'diawzahtftuxoqycktiv'
  const PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''
  
  if (!PASSWORD) {
    console.log('')
    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║   Need Supabase Database Password to create tables       ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')
    console.log('')
    console.log('To get the password:')
    console.log('  1. Go to https://supabase.com/dashboard/project/diawzahtftuxoqycktiv')
    console.log('  2. Go to Project Settings → Database')
    console.log('  3. Copy the database password under "Connection string"')
    console.log('')
    console.log('Then run:')
    console.log('  node scripts/migrate.js YOUR_DB_PASSWORD')
    console.log('')
    console.log('Or copy-paste supabase/migrations/full_schema.sql into the SQL Editor.')
    process.exit(1)
  }

  const connStr = `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
  const client = new Client({ connectionString: connStr })

  try {
    await client.connect()
    console.log('✓ Connected to Supabase PostgreSQL')
    
    const fs = require('fs')
    const path = require('path')
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', 'full_schema.sql'), 'utf8')
    
    console.log('✓ Running migrations...')
    await client.query(sql)
    console.log('✓ All tables created successfully')
    
    // Verify
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log(`\n✓ Created ${tables.rows.length} tables:`)
    tables.rows.forEach(t => console.log(`  - ${t.table_name}`))
    
    await client.end()
  } catch (err) {
    console.error('✗ Error:', err.message)
    if (err.message?.includes('password')) {
      console.log('\nPassword incorrect. Get the correct password from:')
      console.log('  https://supabase.com/dashboard/project/diawzahtftuxoqycktiv/settings/database')
    }
    process.exit(1)
  }
}

main()
