'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function punchIn() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get employee_id and org_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('employee_id, org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.employee_id) return { error: 'No employee record associated with this account' }

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  // Check if already punched in today
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('employee_id', profile.employee_id)
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    return { error: 'Already punched in for today' }
  }

  // Determine status based on shift or defaults (e.g. 9:15 AM limit)
  const isLate = new Date().getHours() >= 9 && new Date().getMinutes() > 15
  const status = isLate ? 'late' : 'present'

  const { error } = await supabase
    .from('attendance')
    .insert({
      employee_id: profile.employee_id,
      date: today,
      clock_in: now,
      status
    })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/attendance')
  return { success: 'Successfully punched in!' }
}

export async function punchOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get employee_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.employee_id) return { error: 'No employee record associated with this account' }

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  // Find today's clock_in record
  const { data: existing, error: fetchError } = await supabase
    .from('attendance')
    .select('id, clock_out')
    .eq('employee_id', profile.employee_id)
    .eq('date', today)
    .maybeSingle()

  if (fetchError || !existing) {
    return { error: 'No clock-in record found for today' }
  }

  if (existing.clock_out) {
    return { error: 'Already punched out for today' }
  }

  const { error } = await supabase
    .from('attendance')
    .update({
      clock_out: now
    })
    .eq('id', existing.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/attendance')
  return { success: 'Successfully punched out!' }
}
