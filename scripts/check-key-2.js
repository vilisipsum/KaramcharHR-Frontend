const payload = Buffer.from('eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYXd6YWh0ZnR1eG9xeWNrdGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzg1NTEyMCwiZXhwIjoyMDk5NDMxMTIwfQ', 'base64').toString()
const data = JSON.parse(payload)
console.log('Decoded:', JSON.stringify(data, null, 2))
console.log('Role:', data.role)
if (data.role === 'service_role') {
  console.log('Correct service_role key!')
} else {
  console.log('Wrong key, need service_role')
}
