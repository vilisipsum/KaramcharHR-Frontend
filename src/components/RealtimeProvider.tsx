'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeContextValue {
  isConnected: boolean
  connectionError: Error | null
  subscribe: (channelName: string, config: {
    table: string
    event?: string
    filter?: string
    callback: (payload: any) => void
  }) => () => void
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map())

  const subscribe = (channelName: string, config: {
    table: string
    event?: string
    filter?: string
    callback: (payload: any) => void
  }) => {
    const supabase = createClient()
    
    // Remove existing channel with same name
    const existingChannel = channelsRef.current.get(channelName)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: config.event || '*',
          schema: 'public',
          table: config.table,
          filter: config.filter,
        },
        config.callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setConnectionError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionError(new Error(`Channel error: ${channelName}`))
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    channelsRef.current.set(channelName, channel)

    return () => {
      supabase.removeChannel(channel)
      channelsRef.current.delete(channelName)
    }
  }

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      const supabase = createClient()
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel)
      })
      channelsRef.current.clear()
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{ isConnected, connectionError, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider')
  }
  return context
}

// Hook for subscribing to specific table changes with auto-cleanup
export function useTableSubscription<T = any>(
  table: string,
  callback: (payload: { eventType: string; new: T; old: T }) => void,
  options?: {
    event?: string
    filter?: string
    enabled?: boolean
  }
) {
  const { subscribe, isConnected } = useRealtimeContext()
  const channelNameRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!options?.enabled) return

    const channelName = `table-${table}-${options.filter || 'all'}-${Date.now()}`
    channelNameRef.current = channelName

    const unsubscribe = subscribe(channelName, {
      table,
      event: options.event,
      filter: options.filter,
      callback,
    })

    return unsubscribe
  }, [table, options?.event, options?.filter, options?.enabled, subscribe, callback])

  return { isConnected }
}

// Hook for optimistic updates with real-time sync
export function useOptimisticSync<T extends { id: string }>(
  table: string,
  orgId: string,
  initialData: T[]
) {
  const [data, setData] = useState<T[]>(initialData)
  const { subscribe } = useRealtimeContext()

  useEffect(() => {
    const unsubscribe = subscribe(`optimistic-${table}-${orgId}`, {
      table,
      filter: `org_id=eq.${orgId}`,
      callback: (payload) => {
        setData(prev => {
          switch (payload.eventType) {
            case 'INSERT':
              return [...prev, payload.new as T]
            case 'UPDATE':
              return prev.map(item => 
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            case 'DELETE':
              return prev.filter(item => item.id !== payload.old.id)
            default:
              return prev
          }
        })
      },
    })

    return unsubscribe
  }, [table, orgId, subscribe])

  const optimisticUpdate = useCallback((updates: Partial<T> & { id: string }) => {
    setData(prev => prev.map(item => 
      item.id === updates.id ? { ...item, ...updates } : item
    ))
  }, [])

  const optimisticInsert = useCallback((newItem: T) => {
    setData(prev => [...prev, newItem])
  }, [])

  const optimisticDelete = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id))
  }, [])

  return { data, optimisticUpdate, optimisticInsert, optimisticDelete }
}