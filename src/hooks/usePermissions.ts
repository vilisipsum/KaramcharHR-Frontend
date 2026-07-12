'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { hasPermission, hasRole, canManageRole, type Role, type Permission } from '@/lib/permissions'

export function usePermissions() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const userRole = (user?.user_metadata?.role as Role) || 'employee'
      setRole(userRole)
      setLoading(false)
    })
  }, [])

  return {
    role,
    loading,
    can: (permission: Permission) => hasPermission(role, permission),
    isAtLeast: (minimumRole: Role) => hasRole(role, minimumRole),
    canManage: (targetRole: Role) => canManageRole(role, targetRole),
  }
}
