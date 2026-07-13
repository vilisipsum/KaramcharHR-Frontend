import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EmployeesContent } from './employees-content'

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const supabase = await import('@/lib/server').then(m => m.createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return null

  const { getEmployees, getDepartments, getDesignations } = await import('@/lib/data')
  
  const params = await searchParams
  const search = params.search || ''
  const page = parseInt(params.page || '1')
  
  const [employeesResult, departments, designations] = await Promise.all([
    getEmployees(profile.org_id, { search, page, limit: 20 }),
    getDepartments(profile.org_id),
    getDesignations(profile.org_id),
  ])

  return (
    <DashboardLayout>
      <EmployeesContent 
        employees={employeesResult.data} 
        total={employeesResult.total}
        page={employeesResult.page}
        limit={employeesResult.limit}
        search={search}
        departments={departments}
        designations={designations}
      />
    </DashboardLayout>
  )
}