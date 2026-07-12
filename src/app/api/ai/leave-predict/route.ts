import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll() { return req.cookies.getAll() }, setAll() {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (!profile) return Response.json({ error: 'No profile' }, { status: 403 })

    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

    const { data: attendance } = await supabase
      .from('attendance')
      .select('date, status, employee_id')
      .in('employee_id', supabase.from('employees').select('id').eq('org_id', profile.org_id) as any)
      .gte('date', ninetyDaysAgo)
      .limit(500)

    const { data: leaveReqs } = await supabase
      .from('leave_requests')
      .select('start_date, end_date, status, leave_types(name)')
      .in('employee_id', supabase.from('employees').select('id').eq('org_id', profile.org_id) as any)
      .gte('start_date', ninetyDaysAgo)
      .limit(200)

    const { data: holidays } = await supabase
      .from('holidays')
      .select('name, date')
      .eq('org_id', profile.org_id)
      .gte('date', new Date().toISOString().split('T')[0])
      .limit(50)

    const { default: OpenAI } = await import('openai')
    const deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY,
    })

    const res = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an HR analytics AI. Analyze attendance and leave data to predict trends.

Return valid JSON:
{
  "peakLeavePeriods": [{ "month": "string", "expectedAbsences": number, "reason": "string" }],
  "burnoutFlags": ["team/individual at risk"],
  "recommendations": ["actionable suggestion"]
}`,
        },
        {
          role: 'user',
          content: `Recent 90d attendance: ${JSON.stringify(attendance)}
Leave requests: ${JSON.stringify(leaveReqs)}
Upcoming holidays: ${JSON.stringify(holidays)}

Analyze and predict leave patterns.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1024,
    })

    const content = res.choices[0]?.message?.content
    if (!content) return Response.json({ error: 'AI returned empty response' }, { status: 502 })

    const prediction = JSON.parse(content)
    return Response.json(prediction)
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
