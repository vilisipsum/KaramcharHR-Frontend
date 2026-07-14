'use client'

import { useState, useEffect } from 'react'

interface Prediction {
  peakLeavePeriods: Array<{ month: string; expectedAbsences: number; reason: string }>
  burnoutFlags: string[]
  recommendations: string[]
}

export function LeavePredictWidget() {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/ai/leave-predict', { method: 'POST' })
      .then(r => r.json())
      .then(d => setPrediction(d))
      .catch(() => setPrediction(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Analyzing leave patterns...
      </div>
    </div>
  )

  if (!prediction) return null

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">AI Leave Prediction</h3>
        <span className="text-[10px] text-slate-800/30 font-mono">DeepSeek AI</span>
      </div>

      {prediction.peakLeavePeriods?.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] text-slate-800/40 uppercase tracking-wider font-semibold">Forecasted Peaks</div>
          {prediction.peakLeavePeriods.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700">{p.month}</span>
                  <span className="text-amber-400 font-semibold">{p.expectedAbsences} absences</span>
                </div>
                <div className="h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    style={{ width: `${Math.min(p.expectedAbsences * 10, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-800/40 mt-0.5">{p.reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {prediction.burnoutFlags?.length > 0 && (
        <div>
          <div className="text-[11px] text-slate-800/40 uppercase tracking-wider font-semibold mb-2">Burnout Flags</div>
          {prediction.burnoutFlags.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-rose-400 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {f}
            </div>
          ))}
        </div>
      )}

      {prediction.recommendations?.length > 0 && (
        <div>
          <div className="text-[11px] text-slate-800/40 uppercase tracking-wider font-semibold mb-2">Recommendations</div>
          {prediction.recommendations.map((r, i) => (
            <div key={i} className="text-xs text-teal mb-1 flex items-start gap-2">
              <span className="text-teal mt-0.5">→</span>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
