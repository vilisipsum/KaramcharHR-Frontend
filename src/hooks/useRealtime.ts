'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/client'
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js'

type TableName = 
  | 'employees' 
  | 'leave_requests' 
  | 'expense_claims' 
  | 'payroll_runs' 
  | 'attendance' 
  | 'departments' 
  | 'designations'
  | 'leave_types'
  | 'holidays'

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface RealtimeOptions<T> {
  table: TableName
  event?: EventType
  filter?: string
  onInsert?: (newRecord: T) => void
  onUpdate?: (newRecord: T, oldRecord: T) => void
  onDelete?: (deletedRecord: T) => void
  onError?: (error: Error) => void
}

interface UseRealtimeReturn<T> {
  subscribe: (options: RealtimeOptions<T>) => () => void
  isConnected: boolean
  lastEvent: RealtimePostgresChangesPayload<any> | null
  error: Error | null
}

export function useRealtime<T = any>(): UseRealtimeReturn<T> {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimePostgresChangesPayload<any> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const subscribe = useCallback((options: RealtimeOptions<T>) => {
    const supabase = createClient()
    
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`realtime-${options.table}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter,
        },
        (payload) => {
          setLastEvent(payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              options.onInsert?.(payload.new as T)
              break
            case 'UPDATE':
              options.onUpdate?.(payload.new as T, payload.old as T)
              break
            case 'DELETE':
              options.onDelete?.(payload.old as T)
              break
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        if (status === 'CHANNEL_ERROR') {
          const err = new Error(`Realtime connection error for ${options.table}`)
          setError(err)
          options.onError?.(err)
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return { subscribe, isConnected, lastEvent, error }
}

// Specialized hooks for common use cases
export function useEmployeeRealtime(
  orgId: string,
  callbacks: {
    onInsert?: (employee: any) => void
    onUpdate?: (employee: any) => void
    onDelete?: (employee: any) => void
  }
) {
  const { subscribe, isConnected, lastEvent, error } = useRealtime()
  
  useEffect(() => {
    if (!orgId) return
    
    const unsubscribe = subscribe({
      table: 'employees',
      filter: `org_id=eq.${orgId}`,
      ...callbacks,
    })
    
    return unsubscribe
  }, [orgId, subscribe, callbacks])

  return { isConnected, lastEvent, error }
}

export function useLeaveRequestRealtime(
  orgId: string,
  callbacks: {
    onInsert?: (request: any) => void
    onUpdate?: (request: any) => void
    onDelete?: (request: any) => void
  }
) {
  const { subscribe, isConnected, lastEvent, error } = useRealtime()
  
  useEffect(() => {
    if (!orgId) return
    
    const unsubscribe = subscribe({
      table: 'leave_requests',
      filter: `employee_id=in.(select id from employees where org_id=eq.${orgId})`,
      ...callbacks,
    })
    
    return unsubscribe
  }, [orgId, subscribe, callbacks])

  return { isConnected, lastEvent, error }
}

export function useExpenseClaimRealtime(
  orgId: string,
  callbacks: {
    onInsert?: (claim: any) => void
    onUpdate?: (claim: any) => void
    onDelete?: (claim: any) => void
  }
) {
  const { subscribe, isConnected, lastEvent, error } = useRealtime()
  
  useEffect(() => {
    if (!orgId) return
    
    const unsubscribe = subscribe({
      table: 'expense_claims',
      filter: `employee_id=in.(select id from employees where org_id=eq.${orgId})`,
      ...callbacks,
    })
    
    return unsubscribe
  }, [orgId, subscribe, callbacks])

  return { isConnected, lastEvent, error }
}

export function usePayrollRealtime(
  orgId: string,
  callbacks: {
    onInsert?: (run: any) => void
    onUpdate?: (run: any) => void
  }
) {
  const { subscribe, isConnected, lastEvent, error } = useRealtime()
  
  useEffect(() => {
    if (!orgId) return
    
    const unsubscribe = subscribe({
      table: 'payroll_runs',
      filter: `org_id=eq.${orgId}`,
      ...callbacks,
    })
    
    return unsubscribe
  }, [orgId, subscribe, callbacks])

  return { isConnected, lastEvent, error }
}

export function useAttendanceRealtime(
  orgId: string,
  callbacks: {
    onInsert?: (attendance: any) => void
    onUpdate?: (attendance: any) => void
  }
) {
  const { subscribe, isConnected, lastEvent, error } = useRealtime()
  
  useEffect(() => {
    if (!orgId) return
    
    const unsubscribe = subscribe({
      table: 'attendance',
      filter: `employee_id=in.(select id from employees where org_id=eq.${orgId})`,
      ...callbacks,
    })
    
    return unsubscribe
  }, [orgId, subscribe, callbacks])

  return { isConnected, lastEvent, error }
}

// Hook for presence (online users)
export function usePresence(channelName: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    let channel: RealtimeChannel | null = null
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted || !user) return
      
      channel = supabase.channel(`presence-${channelName}`, {
        config: { presence: { key: user.id } }
      })
      
      channelRef.current = channel
      
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!channel) return
          const state = channel.presenceState()
          const users = Object.values(state || {}).flatMap(p => p).map((p: any) => p.user_id).filter(Boolean)
          setOnlineUsers(users as string[])
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          setOnlineUsers(prev => [...prev, key])
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          setOnlineUsers(prev => prev.filter(u => u !== key))
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const { data: { user: u } } = await supabase.auth.getUser()
            if (u) {
              await channel?.track({ user_id: u.id, online_at: new Date().toISOString() })
            }
          }
        })
    })

    return () => {
      mounted = false
      if (channel) {
        channel.untrack()
        supabase.removeChannel(channel)
      }
    }
  }, [channelName])

  return onlineUsers
}

// Hook for broadcasting custom events
export function useBroadcast<T>(channelName: string) {
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  const broadcast = useCallback(async (event: string, payload: T) => {
    if (!channelRef.current) return
    await channelRef.current.send({ type: 'broadcast', event, payload })
  }, [])

  useEffect(() => {
    const channel = supabase.channel(`broadcast-${channelName}`)
    channelRef.current = channel
    channel.subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName])

  return { broadcast }
}
