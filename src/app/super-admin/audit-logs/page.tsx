import { getPlatformAuditLogs } from '@/lib/super-admin'
import { ScrollText, Shield, Zap, Building2, Settings, LogIn, AlertTriangle } from 'lucide-react'

const actionConfig: Record<string, { icon: typeof ScrollText; color: string; bg: string }> = {
  'org.suspend': { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  'org.activate': { icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'org.plan_change': { icon: Settings, color: 'text-marigold', bg: 'bg-marigold/10' },
  'org.limits_update': { icon: Settings, color: 'text-indigo', bg: 'bg-indigo/10' },
  'feature.enable': { icon: Zap, color: 'text-teal', bg: 'bg-teal/10' },
  'feature.disable': { icon: Zap, color: 'text-slate-500', bg: 'bg-zinc-400/10' },
  'feature.global_toggle': { icon: Zap, color: 'text-marigold', bg: 'bg-marigold/10' },
  'impersonate': { icon: LogIn, color: 'text-rose-400', bg: 'bg-rose-400/10' },
}

const actionLabels: Record<string, string> = {
  'org.suspend': 'Suspended organization',
  'org.activate': 'Activated organization',
  'org.plan_change': 'Changed plan',
  'org.limits_update': 'Updated limits',
  'feature.enable': 'Enabled feature',
  'feature.disable': 'Disabled feature',
  'feature.global_toggle': 'Toggled global feature default',
  'impersonate': 'Impersonated org admin',
}

export default async function AuditLogsPage() {
  const logs = await getPlatformAuditLogs(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Complete record of all super admin actions across the platform</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Shield className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-500">No audit events yet. Actions will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {logs.map(log => {
              const config = actionConfig[log.action] ?? { icon: ScrollText, color: 'text-slate-500', bg: 'bg-slate-50 border border-slate-100' }
              const Icon = config.icon
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-9 h-9 rounded-xl border ${config.bg} flex items-center justify-center shrink-0 mt-0.5`} style={{ borderColor: config.color + '33' }}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{actionLabels[log.action] ?? log.action}</p>
                      {log.org_name && (
                        <span className="text-xs text-marigold font-semibold">· {log.org_name}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      by <span className="text-slate-700">{log.actor_email ?? 'Unknown'}</span>
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {Object.entries(log.metadata).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-500">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 mt-1">
                    {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
