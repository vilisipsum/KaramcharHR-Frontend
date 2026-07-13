import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TrainingContent } from './training-content'

export default async function TrainingPage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getTrainings } = await import('@/lib/data')
  const trainings = await getTrainings(profile.org_id)

  return (
    <DashboardLayout>
      <TrainingContent trainings={trainings} />
    </DashboardLayout>
  )
}