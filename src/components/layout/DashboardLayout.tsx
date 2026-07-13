'use client'

import { useState } from 'react'
import { BackgroundBlobs } from './BackgroundBlobs'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CopilotChat } from '@/components/ai/CopilotChat'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <div className="relative z-10 flex flex-col gap-4 p-4">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex gap-5 relative" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block min-w-[200px]">
            <Sidebar />
          </div>

          {/* Mobile Drawer Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsSidebarOpen(false)}
              />
              {/* Drawer Content */}
              <div className="relative z-10 w-[240px] h-full bg-[#0F0B22] border-r border-border/30 p-4 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-display font-semibold text-lg text-white">Navigation</span>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 cursor-pointer flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar onClose={() => setIsSidebarOpen(false)} />
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 space-y-6 overflow-x-hidden p-1">
            {children}
          </main>
        </div>
      </div>
      <CopilotChat />
    </div>
  )
}
