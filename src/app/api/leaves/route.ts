import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const employeeId = searchParams.get('employee_id')
  const leaveTypeId = searchParams.get('leave_type_id')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('leave_requests')
    .select('*, employees(first_name, last_name, employee_code, departments(name)), leave_types(name, code, color)', { count: 'exact' })
    .in('employee_id', supabase.from('employees').select('id').eq('org_id', profile.org_id) as any)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (employeeId) query = query.eq('employee_id', employeeId)
  if (leaveTypeId) query = query.eq('leave_type_id', leaveTypeId)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, employee_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const body = await request.json()
  const employeeId = body.employee_id || profile.employee_id
  if (!employeeId) return NextResponse.json({ error: 'Employee not found' }, { status: 400 })

  const { data, error } = await supabase
    .from('leave_requests')
    .insert({ ...body, employee_id: employeeId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}