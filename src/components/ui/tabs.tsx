'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode | ((context: { value: string; onValueChange: (value: string) => void }) => React.ReactNode)
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, className, ...props }, ref) => {
    const activeValue = value || defaultValue || ''
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {typeof children === 'function' ? children({ value: activeValue, onValueChange: onValueChange || (() => {}) }) : children}
      </div>
    )
  }
)
Tabs.displayName = 'Tabs'

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-800/50 p-1 text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  disabled?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === value
    
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-amber-500/20 text-amber-400 shadow-sm'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50',
          className
        )}
        {...props}
        disabled={disabled}
        onClick={() => context?.onValueChange?.(value)}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  forceMount?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === value
    
    if (!isActive && !forceMount) return null
    
    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

interface TabsContextValue {
  value: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export { Tabs, TabsList, TabsTrigger, TabsContent }