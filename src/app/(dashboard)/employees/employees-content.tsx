'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { StatusChip } from '@/components/ui/StatusChip'
import { Search, UserPlus, X, Calendar, User, Mail, Phone, Briefcase, Hash } from 'lucide-react'

interface EmployeesContentProps {
  employees: Array<{
    id: string
    employee_code: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    date_of_joining: string
    status: string
    departments: { name: string; code: string } | null
    designations: { title: string; level: number } | null
    leave_balances: Array<{ leave_types: { name: string; code: string }; balance: number; entitled: number; taken: number }>
  }>
  total: number
  page: number
  limit: number
  search: string
  departments: Array<{ id: string; name: string; code: string }>
  designations: Array<{ id: string; title: string; level: number }>
}

export function EmployeesContent({ employees, total, page, limit, search, departments, designations }: EmployeesContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSearch, setLocalSearch] = useState(search)
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Form State
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_code: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    department_id: departments[0]?.id || '',
    designation_id: designations[0]?.id || '',
  })

  const totalPages = Math.ceil(total / limit)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (localSearch) params.set('search', localSearch)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/employees?${params.toString()}`)
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/employees?${params.toString()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            status: 'active'
          })
        })

        if (!res.ok) {
          const err = await res.json()
          showToast(err.error || 'Failed to add employee', 'error')
          return
        }

        showToast('Employee added successfully!', 'success')
        setShowModal(false)
        setForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          employee_code: '',
          date_of_joining: new Date().toISOString().split('T')[0],
          department_id: departments[0]?.id || '',
          designation_id: designations[0]?.id || '',
        })
        router.refresh()
      } catch (err) {
        showToast('An unexpected error occurred', 'error')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, team, ID…"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-indigo text-sm transition-colors"
          />
        </form>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo text-slate-800 text-sm font-bold hover:bg-[#3730A3] hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Employee list */}
      {employees.length === 0 ? (
        <div className="glass p-16 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
          <Briefcase className="w-8 h-8 text-slate-500 opacity-50" />
          <div className="text-slate-500 font-semibold text-sm">No employees in directory yet.</div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 text-xs text-marigold font-bold hover:text-amber transition-colors cursor-pointer"
          >
            Create first employee profile →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, i) => (
            <div key={emp.id} className="glass p-5 rounded-2xl flex flex-col items-center gap-2 text-center hover:border-amber-500/20 hover:shadow-md transition-all cursor-pointer relative group">
              <Avatar initials={`${emp.first_name?.[0]}${emp.last_name?.[0]}`.toUpperCase()} index={i} size="lg" />
              <div className="font-semibold text-sm truncate w-full mt-2 text-slate-800">{emp.first_name} {emp.last_name}</div>
              <div className="text-xs text-slate-500 truncate w-full">{emp.designations?.title || '—'} · {emp.departments?.name || '—'}</div>
              <div className="mt-1">
                <StatusChip type={emp.status === 'active' ? 'present' : emp.status === 'on_leave' ? 'leave' : 'absent'} label={emp.status} />
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{emp.employee_code}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-slate-500 font-semibold">
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)} />

          {/* Modal Container */}
          <div className="relative glass w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo" />
                <h3 className="font-bold text-slate-800 text-base">Add New Employee</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="John" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="Doe" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required placeholder="john.doe@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Employee Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="EMP024" value={form.employee_code} onChange={e => setForm({ ...form, employee_code: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date of Joining</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" required value={form.date_of_joining} onChange={e => setForm({ ...form, date_of_joining: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors appearance-none">
                      {departments.map(d => (
                        <option key={d.id} value={d.id} className="bg-white text-slate-800">{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select value={form.designation_id} onChange={e => setForm({ ...form, designation_id: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo/50 transition-colors appearance-none">
                      {designations.map(d => (
                        <option key={d.id} value={d.id} className="bg-white text-slate-800">{d.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-indigo text-slate-800 text-sm font-bold rounded-xl hover:bg-[#3730A3] hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Onboarding...' : 'Onboard Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}