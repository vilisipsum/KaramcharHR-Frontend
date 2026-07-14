'use client'

import { useState } from 'react'

interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  skills?: string[]
  totalExperienceYears?: number
  currentCompany?: string | null
  currentDesignation?: string | null
  education?: Array<{ degree: string; institution: string; year: number | null }>
  summary?: string
  matchScore?: number
  matchAnalysis?: string
}

export default function ResumeScreeningPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParsedResume | null>(null)
  const [error, setError] = useState('')

  async function parse() {
    if (!resumeText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDescription || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI Resume Screening</h1>
        <p className="text-slate-500">Paste a resume to extract candidate data and match against job openings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-800 mb-2 block">Resume Text</label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste the full resume text here..."
              rows={12}
              className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors resize-none font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800 mb-2 block">Job Description (optional — for match scoring)</label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements to calculate a match score..."
              rows={6}
              className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors resize-none font-mono"
            />
          </div>

          <button
            onClick={parse}
            disabled={loading || !resumeText.trim()}
            className="px-6 py-3 rounded-xl bg-indigo hover:bg-[#3730A3] text-slate-800 text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? 'Parsing...' : 'Analyze Resume'}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Extracted Data</h2>

          {!result && !loading && (
            <p className="text-slate-800/40 text-sm">Paste a resume on the left and click "Analyze Resume"</p>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Analyzing with DeepSeek AI...
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.matchScore !== undefined && (
                <div className="glass-strong rounded-xl p-4 flex items-center gap-4">
                  <div className={`text-3xl font-bold ${
                    result.matchScore >= 80 ? 'text-teal' : result.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>{result.matchScore}%</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Match Score</div>
                    <div className="text-xs text-slate-400">{result.matchAnalysis}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Field label="Name" value={result.name} />
                <Field label="Email" value={result.email} />
                <Field label="Phone" value={result.phone} />
                <Field label="Experience" value={result.totalExperienceYears ? `${result.totalExperienceYears} years` : undefined} />
                <Field label="Current Company" value={result.currentCompany} />
                <Field label="Current Designation" value={result.currentDesignation} />
              </div>

              {result.skills && result.skills.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white border border-slate-200/60 text-xs text-slate-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.education && result.education.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-2">Education</div>
                  {result.education.map((e, i) => (
                    <div key={i} className="text-xs text-slate-600 mb-1">
                      {e.degree} — {e.institution}{e.year ? ` (${e.year})` : ''}
                    </div>
                  ))}
                </div>
              )}

              {result.summary && (
                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">Summary</div>
                  <p className="text-xs text-slate-500">{result.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-slate-800/40">{label}</div>
      <div className="text-sm text-slate-800 font-medium">{value || '—'}</div>
    </div>
  )
}
