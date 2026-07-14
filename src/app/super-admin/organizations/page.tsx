import { getAllOrganizations } from '@/lib/super-admin'
import { OrgListClient } from '@/components/super-admin/OrgListClient'

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string; status?: string }>
}) {
  const params = await searchParams
  const orgs = await getAllOrganizations(params.search, params.plan, params.status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Organizations</h1>
        <p className="text-sm text-muted-foreground mt-1">{orgs.length} organizations found</p>
      </div>
      <OrgListClient orgs={orgs} />
    </div>
  )
}
