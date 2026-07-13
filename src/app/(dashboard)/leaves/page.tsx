import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'

export default function LeavesPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Casual Leave" value={<>4.5 <span className="text-muted-foreground text-sm">/ 12</span></>} />
        <StatCard label="Sick Leave" value={<>6 <span className="text-muted-foreground text-sm">/ 10</span></>} />
        <StatCard label="Earned Leave" value={<>11 <span className="text-muted-foreground text-sm">/ 15</span></>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5 overflow-x-auto">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Recent requests</div>
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="font-mono text-[10px] uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2.5 px-3">Employee</th>
                <th className="text-left py-2.5 px-3">Type</th>
                <th className="text-left py-2.5 px-3">Dates</th>
                <th className="text-left py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Rohit Kulkarni', type: 'Sick Leave', dates: '08–09 Jul', status: 'approved' as const },
                { name: 'Priya Nair', type: 'Casual Leave', dates: '14–15 Aug', status: 'pending' as const },
                { name: 'Devika Rao', type: 'Earned Leave', dates: '02–06 Sep', status: 'rejected' as const },
              ].map((r, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-3 px-3">{r.name}</td>
                  <td className="py-3 px-3">{r.type}</td>
                  <td className="py-3 px-3">{r.dates}</td>
                  <td className="py-3 px-3"><StatusChip type={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Apply for leave</div>
          <div className="space-y-4">
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Leave type</label>
              <select className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm">
                <option>Casual Leave</option><option>Sick Leave</option><option>Earned Leave</option>
              </select>
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">From — To</label>
              <input type="text" placeholder="14 Aug – 15 Aug" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Reason</label>
              <input type="text" placeholder="Family function" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <button className="btn btn-primary w-full">Submit request</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
