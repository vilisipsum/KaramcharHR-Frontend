'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatusChip } from '@/components/ui/StatusChip'
import { punchIn, punchOut } from '@/app/attendance/actions'

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
  employeeId: string | null
}

export function AttendanceContent({ stats, attendance, employeeId }: AttendanceContentProps) {
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
  const presentPct = stats.totalEmployees > 0 ? Math.round((stats.presentCount / stats.totalEmployees) * 100) : 0

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Present today" value={presentToday} trend={`${presentPct}% headcount`} />
        <StatCard label="On leave" value={stats.onLeaveCount} />
        <StatCard label="Late arrivals" value={attendance.filter(a => a.status === 'late').length} trend="↓ 2 from yesterday" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5 flex flex-col items-center justify-center gap-4">
          <ProgressRing value={percent} label={elapsed} sublabel={userRecord?.clock_out ? "CLOCKED OUT" : userRecord?.clock_in ? "CLOCKED IN" : "NOT CLOCKED IN"} />
          {userRecord?.clock_out ? (
            <button disabled className="btn bg-slate-100 text-slate-500 w-full sm:w-auto cursor-not-allowed">
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
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Today&apos;s activity</div>
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No attendance records yet</div>
            ) : (
              attendance.slice(0, 10).map((a) => (
                <div key={a.employee_id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-semibold text-sm">{a.employees.first_name} {a.employees.last_name}</div>
                    <div className="text-xs text-slate-500">Clock in: {a.clock_in ? new Date(a.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}</div>
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