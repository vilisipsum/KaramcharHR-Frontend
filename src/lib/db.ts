import { createClient } from '@/lib/server'
import type { createClient as createBrowserClient } from '@/lib/client'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>
type BrowserClient = ReturnType<typeof createBrowserClient>

// ─── Dashboard ───
export async function getDashboardStats(supabase: SupabaseClient | BrowserClient, orgId: string) {
  const today = new Date().toISOString().split('T')[0]

  const [employees, present, onLeave, holidays] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'active'),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).neq('status', 'absent'),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved').gte('end_date', today).lte('start_date', today),
    supabase.from('holidays').select('*').eq('org_id', orgId).gte('date', today).order('date').limit(1),
  ])

  return {
    totalEmployees: employees.count ?? 0,
    presentCount: present.count ?? 0,
    onLeaveCount: onLeave.count ?? 0,
    upcomingHoliday: holidays.data?.[0] ?? null,
  }
}

// ─── Employees ───
export async function getEmployees(supabase: SupabaseClient | BrowserClient, orgId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(name), designations(title)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getEmployee(supabase: SupabaseClient | BrowserClient, id: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(name), designations(title), employee_salaries(salary_structures(*))')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Leaves ───
export async function getLeaveBalances(supabase: SupabaseClient | BrowserClient, employeeId: string) {
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*, leave_types(name, code)')
    .eq('employee_id', employeeId)

  if (error) throw error
  return data ?? []
}

export async function getLeaveRequests(supabase: SupabaseClient | BrowserClient, orgId: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employees(first_name, last_name), leave_types(name)')
    .in('employee_id', supabase.from('employees').select('id').eq('org_id', orgId) as any)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

// ─── Payroll ───
export async function getPayrollRuns(supabase: SupabaseClient | BrowserClient, orgId: string) {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('org_id', orgId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)

  if (error) throw error
  return data ?? []
}

// ─── Attendance ───
export async function getTodayAttendance(supabase: SupabaseClient | BrowserClient, orgId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('attendance')
    .select('*, employees(first_name, last_name, employee_code)')
    .eq('date', today)
    .in('employee_id', supabase.from('employees').select('id').eq('org_id', orgId) as any)

  if (error) throw error
  return data ?? []
}
