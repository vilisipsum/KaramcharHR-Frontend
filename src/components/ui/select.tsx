'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, ...props }, ref) => (
    <select
      className={cn(
        'flex h-10 w-full appearance-none rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      onChange={(e) => {
        props.onChange?.(e)
        onValueChange?.(e.target.value)
      }}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}
const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className
      )}
      {...props}
    >
      {children}
      <span className="text-gray-400">▼</span>
    </button>
  )
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps {
  placeholder?: string
}
const SelectValue = ({ placeholder }: SelectValueProps) => (
  <span>{placeholder || 'Select...'}</span>
)

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}
const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-900/95 text-white shadow-md',
        className
      )}
      {...props}
    >
      <div className="max-h-96 overflow-y-auto">{children}</div>
    </div>
  )
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}
const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-amber-500/20 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      data-value={value}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }