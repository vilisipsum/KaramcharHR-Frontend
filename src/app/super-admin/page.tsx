import { getPlatformStats, getAllOrganizations } from '@/lib/super-admin'
import { Building2, Users, TrendingUp, AlertTriangle, IndianRupee, Ban, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminOverview() {
  const [stats, recentOrgs] = await Promise.all([
    getPlatformStats(),
    getAllOrganizations(undefined, undefined, undefined),
  ])

  const planColors: Record<string, string> = {
    trial: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    free: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
    starter: 'text-teal bg-teal/10 border-teal/20',
    professional: 'text-indigo bg-indigo/10 border-indigo/20',
    enterprise: 'text-marigold bg-marigold/10 border-marigold/20',
  }

  const statCards = [
    { label: 'Total Organizations', value: stats.totalOrgs, icon: Building2, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo', bg: 'bg-indigo/10' },
    { label: 'Monthly Revenue (MRR)', value: `₹${stats.mrr.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-marigold', bg: 'bg-marigold/10' },
    { label: 'Expired Trials', value: stats.expiredTrials, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Active Orgs', value: stats.activeOrgs, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Suspended Orgs', value: stats.suspendedOrgs, icon: Ban, color: 'text-coral', bg: 'bg-coral/10' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time snapshot of all KaramcharHR tenants</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white font-mono">{card.value}</p>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Plan Distribution */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Plan Distribution</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.planDistribution).map(([plan, count]) => (
            <div key={plan} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${planColors[plan] ?? 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'}`}>
              <span className="capitalize">{plan}</span>
              <span className="opacity-60">·</span>
              <span>{count} org{count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Organizations */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recent Organizations</h2>
          <Link href="/super-admin/organizations" className="text-xs text-marigold hover:text-amber font-bold transition-colors">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border/10">
          {recentOrgs.slice(0, 8).map((org) => {
            const isTrialExpired = org.plan === 'trial' && org.trial_ends_at && new Date(org.trial_ends_at) < new Date()
            const daysLeft = org.trial_ends_at ? Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000) : null
            return (
              <Link
                key={org.id}
                href={`/super-admin/organizations/${org.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Org Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo/40 to-marigold/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-white">{org.name.slice(0, 2).toUpperCase()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-marigold transition-colors truncate">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(org.created_at).toLocaleDateString('en-IN')}</p>
                </div>

                {/* Plan badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${planColors[org.plan] ?? 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'}`}>
                  {org.plan}
                </span>

                {/* Trial countdown */}
                {org.plan === 'trial' && daysLeft !== null && (
                  <span className={`flex items-center gap-1 text-[10px] font-bold ${isTrialExpired ? 'text-rose-400' : 'text-amber-400'}`}>
                    <Clock className="w-3 h-3" />
                    {isTrialExpired ? 'Expired' : `${daysLeft}d left`}
                  </span>
                )}

                {/* Status */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${org.status === 'active' ? 'bg-emerald-400' : org.status === 'suspended' ? 'bg-rose-400' : 'bg-zinc-500'}`} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
