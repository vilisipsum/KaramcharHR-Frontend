'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Users, Briefcase, MapPin, DollarSign, Calendar, AlertCircle } from 'lucide-react'

interface JobOpening {
  id: string
  title: string
  department_id: string | null
  department: { name: string } | null
  location: string
  employment_type: string
  min_salary: number | null
  max_salary: number | null
  currency: string
  openings: number
  filled: number
  skills: string[]
  experience_min: number | null
  experience_max: number | null
  status: 'open' | 'in_progress' | 'filled' | 'closed' | 'on_hold'
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export function JobOpeningsContent() {
  const [openings, setOpenings] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<JobOpening | null>(null)
  const [formData, setFormData] = useState<Partial<JobOpening>>({
    title: '', department_id: '', location: '', employment_type: 'full_time',
    min_salary: null, max_salary: null, currency: 'INR', openings: 1,
    skills: [], experience_min: null, experience_max: null,
    status: 'open', priority: 'normal'
  })

  useEffect(() => { loadOpenings() }, [])

  async function loadOpenings() {
    try {
      const res = await fetch('/api/job-openings')
      if (res.ok) {
        const data = await res.json()
        setOpenings(data.data || data || [])
      }
    } catch { setError('Failed to load job openings') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/job-openings/${editing.id}` : '/api/job-openings'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, skills: formData.skills?.join(',') || '' }),
      })
      if (res.ok) { loadOpenings(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save job opening') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job opening?')) return
    try {
      const res = await fetch(`/api/job-openings/${id}`, { method: 'DELETE' })
      if (res.ok) loadOpenings()
    } catch { setError('Failed to delete job opening') }
  }

  function resetForm() {
    setFormData({
      title: '', department_id: '', location: '', employment_type: 'full_time',
      min_salary: null, max_salary: null, currency: 'INR', openings: 1,
      skills: [], experience_min: null, experience_max: null,
      status: 'open', priority: 'normal'
    })
  }

  const filtered = (openings || []).filter(o => 
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.location.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.priority === 'urgent' ? -1 : 0) - (b.priority === 'urgent' ? 0 : 1))

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadOpenings}
      emptyTitle="No job openings found"
      emptyDescription="Create job openings to start recruiting"
      emptyAction={{ label: 'Add Job Opening', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Job Opening
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Job Opening' : 'Add Job Opening'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Department</Label><Select value={formData.department_id || ''} onChange={(e) => setFormData({ ...formData, department_id: e.target.value || null })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent><SelectItem value="">None</SelectItem>{openings.map(o => o.department && <SelectItem key={o.department_id} value={o.department_id!}>{o.department.name}</SelectItem>)}</SelectContent>
                    </Select></div>
                    <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Employment Type</Label><Select value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select></div>
                    <div className="space-y-2"><Label>Min Salary</Label><Input type="number" min="0" step="1000" value={formData.min_salary || ''} onChange={(e) => setFormData({ ...formData, min_salary: e.target.value ? parseInt(e.target.value) : null })} /></div>
                    <div className="space-y-2"><Label>Max Salary</Label><Input type="number" min="0" step="1000" value={formData.max_salary || ''} onChange={(e) => setFormData({ ...formData, max_salary: e.target.value ? parseInt(e.target.value) : null })} /></div>
                    <div className="space-y-2"><Label>Openings</Label><Input type="number" min="1" value={formData.openings || 1} onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })} /></div>
                    <div className="space-y-2"><Label>Experience Min (years)</Label><Input type="number" min="0" step="0.5" value={formData.experience_min || ''} onChange={(e) => setFormData({ ...formData, experience_min: e.target.value ? parseFloat(e.target.value) : null })} /></div>
                    <div className="space-y-2"><Label>Experience Max (years)</Label><Input type="number" min="0" step="0.5" value={formData.experience_max || ''} onChange={(e) => setFormData({ ...formData, experience_max: e.target.value ? parseFloat(e.target.value) : null })} /></div>
                    <div className="space-y-2"><Label>Skills (comma separated)</Label><Input value={formData.skills?.join(',') || ''} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="React, TypeScript, Node.js" /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select></div>
                    <div className="space-y-2"><Label>Priority</Label><Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select></div>
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
            {data.map((o) => (
              <Card key={o.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{o.title}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${o.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : o.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {o.priority}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-2">{o.department?.name || 'No department'}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-white/50 mb-2">
                        <span><MapPin className="w-3 h-3 inline mr-1" /> {o.location}</span>
                        <span><Briefcase className="w-3 h-3 inline mr-1" /> {o.employment_type.replace('_', ' ')}</span>
                        <span><DollarSign className="w-3 h-3 inline mr-1" /> {(o.min_salary || o.max_salary) ? `${o.min_salary || 0} - ${o.max_salary || 'Negotiable'} ${o.currency}` : 'Negotiable'}</span>
                        <span><Users className="w-3 h-3 inline mr-1" /> {o.filled}/{o.openings} filled</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {o.skills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 text-xs bg-gray-600/50 text-white/80 rounded">{s}</span>)}
                        {o.skills.length > 4 && <span className="px-2 py-0.5 text-xs bg-gray-600/50 text-white/60 rounded">+{o.skills.length - 4}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(o); setFormData(o); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}>
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

