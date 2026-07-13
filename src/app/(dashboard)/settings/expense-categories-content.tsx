'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface ExpenseCategory {
  id: string
  name: string
  code: string
  description: string
  max_amount: number | null
  requires_receipt: boolean
  is_active: boolean
  _count: { claims: number }
}

export function ExpenseCategoriesContent() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ExpenseCategory | null>(null)
  const [formData, setFormData] = useState<Partial<ExpenseCategory>>({
    name: '', code: '', description: '', max_amount: null, requires_receipt: true, is_active: true
  })

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    try {
      const res = await fetch('/api/expense-categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || data || [])
      }
    } catch { setError('Failed to load categories') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/expense-categories/${editing.id}` : '/api/expense-categories'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadCategories(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save category') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    try {
      const res = await fetch(`/api/expense-categories/${id}`, { method: 'DELETE' })
      if (res.ok) loadCategories()
    } catch { setError('Failed to delete category') }
  }

  function resetForm() {
    setFormData({ name: '', code: '', description: '', max_amount: null, requires_receipt: true, is_active: true })
  }

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadCategories}
      emptyTitle="No expense categories found"
      emptyDescription="Create categories to organize expense claims"
      emptyAction={{ label: 'Add Category', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle>{editing ? 'Edit Category' : 'Add Category'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Amount</Label>
                    <Input type="number" step="0.01" min="0" value={formData.max_amount || ''} onChange={(e) => setFormData({ ...formData, max_amount: e.target.value ? parseFloat(e.target.value) : null })} placeholder="No limit" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" rows={3} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="requires_receipt" checked={formData.requires_receipt} onChange={(e) => setFormData({ ...formData, requires_receipt: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    <Label htmlFor="requires_receipt" className="text-white">Require Receipt</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    <Label htmlFor="is_active" className="text-white">Active</Label>
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
            {data.map((cat) => (
              <Card key={cat.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{cat.name}</span>
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">{cat.code}</span>
                        {cat.is_active && <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Active</span>}
                        {!cat.is_active && <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">Inactive</span>}
                      </div>
                      <p className="text-sm text-white/60 mb-2">{cat.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-white/50">
                        <span>{cat._count?.claims || 0} claims</span>
                        {cat.max_amount && <span>Max: ₹{cat.max_amount.toLocaleString()}</span>}
                        <span>{cat.requires_receipt ? 'Receipt required' : 'No receipt needed'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(cat); setFormData(cat); setShowForm(true) }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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

