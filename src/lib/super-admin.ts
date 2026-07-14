import { createClient } from '@/lib/server'

// ─── Super Admin Guard ───────────────────────────────────────────────────────
export async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') return null
  return { user, profile }
}

// ─── Service Role Client ─────────────────────────────────────────────────────
async function adminClient() {
  return createClient(true)
}

// ─── Platform Overview ───────────────────────────────────────────────────────
export async function getPlatformStats() {
  const sa = await adminClient()

  const [orgs, profiles, flagged, suspended] = await Promise.all([
    sa.from('organizations').select('id, plan, status, created_at, trial_ends_at', { count: 'exact' }),
    sa.from('profiles').select('id', { count: 'exact', head: true }),
    sa.from('organizations').select('id', { count: 'exact', head: true }).lte('trial_ends_at', new Date().toISOString()).eq('plan', 'trial'),
    sa.from('organizations').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
  ])

  const orgList = orgs.data ?? []
  const planDistribution: Record<string, number> = {}
  orgList.forEach(o => {
    planDistribution[o.plan] = (planDistribution[o.plan] ?? 0) + 1
  })

  // Calculate MRR (mock pricing)
  const planPricing: Record<string, number> = { trial: 0, free: 0, starter: 2999, professional: 7999, enterprise: 19999 }
  const mrr = orgList.reduce((acc, o) => acc + (planPricing[o.plan] ?? 0), 0)

  return {
    totalOrgs: orgs.count ?? 0,
    totalUsers: profiles.count ?? 0,
    expiredTrials: flagged.count ?? 0,
    suspendedOrgs: suspended.count ?? 0,
    planDistribution,
    mrr,
    activeOrgs: orgList.filter(o => o.status === 'active').length,
  }
}

// ─── Organizations ───────────────────────────────────────────────────────────
export async function getAllOrganizations(search?: string, plan?: string, status?: string) {
  const sa = await adminClient()
  let query = sa
    .from('organizations')
    .select('id, name, slug, plan, status, trial_ends_at, max_employees, seats_used, created_at, notes')
    .order('created_at', { ascending: false })

  if (plan) query = query.eq('plan', plan)
  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query.limit(100)
  if (error) throw error
  return data ?? []
}

export async function getOrganizationDetail(orgId: string) {
  const sa = await adminClient()

  const [org, employees, features, auditLogs] = await Promise.all([
    sa.from('organizations').select('*').eq('id', orgId).single(),
    sa.from('employees').select('id, first_name, last_name, status, created_at').eq('org_id', orgId).order('created_at', { ascending: false }).limit(10),
    sa.from('org_feature_overrides').select('*').eq('org_id', orgId),
    sa.from('platform_audit_logs').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(20),
  ])

  // Get the org admin profile
  const { data: adminProfile } = await sa
    .from('profiles')
    .select('id, email:id, role, created_at')
    .eq('org_id', orgId)
    .eq('role', 'org_admin')
    .limit(1)
    .single()

  return {
    org: org.data,
    employees: employees.data ?? [],
    features: features.data ?? [],
    auditLogs: auditLogs.data ?? [],
    adminProfile,
  }
}

// ─── Feature Flags ───────────────────────────────────────────────────────────
export async function getAllFeatureFlags() {
  const sa = await adminClient()
  const { data, error } = await sa
    .from('platform_feature_flags')
    .select('*')
    .order('label')

  if (error) throw error
  return data ?? []
}

export async function getOrgFeatureOverrides(orgId: string) {
  const sa = await adminClient()
  const { data, error } = await sa
    .from('org_feature_overrides')
    .select('*')
    .eq('org_id', orgId)

  if (error) throw error
  return data ?? []
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────
export async function getPlatformAuditLogs(limit = 50, orgId?: string) {
  const sa = await adminClient()
  let query = sa
    .from('platform_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (orgId) query = query.eq('org_id', orgId)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// ─── Announcements ───────────────────────────────────────────────────────────
export async function getPlatformAnnouncements() {
  const sa = await adminClient()
  const { data, error } = await sa
    .from('platform_announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─── Audit Logger ────────────────────────────────────────────────────────────
export async function logPlatformAction(
  actorId: string,
  actorEmail: string,
  action: string,
  orgId?: string,
  orgName?: string,
  metadata: Record<string, unknown> = {}
) {
  const sa = await adminClient()
  await sa.from('platform_audit_logs').insert({
    actor_id: actorId,
    actor_email: actorEmail,
    action,
    org_id: orgId,
    org_name: orgName,
    metadata,
  })
}
