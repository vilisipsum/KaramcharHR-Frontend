import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/super-admin'
import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin()
  if (!session) redirect('/auth/login')

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Super Admin Sidebar */}
      <div className="hidden lg:flex w-64 shrink-0">
        <SuperAdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 shrink-0 border-b border-border/30 flex items-center px-6 gap-4 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Super Admin</span>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {session.user.email}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
