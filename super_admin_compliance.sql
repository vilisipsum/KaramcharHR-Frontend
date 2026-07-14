-- 1. Professional Tax (PT) State Matrix Controller Table
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
  );
