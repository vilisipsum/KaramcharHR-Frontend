import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Avatar } from '@/components/ui/Avatar'

export default function EmployeesPage() {
  return (
    <DashboardLayout>
      <div className="field max-w-xs">
        <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Search</label>
        <input type="text" placeholder="Search by name, team, ID…" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { i: 'AS', n: 'Ananya Sharma', r: 'Product Design' },
            { i: 'RK', n: 'Rohit Kulkarni', r: 'Engineering', idx: 1 },
            { i: 'PN', n: 'Priya Nair', r: 'Sales', idx: 2 },
            { i: 'DR', n: 'Devika Rao', r: 'Operations', idx: 3 },
            { i: 'SK', n: 'Sameer Khan', r: 'Finance', idx: 4 },
            { i: 'MT', n: 'Meera Iyer', r: 'HR', idx: 0 },
          ].map((emp, i) => (
            <div key={i} className="glass p-4 flex flex-col items-center gap-2 text-center">
              <Avatar initials={emp.i} index={emp.idx ?? i} />
              <div className="font-semibold text-sm">{emp.n}</div>
              <div className="text-xs text-muted-foreground">{emp.r}</div>
            </div>
          ))}
        </div>

        <div className="glass p-5">
          <div className="flex gap-3 items-center mb-4">
            <Avatar initials="AS" size="lg" />
            <div>
              <div className="font-semibold">Ananya Sharma</div>
              <div className="text-xs text-muted-foreground">Product Designer · EMP-2291</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[{ k: 'PAN', v: 'ABCPS1234K' }, { k: 'Aadhaar', v: 'XXXX XXXX 8842' }, { k: 'UAN', v: '100488229100' }, { k: 'Bank', v: 'HDFC ••4471' }].map((kv, i) => (
              <div key={i} className="bg-muted/20 rounded-md p-2.5">
                <div className="font-mono text-[10px] text-muted-foreground uppercase">{kv.k}</div>
                <div className="font-semibold text-sm mt-0.5">{kv.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
