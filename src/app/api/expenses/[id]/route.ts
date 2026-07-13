import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('expense_claims')
    .select('*, employees(first_name, last_name, employee_code, departments(name)), expense_categories(name, code)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const isHR = ['super_admin', 'org_admin', 'hr_manager', 'manager'].includes(profile.role)
  const { data: claim } = await supabase
    .from('expense_claims')
    .select('employee_id, status')
    .eq('id', id)
    .single()

  if (!isHR && claim?.employee_id !== profile.employee_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateData = { ...body }
  if (body.status === 'approved' || body.status === 'rejected') {
    updateData.approved_by = user.id
    updateData.approved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('expense_claims')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const isHR = ['super_admin', 'org_admin', 'hr_manager'].includes(profile.role)
  const { data: claim } = await supabase
    .from('expense_claims')
    .select('employee_id, status')
    .eq('id', id)
    .single()

  if (!isHR && claim?.employee_id !== profile.employee_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (claim?.status !== 'pending') {
    return NextResponse.json({ error: 'Cannot delete non-pending claim' }, { status: 400 })
  }

  const { error } = await supabase
    .from('expense_claims')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}