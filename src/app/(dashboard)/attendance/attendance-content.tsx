'use client'

import { StatCard } from '@/components/ui/StatCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatusChip } from '@/components/ui/StatusChip'

interface AttendanceContentProps {
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
}

export function AttendanceContent({ stats, attendance }: AttendanceContentProps) {
  const presentToday = `${stats.presentCount} / ${stats.totalEmployees}`
  const presentPct = stats.totalEmployees > 0 ? Math.round((stats.presentCount / stats.totalEmployees) * 100) : 0
  const clockInRecord = attendance.find(a => a.clock_in)

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Present today" value={presentToday} trend={`${presentPct}% headcount`} />
        <StatCard label="On leave" value={stats.onLeaveCount} />
        <StatCard label="Late arrivals" value={attendance.filter(a => a.status === 'late').length} trend="↓ 2 from yesterday" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5 flex flex-col items-center justify-center gap-4">
          <ProgressRing value={presentPct} label={clockInRecord?.clock_in ? new Date(clockInRecord.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '0h 0m'} sublabel="CLOCKED IN" />
          <button className="btn btn-primary w-full sm:w-auto">Punch Out</button>
        </div>
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Today&apos;s activity</div>
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No attendance records yet</div>
            ) : (
              attendance.slice(0, 10).map((a, i) => (
                <div key={a.employee_id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-semibold text-sm">{a.employees.first_name} {a.employees.last_name}</div>
                    <div className="text-xs text-muted-foreground">Clock in: {a.clock_in ? new Date(a.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}</div>
                  </div>
                  <StatusChip type={a.status as any} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}