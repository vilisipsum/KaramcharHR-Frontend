'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = 'attendance' | 'leave_requests' | 'payroll_runs'
type EventType = 'INSERT' | 'UPDATE' | 'DELETE'

export function useRealtime<T extends Record<string, unknown>>(
  table: TableName,
  event: EventType,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`realtime-${table}`)
      .on<T>('postgres_changes',
        { event, schema: 'public', table },
        (payload) => callbackRef.current(payload)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event])
}

export function useAttendanceLive(callback: (payload: any) => void) {
  return useRealtime('attendance', 'INSERT', callback)
}

export function useLeaveLive(callback: (payload: any) => void) {
  return useRealtime('leave_requests', 'UPDATE', callback)
}

export function usePayrollLive(callback: (payload: any) => void) {
  return useRealtime('payroll_runs', 'UPDATE', callback)
}
