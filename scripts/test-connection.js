const { Client } = require('pg')
const dns = require('dns')

async function main() {
  const PASSWORD = process.argv[2]
  if (!PASSWORD) { console.log('Need password'); process.exit(1) }

  // Try pooler connections with SNI (server name) customization
  const configs = []

  // Try pooler IPs with proper SNI
  const poolerIps = await dns.promises.resolve4('aws-0-ap-south-1.pooler.supabase.com')
  
  for (const ip of poolerIps) {
    configs.push({
      label: `Pooler ${ip}:5432 (SNI: pooler host)`,
      config: {
        host: ip,
        port: 5432,
        database: 'postgres',
        user: 'postgres.diawzahtftuxoqycktiv',
        password: PASSWORD,
        ssl: {
          rejectUnauthorized: false,
          servername: 'aws-0-ap-south-1.pooler.supabase.com'
        },
        connectionTimeoutMillis: 10000
      }
    })
    configs.push({
      label: `Pooler ${ip}:6543 (SNI: pooler host)`,
      config: {
        host: ip,
        port: 6543,
        database: 'postgres',
        user: 'postgres.diawzahtftuxoqycktiv',
        password: PASSWORD,
        ssl: {
          rejectUnauthorized: false,
          servername: 'aws-0-ap-south-1.pooler.supabase.com'
        },
        connectionTimeoutMillis: 10000
      }
    })
  }

  for (const { label, config } of configs) {
    console.log(`Trying ${label}...`)
    const client = new Client(config)
    try {
      await client.connect()
      const res = await client.query('SELECT version()')
      console.log(`  ✓ Connected! ${res.rows[0].version.split(',')[0]}`)
      await client.end()
      console.log('\nConnection successful!')
      return
    } catch (err) {
      console.log(`  ✗ ${err.message.slice(0, 200)}`)
      try { await client.end() } catch {}
    }
  }

  console.log('\nAll attempts failed.')
  console.log('\nThe Supabase pooler may not be fully provisioned for this project yet.')
  console.log('This is common for new projects and can take 24-48h to resolve.')
  console.log('\nBest workaround: Use the SQL Editor in the Supabase Dashboard')
  console.log('1. Go to: https://supabase.com/dashboard/project/diawzahtftuxoqycktiv/sql/new')
  console.log('2. Open: supabase/migrations/full_schema.sql')
  console.log('3. Copy entire file contents and paste into the SQL Editor')
  console.log('4. Click "Run" to create all tables')
}

main().catch(e => console.error('Fatal:', e.message))
