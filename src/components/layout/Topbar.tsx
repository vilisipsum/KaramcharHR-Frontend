'use client'

import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { NLSearchBar } from '@/components/ai/NLSearchBar'

export function Topbar() {
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
    <header className="glass flex items-center justify-between px-8 py-3 rounded-xl">
      <div className="flex items-center gap-3">
        <Logo className="w-6 h-6" />
        <span className="font-display font-semibold text-lg hidden md:block">KaramcharHR</span>
      </div>
      <div className="flex-1 max-w-xl mx-4">
        <NLSearchBar />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-border bg-white/50 dark:bg-[rgba(32,25,60,0.5)] hover:bg-white/80 transition-colors"
        >
          {dark ? '☀ Light' : '☾ Dark'}
        </button>
      </div>
    </header>
  )
}
