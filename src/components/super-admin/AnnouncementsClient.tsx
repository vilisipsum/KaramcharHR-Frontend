'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAnnouncement, toggleAnnouncement } from '@/app/super-admin/actions'
import { Megaphone, Info, AlertTriangle, Wrench, Sparkles, Plus } from 'lucide-react'

type Announcement = {
  id: string
  title: string
  body: string
  type: string
  active: boolean
  created_at: string
}

const typeConfig: Record<string, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info: { icon: Info, color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  maintenance: { icon: Wrench, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  update: { icon: Sparkles, color: 'text-marigold', bg: 'bg-marigold/10', border: 'border-marigold/20' },
}

export function AnnouncementsClient({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createAnnouncement(formData)
      if (result.error) showToast(result.error, 'error')
      else {
        showToast(result.success!, 'success')
        setShowForm(false)
        router.refresh()
      }
    })
  }

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const result = await toggleAnnouncement(id, !active)
      if (result.error) showToast(result.error, 'error')
      else router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>{toast.message}</div>
      )}

      {/* New Announcement Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-marigold/10 border border-rose-500/20 text-slate-800 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        New Announcement
      </button>

      {/* Create Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Create Announcement</h3>
          <form action={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Title</label>
                <input type="text" name="title" required placeholder="System maintenance at 2AM IST"
                  className="w-full px-3 py-2 bg-white border border-slate-200/60/30 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-indigo/50" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Type</label>
                <select name="type" className="w-full px-3 py-2 bg-white border border-slate-200/60/30 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50">
                  <option value="info">ℹ️ Information</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="update">✨ Feature Update</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">Message</label>
              <textarea name="body" required rows={4} placeholder="Write your announcement here…"
                className="w-full px-3 py-2 bg-white border border-slate-200/60/30 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-indigo/50 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isPending}
                className="px-6 py-2 bg-indigo text-slate-800 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
                Publish
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-50 border border-slate-100 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcement List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center space-y-3">
            <Megaphone className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-500">No announcements yet.</p>
          </div>
        ) : announcements.map(ann => {
          const config = typeConfig[ann.type] ?? typeConfig.info
          const Icon = config.icon
          return (
            <div key={ann.id} className={`glass rounded-2xl p-5 border ${config.border} ${!ann.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{ann.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.color} ${config.bg}`}>{ann.type}</span>
                    {ann.active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-400/10">ACTIVE</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-zinc-500/10">INACTIVE</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{ann.body}</p>
                  <p className="text-[10px] text-zinc-600 mt-2">{new Date(ann.created_at).toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => handleToggle(ann.id, ann.active)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                    ann.active ? 'bg-zinc-500/15 text-slate-500 hover:bg-zinc-500/25' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                  }`}
                >
                  {ann.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
