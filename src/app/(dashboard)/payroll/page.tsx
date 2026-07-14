import { PayrollContent } from './payroll-content'

export default async function PayrollPage() {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getPayrollRuns, getEmployeeSalary, getSalaryStructures } = await import('@/lib/data')
  
  const [payrollRuns, employeeSalary, salaryStructures] = await Promise.all([
    getPayrollRuns(profile.org_id),
    profile.employee_id ? getEmployeeSalary(profile.employee_id) : Promise.resolve(null),
    getSalaryStructures(profile.org_id),
  ])

  return (
    <PayrollContent 
      payrollRuns={payrollRuns}
      employeeSalary={employeeSalary}
      salaryStructures={salaryStructures}
    />
  )
}