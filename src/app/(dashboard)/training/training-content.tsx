'use client'

import { useState } from 'react'
import { StatusChip } from '@/components/ui/StatusChip'

interface TrainingContentProps {
  trainings: Array<{
    id: string
    title: string
    description: string | null
    type: string
    start_date: string | null
    end_date: string | null
    duration_hours: number | null
    provider: string | null
    cost: number | null
    status: string
    employee_trainings: Array<{ employee_id: string; completion_status: string; score: number | null; completed_at: string | null }>
  }>
}

const typeColors: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  completed: 'success', in_progress: 'info', planned: 'warning',
}

export function TrainingContent({ trainings }: TrainingContentProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? trainings : trainings.filter(c => c.status === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Management</h1>
          <p className="text-white/60">Corporate training courses, certifications, and skill tracking</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white text-sm font-medium hover:shadow-lg transition-all">+ New Course</button>
      </div>

      <div className="flex gap-2">
        {['all', 'in_progress', 'completed', 'planned'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-white border border-amber-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'}`}
          >
            {tab === 'all' ? 'All' : tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="glass rounded-2xl p-5 space-y-4 hover:border-amber-500/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{c.title}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{c.type} · Due {c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</div>
              </div>
              <StatusChip type={typeColors[c.status]} label={c.status.replace('_', ' ')} />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white border-2 border-amber-500/30">
                {(c.employee_trainings.filter(e => e.completion_status === 'completed').length / Math.max(1, c.employee_trainings.length) * 100).toFixed(0)}%
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all" style={{ width: `${(c.employee_trainings.filter(e => e.completion_status === 'completed').length / Math.max(1, c.employee_trainings.length) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>{c.employee_trainings.filter(e => e.completion_status === 'completed').length}/{c.employee_trainings.length} completed</span>
                  <span>{Math.round(c.employee_trainings.filter(e => e.completion_status === 'completed').length / Math.max(1, c.employee_trainings.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-white">{trainings.length}</div>
          <div className="text-xs text-white/40 mt-1">Active Courses</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-teal">{trainings.reduce((s, c) => s + c.employee_trainings.filter(e => e.completion_status === 'completed').length, 0)}</div>
          <div className="text-xs text-white/40 mt-1">Total Completions</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-amber-400">{trainings.reduce((s, c) => s + c.employee_trainings.length, 0)}</div>
          <div className="text-xs text-white/40 mt-1">Enrolled Employees</div>
        </div>
      </div>
    </div>
  )
}