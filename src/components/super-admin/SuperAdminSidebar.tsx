'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Zap,
  ScrollText,
  Megaphone,
  LogOut,
  Shield
} from 'lucide-react'
import { signout } from '@/app/auth/actions'

const navItems = [
  { label: 'Overview', href: '/super-admin', icon: LayoutDashboard, exact: true },
  { label: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
  { label: 'Compliance Slabs', href: '/super-admin/compliance', icon: Shield },
  { label: 'Feature Flags', href: '/super-admin/feature-flags', icon: Zap },
  { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: ScrollText },
  { label: 'Announcements', href: '/super-admin/announcements', icon: Megaphone },
]

export function SuperAdminSidebar() {
  const path = usePathname()

  return (
    <aside className="h-full w-64 flex flex-col p-4 border-r border-border/30 bg-[#0a0716]">
      {/* Logo */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-marigold flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-white tracking-tight">KaramcharHR</p>
            <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = item.exact ? path === item.href : path.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-rose-500/15 to-marigold/10 text-white border border-rose-500/20'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-rose-400' : ''}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/20 pt-3">
        <button
          onClick={() => signout()}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-white hover:bg-white/5 transition-all w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
