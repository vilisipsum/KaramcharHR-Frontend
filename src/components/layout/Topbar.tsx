'use client'

import { useEffect, useState } from 'react'

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
        <span className="font-deva text-xl bg-gradient-to-r from-marigold to-rose bg-clip-text text-transparent">कर्मचारी</span>
        <span className="font-display font-semibold text-lg">KaramcharHR</span>
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
