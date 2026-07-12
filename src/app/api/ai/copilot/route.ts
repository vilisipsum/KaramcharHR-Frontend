import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, org_id')
    .eq('id', user.id)
    .single()

  let context = ''
  if (profile) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.org_id)
      .single()

    context = `
User: ${profile.full_name || 'Employee'}
Role: ${profile.role}
Organization: ${(org as any)?.name || 'Unknown'}
    `.trim()
  }

  const { default: OpenAI } = await import('openai')
  const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  })
  const stream = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `You are KaramcharHR Copilot, an AI HR assistant for an Indian HRMS platform.

You help employees and HR managers with:
- HR policy questions (Indian labor laws, EPF, ESIC, PT, TDS)
- Leave balance checks and policy details
- Payroll and salary structure questions
- Attendance and shift queries
- Performance review guidance
- Recruitment and candidate screening
- General HR best practices

Current user context:
${context}

Keep responses concise and practical. Use Indian context (INR, Indian leave types CL/SL/EL/ML/PL, etc.).
If you don't have specific data, say so rather than guessing. Format numbers in Indian grouping (₹1,23,456).
`,
      },
      { role: 'user', content: message },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 1024,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
