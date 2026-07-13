import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PerformanceContent } from './performance-content'

export default async function PerformancePage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getPerformanceCycles, getPerformanceReviews, getEmployeeSalary } = await import('@/lib/data')
  
  const [cycles, reviews] = await Promise.all([
    getPerformanceCycles(profile.org_id),
    getPerformanceReviews(profile.org_id),
  ])

  return (
    <DashboardLayout>
      <PerformanceContent cycles={cycles} reviews={reviews} />
    </DashboardLayout>
  )
}