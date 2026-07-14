import { AssetsContent } from './assets-content'

export default async function AssetsPage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getAssets } = await import('@/lib/data')
  const assets = await getAssets(profile.org_id)

  return (
    <AssetsContent assets={assets} />
  )
}