'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hello! I\'m KaramcharHR Copilot. Ask me anything about HR policies, payroll, leave, attendance, or your organization.' },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || streaming) return

    const userMsg: Message = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    setMessages(prev => [...prev, { role: 'assistant', text: '' }])

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', text: `Error: ${err.error}` }
          return next
        })
        setStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const { text } = JSON.parse(data)
              setMessages(prev => {
                const next = [...prev]
                const last = next[next.length - 1]
                next[next.length - 1] = { ...last, text: last.text + text }
                return next
              })
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', text: `Connection error: ${err.message}` }
        return next
      })
    }

    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">HR Copilot</h1>
        <p className="text-white/60">AI-powered HR assistant for your organization</p>
      </div>

      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-white border border-amber-500/20'
                  : 'bg-white/5 text-white/90 border border-white/10'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${msg.role === 'user' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {msg.role === 'user' ? 'You' : 'Copilot'}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{msg.text || (msg.role === 'assistant' && i === messages.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : null)}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="px-6 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about HR, payroll, leave policies..."
              disabled={streaming}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all whitespace-nowrap"
            >
              {streaming ? 'Thinking...' : 'Send'}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/20">
            Ask about leave balances, payroll, attendance, HR policies, recruitment, or performance reviews.
          </p>
        </form>
      </div>
    </div>
  )
}
