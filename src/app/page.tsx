import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'
import { LeavePredictWidget } from '@/components/ai/LeavePredictWidget'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Present today" value="118 / 132" trend="89% headcount" />
        <StatCard label="On leave" value="9">
          <div className="flex gap-2 flex-wrap">
            <StatusChip type="leave" label="3 Casual" />
            <StatusChip type="leave" label="4 Sick" />
            <StatusChip type="leave" label="2 Earned" />
          </div>
        </StatCard>
        <StatCard label="Upcoming holiday" value="15 Aug" trend="Independence Day" />
      </div>
      <LeavePredictWidget />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass p-5 col-span-1 lg:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Attendance — last 14 days</div>
          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-14 gap-1.5 min-w-[280px]">
              {Array.from({ length: 14 }).map((_, i) => {
                const colors = ['bg-teal', 'bg-teal', 'bg-teal', 'bg-teal', 'bg-teal', 'bg-transparent border border-dashed border-border', 'bg-transparent border border-dashed border-border',
                  'bg-teal', 'bg-amber', 'bg-teal', 'bg-teal', 'bg-muted', 'bg-transparent border border-dashed border-border', 'bg-transparent border border-dashed border-border']
                return <div key={i} className={`aspect-square rounded ${colors[i]}`} />
              })}
            </div>
          </div>
        </div>

        <div className="glass p-5 flex flex-col items-center justify-center gap-4">
          <ProgressRing value={86} label="8h 40m" sublabel="CLOCKED IN" />
          <button className="btn btn-primary w-full sm:w-auto">Punch Out</button>
        </div>
      </div>

      <div className="glass p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Employee Spotlight</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { initials: 'AS', name: 'Ananya Sharma', role: 'Product Design' },
            { initials: 'RK', name: 'Rohit Kulkarni', role: 'Engineering', idx: 1 },
            { initials: 'PN', name: 'Priya Nair', role: 'Sales', idx: 2 },
            { initials: 'DR', name: 'Devika Rao', role: 'Operations', idx: 3 },
            { initials: 'SK', name: 'Sameer Khan', role: 'Finance', idx: 4 },
            { initials: 'MT', name: 'Meera Iyer', role: 'HR', idx: 0 },
          ].map((emp, i) => (
            <div key={i} className="glass-strong rounded-lg p-4 flex flex-col items-center gap-2 text-center">
              <Avatar initials={emp.initials} index={emp.idx ?? i} size="md" />
              <div className="font-semibold text-sm truncate w-full">{emp.name}</div>
              <div className="text-xs text-muted-foreground truncate w-full">{emp.role}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
