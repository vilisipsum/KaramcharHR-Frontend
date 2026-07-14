import { AttendanceContent } from './attendance-content'

export default async function AttendancePage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getDashboardStats, getTodayAttendance } = await import('@/lib/data')
  
  const [stats, attendance] = await Promise.all([
    getDashboardStats(profile.org_id),
    getTodayAttendance(profile.org_id),
  ])

  return (
    <AttendanceContent stats={stats} attendance={attendance} employeeId={profile.employee_id} />
  )
}