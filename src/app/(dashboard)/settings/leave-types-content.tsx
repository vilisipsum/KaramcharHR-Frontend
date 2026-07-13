'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Shield, Clock, Calendar, Check, X } from 'lucide-react'

interface LeaveType {
  id: string
  name: string
  code: string
  description: string
  days_per_year: number
  max_consecutive_days: number | null
  max_carry_forward: number
  carry_forward_expiry: string | null
  is_paid: boolean
  is_half_day_allowed: boolean
  requires_approval: boolean
  gender_specific: 'male' | 'female' | 'both'
  min_service_days: number
  is_active: boolean
}

export function LeaveTypesContent() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<LeaveType | null>(null)
  const [formData, setFormData] = useState<Partial<LeaveType>>({
    name: '', code: '', description: '', days_per_year: 0,
    max_consecutive_days: null, max_carry_forward: 0, carry_forward_expiry: null,
    is_paid: true, is_half_day_allowed: true, requires_approval: true,
    gender_specific: 'both', min_service_days: 0, is_active: true
  })

  useEffect(() => { loadLeaveTypes() }, [])

  async function loadLeaveTypes() {
    try {
      const res = await fetch('/api/leave-types')
      if (res.ok) {
        const data = await res.json()
        setLeaveTypes(data.data || data || [])
      }
    } catch { setError('Failed to load leave types') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/leave-types/${editing.id}` : '/api/leave-types'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadLeaveTypes(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save leave type') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this leave type?')) return
    try {
      const res = await fetch(`/api/leave-types/${id}`, { method: 'DELETE' })
      if (res.ok) loadLeaveTypes()
    } catch { setError('Failed to delete leave type') }
  }

  function resetForm() {
    setFormData({
      name: '', code: '', description: '', days_per_year: 0,
      max_consecutive_days: null, max_carry_forward: 0, carry_forward_expiry: null,
      is_paid: true, is_half_day_allowed: true, requires_approval: true,
      gender_specific: 'both', min_service_days: 0, is_active: true
    })
  }

  const filtered = leaveTypes.filter(lt => 
    lt.name.toLowerCase().includes(search.toLowerCase()) ||
    lt.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadLeaveTypes}
      emptyTitle="No leave types found"
      emptyDescription="Create leave types to configure your leave policy"
      emptyAction={{ label: 'Add Leave Type', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search leave types..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Leave Type' : 'Add Leave Type'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required maxLength={10} />
                    </div>
                    <div className="space-y-2">
                      <Label>Days per Year</Label>
                      <Input type="number" min={0} value={formData.days_per_year} onChange={(e) => setFormData({ ...formData, days_per_year: parseInt(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Consecutive Days</Label>
                      <Input type="number" min={0} value={formData.max_consecutive_days || ''} onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value ? parseInt(e.target.value) : null })} placeholder="Unlimited" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Carry Forward</Label>
                      <Input type="number" min={0} value={formData.max_carry_forward} onChange={(e) => setFormData({ ...formData, max_carry_forward: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Carry Forward Expiry</Label>
                      <Select value={formData.carry_forward_expiry || ''} onChange={(e) => setFormData({ ...formData, carry_forward_expiry: e.target.value || null })}>
                        <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].map(m => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender Specific</Label>
                      <Select value={formData.gender_specific} onChange={(e) => setFormData({ ...formData, gender_specific: e.target.value as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="male">Male Only</SelectItem>
                          <SelectItem value="female">Female Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Min Service Days</Label>
                      <Input type="number" min={0} value={formData.min_service_days} onChange={(e) => setFormData({ ...formData, min_service_days: parseInt(e.target.value) })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description</Label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" rows={3} />
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Paid Leave</p>
                        <p className="text-sm text-white/60">Leave counts as paid time off</p>
                      </div>
                      <input type="checkbox" checked={formData.is_paid} onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })} className="w-5 h-5 accent-amber-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Half Day Allowed</p>
                        <p className="text-sm text-white/60">Employees can take half day leave</p>
                      </div>
                      <input type="checkbox" checked={formData.is_half_day_allowed} onChange={(e) => setFormData({ ...formData, is_half_day_allowed: e.target.checked })} className="w-5 h-5 accent-amber-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Requires Approval</p>
                        <p className="text-sm text-white/60">Manager/HR must approve leave requests</p>
                      </div>
                      <input type="checkbox" checked={formData.requires_approval} onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })} className="w-5 h-5 accent-amber-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Active</p>
                        <p className="text-sm text-white/60">Available for employees to request</p>
                      </div>
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 accent-amber-500" />
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
            {data.map((lt) => (
              <Card key={lt.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{lt.name}</span>
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">{lt.code}</span>
                        {lt.is_active && <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>}
                        {!lt.is_active && <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded flex items-center gap-1"><X className="w-3 h-3" /> Inactive</span>}
                      </div>
                      <p className="text-sm text-white/60 mb-2">{lt.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-white/50">
                        <span><Calendar className="w-3 h-3 inline mr-1" /> {lt.days_per_year} days/year</span>
                        <span><Shield className="w-3 h-3 inline mr-1" /> {lt.requires_approval ? 'Approval Required' : 'Auto-approve'}</span>
                        <span><Clock className="w-3 h-3 inline mr-1" /> {lt.is_half_day_allowed ? 'Half-day allowed' : 'Full day only'}</span>
                        {lt.max_carry_forward > 0 && <span><Calendar className="w-3 h-3 inline mr-1" /> Carry: {lt.max_carry_forward} days</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(lt); setFormData(lt); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lt.id)}>
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

