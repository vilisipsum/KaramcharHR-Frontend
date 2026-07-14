'use client'

import { useState } from 'react'
import { StatusChip } from '@/components/ui/StatusChip'

const categories = ['travel', 'food', 'accommodation', 'transport', 'supplies', 'healthcare', 'training', 'other'] as const

const mockExpenses = [
  { id: '1', category: 'travel', amount: 12450, description: 'Mumbai client visit - flight & cab', date: '2026-07-10', status: 'approved' as const, employee: 'Neha Singh' },
  { id: '2', category: 'food', amount: 2340, description: 'Team lunch - Q2 planning', date: '2026-07-08', status: 'reimbursed' as const, employee: 'Arjun Joshi' },
  { id: '3', category: 'accommodation', amount: 8900, description: 'Hotel stay - Noida office visit', date: '2026-07-05', status: 'pending' as const, employee: 'Rahul Bose' },
  { id: '4', category: 'supplies', amount: 3200, description: 'Office stationery & printer toner', date: '2026-07-03', status: 'approved' as const, employee: 'Kavya Verma' },
  { id: '5', category: 'transport', amount: 850, description: 'Local cab - client meeting', date: '2026-07-01', status: 'rejected' as const, employee: 'Sana Malik' },
]

const statusStyles: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  pending: 'warning', approved: 'info', reimbursed: 'success', rejected: 'error',
}

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'travel', amount: '', description: '', date: '' })
  const [expenses, setExpenses] = useState(mockExpenses)

  function submitClaim(e: React.FormEvent) {
    e.preventDefault()
    setExpenses(prev => [{
      id: String(Date.now()),
      category: form.category as any,
      amount: Number(form.amount),
      description: form.description,
      date: form.date,
      status: 'pending',
      employee: 'You',
    }, ...prev])
    setForm({ category: 'travel', amount: '', description: '', date: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expense Claims</h1>
          <p className="text-slate-500">Submit and track expense reimbursements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 rounded-xl bg-indigo hover:bg-[#3730A3] text-sm font-medium hover:shadow-lg transition-all">
          {showForm ? 'Cancel' : '+ New Claim'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitClaim} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500/50">
                {categories.map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="What was this expense for?" className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo hover:bg-[#3730A3] text-sm font-medium hover:shadow-lg transition-all">Submit Claim</button>
        </form>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Employee</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">Description</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-right px-5 py-3 font-semibold">Amount</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 border border-slate-100 transition-colors">
                  <td className="px-5 py-3.5 text-slate-800 font-medium">{e.employee}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.category.charAt(0).toUpperCase() + e.category.slice(1)}</td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-[200px] truncate">{e.description}</td>
                  <td className="px-5 py-3.5 text-slate-500">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-right text-slate-800 font-semibold">₹{e.amount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-center"><StatusChip type={statusStyles[e.status]} label={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-slate-800">₹{expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-800/40 mt-1">Pending Approval</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-teal">₹{expenses.filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-800/40 mt-1">Approved This Month</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-slate-800">{expenses.length}</div>
          <div className="text-xs text-slate-800/40 mt-1">Total Claims</div>
        </div>
      </div>
    </div>
  )
}
