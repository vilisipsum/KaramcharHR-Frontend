'use client'

import { useState } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { Avatar } from '@/components/ui/Avatar'

interface LeavesContentProps {
  balances: Array<{
    leave_types: { name: string; code: string }
    balance: number
    entitled: number
    taken: number
    pending: number
  }>
  leaveRequests: Array<{
    id: string
    start_date: string
    end_date: string
    total_days: number
    status: string
    reason: string
    employees: { first_name: string; last_name: string; employee_code: string }
    leave_types: { name: string; code: string }
  }>
  leaveTypes: Array<{ id: string; name: string; code: string; days_per_year: number }>
  stats: {
    presentCount: number
    onLeaveCount: number
    totalEmployees: number
    upcomingHoliday: { name: string; date: string } | null
  }
}

export function LeavesContent({ balances, leaveRequests, leaveTypes, stats }: LeavesContentProps) {
  const [activeTab, setActiveTab] = useState<'balance' | 'requests'>('balance')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit leave request
    console.log('Submit leave request:', formData)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'balance' ? 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-white border border-amber-500/30' : 'bg-slate-50 border border-slate-100 text-slate-400 border border-slate-200/60 hover:text-slate-700'}`}
        >
          My Balances
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-white border border-amber-500/30' : 'bg-slate-50 border border-slate-100 text-slate-400 border border-slate-200/60 hover:text-slate-700'}`}
        >
          Requests
        </button>
      </div>

      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b, i) => (
            <StatCard key={i} label={b.leave_types?.name || 'Unknown'} value={<>{b.balance} <span className="text-slate-500 text-sm">/ {b.entitled}</span></>}>
              <div className="flex gap-2 flex-wrap">
                <StatusChip type="leave" label={`${b.taken} used`} />
                <StatusChip type="pending" label={`${b.pending} pending`} />
              </div>
            </StatCard>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Recent requests</div>
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">+ New Request</button>
          </div>

          <div className="glass p-5 overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="font-mono text-[10px] uppercase text-slate-500 border-b border-border">
                  <th className="text-left py-2.5 px-3">Employee</th>
                  <th className="text-left py-2.5 px-3">Type</th>
                  <th className="text-left py-2.5 px-3">Dates</th>
                  <th className="text-left py-2.5 px-3">Days</th>
                  <th className="text-left py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-8">No leave requests yet</td>
                  </tr>
                ) : (
                  leaveRequests.map((r, i) => (
                    <tr key={r.id} className="border-b border-border">
                      <td className="py-3 px-3">{r.employees?.first_name} {r.employees?.last_name}</td>
                      <td className="py-3 px-3">{r.leave_types?.name}</td>
                      <td className="py-3 px-3">{new Date(r.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(r.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td className="py-3 px-3">{r.total_days}</td>
                      <td className="py-3 px-3"><StatusChip type={r.status as any} label={r.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Leave type</label>
                  <select value={formData.leave_type_id} onChange={e => setFormData({...formData, leave_type_id: e.target.value})} className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50">
                    {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">From</label>
                  <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">To</label>
                  <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Reason</label>
                <input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Reason for leave" className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo hover:bg-[#3730A3] text-slate-800 text-sm font-medium hover:shadow-lg transition-all">Submit Request</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl bg-white border border-slate-200/60 text-slate-500 hover:text-slate-800 transition-all">Cancel</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}