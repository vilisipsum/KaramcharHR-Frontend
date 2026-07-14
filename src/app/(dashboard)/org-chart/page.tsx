import { OrgChartContent } from './org-chart-content'

export default async function OrgChartPage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getOrgChart } = await import('@/lib/data')
  const orgChart = await getOrgChart(profile.org_id)

  return (
    <OrgChartContent orgChart={orgChart} />
  )
}