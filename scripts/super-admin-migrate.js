// Super Admin DB migration script - runs against Supabase via service role
// Run: node scripts/super-admin-migrate.js

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const migrations = `
-- Extend organizations table with SaaS fields
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','free','starter','professional','enterprise')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS max_employees integer DEFAULT 25,
  ADD COLUMN IF NOT EXISTS storage_quota_mb integer DEFAULT 500,
  ADD COLUMN IF NOT EXISTS seats_used integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Platform feature flags
CREATE TABLE IF NOT EXISTS platform_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  default_enabled boolean NOT NULL DEFAULT true,
  plans_included text[] DEFAULT ARRAY['starter','professional','enterprise'],
  created_at timestamptz DEFAULT now()
);

-- Per-org feature overrides
CREATE TABLE IF NOT EXISTS org_feature_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_key text NOT NULL REFERENCES platform_feature_flags(key) ON DELETE CASCADE,
  enabled boolean NOT NULL,
  overridden_by uuid REFERENCES auth.users(id),
  overridden_at timestamptz DEFAULT now(),
  UNIQUE(org_id, feature_key)
);

-- Platform-wide audit logs
CREATE TABLE IF NOT EXISTS platform_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  org_name text,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Platform announcements
CREATE TABLE IF NOT EXISTS platform_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','maintenance','update')),
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS: Only super_admin role can access super admin tables
ALTER TABLE platform_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_announcements ENABLE ROW LEVEL SECURITY;

-- Seed default feature flags
INSERT INTO platform_feature_flags (key, label, description, default_enabled, plans_included) VALUES
  ('payroll', 'Payroll Processing', 'Run monthly payroll with EPF/ESIC/PT/TDS deductions', true, ARRAY['starter','professional','enterprise']),
  ('ai_copilot', 'AI Copilot', 'Natural language HR assistant powered by Gemini', false, ARRAY['professional','enterprise']),
  ('ai_resume_screening', 'AI Resume Screening', 'Automated resume scoring and candidate ranking', false, ARRAY['professional','enterprise']),
  ('document_vault', 'Document Vault', 'Secure storage for PAN, Aadhaar, contracts', true, ARRAY['starter','professional','enterprise']),
  ('org_chart', 'Interactive Org Chart', 'Visual org hierarchy and reporting structure', true, ARRAY['starter','professional','enterprise']),
  ('performance_appraisals', 'Performance & OKRs', '360 appraisals and goal tracking', false, ARRAY['professional','enterprise']),
  ('expense_claims', 'Expense Claims', 'Receipt uploads and approval workflows', true, ARRAY['starter','professional','enterprise']),
  ('asset_management', 'Asset Management', 'Track company laptops and device assignments', false, ARRAY['professional','enterprise']),
  ('training_module', 'Training & LMS', 'Course management and completion tracking', false, ARRAY['enterprise']),
  ('advanced_analytics', 'Advanced Analytics', 'Attrition prediction, salary benchmarking', false, ARRAY['enterprise'])
ON CONFLICT (key) DO NOTHING;
`

async function runMigration() {
  console.log('Running Super Admin schema migration...')
  const { error } = await supabase.rpc('exec_sql', { sql: migrations }).catch(() => ({ error: 'rpc_not_available' }))
  if (error) {
    console.log('Note: Direct SQL exec not available via RPC (expected). Run the SQL manually in Supabase SQL editor.')
    console.log('\n--- COPY THIS SQL INTO SUPABASE SQL EDITOR ---\n')
    console.log(migrations)
  } else {
    console.log('Migration complete!')
  }
}

runMigration()
