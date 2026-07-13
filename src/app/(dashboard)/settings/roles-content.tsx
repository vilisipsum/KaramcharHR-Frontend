'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, Shield, Users, Key, Eye, Lock, Unlock, Check, X } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  is_system: boolean
  _count: { users: number }
}

const ALL_PERMISSIONS = [
  'employees.read', 'employees.write', 'employees.delete',
  'leave.read', 'leave.write', 'leave.approve',
  'attendance.read', 'attendance.write', 'attendance.approve',
  'payroll.read', 'payroll.write', 'payroll.approve',
  'expense.read', 'expense.write', 'expense.approve',
  'performance.read', 'performance.write', 'performance.review',
  'recruitment.read', 'recruitment.write', 'recruitment.hire',
  'documents.read', 'documents.write',
  'reports.read', 'reports.export',
  'settings.read', 'settings.write',
  'users.read', 'users.write', 'users.delete',
  'roles.read', 'roles.write', 'roles.delete',
]

export function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '', description: '', permissions: [], is_system: false
  })

  useEffect(() => { loadRoles() }, [])

  async function loadRoles() {
    try {
      const res = await fetch('/api/roles')
      if (res.ok) {
        const data = await res.json()
        setRoles(data.data || data || [])
      }
    } catch { setError('Failed to load roles') }
    finally { setIsLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editing ? `/api/roles/${editing.id}` : '/api/roles'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { loadRoles(); setShowForm(false); setEditing(null); resetForm() }
    } catch { setError('Failed to save role') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this role?')) return
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
      if (res.ok) loadRoles()
    } catch { setError('Failed to delete role') }
  }

  function resetForm() {
    setFormData({ name: '', description: '', permissions: [], is_system: false })
  }

  const filtered = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.is_system ? -1 : 1) || a.name.localeCompare(b.name))

  const permissionGroups = {
    'Employees': ['employees.read', 'employees.write', 'employees.delete'],
    'Leave': ['leave.read', 'leave.write', 'leave.approve'],
    'Attendance': ['attendance.read', 'attendance.write', 'attendance.approve'],
    'Payroll': ['payroll.read', 'payroll.write', 'payroll.approve'],
    'Expenses': ['expense.read', 'expense.write', 'expense.approve'],
    'Performance': ['performance.read', 'performance.write', 'performance.review'],
    'Recruitment': ['recruitment.read', 'recruitment.write', 'recruitment.hire'],
    'Documents': ['documents.read', 'documents.write'],
    'Reports': ['reports.read', 'reports.export'],
    'Settings': ['settings.read', 'settings.write'],
    'Users': ['users.read', 'users.write', 'users.delete'],
    'Roles': ['roles.read', 'roles.write', 'roles.delete'],
  }

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadRoles}
      emptyTitle="No roles found"
      emptyDescription="Create custom roles with specific permissions"
      emptyAction={{ label: 'Add Role', onClick: () => { setEditing(null); resetForm(); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30 max-w-3xl">
              <CardHeader><CardTitle>{editing ? 'Edit Role' : 'Add Role'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>System Role</Label>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.is_system} onChange={(e) => setFormData({ ...formData, is_system: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                        <Label className="text-white cursor-pointer">Cannot be deleted</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" rows={3} />
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Permissions</h4>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, permissions: ALL_PERMISSIONS })}>
                          <Check className="w-4 h-4 mr-1" /> Select All
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, permissions: [] })}>
                          <X className="w-4 h-4 mr-1" /> Clear All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(permissionGroups).map(([group, perms]) => (
                        <div key={group} className="space-y-2 p-4 glass rounded-lg">
                          <h5 className="font-medium text-white mb-2 border-b border-gray-700 pb-2">{group}</h5>
                          {perms.map(perm => (
                            <label key={perm} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permissions?.includes(perm)}
                                onChange={(e) => {
                                  const perms = formData.permissions || []
                                  if (e.target.checked) {
                                    setFormData({ ...formData, permissions: [...perms, perm] })
                                  } else {
                                    setFormData({ ...formData, permissions: perms.filter(p => p !== perm) })
                                  }
                                }}
                                className="w-4 h-4 accent-amber-500"
                              />
                              <span className="text-sm text-white/80">{perm.replace('.', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      ))}
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
            {data.map((r) => (
              <Card key={r.id} className={`hover:border-amber-500/30 transition-colors ${r.is_system ? 'border-purple-500/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{r.name}</span>
                        {r.is_system && (
                          <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded flex items-center gap-1">
                            <Shield className="w-3 h-3" /> System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 mb-2">{r.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs bg-gray-600/50 text-white/80 rounded flex items-center gap-1">
                          <Users className="w-3 h-3" /> {r._count?.users || 0} users
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
                          <Key className="w-3 h-3" /> {r.permissions.length} permissions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                        {r.permissions.slice(0, 5).map(p => (
                          <span key={p} className="px-2 py-0.5 text-xs bg-gray-700/50 text-white/70 rounded">{p.replace('.', ' ')}</span>
                        ))}
                        {r.permissions.length > 5 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-700/50 text-white/50 rounded">+{r.permissions.length - 5} more</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
{!r.is_system ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setFormData(r); setShowForm(true) }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="px-2 py-1 text-xs text-white/40">Protected</span>
                        )}
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

