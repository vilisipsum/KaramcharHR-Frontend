import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { documentType, documentNumber, documentText } = await req.json()
    if (!documentType || !documentNumber) {
      return Response.json({ error: 'documentType and documentNumber are required' }, { status: 400 })
    }
    if (!['pan', 'aadhaar', 'passport', 'driving_license', 'voter_id'].includes(documentType)) {
      return Response.json({ error: 'Invalid document type' }, { status: 400 })
    }

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
          content: `You are an Indian document verification AI. Analyze the document and return valid JSON:

{
  "verified": boolean,
  "confidence": "high" | "medium" | "low",
  "formatValid": boolean,
  "extractedInfo": { "name": string or null, "dob": string or null, "gender": string or null },
  "flags": ["suspicious pattern descriptions"],
  "message": "human-readable summary"
}

Document rules:
- PAN: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F). The 4th character is the type (P for individual).
- Aadhaar: 12 digits, may be formatted as XXXX XXXX XXXX. Uses Verhoeff checksum.
- Passport: 8 alphanumeric (e.g., A1234567) or J series.
- Driving License: varies by state, typically alphanumeric.
- Voter ID: 3 letters + 7 digits (e.g., ABC1234567).`,
        },
        {
          role: 'user',
          content: `Verify this ${documentType}: number="${documentNumber}"${documentText ? `\nfull text:\n${documentText}` : ''}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1024,
    })

    const content = res.choices[0]?.message?.content
    if (!content) return Response.json({ error: 'AI returned empty response' }, { status: 502 })

    const result = JSON.parse(content)
    return Response.json(result)
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
