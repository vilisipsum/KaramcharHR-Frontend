import { redirect } from 'next/navigation'
import { DashboardContent } from './dashboard-content'

export default async function Dashboard() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/auth/login')

  const { getDashboardStats, getTodayAttendance, getUserLeaveBalances } = await import('@/lib/data')
  
  const [stats, attendance, leaveBalances] = await Promise.all([
    getDashboardStats(profile.org_id),
    getTodayAttendance(profile.org_id),
    getUserLeaveBalances(profile.org_id, user.id),
  ])

  return (
    <DashboardContent stats={stats} attendance={attendance} leaveBalances={leaveBalances} employeeId={profile.employee_id} />
  )
}