'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'
import { LeavePredictWidget } from '@/components/ai/LeavePredictWidget'
import { punchIn, punchOut } from '@/app/attendance/actions'

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
  employeeId: string | null
}

export function DashboardContent({ stats, attendance, leaveBalances, employeeId }: DashboardContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Find logged-in user's record
  const userRecord = employeeId ? attendance.find(a => a.employee_id === employeeId) : null
  const [elapsed, setElapsed] = useState('0h 0m')
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    if (!userRecord?.clock_in || userRecord?.clock_out) {
      setElapsed('0h 0m')
      setPercent(0)
      return
    }

    const updateTimer = () => {
      const diffMs = Date.now() - new Date(userRecord.clock_in!).getTime()
      const totalMin = Math.max(0, Math.floor(diffMs / 60000))
      const hours = Math.floor(totalMin / 60)
      const mins = totalMin % 60
      setElapsed(`${hours}h ${mins}m`)
      
      // Assume 8-hour workday = 100%
      const pct = Math.min(Math.round((totalMin / 480) * 100), 100)
      setPercent(pct)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [userRecord])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handlePunch = () => {
    startTransition(async () => {
      if (!userRecord) {
        const res = await punchIn()
        if (res.error) showToast(res.error, 'error')
        else {
          showToast(res.success!, 'success')
          router.refresh()
        }
      } else {
        const res = await punchOut()
        if (res.error) showToast(res.error, 'error')
        else {
          showToast(res.success!, 'success')
          router.refresh()
        }
      }
    })
  }

  const presentToday = `${stats.presentCount} / ${stats.totalEmployees}`

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
        }`}>
          {toast.message}
        </div>
      )}

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
          <ProgressRing value={percent} label={elapsed} sublabel={userRecord?.clock_out ? "CLOCKED OUT" : userRecord?.clock_in ? "CLOCKED IN" : "NOT CLOCKED IN"} />
          {userRecord?.clock_out ? (
            <button disabled className="btn bg-white/10 text-muted-foreground w-full sm:w-auto cursor-not-allowed">
              Punched Out for Today
            </button>
          ) : (
            <button
              onClick={handlePunch}
              disabled={isPending}
              className={`btn btn-primary w-full sm:w-auto cursor-pointer ${isPending ? 'opacity-50' : ''}`}
            >
              {isPending ? 'Processing...' : userRecord?.clock_in ? 'Punch Out' : 'Punch In'}
            </button>
          )}
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