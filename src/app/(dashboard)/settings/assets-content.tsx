'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Laptop, Smartphone, Shield, Monitor, Keyboard, Mouse, HardDrive, Wifi, Package } from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: 'laptop' | 'phone' | 'monitor' | 'accessory' | 'network' | 'storage' | 'other'
  serial_number: string
  model: string
  purchase_date: string
  purchase_cost: number
  warranty_expiry: string | null
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost'
  assigned_to: { first_name: string; last_name: string; employee_code: string } | null
}

export function AssetsContent() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '', type: 'laptop', serial_number: '', model: '',
    purchase_date: '', purchase_cost: 0, warranty_expiry: null,
    status: 'available', assigned_to: null
  })

  useEffect(() => {
    loadAssets()
  }, [])

  async function loadAssets() {
    try {
      const res = await fetch('/api/assets')
      if (res.ok) {
        const data = await res.json()
        setAssets(data.data || data || [])
      }
    } catch { setError('Failed to load assets') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/assets/${editing.id}` : '/api/assets'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadAssets(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save asset') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this asset?')) return
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      if (res.ok) loadAssets()
    } catch { setError('Failed to delete asset') }
  }

  function resetForm() {
    setFormData({ name: '', type: 'laptop', serial_number: '', model: '',
      purchase_date: '', purchase_cost: 0, warranty_expiry: null,
      status: 'available', assigned_to: null })
  }

  const typeIcons = {
    laptop: Laptop, phone: Smartphone, monitor: Monitor,
    accessory: Keyboard, network: Wifi, storage: HardDrive, other: Package
  }

  const filtered = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.serial_number.toLowerCase().includes(search.toLowerCase()) ||
    a.model.toLowerCase().includes(search.toLowerCase()) ||
    a.assigned_to?.first_name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadAssets}
      emptyTitle="No assets found"
      emptyDescription="Add assets to track company equipment"
      emptyAction={{ label: 'Add Asset', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Asset' : 'Add Asset'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Type</Label><Select value={formData.type} onChange={(v) => setFormData({ ...formData, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                        <SelectItem value="network">Network Equipment</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select></div>
                    <div className="space-y-2"><Label>Serial Number</Label><Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Model</Label><Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Purchase Cost (₹)</Label><Input type="number" min="0" step="100" value={formData.purchase_cost || ''} onChange={(e) => setFormData({ ...formData, purchase_cost: parseInt(e.target.value) || 0 })} /></div>
                    <div className="space-y-2"><Label>Warranty Expiry</Label><Input type="date" value={formData.warranty_expiry || ''} onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value || null })} /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
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
            {data.map((a) => {
              const TypeIcon = typeIcons[a.type] || Package
              const statusColors = {
                available: 'bg-green-500/20 text-green-400',
                assigned: 'bg-blue-500/20 text-blue-400',
                maintenance: 'bg-amber-500/20 text-amber-400',
                retired: 'bg-gray-500/20 text-gray-400',
                lost: 'bg-red-500/20 text-red-400'
              }
              return (
                <Card key={a.id} className="hover:border-amber-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-white">{a.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${statusColors[a.status]}`}>{a.status}</span>
                        </div>
                        <p className="text-sm text-white/60 mb-1">{a.model}</p>
                        <p className="text-xs text-white/50 mb-1">SN: {a.serial_number}</p>
                        <p className="text-xs text-white/50">Purchased: {new Date(a.purchase_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • ₹{a.purchase_cost.toLocaleString()}</p>
                        {a.warranty_expiry && (
                          <p className="text-xs text-white/50 mt-1">Warranty: {new Date(a.warranty_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        )}
                        {a.assigned_to && (
                          <p className="text-xs text-white/50 mt-1">Assigned: {a.assigned_to.first_name} {a.assigned_to.last_name} ({a.assigned_to.employee_code})</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setFormData(a); setShowForm(true) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
            )
          }
        )}
        </div>
      </div>
      )}
    </DataState>
  )
}

