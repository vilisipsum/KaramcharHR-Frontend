'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateFeatureFlagDefault } from '@/app/super-admin/actions'
import { Zap, CheckCircle2, XCircle } from 'lucide-react'

type Flag = {
  key: string
  label: string
  description: string
  default_enabled: boolean
  plans_included: string[]
}

const planColors: Record<string, string> = {
  trial: 'text-amber-400 bg-amber-400/10',
  free: 'text-zinc-400 bg-zinc-400/10',
  starter: 'text-teal bg-teal/10',
  professional: 'text-indigo bg-indigo/10',
  enterprise: 'text-marigold bg-marigold/10',
}

export function FeatureFlagManager({ flags }: { flags: Flag[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = (key: string, currentDefault: boolean) => {
    startTransition(async () => {
      const result = await updateFeatureFlagDefault(key, !currentDefault)
      if (result.error) showToast(result.error, 'error')
      else showToast(result.success!, 'success')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
        }`}>{toast.message}</div>
      )}

      {/* Legend */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <Zap className="w-4 h-4 text-marigold" />
        <span className="text-xs text-muted-foreground">Toggle global defaults. Per-org overrides on the Org Detail page take precedence.</span>
        <div className="ml-auto flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled globally</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><XCircle className="w-3.5 h-3.5" /> Disabled globally</span>
        </div>
      </div>

      {/* Flags Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Feature</th>
              <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Available On Plans</th>
              <th className="text-center px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {flags.map(flag => (
              <tr key={flag.key} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-white">{flag.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                  <code className="text-[9px] text-zinc-600 font-mono mt-1 block">{flag.key}</code>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {flag.plans_included.map(plan => (
                      <span key={plan} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${planColors[plan] ?? 'text-zinc-400 bg-zinc-400/10'}`}>
                        {plan}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleToggle(flag.key, flag.default_enabled)}
                    disabled={isPending}
                    className={`relative w-11 h-6 rounded-full transition-all cursor-pointer disabled:opacity-50 mx-auto block ${flag.default_enabled ? 'bg-teal' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${flag.default_enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
