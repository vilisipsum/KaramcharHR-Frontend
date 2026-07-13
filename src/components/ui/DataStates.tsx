'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, AlertCircle, FileText, Search, RefreshCw } from 'lucide-react'

interface LoadingStateProps {
  isLoading: boolean
  children?: React.ReactNode
  fallback?: React.ReactNode
  skeletonCount?: number
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback,
  skeletonCount = 5 
}: LoadingStateProps) {
  if (isLoading) {
    return fallback || (
      <div className="space-y-4" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  return <>{children}</>
}

function SkeletonCard() {
  return (
    <div className="glass p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
  )
}

interface ErrorStateProps {
  error: Error | string | null
  onRetry?: () => void
  title?: string
  description?: string
  children?: React.ReactNode
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  description,
  children 
}: ErrorStateProps) {
  if (!error) return children ? <>{children}</> : null

  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className="glass p-8 text-center" role="alert">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-4 max-w-md mx-auto">
        {description || errorMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  secondaryAction,
  className 
}: EmptyStateProps) {
  return (
    <div className={`glass p-12 text-center ${className || ''}`}>
      {icon ? (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
          {icon}
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/60 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {action && (
            <button
              onClick={action.onClick}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {action.icon || <Search className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="btn btn-ghost"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface DataStateProps<T> {
  data: T[] | null | undefined
  isLoading: boolean
  error: Error | string | null
  children: (data: T[]) => React.ReactNode
  emptyTitle: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  onRetry?: () => void
  skeletonCount?: number
}

export function DataState<T>({
  data,
  isLoading,
  error,
  children,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  onRetry,
  skeletonCount = 5,
}: DataStateProps<T>) {
  if (isLoading) {
    return (
      <LoadingState isLoading={true} skeletonCount={skeletonCount} />
    )
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  const items = data ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
      />
    )
  }

  return <>{children(items)}</>
}

// Optimistic UI wrapper
interface OptimisticStateProps<T> {
  data: T[]
  pendingMutations: Map<string, { type: 'create' | 'update' | 'delete'; data: Partial<T> }>
  children: (data: T[]) => React.ReactNode
}

export function OptimisticState<T extends { id: string }>({
  data,
  pendingMutations,
  children,
}: OptimisticStateProps<T>) {
  const mergedData = useMemo(() => {
    let result = [...data]
    
    pendingMutations.forEach((mutation, key) => {
      switch (mutation.type) {
        case 'create':
          result = [{ ...mutation.data } as T, ...result]
          break
        case 'update':
          result = result.map(item => 
            item.id === key ? { ...item, ...mutation.data } : item
          )
          break
        case 'delete':
          result = result.filter(item => item.id !== key)
          break
      }
    })
    
    return result
  }, [data, pendingMutations])

  return <>{children(mergedData)}</>
}