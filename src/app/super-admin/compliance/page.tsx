'use client'

import { useState, useEffect, useTransition } from 'react'
import { getComplianceData, updatePlatformSetting, updateTaxRules } from './actions'
import { Shield, Save, AlertTriangle, FileText, CheckCircle2, Copy } from 'lucide-react'

type Setting = { id: string; key: string; value: number; description: string }
type TaxRule = { id: string; state_name: string; slabs: any[]; updated_at: string }

export default function CompliancePage() {
  const [data, setData] = useState<{ settings: Setting[]; taxRules: TaxRule[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Slabs edit states
  const [editingState, setEditingState] = useState<string | null>(null)
  const [jsonText, setJsonText] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadData() {
    setLoading(true)
    const res = await getComplianceData()
    if ('error' in res && res.error) {
      if (res.error === 'COMPLIANCE_TABLES_MISSING') {
        setErrorMsg('TABLES_MISSING')
      } else {
        setErrorMsg(res.error)
      }
    } else if ('settings' in res) {
      setData({ settings: res.settings || [], taxRules: res.taxRules || [] })
      setErrorMsg(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateSetting = async (key: string, value: number) => {
    startTransition(async () => {
      const res = await updatePlatformSetting(key, value)
      if (res.error) showToast(res.error, 'error')
      else {
        showToast(res.success!, 'success')
        loadData()
      }
    })
  }

  const handleEditSlabsClick = (stateName: string, slabs: any[]) => {
    setEditingState(stateName)
    setJsonText(JSON.stringify(slabs, null, 2))
  }

  const handleSaveSlabs = async () => {
    try {
      const parsedSlabs = JSON.parse(jsonText)
      if (!Array.isArray(parsedSlabs)) {
        showToast('Slabs must be a valid JSON array', 'error')
        return
      }

      for (const slab of parsedSlabs) {
        if (typeof slab.min !== 'number' || typeof slab.max !== 'number' || typeof slab.pt !== 'number') {
          showToast('Each slab must contain numerical min, max, and pt properties.', 'error')
          return
        }
      }

      startTransition(async () => {
        const res = await updateTaxRules(editingState!, parsedSlabs)
        if (res.error) showToast(res.error, 'error')
        else {
          showToast(res.success!, 'success')
          setEditingState(null)
          loadData()
        }
      })
    } catch (e) {
      showToast('Invalid JSON structure formatting', 'error')
    }
  }

  const sqlScript = `-- 1. Professional Tax (PT) State Matrix Controller Table
CREATE TABLE IF NOT EXISTS platform_tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_name text UNIQUE NOT NULL,
  slabs jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 2. PF & ESIC Central Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value numeric(14,4) NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- RLS: Enable row level security and allow super_admin read/write, orgs read
ALTER TABLE platform_tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Seed defaults for professional tax states
INSERT INTO platform_tax_rules (state_name, slabs) VALUES
  ('Maharashtra', '[
    {"min": 0, "max": 7500, "pt": 0},
    {"min": 7501, "max": 10000, "pt": 175},
    {"min": 10001, "max": 9999999, "pt": 200}
  ]'),
  ('Karnataka', '[
    {"min": 0, "max": 15000, "pt": 0},
    {"min": 15001, "max": 9999999, "pt": 200}
  ]'),
  ('Tamil Nadu', '[
    {"min": 0, "max": 12000, "pt": 0},
    {"min": 12001, "max": 9999999, "pt": 200}
  ]')
ON CONFLICT (state_name) DO UPDATE SET slabs = EXCLUDED.slabs;

-- Seed defaults for EPF/ESIC ceilings & rates
INSERT INTO platform_settings (key, value, description) VALUES
  ('epf_employee_rate', 12.0, 'EPF Employee rate percentage (e.g. 12.00%)'),
  ('epf_wage_cap', 15000.0, 'EPF wage ceiling cap (INR)'),
  ('esic_employee_rate', 0.75, 'ESIC Employee contribution rate percentage (e.g. 0.75%)'),
  ('esic_employer_rate', 3.25, 'ESIC Employer contribution rate percentage (e.g. 3.25%)'),
  ('esic_wage_cap', 21000.0, 'ESIC wage ceiling cap (INR)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Policies for platform_tax_rules
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON platform_tax_rules;
CREATE POLICY "Allow read for all authenticated users" ON platform_tax_rules
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write for super_admin" ON platform_tax_rules;
CREATE POLICY "Allow write for super_admin" ON platform_tax_rules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Policies for platform_settings
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON platform_settings;
CREATE POLICY "Allow read for all authenticated users" ON platform_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write for super_admin" ON platform_settings;
CREATE POLICY "Allow write for super_admin" ON platform_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (errorMsg === 'TABLES_MISSING') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-500" />
            Compliance Slabs Controls
          </h1>
          <p className="text-xs text-slate-500">Manage state tax brackets and PF/ESIC platform values.</p>
        </div>

        <div className="glass border border-amber-500/25 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-bold text-slate-800 text-base">Setup Required: Compliance Tables Missing</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The platform compliance metadata tables (`platform_tax_rules` and `platform_settings`) have not been initialized in your Supabase database schema yet.
          </p>
          <div className="p-4 bg-black/40 border border-slate-100 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                super_admin_compliance.sql
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(sqlScript); showToast('SQL copied to clipboard!', 'success') }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-800 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                Copy SQL
              </button>
            </div>
            <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
              {sqlScript}
            </pre>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            <strong>To install compliance tables:</strong> Go to your Supabase Dashboard SQL Editor, click &quot;New Query&quot;, paste the SQL script, and click &quot;Run&quot;. After running, refresh this page.
          </div>
        </div>

        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            {toast.message}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>{toast.message}</div>
      )}

      {editingState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditingState(null)} />
          <div className="relative glass w-full max-w-lg rounded-2xl p-6 border border-slate-200/60 shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-800 text-base">Edit Professional Tax Slabs — {editingState}</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">JSON Slab Configurations</label>
              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 bg-black/40 border border-slate-200/60 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveSlabs}
                disabled={isPending}
                className="flex-1 py-2 bg-indigo text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                {isPending ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                onClick={() => setEditingState(null)}
                className="px-4 py-2 bg-white border border-slate-200/60/30 text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-500" />
          Compliance Slabs Controls
        </h1>
        <p className="text-xs text-slate-500">Manage professional tax matrices and statutory EPF/ESIC constants dynamically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PF & ESIC Central Overrides */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">PF & ESIC Constants Override</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Central limits updated across all client salaries.</p>
          </div>

          <div className="space-y-4">
            {data?.settings.map(sett => (
              <div key={sett.id} className="flex items-center justify-between gap-4 p-3 bg-white/[0.02] border border-slate-100 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800 font-mono">{sett.key}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{sett.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={sett.value}
                    step={sett.key.includes('rate') ? 0.01 : 1}
                    onBlur={e => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val) && val !== sett.value) {
                        handleUpdateSetting(sett.key, val)
                      }
                    }}
                    className="w-24 px-2 py-1.5 bg-white border border-slate-200/60/30 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo/50 text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Tax Matrices */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Professional Tax State Slabs</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Custom slabs mapping salary range to monthly Professional Tax (PT).</p>
          </div>

          <div className="space-y-4">
            {data?.taxRules.map(rule => (
              <div key={rule.id} className="p-4 bg-white/[0.02] border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">{rule.state_name}</span>
                  <button
                    onClick={() => handleEditSlabsClick(rule.state_name, rule.slabs)}
                    className="text-[10px] text-marigold font-bold hover:underline cursor-pointer"
                  >
                    Edit Slabs
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                    <span>Wage Min</span>
                    <span>Wage Max</span>
                    <span className="text-right">PT Amount</span>
                  </div>
                  {rule.slabs.map((slab, index) => (
                    <div key={index} className="grid grid-cols-3 text-[11px] font-medium text-slate-800 font-mono">
                      <span>₹{slab.min.toLocaleString('en-IN')}</span>
                      <span>₹{slab.max > 999999 ? 'No limit' : slab.max.toLocaleString('en-IN')}</span>
                      <span className="text-right text-rose-300">₹{slab.pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
