import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })
  if (!['org_admin', 'hr_manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.org_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  
  // Get settings from org settings JSONB or defaults
  const settings = data.settings || {
    companyName: data.name,
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'INR',
    language: 'en',
    weekStart: 'monday',
    fiscalYearStart: 'april',
  }

  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })
  if (!['org_admin', 'hr_manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  
  const { data, error } = await supabase
    .from('organizations')
    .update({ 
      settings: body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data.settings || body)
}