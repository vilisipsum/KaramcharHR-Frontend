'use client'

import { usePermissions } from '@/hooks/usePermissions'
import type { Permission, Role } from '@/lib/permissions'

export function PermissionGate({ permission, fallback, children }: {
  permission?: Permission
  minRole?: Role
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { can, isAtLeast, loading } = usePermissions()

  if (loading) return null
  if (permission && !can(permission)) return fallback ?? null
  
  return <>{children}</>
}

export function RoleGate({ role, fallback, children }: {
  role: Role
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { isAtLeast, loading } = usePermissions()

  if (loading) return null
  if (!isAtLeast(role)) return fallback ?? null
  
  return <>{children}</>
}
