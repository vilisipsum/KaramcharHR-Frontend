'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchResult {
  results: any[]
  explanation: string
  summary: string
  count: number
}

export function NLSearchBar() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<Array<{ query: string; result: SearchResult }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  async function search() {
    if (!query.trim() || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/nl-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
      setHistory(prev => [{ query, result: data }, ...prev])
      setQuery('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="glass-strong rounded-xl px-4 py-2.5 text-sm text-slate-800/40 hover:text-slate-500 transition-colors flex items-center gap-2 w-full"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Ask anything about your HR data...
        <span className="ml-auto text-[10px] text-slate-800/20 font-mono">⌘K</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl glass-strong rounded-2xl shadow-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <form onSubmit={e => { e.preventDefault(); search() }} className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='e.g. "Who joined last month?" or "Show late arrivals this week"'
                className="flex-1 bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 py-3 rounded-xl bg-indigo hover:bg-[#3730A3] text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 block border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Search'}
              </button>
            </form>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            {result && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  {result.summary || result.explanation}
                </div>
                {result.count > 0 && (
                  <div className="text-xs text-slate-400 mb-1">{result.count} result{result.count !== 1 ? 's' : ''}</div>
                )}
                <div className="space-y-2">
                  {result.results?.slice(0, 10).map((item, i) => (
                    <div key={i} className="glass rounded-lg p-3 text-xs text-slate-700 font-mono">
                      {JSON.stringify(item, null, 2)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && !result && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="text-[10px] text-slate-800/30 uppercase tracking-wider font-semibold">Recent Searches</div>
                {history.map((h, i) => (
                  <div key={i} className="glass rounded-lg p-3 cursor-pointer" onClick={() => { setQuery(h.query); setResult(h.result) }}>
                    <div className="text-sm text-slate-700">{h.query}</div>
                    <div className="text-xs text-slate-800/40 mt-1">{h.result.summary}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 text-[10px] text-slate-800/20 justify-center pt-1">
              <span>Try: "Who joined this month?"</span>
              <span>"Leave this week"</span>
              <span>"Late arrivals"</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-800/40 hover:text-slate-500">ESC</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
