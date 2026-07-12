import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PayrollInput {
  month: number
  year: number
  orgId: string
}

interface EmployeeWithSalary {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  date_of_joining: string
  employee_salaries: Array<{
    salary_structures: {
      id: string
      ctc_annual: number
      basic_percent: number
      hra_percent: number
      special_allowance_percent: number
      conveyance_monthly: number
      medical_allowance_monthly: number
      lta_monthly: number
      pf_employee_rate: number
      pf_employer_rate: number
      esi_applicable: boolean
      esi_employee_rate: number
      esi_employer_rate: number
      professional_tax_monthly: number
    }
  }>
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { month, year, orgId }: PayrollInput = await req.json()

  // Fetch all active employees with salary structures
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select(`
      id,
      employee_code,
      first_name,
      last_name,
      date_of_joining,
      employee_salaries!inner(
        salary_structures!inner(
          id,
          ctc_annual,
          basic_percent,
          hra_percent,
          special_allowance_percent,
          conveyance_monthly,
          medical_allowance_monthly,
          lta_monthly,
          pf_employee_rate,
          pf_employer_rate,
          esi_applicable,
          esi_employee_rate,
          esi_employer_rate,
          professional_tax_monthly
        )
      )
    `)
    .eq('org_id', orgId)
    .eq('status', 'active')

  if (empError) {
    return new Response(JSON.stringify({ error: empError.message }), { status: 500 })
  }

  const typedEmployees = employees as unknown as EmployeeWithSalary[]
  const payrollItems = typedEmployees.map((emp) => {
    const struct = emp.employee_salaries[0]?.salary_structures
    if (!struct) return null

    const monthlyCTC = struct.ctc_annual / 12
    const basic = Math.round(monthlyCTC * (struct.basic_percent / 100) * 100) / 100
    const hra = Math.round(monthlyCTC * (struct.hra_percent / 100) * 100) / 100
    const specialAllowance = Math.round(monthlyCTC * (struct.special_allowance_percent / 100) * 100) / 100
    const conveyance = struct.conveyance_monthly
    const medical = struct.medical_allowance_monthly
    const lta = struct.lta_monthly

    const grossEarnings = basic + hra + specialAllowance + conveyance + medical + lta

    const pfDeduction = basic * (struct.pf_employee_rate / 100)
    const esiDeduction = struct.esi_applicable ? grossEarnings * (struct.esi_employee_rate / 100) : 0
    const profTax = struct.professional_tax_monthly
    const totalDeductions = pfDeduction + esiDeduction + profTax

    const netPay = grossEarnings - totalDeductions

    const employerPF = basic * (struct.pf_employer_rate / 100)
    const employerESI = struct.esi_applicable ? grossEarnings * (struct.esi_employer_rate / 100) : 0

    return {
      employee_id: emp.id,
      basic, hra, conveyance, medical_allowance: medical, lta, special_allowance: specialAllowance,
      gross_earnings: grossEarnings,
      pf_deduction: pfDeduction, esi_deduction: esiDeduction, professional_tax: profTax,
      total_deductions: totalDeductions, net_pay: netPay,
      employer_pf: employerPF, employer_esi: employerESI,
      working_days: 30, payable_days: 30,
    }
  }).filter(Boolean)

  // Create payroll run
  const { data: payrollRun, error: prError } = await supabase
    .from('payroll_runs')
    .insert({
      month,
      year,
      org_id: orgId,
      status: 'processed',
      total_gross: payrollItems.reduce((s, i) => s + (i?.gross_earnings ?? 0), 0),
      total_deductions: payrollItems.reduce((s, i) => s + (i?.total_deductions ?? 0), 0),
      total_net: payrollItems.reduce((s, i) => s + (i?.net_pay ?? 0), 0),
      total_employer_contributions: payrollItems.reduce((s, i) => s + (i?.employer_pf ?? 0) + (i?.employer_esi ?? 0), 0),
      processed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (prError) {
    return new Response(JSON.stringify({ error: prError.message }), { status: 500 })
  }

  // Insert payroll items
  const itemsWithRunId = payrollItems.map((item) => ({
    ...item,
    payroll_run_id: payrollRun.id,
  }))

  const { error: piError } = await supabase
    .from('payroll_items')
    .insert(itemsWithRunId)

  if (piError) {
    return new Response(JSON.stringify({ error: piError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({
      success: true,
      payrollRunId: payrollRun.id,
      totalEmployees: payrollItems.length,
      totalNetPay: payrollRun.total_net,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
