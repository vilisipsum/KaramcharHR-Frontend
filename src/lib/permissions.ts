export type Role = 'super_admin' | 'org_admin' | 'hr_manager' | 'manager' | 'employee'

export type Permission = 
  | 'employees.view'
  | 'employees.create'
  | 'employees.edit'
  | 'employees.delete'
  | 'payroll.view'
  | 'payroll.process'
  | 'payroll.approve'
  | 'leaves.view'
  | 'leaves.approve'
  | 'attendance.view'
  | 'attendance.edit'
  | 'recruitment.view'
  | 'recruitment.create'
  | 'performance.view'
  | 'performance.review'
  | 'settings.view'
  | 'settings.edit'
  | 'reports.view'
  | 'users.manage'
  | 'roles.manage'

// Role → Permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
    'payroll.view', 'payroll.process', 'payroll.approve',
    'leaves.view', 'leaves.approve',
    'attendance.view', 'attendance.edit',
    'recruitment.view', 'recruitment.create',
    'performance.view', 'performance.review',
    'settings.view', 'settings.edit',
    'reports.view',
    'users.manage', 'roles.manage',
  ],
  org_admin: [
    'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
    'payroll.view', 'payroll.process', 'payroll.approve',
    'leaves.view', 'leaves.approve',
    'attendance.view', 'attendance.edit',
    'recruitment.view', 'recruitment.create',
    'performance.view', 'performance.review',
    'settings.view', 'settings.edit',
    'reports.view',
    'users.manage',
  ],
  hr_manager: [
    'employees.view', 'employees.create', 'employees.edit',
    'payroll.view', 'payroll.process',
    'leaves.view', 'leaves.approve',
    'attendance.view', 'attendance.edit',
    'recruitment.view', 'recruitment.create',
    'performance.view',
    'settings.view',
    'reports.view',
  ],
  manager: [
    'employees.view',
    'leaves.view', 'leaves.approve',
    'attendance.view',
    'performance.view', 'performance.review',
    'reports.view',
  ],
  employee: [
    'employees.view',
    'leaves.view',
    'attendance.view',
    'performance.view',
  ],
}

// Role hierarchy (higher number = more access)
const roleHierarchy: Record<Role, number> = {
  super_admin: 100,
  org_admin: 80,
  hr_manager: 60,
  manager: 40,
  employee: 20,
}

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasRole(userRole: Role | null, minimumRole: Role): boolean {
  if (!userRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}

export function canManageRole(actorRole: Role | null, targetRole: Role): boolean {
  if (!actorRole) return false
  // You can only manage roles below your own
  return roleHierarchy[actorRole] > roleHierarchy[targetRole]
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Organization Admin',
    hr_manager: 'HR Manager',
    manager: 'Manager',
    employee: 'Employee',
  }
  return labels[role]
}

export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    super_admin: 'from-rose to-marigold',
    org_admin: 'from-marigold to-amber',
    hr_manager: 'from-teal to-indigo',
    manager: 'from-indigo to-rose',
    employee: 'from-muted-foreground to-muted',
  }
  return colors[role]
}
