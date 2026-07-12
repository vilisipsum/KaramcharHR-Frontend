'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

type AuthState = { error?: string; needsSetup?: boolean } | null

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  // Check if user has an org set up
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user?.id)
    .single()

  if (!profile?.org_id) {
    revalidatePath('/', 'layout')
    redirect('/onboarding')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const company = formData.get('company') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: email.split('@')[0], company_name: company, role: 'org_admin' },
    },
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function setupOrganization(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug })
    .select()
    .single()

  if (orgError) return { error: orgError.message }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ org_id: org.id, role: 'org_admin' })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  // Seed default data for the new org (use admin client to bypass RLS)
  const admin = await createClient(true)

  const leaveTypes = [
    { name: 'Casual Leave', code: 'CL', description: 'Urgent/personal work - no reason needed', days_per_year: 12, max_consecutive_days: 3, max_carry_forward: 0, is_paid: true, gender_specific: 'both' },
    { name: 'Sick Leave', code: 'SL', description: 'Medical reasons with doctor certificate if >2 days', days_per_year: 10, max_consecutive_days: 5, max_carry_forward: 0, is_paid: true, gender_specific: 'both' },
    { name: 'Earned Leave', code: 'EL', description: 'Privilege leave / planned time off', days_per_year: 15, max_consecutive_days: 15, max_carry_forward: 15, is_paid: true, gender_specific: 'both' },
    { name: 'Maternity Leave', code: 'ML', description: 'Maternity benefit as per Maternity Benefit Act', days_per_year: 182, max_consecutive_days: 182, max_carry_forward: 0, is_paid: true, gender_specific: 'female' },
    { name: 'Paternity Leave', code: 'PL', description: 'Paternity leave for new fathers', days_per_year: 15, max_consecutive_days: 15, max_carry_forward: 0, is_paid: true, gender_specific: 'male' },
    { name: 'Comp Off', code: 'CO', description: 'Compensatory off for overtime', days_per_year: 0, max_consecutive_days: 0, max_carry_forward: 0, is_paid: true, gender_specific: 'both' },
    { name: 'Bereavement Leave', code: 'BL', description: 'Leave on death of family member', days_per_year: 3, max_consecutive_days: 3, max_carry_forward: 0, is_paid: true, gender_specific: 'both' },
  ].map(lt => ({ ...lt, org_id: org.id }))

  const { error: leaveError } = await admin.from('leave_types').insert(leaveTypes)
  if (leaveError) console.error('Failed to seed leave types:', leaveError.message)

  const holidays = [
    { name: 'Republic Day', date: '2026-01-26', type: 'national', year: 2026, description: 'Republic Day of India' },
    { name: 'Holi', date: '2026-03-04', type: 'regional', year: 2026, description: 'Festival of Colors' },
    { name: 'Good Friday', date: '2026-04-03', type: 'national', year: 2026, description: 'Good Friday' },
    { name: 'Eid-ul-Fitr', date: '2026-04-11', type: 'regional', year: 2026, description: 'Eid' },
    { name: 'Independence Day', date: '2026-08-15', type: 'national', year: 2026, description: 'Independence Day of India' },
    { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'national', year: 2026, description: 'Mahatma Gandhi Birthday' },
    { name: 'Dussehra', date: '2026-10-21', type: 'regional', year: 2026, description: 'Vijayadashami' },
    { name: 'Diwali', date: '2026-11-08', type: 'regional', year: 2026, description: 'Festival of Lights' },
    { name: 'Guru Nanak Jayanti', date: '2026-11-25', type: 'regional', year: 2026, description: 'Guru Nanak Birthday' },
    { name: 'Christmas', date: '2026-12-25', type: 'national', year: 2026, description: 'Christmas Day' },
  ].map(h => ({ ...h, org_id: org.id }))

  const { error: holidayError } = await admin.from('holidays').insert(holidays)
  if (holidayError) console.error('Failed to seed holidays:', holidayError.message)

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
