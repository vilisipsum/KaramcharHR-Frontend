'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Building2, Clock, CheckCircle2, Ban, ChevronRight } from 'lucide-react'
import { suspendOrganization, activateOrganization } from '@/app/super-admin/actions'

type Org = {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  trial_ends_at: string | null
  max_employees: number
  seats_used: number
  created_at: string
  notes: string | null
}

const planColors: Record<string, string> = {
  trial: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  free: 'text-slate-500 bg-zinc-400/10 border-zinc-400/20',
  starter: 'text-teal bg-teal/10 border-teal/20',
  professional: 'text-indigo bg-indigo/10 border-indigo/20',
  enterprise: 'text-marigold bg-marigold/10 border-marigold/20',
}

export function OrgListClient({ orgs }: { orgs: Org[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = orgs.filter(o => {
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || o.plan === planFilter
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchPlan && matchStatus
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSuspend = (orgId: string, orgName: string) => {
    startTransition(async () => {
      const result = await suspendOrganization(orgId, orgName)
      if (result.error) showToast(result.error, 'error')
      else showToast(result.success!, 'success')
      router.refresh()
    })
  }

  const handleActivate = (orgId: string, orgName: string) => {
    startTransition(async () => {
      const result = await activateOrganization(orgId, orgName)
      if (result.error) showToast(result.error, 'error')
      else showToast(result.success!, 'success')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search organizations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/60/30 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-indigo/50 transition-colors"
          />
        </div>

        <select
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200/60/30 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors"
        >
          <option value="all">All Plans</option>
          <option value="trial">Trial</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200/60/30 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Organization</th>
              <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan</th>
              <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Trial</th>
              <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Seats</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No organizations found</td>
              </tr>
            ) : filtered.map(org => {
              const isTrialExpired = org.plan === 'trial' && org.trial_ends_at && new Date(org.trial_ends_at) < new Date()
              const daysLeft = org.trial_ends_at ? Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000) : null
              const seatsPercent = org.max_employees > 0 ? Math.round((org.seats_used / org.max_employees) * 100) : 0

              return (
                <tr key={org.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/super-admin/organizations/${org.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo/40 to-marigold/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-extrabold text-slate-800">{org.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-marigold transition-colors">{org.name}</p>
                        <p className="text-[10px] text-slate-500">{org.slug}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${planColors[org.plan] ?? 'text-slate-500 bg-zinc-400/10 border-zinc-400/20'}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="text-xs text-slate-500 capitalize">{org.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {org.plan === 'trial' && daysLeft !== null ? (
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${isTrialExpired ? 'text-rose-400' : 'text-amber-400'}`}>
                        <Clock className="w-3 h-3" />
                        {isTrialExpired ? 'Expired' : `${daysLeft}d`}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{org.seats_used}/{org.max_employees}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${seatsPercent >= 90 ? 'bg-rose-400' : seatsPercent >= 70 ? 'bg-amber-400' : 'bg-teal'}`}
                          style={{ width: `${seatsPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {org.status === 'active' ? (
                        <button
                          onClick={() => handleSuspend(org.id, org.name)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[10px] font-bold hover:bg-rose-500/25 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(org.id, org.name)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      <Link
                        href={`/super-admin/organizations/${org.id}`}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
