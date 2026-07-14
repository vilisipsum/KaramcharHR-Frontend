'use client'

import { useState } from 'react'

type DocType = 'pan' | 'aadhaar' | 'passport' | 'driving_license' | 'voter_id'

const docLabels: Record<DocType, string> = {
  pan: 'PAN Card',
  aadhaar: 'Aadhaar Card',
  passport: 'Passport',
  driving_license: 'Driving License',
  voter_id: 'Voter ID',
}

interface VerifyResult {
  verified: boolean
  confidence: 'high' | 'medium' | 'low'
  formatValid: boolean
  extractedInfo: { name: string | null; dob: string | null; gender: string | null }
  flags: string[]
  message: string
}

export default function DocumentVerifyPage() {
  const [docType, setDocType] = useState<DocType>('pan')
  const [docNumber, setDocNumber] = useState('')
  const [docText, setDocText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState('')

  async function verify() {
    if (!docNumber.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/document-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: docType, documentNumber: docNumber, documentText: docText || undefined }),
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
        <h1 className="text-2xl font-bold text-slate-800">Document Verification</h1>
        <p className="text-slate-500">AI-powered validation of Indian government documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {(Object.entries(docLabels) as [DocType, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDocType(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  docType === key
                    ? 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-white border border-amber-500/30'
                    : 'bg-slate-50 border border-slate-100 text-slate-400 border border-slate-200/60 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800 mb-2 block">Document Number</label>
            <input
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              placeholder={docType === 'aadhaar' ? 'XXXX XXXX XXXX' : docType === 'pan' ? 'ABCDE1234F' : 'Enter number'}
              className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800 mb-2 block">Full Document Text (optional — for deeper analysis)</label>
            <textarea
              value={docText}
              onChange={e => setDocText(e.target.value)}
              placeholder="Paste any visible text from the document for more accurate verification..."
              rows={4}
              className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>

          <button
            onClick={verify}
            disabled={loading || !docNumber.trim()}
            className="px-6 py-3 rounded-xl bg-indigo hover:bg-[#3730A3] text-slate-800 text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? 'Verifying...' : 'Verify Document'}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Verification Result</h2>

          {!result && !loading && (
            <p className="text-slate-800/40 text-sm">Enter a document number and click Verify</p>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Analyzing document with DeepSeek AI...
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  result.verified ? 'bg-teal/20 text-teal' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {result.verified ? '✓' : '✗'}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{result.verified ? 'Verified' : 'Suspicious'}</div>
                  <div className="text-xs text-slate-400">{result.message}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-800/40">Confidence</div>
                  <div className={`text-sm font-semibold ${
                    result.confidence === 'high' ? 'text-teal' : result.confidence === 'medium' ? 'text-amber-400' : 'text-rose-400'
                  }`}>{result.confidence}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-800/40">Format Valid</div>
                  <div className={`text-sm font-semibold ${result.formatValid ? 'text-teal' : 'text-rose-400'}`}>
                    {result.formatValid ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              {result.extractedInfo && (
                <div>
                  <div className="text-xs text-slate-800/40 uppercase tracking-wider mb-2">Extracted Info</div>
                  <div className="glass-strong rounded-xl p-3 space-y-1 text-sm">
                    {result.extractedInfo.name && <div><span className="text-slate-400">Name:</span> <span className="text-slate-800">{result.extractedInfo.name}</span></div>}
                    {result.extractedInfo.dob && <div><span className="text-slate-400">DOB:</span> <span className="text-slate-800">{result.extractedInfo.dob}</span></div>}
                    {result.extractedInfo.gender && <div><span className="text-slate-400">Gender:</span> <span className="text-slate-800">{result.extractedInfo.gender}</span></div>}
                  </div>
                </div>
              )}

              {result.flags?.length > 0 && (
                <div>
                  <div className="text-xs text-slate-800/40 uppercase tracking-wider mb-2">Flags</div>
                  {result.flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-rose-400 mb-1">
                      <span className="mt-0.5">⚠</span>
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
