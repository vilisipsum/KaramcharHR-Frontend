import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

const schemaInfo = [
  'employees(id, employee_code, first_name, last_name, email, phone, department_id, designation_id, date_of_joining, status, manager_id)',
  'departments(id, name, code)',
  'designations(id, title, level)',
  'attendance(id, date, clock_in, clock_out, status, total_hours)',
  'leave_requests(id, start_date, end_date, status, total_days)',
  'leave_types(id, name, code, days_per_year)',
  'payroll_runs(id, month, year, status, total_net)',
].join('\n')

export async function POST(req: NextRequest) {
  try {
    const { query: userQuery } = await req.json()
    if (!userQuery) return Response.json({ error: 'Query is required' }, { status: 400 })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll() { return req.cookies.getAll() }, setAll() {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.org_id) return Response.json({ error: 'No org' }, { status: 403 })

    const { default: OpenAI } = await import('openai')
    const deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY,
    })

    const planRes = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an HR data analyst. Convert natural language queries into Supabase REST API calls.

Available tables:
${schemaInfo}

Rules:
- ALWAYS filter by org_id
- Use proper Supabase query syntax
- Return valid JSON: { "table": "table_name", "select": "col1,col2", "filters": [{ "col": "col", "op": "eq|gte|lte|ilike", "val": "value" }], "limit": number, "explanation": "what you found" }
- Use current date context: today is ${new Date().toISOString().split('T')[0]}`,
        },
        { role: 'user', content: userQuery },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1024,
    })

    const planContent = planRes.choices[0]?.message?.content
    if (!planContent) return Response.json({ error: 'AI returned empty plan' }, { status: 502 })

    const plan = JSON.parse(planContent)
    if (!plan.table) return Response.json({ error: 'Could not parse query' }, { status: 400 })

    // Execute the query
    let query = supabase
      .from(plan.table as any)
      .select(plan.select || '*')

    if (plan.filters) {
      for (const f of plan.filters) {
        if (typeof (query as any)[f.op] === 'function') {
          query = (query as any)[f.op](f.col, f.val)
        }
      }
    }
    query = query.eq('org_id', profile.org_id)

    if (plan.limit) query = query.limit(plan.limit)
    query = query.limit(50)

    const { data: results, error: queryError } = await query

    if (queryError) {
      return Response.json({ error: queryError.message, plan }, { status: 500 })
    }

    // Have AI summarize results
    const summaryRes = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Summarize the HR query results in 1-2 sentences. Be concise.',
        },
        {
          role: 'user',
          content: `Query: "${userQuery}"\nResults: ${JSON.stringify(results)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
    })

    return Response.json({
      results,
      explanation: plan.explanation || '',
      summary: summaryRes.choices[0]?.message?.content || '',
      count: Array.isArray(results) ? results.length : 0,
    })
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
