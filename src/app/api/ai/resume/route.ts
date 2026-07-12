import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json()
  if (!resumeText) return Response.json({ error: 'Resume text is required' }, { status: 400 })

  const { default: OpenAI } = await import('openai')
  const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
  })

  const systemPrompt = `You are an AI resume parser for KaramcharHR. Extract structured data from the resume text.

Return valid JSON with this exact structure:
{
  "name": "Full name",
  "email": "email",
  "phone": "phone",
  "skills": ["skill1", "skill2"],
  "totalExperienceYears": number,
  "currentCompany": "company or null",
  "currentDesignation": "designation or null",
  "education": [
    { "degree": "degree name", "institution": "institution", "year": year or null }
  ],
  "summary": "brief professional summary"
}`

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Parse this resume:\n\n${resumeText}` },
  ]

  if (jobDescription) {
    messages.push({
      role: 'user',
      content: `Also match this resume against the following job description. Add a field "matchScore" (0-100) and "matchAnalysis" (brief explanation) to the JSON output.\n\nJob Description:\n${jobDescription}`,
    })
  }

  const res = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 2048,
  })

  const parsed = JSON.parse(res.choices[0]?.message?.content || '{}')
  return Response.json(parsed)
}
