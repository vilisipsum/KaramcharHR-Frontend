import { getAllFeatureFlags } from '@/lib/super-admin'
import { FeatureFlagManager } from '@/components/super-admin/FeatureFlagManager'

export default async function FeatureFlagsPage() {
  const flags = await getAllFeatureFlags()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Feature Flags</h1>
        <p className="text-sm text-muted-foreground mt-1">Control which features are available globally or per plan</p>
      </div>
      <FeatureFlagManager flags={flags} />
    </div>
  )
}
