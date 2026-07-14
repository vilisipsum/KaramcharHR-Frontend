'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'
import { requireSuperAdmin, logPlatformAction } from '@/lib/super-admin'

type ActionResult = { error?: string; success?: string }

// ─── Fetch Compliance Configurations ──────────────────────────────────────────

export async function getComplianceData() {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)

  try {
    const [settingsRes, taxRulesRes] = await Promise.all([
      sa.from('platform_settings').select('*').order('key'),
      sa.from('platform_tax_rules').select('*').order('state_name')
    ])

    if (settingsRes.error) {
      if (settingsRes.error.code === 'PGRST116' || settingsRes.error.message.includes('does not exist')) {
        return { error: 'COMPLIANCE_TABLES_MISSING' }
      }
      return { error: settingsRes.error.message }
    }

    return {
      settings: settingsRes.data || [],
      taxRules: taxRulesRes.data || []
    }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ─── Update Central Settings ──────────────────────────────────────────────────

export async function updatePlatformSetting(key: string, value: number): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)

  const { error } = await sa
    .from('platform_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'compliance.settings_update', undefined, undefined, { key, value })
  revalidatePath('/super-admin/compliance')
  return { success: `Setting for "${key}" updated to ${value}.` }
}

// ─── Update PT State Slabs ────────────────────────────────────────────────────

export async function updateTaxRules(stateName: string, slabs: any[]): Promise<ActionResult> {
  const session = await requireSuperAdmin()
  if (!session) return { error: 'Unauthorized' }

  const sa = await createClient(true)

  const { error } = await sa
    .from('platform_tax_rules')
    .update({ slabs, updated_at: new Date().toISOString() })
    .eq('state_name', stateName)

  if (error) return { error: error.message }

  await logPlatformAction(session.user.id, session.user.email!, 'compliance.pt_matrix_update', undefined, undefined, { state: stateName, slabs })
  revalidatePath('/super-admin/compliance')
  return { success: `Tax slabs for ${stateName} updated successfully.` }
}
