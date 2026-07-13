'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react'

interface Holiday {
  id: string
  name: string
  date: string
  type: 'national' | 'regional' | 'company' | 'optional'
  description: string
  year: number
  is_optional: boolean
}

export function HolidaysContent() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState<Partial<Holiday>>({
    name: '', date: '', type: 'national', description: '', year: new Date().getFullYear(), is_optional: false
  })

  useEffect(() => { loadHolidays() }, [yearFilter])

  async function loadHolidays() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/holidays?year=${yearFilter}`)
      if (res.ok) {
        const data = await res.json()
        setHolidays(data.data || data || [])
      }
    } catch { setError('Failed to load holidays') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/holidays/${editing.id}` : '/api/holidays'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadHolidays(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save holiday') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this holiday?')) return
    try {
      const res = await fetch(`/api/holidays/${id}`, { method: 'DELETE' })
      if (res.ok) loadHolidays()
    } catch { setError('Failed to delete holiday') }
  }

  function resetForm() {
    setFormData({ name: '', date: '', type: 'national', description: '', year: new Date().getFullYear(), is_optional: false })
  }

  const filtered = holidays.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadHolidays}
      emptyTitle="No holidays found"
      emptyDescription={`Add holidays for ${yearFilter}`}
      emptyAction={{ label: 'Add Holiday', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search holidays..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-4">
              <Select value={yearFilter} onChange={(e) => setYearFilter(parseInt(e.target.value))}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...Array(5)].map((_, i) => new Date().getFullYear() + i).map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Holiday
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Holiday' : 'Add Holiday'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onChange={(v) => setFormData({ ...formData, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" rows={3} />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="is_optional" checked={formData.is_optional} onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    <Label htmlFor="is_optional" className="text-white">Optional Holiday (employees can choose)</Label>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 border-t border-gray-700 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); resetForm() }}>Cancel</Button>
                    <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((h) => (
              <Card key={h.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-white">{h.name}</span>
                        <span className="px-2 py-0.5 text-xs bg-gray-600/50 text-white/80 rounded capitalize">{h.type}</span>
                        {h.is_optional && <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">Optional</span>}
                      </div>
                      <p className="text-sm text-white/60">{h.description}</p>
                      <p className="text-xs text-white/50 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(h); setFormData(h); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}>
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

