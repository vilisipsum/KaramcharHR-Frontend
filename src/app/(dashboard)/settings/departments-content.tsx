'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState, LoadingState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
  head_id: string | null
  head: { first_name: string; last_name: string; employee_code: string } | null
  _count: { employees: number }
}

export function DepartmentsContent() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', head_id: '' })

  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.data || data || [])
      }
    } catch (err) {
      setError('Failed to load departments')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments'
      const method = editingDept ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        loadDepartments()
        setShowForm(false)
        setEditingDept(null)
        setFormData({ name: '', code: '', head_id: '' })
      }
    } catch (err) {
      setError('Failed to save department')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this department?')) return
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      if (res.ok) loadDepartments()
    } catch (err) {
      setError('Failed to delete department')
    }
  }

  function editDepartment(dept: Department) {
    setEditingDept(dept)
    setFormData({ name: dept.name, code: dept.code, head_id: dept.head_id || '' })
    setShowForm(true)
  }

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DataState
      data={filteredDepts}
      isLoading={isLoading}
      error={error}
      onRetry={loadDepartments}
      emptyTitle="No departments found"
      emptyDescription="Create your first department to get started"
      emptyAction={{ label: 'Add Department', onClick: () => { setEditingDept(null); setFormData({ name: '', code: '', head_id: '' }); setShowForm(true) } }}
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800/40" />
              <Input
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setEditingDept(null); setFormData({ name: '', code: '', head_id: '' }); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle>{editingDept ? 'Edit Department' : 'Add Department'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="head_id">Department Head</Label>
                    <Select value={formData.head_id} onChange={(e) => setFormData({ ...formData, head_id: e.target.value })}>
                      <SelectTrigger><SelectValue placeholder="Select head" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {departments.map(d => d.head && (
                          <SelectItem key={d.head_id} value={d.head_id!}>
                            {d.head.first_name} {d.head.last_name} ({d.head.employee_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingDept(null); setFormData({ name: '', code: '', head_id: '' }) }}>Cancel</Button>
                    <Button type="submit">{editingDept ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((dept) => (
              <Card key={dept.id} className="hover:border-amber-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{dept.name}</span>
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">{dept.code}</span>
                      </div>
                      <p className="text-sm text-slate-500">{dept._count?.employees || 0} employees</p>
                      {dept.head && (
                        <p className="text-sm text-slate-400 mt-1">
                          Head: {dept.head.first_name} {dept.head.last_name} ({dept.head.employee_code})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editDepartment(dept)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
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

