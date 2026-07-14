'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataState } from '@/components/ui/DataStates'
import { Plus, Search, Edit, Trash2, FileText, FileQuestion, AlertCircle, CheckCircle, XCircle, Clock, Calendar, Upload } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'aadhaar' | 'pan' | 'passport' | 'driving_license' | 'voter_id' | 'offer_letter' | 'experience_letter' | 'education'
  document_number: string
  file_url: string | null
  expiry_date: string | null
  verified: boolean
  employee_id: string
  employee: { first_name: string; last_name: string; employee_code: string }
  created_at: string
}

export function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => { loadDocuments() }, [])

  async function loadDocuments() {
    try {
      const res = await fetch('/api/employee-documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.data || data || [])
      }
    } catch { setError('Failed to load documents') }
    finally { setIsLoading(false) }
  }

  const typeIcons = {
    aadhaar: FileText, pan: FileText, passport: FileText,
    driving_license: FileText, voter_id: FileText,
    offer_letter: FileText, experience_letter: FileText, education: FileText
  }

  const filtered = documents.filter(d => 
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
     d.employee.first_name.toLowerCase().includes(search.toLowerCase()) ||
     d.employee.last_name.toLowerCase().includes(search.toLowerCase()) ||
     d.document_number.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || d.type === typeFilter) &&
    (!statusFilter || (statusFilter === 'verified' && d.verified) || (statusFilter === 'pending' && !d.verified) || (statusFilter === 'expired' && d.expiry_date && new Date(d.expiry_date) < new Date()))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <DataState
      data={filtered}
      isLoading={isLoading}
      error={error}
      onRetry={loadDocuments}
      emptyTitle="No documents found"
      emptyDescription="Employee documents will appear here"
    >
      {(data) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative max-w-xs flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800/40" />
              <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                  <SelectItem value="voter_id">Voter ID</SelectItem>
                  <SelectItem value="offer_letter">Offer Letter</SelectItem>
                  <SelectItem value="experience_letter">Experience Letter</SelectItem>
                  <SelectItem value="education">Education Certificate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((doc) => {
              const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date()
              const TypeIcon = typeIcons[doc.type] || FileText
              return (
                <Card key={doc.id} className={`hover:border-amber-500/30 transition-colors ${isExpired ? 'border-red-500/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-slate-800">{doc.name}</span>
                          <span className="px-2 py-0.5 text-xs bg-gray-600/50 text-slate-700 rounded capitalize">{doc.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">Number: {doc.document_number}</p>
                        <p className="text-xs text-slate-400 mb-1">
                          {doc.employee.first_name} {doc.employee.last_name} ({doc.employee.employee_code})
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.verified ? (
                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Expired
                            </span>
                          )}
                          {doc.expiry_date && !isExpired && (
                            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Expires: {new Date(doc.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-700 bg-gray-900/50 text-sm text-slate-600 hover:bg-gray-700/50 hover:text-slate-800 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => { /* edit */ }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { /* delete */ }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
)
          }
        )}
        </div>
      </div>
      )}
    </DataState>
  )
}

