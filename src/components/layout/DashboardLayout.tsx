import { BackgroundBlobs } from './BackgroundBlobs'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CopilotChat } from '@/components/ai/CopilotChat'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <div className="relative z-10 flex flex-col gap-4 p-4">
        <Topbar />
        <div className="flex gap-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Sidebar />
          <main className="flex-1 space-y-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <CopilotChat />
    </div>
  )
}
