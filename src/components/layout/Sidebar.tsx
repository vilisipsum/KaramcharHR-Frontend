'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { RoleGate } from '@/components/ui/PermissionGate'
import type { Permission } from '@/lib/permissions'

const navItems: Array<{ label: string; href: string; icon: string; permission?: Permission; minRole?: string }> = [
  { label: 'Dashboard', href: '/', icon: '◉' },
  { label: 'Attendance', href: '/attendance', icon: '◷', permission: 'attendance.view' },
  { label: 'Leave', href: '/leaves', icon: '⊡', permission: 'leaves.view' },
  { label: 'Payroll', href: '/payroll', icon: '₨', permission: 'payroll.view' },
  { label: 'Employees', href: '/employees', icon: '⊞', permission: 'employees.view' },
  { label: 'Recruitment', href: '/recruitment', icon: '⊟', permission: 'recruitment.view' },
  { label: 'Performance', href: '/performance', icon: '★', permission: 'performance.view' },
  { label: 'Reports', href: '#', icon: '▤', permission: 'reports.view' },
  { label: 'Settings', href: '/settings', icon: '⚙', permission: 'settings.view' },
]

export function Sidebar() {
  const path = usePathname()
  const { can } = usePermissions()

  return (
    <aside className="glass p-5 flex flex-col gap-2 h-full min-w-[200px]">
      <div className="font-display font-semibold mb-6 flex items-center gap-2 text-lg">
        <span className="font-deva text-2xl bg-gradient-to-r from-marigold to-rose bg-clip-text text-transparent">कर्मचारी</span>
        KaramcharHR
      </div>
      {navItems.map((item) => {
        if (item.permission && !can(item.permission)) return null
        const active = path === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all ${
              active
                ? 'bg-gradient-to-r from-marigold/20 to-rose/20 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="opacity-50 text-xs">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}

      <div className="mt-auto pt-4 border-t border-border">
        <RoleGate role="org_admin">
          <Link
            href="/settings/roles"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all ${
              path === '/settings/roles' ? 'bg-gradient-to-r from-marigold/20 to-rose/20 text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="opacity-50 text-xs">👥</span>
            Team & Roles
          </Link>
        </RoleGate>
      </div>
    </aside>
  )
}
