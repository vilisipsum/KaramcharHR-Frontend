'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Clock, Sun, Moon, RotateCcw } from 'lucide-react'

interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  grace_period_minutes: number
  late_threshold_minutes: number
  half_day_threshold_minutes: number
  is_flexible: boolean
  _count: { employees: number }
}

export function ShiftsContent() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Shift | null>(null)
  const [formData, setFormData] = useState<Partial<Shift>>({
    name: '', start_time: '', end_time: '',
    grace_period_minutes: 15, late_threshold_minutes: 30,
    half_day_threshold_minutes: 240, is_flexible: false
  })

  useEffect(() => { loadShifts() }, [])

  async function loadShifts() {
    try {
      const res = await fetch('/api/shifts')
      if (res.ok) {
        const data = await res.json()
        setShifts(data.data || data || [])
      }
    } catch { setError('Failed to load shifts') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/shifts/${editing.id}` : '/api/shifts'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadShifts(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save shift') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this shift?')) return
    try {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' })
      if (res.ok) loadShifts()
    } catch { setError('Failed to delete shift') }
  }

  function resetForm() {
    setFormData({ name: '', start_time: '', end_time: '',
      grace_period_minutes: 15, late_threshold_minutes: 30,
      half_day_threshold_minutes: 240, is_flexible: false })
  }

  const filtered = shifts.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadShifts}
      emptyTitle="No shifts found"
      emptyDescription="Create work shifts for employee scheduling"
      emptyAction={{ label: 'Add Shift', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search shifts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Shift
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Shift' : 'Add Shift'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Shift Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (minutes)</Label>
                      <Input type="number" min="0" max="120" value={formData.grace_period_minutes || ''} onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Late Threshold (minutes)</Label>
                      <Input type="number" min="0" max="240" value={formData.late_threshold_minutes || ''} onChange={(e) => setFormData({ ...formData, late_threshold_minutes: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Half Day Threshold (minutes)</Label>
                      <Input type="number" min="0" max="480" value={formData.half_day_threshold_minutes || ''} onChange={(e) => setFormData({ ...formData, half_day_threshold_minutes: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Flexible Shift</Label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.is_flexible} onChange={(e) => setFormData({ ...formData, is_flexible: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                        <Label className="text-white cursor-pointer">Employees can clock in/out flexibly</Label>
                      </div>
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
            {data.map((s) => (
              <Card key={s.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-white/50 mb-2">
                        <span><Sun className="w-3 h-3 inline mr-1" /> Grace: {s.grace_period_minutes} min</span>
                        <span><Moon className="w-3 h-3 inline mr-1" /> Late: {s.late_threshold_minutes} min</span>
                        <span><RotateCcw className="w-3 h-3 inline mr-1" /> Half: {s.half_day_threshold_minutes} min</span>
                        {s.is_flexible && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Flexible</span>}
                      </div>
                      <p className="text-sm text-white/60">{s._count?.employees || 0} employees assigned</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setFormData(s); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
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

