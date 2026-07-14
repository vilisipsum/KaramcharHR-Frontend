'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Calendar, Clock, Play, Pause, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface AppraisalCycle {
  id: string
  name: string
  financial_year: string
  quarter: number | null
  start_date: string
  end_date: string
  self_review_deadline: string | null
  manager_review_deadline: string | null
  status: 'draft' | 'active' | 'self_review' | 'manager_review' | 'calibration' | 'completed' | 'closed'
}

export function AppraisalCyclesContent() {
  const [cycles, setCycles] = useState<AppraisalCycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AppraisalCycle | null>(null)
  const [formData, setFormData] = useState<Partial<AppraisalCycle>>({
    name: '', financial_year: '', quarter: null, start_date: '', end_date: '',
    self_review_deadline: null, manager_review_deadline: null, status: 'draft'
  })

  useEffect(() => {
    loadCycles()
  }, [])

  async function loadCycles() {
    try {
      const res = await fetch('/api/performance-cycles')
      if (res.ok) {
        const data = await res.json()
        setCycles(data.data || data || [])
      }
    } catch { setError('Failed to load appraisal cycles') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/performance-cycles/${editing.id}` : '/api/performance-cycles'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadCycles(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save cycle') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this appraisal cycle?')) return
    try {
      const res = await fetch(`/api/performance-cycles/${id}`, { method: 'DELETE' })
      if (res.ok) loadCycles()
    } catch { setError('Failed to delete cycle') }
  }

  function resetForm() {
    setFormData({
      name: '', financial_year: '', quarter: null, start_date: '', end_date: '',
      self_review_deadline: null, manager_review_deadline: null, status: 'draft'
    })
  }

  const statusConfig = {
    draft: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Draft' },
    active: { icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Active' },
    self_review: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Self Review' },
    manager_review: { icon: Calendar, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Manager Review' },
    calibration: { icon: AlertCircle, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Calibration' },
    completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Completed' },
    closed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Closed' },
  }

  const filtered = cycles.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.financial_year.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadCycles}
      emptyTitle="No appraisal cycles found"
      emptyDescription="Create cycles to manage performance reviews"
      emptyAction={{ label: 'Add Cycle', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800/40" />
              <Input placeholder="Search cycles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cycle
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Cycle' : 'Add Appraisal Cycle'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Cycle Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Financial Year</Label>
                      <Input value={formData.financial_year} onChange={(e) => setFormData({ ...formData, financial_year: e.target.value })} placeholder="e.g., 2025-26" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Quarter</Label>
                      <Select value={formData.quarter || ''} onChange={(e) => setFormData({ ...formData, quarter: e.target.value ? parseInt(e.target.value) : null })}>
                        <SelectTrigger><SelectValue placeholder="Select quarter" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="1">Q1</SelectItem>
                          <SelectItem value="2">Q2</SelectItem>
                          <SelectItem value="3">Q3</SelectItem>
                          <SelectItem value="4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="self_review">Self Review</SelectItem>
                          <SelectItem value="manager_review">Manager Review</SelectItem>
                          <SelectItem value="calibration">Calibration</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
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
                      <Label>Self Review Deadline</Label>
                      <Input type="date" value={formData.self_review_deadline || ''} onChange={(e) => setFormData({ ...formData, self_review_deadline: e.target.value || null })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Manager Review Deadline</Label>
                      <Input type="date" value={formData.manager_review_deadline || ''} onChange={(e) => setFormData({ ...formData, manager_review_deadline: e.target.value || null })} />
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
            {data.map((c) => {
              const status = statusConfig[c.status as keyof typeof statusConfig] || statusConfig.draft
              const StatusIcon = status.icon
              return (
                <Card key={c.id} className="hover:border-amber-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{c.financial_year}{c.quarter ? ` - Q${c.quarter}` : ''}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                          <span><Calendar className="w-3 h-3 inline mr-1" /> {new Date(c.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span><Calendar className="w-3 h-3 inline mr-1" /> {new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          {c.self_review_deadline && <span><Clock className="w-3 h-3 inline mr-1" /> Self: {new Date(c.self_review_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                          {c.manager_review_deadline && <span><Clock className="w-3 h-3 inline mr-1" /> Mgr: {new Date(c.manager_review_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setFormData(c); setShowForm(true) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
            )
            })}
          </div>
        </div>
      )}
    </DataState>
  )
}

