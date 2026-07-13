import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatusChip } from '@/components/ui/StatusChip'

export default function PayrollPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Payslip — July 2026 · Ananya Sharma</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground mb-2">Earnings</div>
              {[{ l: 'Basic', a: '₹ 45,000' }, { l: 'HRA', a: '₹ 18,000' }, { l: 'DA', a: '₹ 6,750' }, { l: 'Special Allowance', a: '₹ 9,500' }].map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-dashed border-border">
                  <span>{e.l}</span><span className="font-mono">{e.a}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground mb-2">Deductions</div>
              {[{ l: 'PF (Employee)', a: '₹ 5,400' }, { l: 'ESI', a: '₹ 585' }, { l: 'Professional Tax', a: '₹ 200' }, { l: 'TDS', a: '₹ 3,815' }].map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-dashed border-border">
                  <span>{e.l}</span><span className="font-mono">{e.a}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-marigold to-rose rounded-lg p-4 flex justify-between items-center text-white">
            <span className="font-semibold">Net Pay</span>
            <span className="font-mono text-xl font-semibold">₹ 69,250</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary">Download PDF</button>
            <button className="btn btn-ghost">Tax summary</button>
          </div>
        </div>

        <div className="glass p-5 overflow-x-auto">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Payroll run — July 2026</div>
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="font-mono text-[10px] uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2.5 px-3">Department</th>
                <th className="text-left py-2.5 px-3">Employees</th>
                <th className="text-left py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[{ dept: 'Engineering', emp: 54, status: 'processed' as const }, { dept: 'Sales', emp: 31, status: 'processed' as const }, { dept: 'Operations', emp: 28, status: 'pending' as const }, { dept: 'HR & Admin', emp: 19, status: 'pending' as const }].map((r, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-3 px-3">{r.dept}</td>
                  <td className="py-3 px-3">{r.emp}</td>
                  <td className="py-3 px-3"><StatusChip type={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
