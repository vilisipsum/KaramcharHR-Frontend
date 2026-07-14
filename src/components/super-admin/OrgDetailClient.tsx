'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleOrgFeature, updateOrgPlan, updateOrgLimits, suspendOrganization, activateOrganization } from '@/app/super-admin/actions'
import { Users, Zap, ScrollText, Settings, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

type Org = {
  id: string; name: string; slug: string; plan: string; status: string
  trial_ends_at: string | null; max_employees: number; seats_used: number
  storage_quota_mb: number; notes: string | null; created_at: string
}
type Employee = { id: string; first_name: string; last_name: string; status: string; created_at: string }
type Feature = { feature_key: string; enabled: boolean }
type AuditLog = { id: string; action: string; actor_email: string; metadata: Record<string, unknown>; created_at: string }
type Flag = { key: string; label: string; description: string; default_enabled: boolean; plans_included: string[] }

const planColors: Record<string, string> = {
  trial: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  free: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
  starter: 'text-teal bg-teal/10 border-teal/20',
  professional: 'text-indigo bg-indigo/10 border-indigo/20',
  enterprise: 'text-marigold bg-marigold/10 border-marigold/20',
}

export function OrgDetailClient({ org, employees, features, auditLogs, allFlags }: {
  org: Org
  employees: Employee[]
  features: Feature[]
  auditLogs: AuditLog[]
  allFlags: Flag[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'employees' | 'audit'>('overview')
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleFeatureToggle = (featureKey: string, currentEnabled: boolean) => {
    startTransition(async () => {
      const result = await toggleOrgFeature(org.id, org.name, featureKey, !currentEnabled)
      if (result.error) showToast(result.error, 'error')
      else showToast(result.success!, 'success')
      router.refresh()
    })
  }

  const isTrialExpired = org.plan === 'trial' && org.trial_ends_at && new Date(org.trial_ends_at) < new Date()
  const daysLeft = org.trial_ends_at ? Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000) : null

  const handleUpdateOrgPlan = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateOrgPlan(formData)
      if (result.error) showToast(result.error, 'error')
      else showToast(result.success!, 'success')
      router.refresh()
    })
  }

  const handleUpdateOrgLimits = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateOrgLimits(formData)
      if (result.error) showToast(result.error, 'error')
      else showToast(result.success!, 'success')
      router.refresh()
    })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'features', label: 'Feature Flags', icon: Zap },
    { id: 'employees', label: `Employees (${employees.length})`, icon: Users },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
  ]

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
        }`}>{toast.message}</div>
      )}

      {/* Status Bar */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${planColors[org.plan] ?? ''}`}>{org.plan}</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${org.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className="text-xs text-muted-foreground capitalize">{org.status}</span>
        </div>
        {org.plan === 'trial' && daysLeft !== null && (
          <span className={`flex items-center gap-1.5 text-xs font-bold ${isTrialExpired ? 'text-rose-400' : 'text-amber-400'}`}>
            <Clock className="w-3.5 h-3.5" />
            {isTrialExpired ? 'Trial Expired' : `${daysLeft} days left in trial`}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {org.status === 'active' ? (
            <button onClick={() => startTransition(async () => { const r = await suspendOrganization(org.id, org.name); showToast(r.error || r.success!, r.error ? 'error' : 'success'); router.refresh() })}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/25 transition-colors cursor-pointer" disabled={isPending}>
              Suspend Org
            </button>
          ) : (
            <button onClick={() => startTransition(async () => { const r = await activateOrganization(org.id, org.name); showToast(r.error || r.success!, r.error ? 'error' : 'success'); router.refresh() })}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer" disabled={isPending}>
              Activate Org
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-gradient-to-r from-rose-500/20 to-marigold/10 text-white border border-rose-500/20' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Control */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Plan & Billing</h3>
            <form action={handleUpdateOrgPlan} className="space-y-3">
              <input type="hidden" name="org_id" value={org.id} />
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Plan</label>
                <select name="plan" defaultValue={org.plan}
                  className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-xl text-sm text-white focus:outline-none focus:border-marigold/50">
                  <option value="trial">Trial</option>
                  <option value="free">Free</option>
                  <option value="starter">Starter (₹2,999/mo)</option>
                  <option value="professional">Professional (₹7,999/mo)</option>
                  <option value="enterprise">Enterprise (₹19,999/mo)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Extend Trial (days)</label>
                <input type="number" name="trial_days" defaultValue={14} min={1} max={365}
                  className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-xl text-sm text-white focus:outline-none focus:border-marigold/50" />
              </div>
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-marigold to-rose text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
                Update Plan
              </button>
            </form>
          </div>

          {/* Limits Control */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Limits & Notes</h3>
            <form action={handleUpdateOrgLimits} className="space-y-3">
              <input type="hidden" name="org_id" value={org.id} />
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Max Employees</label>
                <input type="number" name="max_employees" defaultValue={org.max_employees}
                  className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-xl text-sm text-white focus:outline-none focus:border-marigold/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Storage Quota (MB)</label>
                <input type="number" name="storage_quota_mb" defaultValue={org.storage_quota_mb}
                  className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-xl text-sm text-white focus:outline-none focus:border-marigold/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Internal Notes</label>
                <textarea name="notes" defaultValue={org.notes ?? ''} rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-xl text-sm text-white focus:outline-none focus:border-marigold/50 resize-none" />
              </div>
              <button type="submit" className="w-full py-2 bg-white/10 border border-border/30 text-white text-xs font-bold rounded-xl hover:bg-white/15 transition-colors cursor-pointer">
                Save Limits
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Feature Access</h3>
            <p className="text-xs text-muted-foreground mt-1">Toggle features on/off for this organization only</p>
          </div>
          <div className="divide-y divide-border/10">
            {allFlags.map(flag => {
              const override = features.find(f => f.feature_key === flag.key)
              const isEnabled = override !== undefined ? override.enabled : flag.default_enabled
              const isOverridden = override !== undefined
              return (
                <div key={flag.key} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{flag.label}</p>
                      {isOverridden && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-marigold/15 text-marigold border border-marigold/20">OVERRIDE</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">
                      Plans: {flag.plans_included.join(', ')}
                    </span>
                    <button
                      onClick={() => handleFeatureToggle(flag.key, isEnabled)}
                      disabled={isPending}
                      className={`relative w-11 h-6 rounded-full transition-all cursor-pointer disabled:opacity-50 ${isEnabled ? 'bg-teal' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm font-semibold text-white">{emp.first_name} {emp.last_name}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${emp.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-400 bg-zinc-400/10'}`}>{emp.status}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">{new Date(emp.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="glass rounded-2xl divide-y divide-border/10">
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No audit events for this organization</div>
          ) : auditLogs.map(log => (
            <div key={log.id} className="px-6 py-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-indigo/10 border border-indigo/20 flex items-center justify-center shrink-0 mt-0.5">
                <ScrollText className="w-4 h-4 text-indigo" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{log.action}</p>
                <p className="text-xs text-muted-foreground">by {log.actor_email}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="text-[10px] text-zinc-500 mt-1 font-mono">{JSON.stringify(log.metadata, null, 2)}</pre>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{new Date(log.created_at).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
