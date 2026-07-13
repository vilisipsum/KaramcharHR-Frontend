import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LeavesContent } from './leaves-content'

export default async function LeavesPage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getDashboardStats, getUserLeaveBalances, getLeaveTypes, getLeaveRequests } = await import('@/lib/data')
  
  const [stats, leaveBalances, leaveTypes, leaveRequests] = await Promise.all([
    getDashboardStats(profile.org_id),
    getUserLeaveBalances(profile.org_id, user.id),
    getLeaveTypes(profile.org_id),
    getLeaveRequests(profile.org_id),
  ])

  return (
    <DashboardLayout>
      <LeavesContent stats={stats} balances={leaveBalances} leaveTypes={leaveTypes} leaveRequests={leaveRequests.data} />
    </DashboardLayout>
  )
}