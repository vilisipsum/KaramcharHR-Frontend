'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { getRoleLabel } from '@/lib/permissions'
import { RoleGate } from '@/components/ui/PermissionGate'
import { Avatar } from '@/components/ui/Avatar'

const teamMembers = [
  { initials: 'AS', name: 'Ananya Sharma', email: 'ananya@acme.com', role: 'org_admin' as const },
  { initials: 'RK', name: 'Rohit Kulkarni', email: 'rohit@acme.com', role: 'hr_manager' as const },
  { initials: 'PN', name: 'Priya Nair', email: 'priya@acme.com', role: 'manager' as const },
  { initials: 'SM', name: 'Sana Malik', email: 'sana@acme.com', role: 'employee' as const },
  { initials: 'MT', name: 'Meera Iyer', email: 'meera@acme.com', role: 'employee' as const },
]

const rolesList = [
  { role: 'super_admin' as const, count: 1, desc: 'Full platform access, all orgs' },
  { role: 'org_admin' as const, count: 1, desc: 'Full org access, manage settings & billing' },
  { role: 'hr_manager' as const, count: 2, desc: 'Manage employees, payroll, recruitment' },
  { role: 'manager' as const, count: 8, desc: 'Manage team, approve leaves, review performance' },
  { role: 'employee' as const, count: 121, desc: 'Self-service: profile, attendance, leave, payslips' },
]

export default function RolesPage() {
  return (
    <RoleGate role="hr_manager" fallback={
      <div className="glass p-8 text-center">
        <div className="text-slate-500">You don&apos;t have permission to manage roles.</div>
      </div>
    }>
      <div className="glass p-5 mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-6">Role Definitions</div>
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-12 gap-4 font-mono text-[10px] uppercase text-slate-500 px-3 py-2">
            <div className="col-span-2">Role</div>
            <div className="col-span-1">Users</div>
            <div className="col-span-9">Permissions</div>
          </div>
          {rolesList.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 items-center px-3 py-3 rounded-md hover:bg-muted/10">
              <div className="col-span-2 font-semibold text-sm">{getRoleLabel(r.role)}</div>
              <div className="col-span-1 font-mono text-sm">{r.count}</div>
              <div className="col-span-7 text-xs text-slate-500">{r.desc}</div>
              <div className="col-span-2">
                <RoleGate role="org_admin">
                  <button className="btn btn-ghost text-xs py-1">Edit</button>
                </RoleGate>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Team Members</div>
            <div className="text-xs text-slate-500 mt-1">{teamMembers.length} users in your organization</div>
          </div>
          <RoleGate role="org_admin">
            <button className="btn btn-primary text-xs py-1.5 px-3">Invite User</button>
          </RoleGate>
        </div>
        <div className="space-y-2">
          {teamMembers.map((m, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-muted/10">
              <div className="flex items-center gap-3">
                <Avatar initials={m.initials} size="sm" index={i} />
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor(m.role)} text-white`}>
                  {getRoleLabel(m.role)}
                </span>
                <RoleGate role="org_admin">
                  <button className="text-xs text-slate-500 hover:text-foreground">•••</button>
                </RoleGate>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGate>
  )
}

function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: 'from-rose to-marigold',
    org_admin: 'from-marigold to-amber',
    hr_manager: 'from-teal to-indigo',
    manager: 'from-indigo to-rose',
    employee: 'from-muted-foreground to-muted',
  }
  return colors[role] || 'from-muted to-muted'
}
