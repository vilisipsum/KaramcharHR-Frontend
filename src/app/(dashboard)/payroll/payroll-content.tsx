'use client'

import { StatusChip } from '@/components/ui/StatusChip'

interface PayrollContentProps {
  payrollRuns: Array<{
    id: string
    month: number
    year: number
    status: string
    total_gross: number
    total_deductions: number
    total_net: number
    processed_at: string | null
  }>
  employeeSalary: {
    salary_structures: {
      ctc_annual: number
      basic_percent: number
      hra_percent: number
      special_allowance_percent: number
      conveyance_monthly: number
      medical_allowance_monthly: number
      lta_monthly: number
      other_allowances_monthly: number
      pf_employee_rate: number
      pf_employer_rate: number
      esi_applicable: boolean
      professional_tax_monthly: number
    } | null
    effective_from: string
    is_active: boolean
  } | null
  salaryStructures: Array<{
    id: string
    name: string
    ctc_annual: number
    basic_percent: number
    hra_percent: number
    is_active: boolean
  }>
}

export function PayrollContent({ payrollRuns, employeeSalary, salaryStructures }: PayrollContentProps) {
  const structure = employeeSalary?.salary_structures
  const basic = structure ? (structure.ctc_annual * structure.basic_percent) / 100 : 0
  const hra = structure ? (structure.ctc_annual * structure.hra_percent) / 100 : 0
  const special = structure ? (structure.ctc_annual * structure.special_allowance_percent) / 100 : 0
  const conveyance = structure?.conveyance_monthly ?? 0
  const medical = structure?.medical_allowance_monthly ?? 0
  const lta = structure?.lta_monthly ?? 0
  const other = structure?.other_allowances_monthly ?? 0
  const grossMonthly = basic/12 + hra/12 + special/12 + conveyance + medical + lta/12 + other

  const pfEmp = structure ? (basic * structure.pf_employee_rate) / 100 / 12 : 0
  const pfEmployer = structure ? (basic * structure.pf_employer_rate) / 100 / 12 : 0
  const esi = structure?.esi_applicable ? grossMonthly * 0.0075 : 0
  const pt = structure?.professional_tax_monthly ?? 0
  const tds = 0 // placeholder
  const totalDeductions = pfEmp + esi + pt + tds
  const netPay = grossMonthly - totalDeductions

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Payslip — {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase text-slate-500 mb-2">Earnings</div>
              {structure && [
                { l: 'Basic', a: basic/12 },
                { l: 'HRA', a: hra/12 },
                { l: 'Special Allowance', a: special/12 },
                { l: 'Conveyance', a: conveyance },
                { l: 'Medical', a: medical },
                { l: 'LTA', a: lta/12 },
                { l: 'Other Allowances', a: other },
              ].map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-dashed border-border">
                  <span>{e.l}</span><span className="font-mono">₹ {e.a.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-slate-500 mb-2">Deductions</div>
              {structure && [
                { l: 'PF (Employee)', a: pfEmp },
                { l: 'ESI', a: esi },
                { l: 'Professional Tax', a: pt },
                { l: 'TDS', a: tds },
              ].map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-dashed border-border">
                  <span>{e.l}</span><span className="font-mono">₹ {e.a.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-indigo rounded-lg p-4 flex justify-between items-center text-slate-800">
            <span className="font-semibold">Net Pay</span>
            <span className="font-mono text-xl font-semibold">₹ {netPay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary">Download PDF</button>
            <button className="btn btn-ghost">Tax summary</button>
          </div>
        </div>

        <div className="glass p-5 overflow-x-auto">
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Payroll run — {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="font-mono text-[10px] uppercase text-slate-500 border-b border-border">
                <th className="text-left py-2.5 px-3">Department</th>
                <th className="text-left py-2.5 px-3">Employees</th>
                <th className="text-left py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payrollRuns.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-slate-500 py-8">No payroll runs yet</td>
                </tr>
              ) : (
                payrollRuns.map((r, i) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="py-3 px-3">Company-wide</td>
                    <td className="py-3 px-3">—</td>
                    <td className="py-3 px-3"><StatusChip type={r.status as any} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}