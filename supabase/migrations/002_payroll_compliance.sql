-- ─── Salary Structures ───
CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ctc_annual NUMERIC(14,2) NOT NULL DEFAULT 0,
  basic_percent NUMERIC(5,2) NOT NULL DEFAULT 40,
  hra_percent NUMERIC(5,2) NOT NULL DEFAULT 20,
  special_allowance_percent NUMERIC(5,2) NOT NULL DEFAULT 25,
  conveyance_monthly NUMERIC(10,2) NOT NULL DEFAULT 1600,
  medical_allowance_monthly NUMERIC(10,2) NOT NULL DEFAULT 1250,
  lta_monthly NUMERIC(10,2) NOT NULL DEFAULT 1000,
  other_allowances_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  pf_employee_rate NUMERIC(5,2) NOT NULL DEFAULT 12,
  pf_employer_rate NUMERIC(5,2) NOT NULL DEFAULT 12,
  esi_applicable BOOLEAN DEFAULT false,
  esi_employee_rate NUMERIC(5,2) NOT NULL DEFAULT 0.75,
  esi_employer_rate NUMERIC(5,2) NOT NULL DEFAULT 3.25,
  professional_tax_monthly NUMERIC(10,2) NOT NULL DEFAULT 200,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Employee Salary Assignments ───
CREATE TABLE employee_salaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  salary_structure_id UUID NOT NULL REFERENCES salary_structures(id),
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Payroll Runs ───
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'processed', 'approved', 'paid')),
  total_gross NUMERIC(14,2) DEFAULT 0,
  total_deductions NUMERIC(14,2) DEFAULT 0,
  total_net NUMERIC(14,2) DEFAULT 0,
  total_employer_contributions NUMERIC(14,2) DEFAULT 0,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  payment_date DATE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year, org_id)
);

-- ─── Payroll Items ───
CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,

  -- Earnings
  basic NUMERIC(12,2) NOT NULL DEFAULT 0,
  hra NUMERIC(12,2) NOT NULL DEFAULT 0,
  conveyance NUMERIC(12,2) NOT NULL DEFAULT 0,
  medical_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  lta NUMERIC(12,2) NOT NULL DEFAULT 0,
  special_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  overtime NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(12,2) NOT NULL DEFAULT 0,
  arrears NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Deductions
  pf_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  esi_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  professional_tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  tds_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  loan_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Net
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Employer contributions
  employer_pf NUMERIC(12,2) NOT NULL DEFAULT 0,
  employer_esi NUMERIC(12,2) NOT NULL DEFAULT 0,

  working_days INTEGER DEFAULT 0,
  payable_days INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── PF Records ───
CREATE TABLE pf_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  employee_share NUMERIC(12,2) NOT NULL,
  employer_share NUMERIC(12,2) NOT NULL,
  pension_fund NUMERIC(12,2) NOT NULL DEFAULT 0,
  admin_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
  edli_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
  uan_number TEXT,
  employee_id UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year, employee_id)
);

-- ─── ESI Records ───
CREATE TABLE esi_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  employee_share NUMERIC(12,2) NOT NULL,
  employer_share NUMERIC(12,2) NOT NULL,
  gross_wages NUMERIC(12,2) NOT NULL,
  ip_number TEXT,
  employee_id UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year, employee_id)
);

-- ─── Professional Tax Records ───
CREATE TABLE professional_tax_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  state TEXT NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year, employee_id)
);

-- ─── TDS Records ───
CREATE TABLE tds_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financial_year TEXT NOT NULL,
  total_income NUMERIC(14,2) NOT NULL,
  total_deductions_80c NUMERIC(12,2) DEFAULT 0,
  total_deductions_80d NUMERIC(12,2) DEFAULT 0,
  hra_exemption NUMERIC(12,2) DEFAULT 0,
  taxable_income NUMERIC(14,2) NOT NULL,
  tax_deducted NUMERIC(12,2) NOT NULL,
  surcharge NUMERIC(12,2) DEFAULT 0,
  education_cess NUMERIC(12,2) DEFAULT 0,
  total_tax NUMERIC(12,2) NOT NULL,
  regime TEXT CHECK (regime IN ('new', 'old')),
  form_16_generated BOOLEAN DEFAULT false,
  employee_id UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(financial_year, employee_id)
);

-- ─── Bank Transfer Files ───
CREATE TABLE bank_transfer_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('neft', 'rtgs', 'imps', 'cheque')),
  file_url TEXT,
  total_amount NUMERIC(14,2) NOT NULL,
  total_employees INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'uploaded', 'confirmed', 'failed')),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
