'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'
import { requireSuperAdmin, logPlatformAction } from '@/lib/super-admin'

type ActionResult = { error?: string; success?: string }

// ─── Organization Actions ─────────────────────────────────────────────────────

export async function suspendOrganization(orgId: string, orgName: string): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)
  const { error } = await sa
    .from('organizations')
    .update({ status: 'suspended' })
    .eq('id', orgId)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'org.suspend', orgId, orgName, { reason: 'Manual suspension by super admin' })
  revalidatePath('/super-admin/organizations')
  return { success: `${orgName} has been suspended.` }
}

export async function activateOrganization(orgId: string, orgName: string): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)
  const { error } = await sa
    .from('organizations')
    .update({ status: 'active' })
    .eq('id', orgId)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'org.activate', orgId, orgName)
  revalidatePath('/super-admin/organizations')
  return { success: `${orgName} has been activated.` }
}

export async function updateOrgPlan(formData: FormData): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const orgId = formData.get('org_id') as string
  const plan = formData.get('plan') as string
  const trialDays = formData.get('trial_days') as string

  const sa = await createClient(true)

  const updates: Record<string, unknown> = { plan }
  if (plan === 'trial' && trialDays) {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + parseInt(trialDays))
    updates.trial_ends_at = trialEndsAt.toISOString()
  }

  const { data: org } = await sa.from('organizations').select('name').eq('id', orgId).single()
  const { error } = await sa.from('organizations').update(updates).eq('id', orgId)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'org.plan_change', orgId, org?.name, { new_plan: plan, trial_days: trialDays })
  revalidatePath('/super-admin/organizations')
  revalidatePath(`/super-admin/organizations/${orgId}`)
  return { success: `Plan updated to ${plan}.` }
}

export async function updateOrgLimits(formData: FormData): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const orgId = formData.get('org_id') as string
  const maxEmployees = parseInt(formData.get('max_employees') as string)
  const storageMb = parseInt(formData.get('storage_quota_mb') as string)
  const notes = formData.get('notes') as string

  const sa = await createClient(true)
  const { data: org } = await sa.from('organizations').select('name').eq('id', orgId).single()
  const { error } = await sa
    .from('organizations')
    .update({ max_employees: maxEmployees, storage_quota_mb: storageMb, notes })
    .eq('id', orgId)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'org.limits_update', orgId, org?.name, { max_employees: maxEmployees, storage_quota_mb: storageMb })
  revalidatePath(`/super-admin/organizations/${orgId}`)
  return { success: 'Organization limits updated.' }
}

// ─── Feature Flag Actions ─────────────────────────────────────────────────────

export async function toggleOrgFeature(orgId: string, orgName: string, featureKey: string, enabled: boolean): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)
  const { error } = await sa
    .from('org_feature_overrides')
    .upsert(
      { org_id: orgId, feature_key: featureKey, enabled, overridden_by: session.user.id, overridden_at: new Date().toISOString() },
      { onConflict: 'org_id,feature_key' }
    )

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, `feature.${enabled ? 'enable' : 'disable'}`, orgId, orgName, { feature: featureKey })
  revalidatePath(`/super-admin/organizations/${orgId}`)
  revalidatePath('/super-admin/feature-flags')
  return { success: `Feature "${featureKey}" ${enabled ? 'enabled' : 'disabled'} for ${orgName}.` }
}

export async function updateFeatureFlagDefault(featureKey: string, defaultEnabled: boolean): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)
  const { error } = await sa
    .from('platform_feature_flags')
    .update({ default_enabled: defaultEnabled })
    .eq('key', featureKey)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'feature.global_toggle', undefined, undefined, { feature: featureKey, enabled: defaultEnabled })
  revalidatePath('/super-admin/feature-flags')
  return { success: `Default for "${featureKey}" updated.` }
}

// ─── Announcement Actions ─────────────────────────────────────────────────────

export async function createAnnouncement(formData: FormData): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)
  const { error } = await sa.from('platform_announcements').insert({
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    type: formData.get('type') as string,
    active: true,
    created_by: session.user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/super-admin/announcements')
  return { success: 'Announcement published.' }
}

export async function toggleAnnouncement(id: string, active: boolean): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)
  const { error } = await sa.from('platform_announcements').update({ active }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/super-admin/announcements')
  return { success: `Announcement ${active ? 'activated' : 'deactivated'}.` }
}
