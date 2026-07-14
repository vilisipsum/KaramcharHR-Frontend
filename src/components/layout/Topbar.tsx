'use client'

import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { NLSearchBar } from '@/components/ai/NLSearchBar'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <header className="bg-white border border-slate-200/60 flex items-center justify-between px-8 py-3 rounded-[28px] shadow-[0_10px_35px_-12px_rgba(67,56,202,0.02)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 hover:bg-slate-50 rounded-lg text-slate-700 border border-slate-200 mr-1 cursor-pointer flex items-center justify-center"
          title="Open Menu"
        >
          <span className="text-lg">☰</span>
        </button>
        <Logo className="w-6 h-6" />
        <span className="font-heading font-extrabold text-sm hidden md:block text-slate-800">KaramcharHR</span>
      </div>
      <div className="flex-1 max-w-xl mx-4">
        <NLSearchBar />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
        >
          {dark ? '☀ Light' : '☾ Dark'}
        </button>
      </div>
    </header>
  )
}
