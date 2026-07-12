/**
 * KaramcharHR — Database Setup Script
 * 
 * Run: node scripts/setup-db.js
 * 
 * Requires:
 *   1. SUPABASE_DB_PASSWORD env var (set it below or pass it)
 *   2. OR paste the SQL from supabase/migrations/full_schema.sql into the Supabase Dashboard SQL Editor
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'diawzahtftuxoqycktiv'
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'your_database_password_here'

const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', 'full_schema.sql')
const sql = fs.readFileSync(sqlFile, 'utf8')

console.log('')
console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║            KaramcharHR — Database Setup                  ║')
console.log('╚═══════════════════════════════════════════════════════════╝')
console.log('')
console.log('Option 1: Use Supabase Dashboard (Recommended)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. Go to: https://supabase.com/dashboard/project/diawzahtftuxoqycktiv')
console.log('2. Click "SQL Editor" in the left sidebar')
console.log('3. Click "New Query"')
console.log('4. Paste the contents of: supabase/migrations/full_schema.sql')
console.log('5. Click "Run"')
console.log('')
console.log('Option 2: Use Supabase CLI')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`npx supabase login`)
console.log(`npx supabase link --project-ref ${PROJECT_REF}`)
console.log('npx supabase db push')
console.log('')
console.log('Option 3: Direct psql connection')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`PGPASSWORD="${DB_PASSWORD}" psql -h aws-0-ap-south-1.pooler.supabase.com -p 6543 -d postgres -U postgres.${PROJECT_REF} -f supabase/migrations/full_schema.sql`)
console.log('')
