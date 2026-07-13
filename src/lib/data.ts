import { createClient } from '@/lib/server'

export type DashboardStats = {
  totalEmployees: number
  presentCount: number
  onLeaveCount: number
  upcomingHoliday: { name: string; date: string } | null
}

async function getOrgEmployeeIds(supabase: any, orgId: string): Promise<string[]> {
  const { data } = await supabase
    .from('employees')
    .select('id')
    .eq('org_id', orgId)
    .eq('status', 'active')
  return data?.map((e: any) => e.id) || []
}

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const employeeIds = await getOrgEmployeeIds(supabase, orgId)

  if (employeeIds.length === 0) {
    const { data: holidays } = await supabase
      .from('holidays')
      .select('name, date')
      .eq('org_id', orgId)
      .gte('date', today)
      .order('date')
      .limit(1)

    return {
      totalEmployees: 0,
      presentCount: 0,
      onLeaveCount: 0,
      upcomingHoliday: holidays?.[0] ?? null,
    }
  }

  const [present, onLeave, holidays] = await Promise.all([
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).neq('status', 'absent').in('employee_id', employeeIds),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved').gte('end_date', today).lte('start_date', today).in('employee_id', employeeIds),
    supabase.from('holidays').select('name, date').eq('org_id', orgId).gte('date', today).order('date').limit(1),
  ])

  return {
    totalEmployees: employeeIds.length,
    presentCount: present.count ?? 0,
    onLeaveCount: onLeave.count ?? 0,
    upcomingHoliday: holidays.data?.[0] ?? null,
  }
}

export async function getEmployees(orgId: string, options?: { search?: string; page?: number; limit?: number }) {
  const supabase = await createClient()
  const { search, page = 1, limit = 20 } = options ?? {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('employees')
    .select('*, departments(name, code), designations(title), leave_balances(entitled, taken, balance, leave_types(name, code))', { count: 'exact' })
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_code.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0, page, limit }
}

export async function getEmployee(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(name, code), designations(title, level), employee_salaries(salary_structures(*), effective_from, is_active)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getLeaveBalances(supabase: any, employeeId: string) {
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*, leave_types(name, code, color)')
    .eq('employee_id', employeeId)
  if (error) throw error
  return data ?? []
}

export async function getLeaveRequests(orgId: string, options?: { status?: string; page?: number; limit?: number }) {
  const supabase = await createClient()
  const { status, page = 1, limit = 20 } = options ?? {}
  const from = (page - 1) * limit
  const to = from + limit - 1
  const employeeIds = await getOrgEmployeeIds(supabase, orgId)

  if (employeeIds.length === 0) {
    return { data: [], total: 0 }
  }

  let query = supabase
    .from('leave_requests')
    .select('*, employees(first_name, last_name, employee_code), leave_types(name, code)', { count: 'exact' })
    .in('employee_id', employeeIds)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function getLeaveTypes(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getHolidays(orgId: string, year?: number) {
  const supabase = await createClient()
  let query = supabase.from('holidays').select('*').eq('org_id', orgId)
  if (year) query = query.eq('year', year)
  const { data, error } = await query.order('date')
  if (error) throw error
  return data ?? []
}

export async function getPayrollRuns(orgId: string, limit = 12) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('org_id', orgId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getPayrollRunDetails(supabase: any, runId: string) {
  const { data, error } = await supabase
    .from('payroll_items')
    .select('*, employees(first_name, last_name, employee_code, departments(name))')
    .eq('payroll_run_id', runId)
    .order('employees.last_name')
  if (error) throw error
  return data ?? []
}

export async function getTodayAttendance(orgId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const employeeIds = await getOrgEmployeeIds(supabase, orgId)

  if (employeeIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('attendance')
    .select('*, employees(first_name, last_name, employee_code, departments(name))')
    .eq('date', today)
    .in('employee_id', employeeIds)
    .order('clock_in')
  if (error) throw error
  return data ?? []
}

export async function getShifts(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shifts')
    .select('*, employee_shifts(employee_id, effective_from, effective_to, employees(first_name, last_name))')
    .eq('org_id', orgId)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getAssets(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*, employees(first_name, last_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getTrainings(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trainings')
    .select('*, employee_trainings(employee_id, completion_status, score, completed_at)')
    .eq('org_id', orgId)
    .order('start_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getOrgChart(orgId: string) {
  const supabase = await createClient()
  const { data: employees, error } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code, role:designations(title), manager_id, department:departments(name)')
    .eq('org_id', orgId)
    .eq('status', 'active')
  if (error) throw error

  interface OrgNode {
    id: string
    first_name: string | null
    last_name: string | null
    employee_code: string
    role: { title: string } | null
    manager_id: string | null
    department: { name: string } | null
    initials: string
    children: OrgNode[]
  }

  const buildTree = (managerId: string | null = null): OrgNode[] => {
    const filtered = (employees ?? []).filter(e => e.manager_id === managerId)
    return filtered.map(e => ({
      ...e,
      role: e.role?.[0] ?? null,
      department: e.department?.[0] ?? null,
      initials: `${e.first_name?.[0]}${e.last_name?.[0]}`.toUpperCase(),
      children: buildTree(e.id),
    }))
  }

  return buildTree()
}

export async function getDepartments(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*, head:employees(first_name, last_name)')
    .eq('org_id', orgId)
  if (error) throw error
  return data ?? []
}

export async function getDesignations(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('designations')
    .select('*')
    .eq('org_id', orgId)
  if (error) throw error
  return data ?? []
}

export async function getPerformanceCycles(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appraisal_cycles')
    .select('*')
    .eq('org_id', orgId)
    .order('start_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getPerformanceReviews(cycleId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('performance_reviews')
    .select('*, employees(first_name, last_name, employee_code, departments(name))')
    .eq('appraisal_cycle_id', cycleId)
  if (error) throw error
  return data ?? []
}

export async function getJobOpenings(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_openings')
    .select('*, departments(name), candidates(count)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCandidates(jobId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getOrganization(supabase: any, orgId: string) {
  const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single()
  if (error) throw error
  return data
}

export async function getProfile(supabase: any, userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function getExpenseClaims(orgId: string, options?: { status?: string; page?: number; limit?: number }) {
  const supabase = await createClient()
  const { status, page = 1, limit = 20 } = options ?? {}
  const from = (page - 1) * limit
  const to = from + limit - 1
  const employeeIds = await getOrgEmployeeIds(supabase, orgId)

  if (employeeIds.length === 0) {
    return { data: [], total: 0 }
  }

  let query = supabase
    .from('expense_claims')
    .select('*, employees(first_name, last_name), expense_categories(name)', { count: 'exact' })
    .in('employee_id', employeeIds)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function getExpenseCategories(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
  if (error) throw error
  return data ?? []
}

export async function getSalaryStructures(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salary_structures')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
  if (error) throw error
  return data ?? []
}

export async function getEmployeeSalary(employeeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employee_salaries')
    .select('*, salary_structures(*)')
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .single()
  if (error) throw error
  return data
}

export async function getAttendanceStats(orgId: string, days = 30) {
  const supabase = await createClient()
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  const employeeIds = await getOrgEmployeeIds(supabase, orgId)

  if (employeeIds.length === 0) {
    return { stats: {}, total: 0 }
  }

  const { data, error } = await supabase
    .from('attendance')
    .select('date, status, employee_id')
    .gte('date', startDate)
    .lte('date', endDate)
    .in('employee_id', employeeIds)
  if (error) throw error

  const stats = data?.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return { stats, total: data?.length ?? 0 }
}

export async function getUserLeaveBalances(orgId: string, userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('employee_id')
    .eq('id', userId)
    .single()

  if (!profile?.employee_id) return []

  return getLeaveBalances(supabase, profile.employee_id)
}