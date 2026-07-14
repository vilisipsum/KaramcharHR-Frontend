'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusChip } from '@/components/ui/StatusChip'

interface RecruitmentContentProps {
  jobOpenings: Array<{
    id: string
    title: string
    description: string
    status: string
    department: { name: string } | null
    candidates: Array<{ id: string; first_name: string; last_name: string; email: string; current_company: string | null; total_experience_years: number | null }>
  }>
  selectedJobId?: string
  onSelectJob?: (id: string) => void
}

const steps = [
  { title: 'Offer accepted', desc: 'Signed offer letter received' },
  { title: 'Documents uploaded', desc: 'PAN, Aadhaar, education certificates' },
  { title: 'Background verification', desc: 'In progress with verification partner' },
  { title: 'Induction & asset handover', desc: 'Scheduled for 1 Aug, 10:00 AM' },
]

export function RecruitmentContent({ jobOpenings, selectedJobId, onSelectJob }: RecruitmentContentProps) {
  const [activeJobId, setActiveJobId] = useState(selectedJobId || jobOpenings[0]?.id)
  const activeJob = jobOpenings.find(j => j.id === activeJobId)

  return (
    <div className="space-y-6">
      <div className="glass p-5 mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Candidate pipeline</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {jobOpenings.map((col, ci) => (
            <div
              key={col.id}
              onClick={() => onSelectJob?.(col.id)}
              className={`glass-strong rounded-lg p-3 cursor-pointer transition-all ${activeJobId === col.id ? 'border-amber-500/30 shadow-[0_0_15px_rgba(255,168,39,0.05)]' : ''}`}
            >
              <h4 className="font-mono text-[11px] uppercase text-slate-500 mx-2 mb-3">{col.title} · {col.candidates?.length ?? 0}</h4>
              {(col.candidates || []).map((c, j) => (
                <div key={j} className="glass-strong rounded-md p-3 flex gap-2.5 items-center mb-2">
                  <Avatar initials={`${c.first_name?.[0]}${c.last_name?.[0]}`.toUpperCase()} size="sm" index={j + ci} />
                  <div>
                    <div className="font-semibold text-xs">{c.first_name} {c.last_name}</div>
                    <div className="text-[10px] text-slate-500">{c.current_company || '—'} · {c.total_experience_years ? `${c.total_experience_years}y exp` : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {activeJob && (
        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Onboarding checklist — {activeJob.candidates?.[0]?.first_name} {activeJob.candidates?.[0]?.last_name}</div>
          <div className="flex flex-col">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-4 pb-5 relative last:pb-0">
                {i < steps.length - 1 && <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-border" />}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 ${i < 2 ? 'bg-teal text-white' : i === 2 ? 'bg-indigo text-white' : 'bg-muted/30 text-slate-500'}`}>
                  {i < 2 ? '✓' : i + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}