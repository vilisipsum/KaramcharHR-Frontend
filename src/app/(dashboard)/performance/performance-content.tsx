'use client'

import { useState } from 'react'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'
import { StatCard } from '@/components/ui/StatCard'

interface PerformanceContentProps {
  cycles: Array<{
    id: string
    name: string
    financial_year: string
    quarter: number | null
    start_date: string
    end_date: string
    status: string
  }>
  reviews: Array<{
    id: string
    self_rating: number | null
    manager_rating: number | null
    final_rating: number | null
    status: string
    appraisal_cycle_id: string
    employees: { first_name: string; last_name: string; employee_code: string; departments: { name: string } | null }
  }>
}

export function PerformanceContent({ cycles, reviews }: PerformanceContentProps) {
  const [activeTab, setActiveTab] = useState<'cycles' | 'reviews'>('cycles')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('cycles')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cycles' ? 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-white border border-amber-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'}`}
        >
          Appraisal Cycles
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reviews' ? 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-white border border-amber-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'}`}
        >
          Reviews
        </button>
      </div>

      {activeTab === 'cycles' && (
        <div className="glass p-5 mb-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Appraisal Cycles</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {cycles.map((c, i) => (
              <div key={c.id} className="glass-strong rounded-lg p-4">
                <div className="font-semibold text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.financial_year} · Q{c.quarter ?? 'Annual'}</div>
                <div className="mt-3"><StatusChip type={c.status as any} label={c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ')} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="glass p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Q3 Reviews — In Progress</div>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar initials={`${r.employees.first_name?.[0]}${r.employees.last_name?.[0]}`.toUpperCase()} index={i} />
                    <div>
                      <div className="font-semibold text-sm">{r.employees.first_name} {r.employees.last_name}</div>
                      <div className="text-xs text-muted-foreground">{r.employees.departments?.name || '—'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">Self: {r.self_rating ?? '--'}/5</div>
                    <div className="text-sm font-mono">Mgr: {r.manager_rating ?? '--'}/5</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Avg Self Rating" value="3.8" trend="Q3 FY 2025-26" />
            <StatCard label="Avg Manager Rating" value="4.2" trend="↑ 0.3 from Q2" />
            <StatCard label="Reviews Completed" value="42 / 132" trend="32% completion" />
            <StatCard label="Top Performer" value="Rohit K." trend="Rating: 4.8/5" />
          </div>
        </div>
      )}
    </div>
  )
}