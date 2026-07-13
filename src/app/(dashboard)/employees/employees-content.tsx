'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { StatusChip } from '@/components/ui/StatusChip'

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

  const totalPages = Math.ceil(total / limit)

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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="field max-w-xs">
        <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Search</label>
        <input
          type="text"
          placeholder="Search by name, team, ID…"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm"
        />
      </form>

      {employees.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-muted-foreground">No employees found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, i) => (
            <div key={emp.id} className="glass p-4 flex flex-col items-center gap-2 text-center hover:border-amber-500/30 transition-all cursor-pointer">
              <Avatar initials={`${emp.first_name?.[0]}${emp.last_name?.[0]}`.toUpperCase()} index={i} size="lg" />
              <div className="font-semibold text-sm truncate w-full">{emp.first_name} {emp.last_name}</div>
              <div className="text-xs text-muted-foreground truncate w-full">{emp.departments?.name || '—'}</div>
              <StatusChip type={emp.status === 'active' ? 'present' : emp.status === 'on_leave' ? 'leave' : 'absent'} label={emp.status} />
              <div className="text-[10px] text-muted-foreground font-mono mt-1">{emp.employee_code}</div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="btn btn-ghost btn-sm"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="btn btn-ghost btn-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}