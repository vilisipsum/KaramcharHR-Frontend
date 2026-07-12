-- ─── Expense Claims ───
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  category TEXT NOT NULL CHECK (category IN ('travel', 'food', 'accommodation', 'transport', 'supplies', 'healthcare', 'training', 'other')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  description TEXT NOT NULL,
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expenses_employee ON expenses(employee_id, status);
CREATE INDEX idx_expenses_org ON expenses(org_id, status);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exp_select_org" ON expenses FOR SELECT USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "exp_insert_self" ON expenses FOR INSERT WITH CHECK (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "exp_update_hr" ON expenses FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('org_admin', 'hr_manager'));

-- ─── Assets ───
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('laptop', 'desktop', 'monitor', 'phone', 'tablet', 'headset', 'keyboard', 'mouse', 'accessory', 'furniture', 'vehicle', 'other')),
  brand TEXT,
  model TEXT,
  serial_number TEXT UNIQUE,
  asset_tag TEXT UNIQUE,
  purchase_date DATE,
  purchase_cost NUMERIC(12,2),
  warranty_expiry DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired', 'lost')),
  location TEXT,
  notes TEXT,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assets_org ON assets(org_id, status);

-- ─── Employee Asset Assignments ───
CREATE TABLE IF NOT EXISTS employee_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  returned_at TIMESTAMPTZ,
  condition_at_assignment TEXT,
  condition_at_return TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(asset_id, returned_at)
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asset_select_org" ON assets FOR SELECT USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "asset_insert_hr" ON assets FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('org_admin', 'hr_manager'));
CREATE POLICY "asset_update_hr" ON assets FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('org_admin', 'hr_manager'));

ALTER TABLE employee_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ea_select_org" ON employee_assets FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY "ea_insert_hr" ON employee_assets FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('org_admin', 'hr_manager'));
