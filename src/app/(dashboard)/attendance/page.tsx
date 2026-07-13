import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Present today" value="118 / 132" trend="89% headcount" />
        <StatCard label="On leave" value="9" />
        <StatCard label="Late arrivals" value="3" trend="↓ 2 from yesterday" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5 flex flex-col items-center justify-center gap-4">
          <ProgressRing value={86} label="8h 40m" sublabel="CLOCKED IN" />
          <button className="btn btn-primary">Punch Out</button>
        </div>
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Today&apos;s activity</div>
          <div className="space-y-3">
            {[
              { name: 'Ananya Sharma', time: '09:02 AM', status: 'present' as const },
              { name: 'Rohit Kulkarni', time: '09:15 AM', status: 'present' as const },
              { name: 'Priya Nair', time: '--', status: 'leave' as const },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="font-semibold text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">Clock in: {a.time}</div>
                </div>
                <StatusChip type={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
