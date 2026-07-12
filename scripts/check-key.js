const key = process.argv[2]
const parts = key.split('.')
const payload = Buffer.from(parts[1], 'base64').toString()
console.log('Decoded payload:', payload)
const role = JSON.parse(payload).role
console.log('Role:', role)
if (role === 'service_role') {
  console.log('✓ This is the correct service_role key!')
} else {
  console.log(`✗ This is the ${role} key. Need the service_role key.`)
  console.log('')
  console.log('Go to Settings → API in your Supabase dashboard,')
  console.log('and look for the key labeled "service_role" (NOT "anon public").')
}
