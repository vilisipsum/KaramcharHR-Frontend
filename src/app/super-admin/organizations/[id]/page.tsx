import { getOrganizationDetail, getAllFeatureFlags } from '@/lib/super-admin'
import { OrgDetailClient } from '@/components/super-admin/OrgDetailClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [detail, allFlags] = await Promise.all([
    getOrganizationDetail(id).catch(() => null),
    getAllFeatureFlags(),
  ])

  if (!detail || !detail.org) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/super-admin/organizations" className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{detail.org.name}</h1>
          <p className="text-xs text-slate-500">/{detail.org.slug} · Created {new Date(detail.org.created_at).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <OrgDetailClient
        org={detail.org}
        employees={detail.employees}
        features={detail.features}
        auditLogs={detail.auditLogs}
        allFlags={allFlags}
      />
    </div>
  )
}
