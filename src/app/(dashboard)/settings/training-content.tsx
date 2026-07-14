'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Calendar, Users, BookOpen, DollarSign, Award, Clock } from 'lucide-react'

interface Training {
  id: string
  title: string
  description: string
  type: 'internal' | 'external' | 'online' | 'workshop' | 'certification'
  provider: string
  start_date: string
  end_date: string
  duration_hours: number
  cost: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  max_participants: number
  _count: { employees: number }
}

export function TrainingContent() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Training | null>(null)
  const [formData, setFormData] = useState<Partial<Training>>({
    title: '', description: '', type: 'internal', provider: '',
    start_date: '', end_date: '', duration_hours: 0, cost: 0,
    status: 'planned', max_participants: 0
  })

  useEffect(() => { loadTrainings() }, [])

  async function loadTrainings() {
    try {
      const res = await fetch('/api/trainings')
      if (res.ok) {
        const data = await res.json()
        setTrainings(data.data || data || [])
      }
    } catch { setError('Failed to load trainings') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/trainings/${editing.id}` : '/api/trainings'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadTrainings(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save training') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this training?')) return
    try {
      const res = await fetch(`/api/trainings/${id}`, { method: 'DELETE' })
      if (res.ok) loadTrainings()
    } catch { setError('Failed to delete training') }
  }

  function resetForm() {
    setFormData({ title: '', description: '', type: 'internal', provider: '',
      start_date: '', end_date: '', duration_hours: 0, cost: 0, status: 'planned', max_participants: 0 })
  }

  const filtered = trainings.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.provider.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadTrainings}
      emptyTitle="No trainings found"
      emptyDescription="Create training programs for employee development"
      emptyAction={{ label: 'Add Training', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800/40" />
              <Input placeholder="Search trainings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Training
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Training' : 'Add Training'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={formData.type} onChange={(v) => setFormData({ ...formData, type: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="certification">Certification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (hours)</Label>
                      <Input type="number" min="0" step="0.5" value={formData.duration_hours || ''} onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cost (₹)</Label>
                      <Input type="number" min="0" step="100" value={formData.cost || ''} onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Participants</Label>
                      <Input type="number" min="1" value={formData.max_participants || ''} onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description</Label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" rows={3} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-gray-700 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); resetForm() }}>Cancel</Button>
                    <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((t) => (
              <Card key={t.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{t.title}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : t.status === 'completed' ? 'bg-green-500/20 text-green-400' : t.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded capitalize">{t.type}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{t.provider || 'Internal'}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-2">
                        <span><Calendar className="w-3 h-3 inline mr-1" /> {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(t.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span><Clock className="w-3 h-3 inline mr-1" /> {t.duration_hours} hrs</span>
                        <span><Users className="w-3 h-3 inline mr-1" /> {t._count?.employees || 0}/{t.max_participants || '∞'}</span>
                        {t.cost > 0 && <span><DollarSign className="w-3 h-3 inline mr-1" /> ₹{t.cost.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setFormData(t); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  )
}

