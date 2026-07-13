'use client'

import { StatCard } from '@/components/ui/StatCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'
import { LeavePredictWidget } from '@/components/ai/LeavePredictWidget'

interface DashboardContentProps {
  stats: {
    totalEmployees: number
    presentCount: number
    onLeaveCount: number
    upcomingHoliday: { name: string; date: string } | null
  }
  attendance: Array<{
    employee_id: string
    clock_in: string | null
    clock_out: string | null
    status: string
    employees: { first_name: string; last_name: string; employee_code: string; departments: { name: string } }
  }>
  leaveBalances: Array<{
    leave_types: { name: string; code: string }
    balance: number
    entitled: number
    taken: number
    pending: number
  }>
}

export function DashboardContent({ stats, attendance, leaveBalances }: DashboardContentProps) {
  const presentToday = `${stats.presentCount} / ${stats.totalEmployees}`
  const clockInRecord = attendance.find(a => a.clock_in)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Present today" value={presentToday} trend={`${stats.totalEmployees ? Math.round((stats.presentCount / stats.totalEmployees) * 100) : 0}% headcount`} />
        <StatCard label="On leave" value={stats.onLeaveCount}>
          <div className="flex gap-2 flex-wrap">
            {leaveBalances.slice(0, 3).map((lb, i) => (
              <StatusChip key={i} type="leave" label={`${lb.leave_types?.code}: ${lb.balance}`} />
            ))}
          </div>
        </StatCard>
        <StatCard label="Upcoming holiday" value={stats.upcomingHoliday ? new Date(stats.upcomingHoliday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'None'} trend={stats.upcomingHoliday?.name || 'No upcoming holidays'} />
      </div>
      <LeavePredictWidget />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass p-5 col-span-1 lg:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Attendance — last 14 days</div>
          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-14 gap-1.5 min-w-[280px]">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded ${
                    i % 7 >= 5 ? 'bg-transparent border border-dashed border-border' : 'bg-teal/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-5 flex flex-col items-center justify-center gap-4">
        <ProgressRing value={stats.totalEmployees > 0 ? Math.round((stats.presentCount / stats.totalEmployees) * 100) : 0} label={clockInRecord?.clock_in ? new Date(clockInRecord.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '0h 0m'} sublabel="CLOCKED IN" />
          <button className="btn btn-primary w-full sm:w-auto">Punch Out</button>
        </div>
      </div>

      <div className="glass p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Employee Spotlight</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {attendance.slice(0, 6).map((a, i) => (
            <div key={a.employee_id} className="glass-strong rounded-lg p-4 flex flex-col items-center gap-2 text-center">
              <Avatar initials={`${a.employees.first_name?.[0]}${a.employees.last_name?.[0]}`.toUpperCase()} index={i} size="md" />
              <div className="font-semibold text-sm truncate w-full">{a.employees.first_name} {a.employees.last_name}</div>
              <div className="text-xs text-muted-foreground truncate w-full">{a.employees.departments?.name || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}