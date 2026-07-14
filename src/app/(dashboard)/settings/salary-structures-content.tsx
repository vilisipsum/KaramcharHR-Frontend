'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Calculator } from 'lucide-react'

interface SalaryStructure {
  id: string
  name: string
  ctc_annual: number
  basic_percent: number
  hra_percent: number
  special_allowance_percent: number
  conveyance_monthly: number
  medical_allowance_monthly: number
  lta_monthly: number
  other_allowances_monthly: number
  pf_employee_rate: number
  pf_employer_rate: number
  esi_applicable: boolean
  esi_employee_rate: number
  esi_employer_rate: number
  professional_tax_monthly: number
  is_active: boolean
  _count: { employees: number }
}

export function SalaryStructuresContent() {
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SalaryStructure | null>(null)
  const [formData, setFormData] = useState<Partial<SalaryStructure>>({
    name: '', ctc_annual: 0, basic_percent: 40, hra_percent: 20, special_allowance_percent: 25,
    conveyance_monthly: 1600, medical_allowance_monthly: 1250, lta_monthly: 1000, other_allowances_monthly: 0,
    pf_employee_rate: 12, pf_employer_rate: 12, esi_applicable: false, esi_employee_rate: 0.75, esi_employer_rate: 3.25,
    professional_tax_monthly: 200, is_active: true
  })

  useEffect(() => { loadStructures() }, [])

  async function loadStructures() {
    try {
      const res = await fetch('/api/salary-structures')
      if (res.ok) {
        const data = await res.json()
        setStructures(data.data || data || [])
      }
    } catch { setError('Failed to load structures') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/salary-structures/${editing.id}` : '/api/salary-structures'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadStructures(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save structure') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this salary structure?')) return
    try {
      const res = await fetch(`/api/salary-structures/${id}`, { method: 'DELETE' })
      if (res.ok) loadStructures()
    } catch { setError('Failed to delete structure') }
  }

  function resetForm() {
    setFormData({ name: '', ctc_annual: 0, basic_percent: 40, hra_percent: 20, special_allowance_percent: 25,
      conveyance_monthly: 1600, medical_allowance_monthly: 1250, lta_monthly: 1000, other_allowances_monthly: 0,
      pf_employee_rate: 12, pf_employer_rate: 12, esi_applicable: false, esi_employee_rate: 0.75, esi_employer_rate: 3.25,
      professional_tax_monthly: 200, is_active: true })
  }

  const filtered = structures.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadStructures}
      emptyTitle="No salary structures found"
      emptyDescription="Create salary structures to assign to employees"
      emptyAction={{ label: 'Add Structure', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800/40" />
              <Input placeholder="Search structures..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Structure
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Salary Structure' : 'Add Salary Structure'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual CTC (₹)</Label>
                    <Input type="number" step="1000" min="0" value={formData.ctc_annual || ''} onChange={(e) => setFormData({ ...formData, ctc_annual: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Basic %</Label>
                    <Input type="number" step="0.01" min="0" max="100" value={formData.basic_percent || ''} onChange={(e) => setFormData({ ...formData, basic_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>HRA %</Label>
                    <Input type="number" step="0.01" min="0" max="100" value={formData.hra_percent || ''} onChange={(e) => setFormData({ ...formData, hra_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Special Allowance %</Label>
                    <Input type="number" step="0.01" min="0" max="100" value={formData.special_allowance_percent || ''} onChange={(e) => setFormData({ ...formData, special_allowance_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Conveyance/Month</Label>
                    <Input type="number" step="100" min="0" value={formData.conveyance_monthly || ''} onChange={(e) => setFormData({ ...formData, conveyance_monthly: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Medical/Month</Label>
                    <Input type="number" step="100" min="0" value={formData.medical_allowance_monthly || ''} onChange={(e) => setFormData({ ...formData, medical_allowance_monthly: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>LTA/Month</Label>
                    <Input type="number" step="100" min="0" value={formData.lta_monthly || ''} onChange={(e) => setFormData({ ...formData, lta_monthly: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Other Allowances/Month</Label>
                    <Input type="number" step="100" min="0" value={formData.other_allowances_monthly || ''} onChange={(e) => setFormData({ ...formData, other_allowances_monthly: parseInt(e.target.value) || 0 })} />
                  </div>
                  
                  <div className="space-y-2 lg:col-span-3 border-t border-gray-700 pt-4">
                    <h4 className="font-medium text-slate-800 mb-2">Statutory Components</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>PF Employee %</Label>
                        <Input type="number" step="0.01" min="0" max="20" value={formData.pf_employee_rate || ''} onChange={(e) => setFormData({ ...formData, pf_employee_rate: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>PF Employer %</Label>
                        <Input type="number" step="0.01" min="0" max="20" value={formData.pf_employer_rate || ''} onChange={(e) => setFormData({ ...formData, pf_employer_rate: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Tax/Month</Label>
                        <Input type="number" step="100" min="0" value={formData.professional_tax_monthly || ''} onChange={(e) => setFormData({ ...formData, professional_tax_monthly: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>ESI Applicable</Label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={formData.esi_applicable} onChange={(e) => setFormData({ ...formData, esi_applicable: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                          <Label className="text-slate-800 cursor-pointer">Yes</Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>ESI Employee %</Label>
                        <Input type="number" step="0.01" min="0" max="5" value={formData.esi_employee_rate || ''} onChange={(e) => setFormData({ ...formData, esi_employee_rate: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>ESI Employer %</Label>
                        <Input type="number" step="0.01" min="0" max="5" value={formData.esi_employer_rate || ''} onChange={(e) => setFormData({ ...formData, esi_employer_rate: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-3">
                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    <Label htmlFor="is_active" className="text-slate-800">Active</Label>
                  </div>

                  <div className="lg:col-span-3 flex justify-end gap-2 border-t border-gray-700 pt-4">
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
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">₹{s.ctc_annual.toLocaleString()}/yr</span>
                      {s.is_active && <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Active</span>}
                      {!s.is_active && <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">Inactive</span>}
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
                  <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mb-3">
                    <div><span className="text-slate-800/40">Basic:</span> {s.basic_percent}%</div>
                    <div><span className="text-slate-800/40">HRA:</span> {s.hra_percent}%</div>
                    <div><span className="text-slate-800/40">Special:</span> {s.special_allowance_percent}%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mb-3">
                    <div><span className="text-slate-800/40">PF:</span> {s.pf_employee_rate}% / {s.pf_employer_rate}%</div>
                    <div><span className="text-slate-800/40">PT:</span> ₹{s.professional_tax_monthly}/mo</div>
                    <div><span className="text-slate-800/40">ESI:</span> {s.esi_applicable ? 'Yes' : 'No'}</div>
                  </div>
                  <p className="text-xs text-slate-400">{s._count?.employees || 0} employees assigned</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  )
}

