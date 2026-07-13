import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'
import { StatCard } from '@/components/ui/StatCard'

const reviews = [
  { initials: 'AS', name: 'Ananya Sharma', role: 'Product Design', self: 4, manager: 4 },
  { initials: 'RK', name: 'Rohit Kulkarni', role: 'Engineering', self: 3, manager: 5 },
  { initials: 'PN', name: 'Priya Nair', role: 'Sales', self: 5, manager: null },
]

const cycles: Array<{ name: string; period: string; status: 'active' | 'closed' | 'processed' | 'draft' }> = [
  { name: 'Q1 FY 2025-26', period: 'Apr - Jun 2025', status: 'closed' },
  { name: 'Q2 FY 2025-26', period: 'Jul - Sep 2025', status: 'processed' },
  { name: 'Q3 FY 2025-26', period: 'Oct - Dec 2025', status: 'active' },
  { name: 'Annual 2025-26', period: 'Full Year', status: 'draft' },
]

const kpis = [
  { title: 'Project Delivery', weight: 40, target: '4 projects/quarter', actual: '3.5', rating: 4 },
  { title: 'Code Quality', weight: 25, target: '<5 critical bugs', actual: '3 bugs', rating: 4 },
  { title: 'Team Collaboration', weight: 20, target: 'Peer review score >4', actual: '4.2', rating: 5 },
  { title: 'Process Adherence', weight: 15, target: '100% compliance', actual: '95%', rating: 3 },
]

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="glass p-5 mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Appraisal Cycles</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cycles.map((c, i) => (
            <div key={i} className="glass-strong rounded-lg p-4">
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.period}</div>
              <div className="mt-3"><StatusChip type={c.status} label={c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ')} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Q3 Reviews — In Progress</div>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar initials={r.initials} index={i} />
                  <div>
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">Self: {r.self}/5</div>
                  <div className="text-sm font-mono">Mgr: {r.manager ?? '--'}/5</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">KPI Breakdown — Ananya Sharma</div>
          <div className="space-y-4">
            {kpis.map((k, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{k.title}</span>
                  <span className="font-mono text-xs">{k.weight}% · Rating: {k.rating}/5</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Target: {k.target}</span>
                  <span>Actual: {k.actual}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted/30">
                  <div className="h-full rounded-full bg-gradient-to-r from-marigold to-rose" style={{ width: `${(k.rating / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Self Rating" value="3.8" trend="Q3 FY 2025-26" />
        <StatCard label="Avg Manager Rating" value="4.2" trend="↑ 0.3 from Q2" />
        <StatCard label="Reviews Completed" value="42 / 132" trend="32% completion" />
        <StatCard label="Top Performer" value="Rohit K." trend="Rating: 4.8/5" />
      </div>
    </DashboardLayout>
  )
}
