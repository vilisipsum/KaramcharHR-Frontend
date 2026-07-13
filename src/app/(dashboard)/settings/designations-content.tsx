'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState, LoadingState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Designation {
  id: string
  title: string
  level: number
}

export function DesignationsContent() {
  const [designations, setDesignations] = useState<Designation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Designation | null>(null)
  const [formData, setFormData] = useState({ title: '', level: 1 })

  useEffect(() => { loadDesignations() }, [])

  async function loadDesignations() {
    try {
      const res = await fetch('/api/designations')
      if (res.ok) {
        const data = await res.json()
        setDesignations(data.data || data || [])
      }
    } catch { setError('Failed to load designations') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/designations/${editing.id}` : '/api/designations'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadDesignations(); setShowForm(false); setEditing(null); setFormData({ title: '', level: 1 }) }
    } catch { setError('Failed to save designation') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this designation?')) return
    try {
      const res = await fetch(`/api/designations/${id}`, { method: 'DELETE' })
      if (res.ok) loadDesignations()
    } catch { setError('Failed to delete designation') }
  }

  const filtered = designations.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.level - a.level)

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadDesignations}
      emptyTitle="No designations found"
      emptyDescription="Create your first designation to get started"
      emptyAction={{ label: 'Add Designation', onClick: () => { setEditing(null); setFormData({ title: '', level: 1 }); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search designations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); setFormData({ title: '', level: 1 }); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Designation
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Designation' : 'Add Designation'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level (higher = more senior)</Label>
                    <Input id="level" type="number" min={1} max={10} value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })} required />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setFormData({ title: '', level: 1 }) }}>Cancel</Button>
                    <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => (
              <Card key={d.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{d.title}</span>
                        <span className="px-2 py-0.5 text-xs bg-gray-600/50 text-white/80 rounded">Level {d.level}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(d); setFormData({ title: d.title, level: d.level }); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
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

