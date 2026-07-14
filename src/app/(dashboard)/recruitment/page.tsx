import { RecruitmentContent } from './recruitment-content'

export default async function RecruitmentPage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getJobOpenings } = await import('@/lib/data')
  const jobOpenings = await getJobOpenings(profile.org_id)

  return (
    <RecruitmentContent jobOpenings={jobOpenings} />
  )
}