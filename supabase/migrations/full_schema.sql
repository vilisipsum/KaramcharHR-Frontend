-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tenancy ───
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  domain TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Profiles (extends auth.users) ───
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('super_admin', 'org_admin', 'hr_manager', 'manager', 'employee')),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, org_id)
);

-- ─── Departments ───
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(code, org_id)
);

-- ─── Designations ───
CREATE TABLE designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  level INTEGER NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Employees ───
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  address JSONB,
  aadhaar_number TEXT,
  pan_number TEXT,
  passport_number TEXT,
  date_of_joining DATE NOT NULL,
  date_of_leaving DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive', 'terminated')),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  designation_id UUID REFERENCES designations(id),
  manager_id UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_code, org_id)
);

ALTER TABLE departments ADD FOREIGN KEY (head_id) REFERENCES employees(id);

-- ─── Employee Documents ───
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', 'offer_letter', 'experience_letter', 'education')),
  document_number TEXT,
  file_url TEXT,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'employee'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
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
-- ─── Shifts ───
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  grace_period_minutes INTEGER DEFAULT 15,
  late_threshold_minutes INTEGER DEFAULT 30,
  half_day_threshold_minutes INTEGER DEFAULT 240,
  is_flexible BOOLEAN DEFAULT false,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Employee Shift Assignments ───
CREATE TABLE employee_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id),
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Attendance ───
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  total_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'late', 'wfh', 'holiday', 'weekend', 'on_leave')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'biometric', 'app', 'api', 'auto')),
  ip_address TEXT,
  location JSONB,
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  shift_id UUID REFERENCES shifts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, employee_id)
);

CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_attendance_org_date ON attendance(employee_id, date);

-- ─── Leave Types ───
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  days_per_year INTEGER NOT NULL,
  max_consecutive_days INTEGER,
  max_carry_forward INTEGER DEFAULT 0,
  carry_forward_expiry TEXT, -- 'march' month
  is_paid BOOLEAN DEFAULT true,
  is_half_day_allowed BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  gender_specific TEXT CHECK (gender_specific IN ('male', 'female', 'both')) DEFAULT 'both',
  min_service_days INTEGER DEFAULT 0,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(code, org_id)
);

-- ─── Leave Balances ───
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  entitled NUMERIC(5,2) NOT NULL,
  taken NUMERIC(5,2) DEFAULT 0,
  pending NUMERIC(5,2) DEFAULT 0,
  balance NUMERIC(5,2) NOT NULL,
  carry_forward NUMERIC(5,2) DEFAULT 0,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- ─── Leave Requests ───
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(5,2) NOT NULL,
  half_day BOOLEAN DEFAULT false,
  half_day_period TEXT CHECK (half_day_period IN ('first_half', 'second_half')),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  remarks TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leave_requests_status ON leave_requests(employee_id, status);

-- ─── Holidays ───
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'national' CHECK (type IN ('national', 'regional', 'company', 'optional')),
  description TEXT,
  year INTEGER NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, org_id)
);

CREATE INDEX idx_holidays_year ON holidays(org_id, year);

-- ─── Attendance Regularization ───
CREATE TABLE attendance_regularizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  expected_clock_in TIME,
  expected_clock_out TIME,
  actual_clock_in TIME,
  actual_clock_out TIME,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- ─── Job Openings ───
CREATE TABLE job_openings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  department_id UUID REFERENCES departments(id),
  location TEXT,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'temporary')),
  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),
  currency TEXT DEFAULT 'INR',
  openings INTEGER DEFAULT 1,
  filled INTEGER DEFAULT 0,
  skills TEXT[],
  experience_min INTEGER,
  experience_max INTEGER,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'filled', 'closed', 'on_hold')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  posted_by UUID REFERENCES profiles(id),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_openings_status ON job_openings(org_id, status);

-- ─── Candidates ───
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  source TEXT CHECK (source IN ('linkedin', 'naukri', 'indeed', 'company_website', 'referral', 'walkin', 'agency', 'other')),
  current_company TEXT,
  current_designation TEXT,
  total_experience_years NUMERIC(4,1),
  relevant_experience_years NUMERIC(4,1),
  current_ctc NUMERIC(12,2),
  expected_ctc NUMERIC(12,2),
  notice_period_days INTEGER,
  skills TEXT[],
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'phone_screen', 'interview', 'background_check', 'offer', 'hired', 'rejected', 'withdrawn')),
  job_id UUID NOT NULL REFERENCES job_openings(id),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_candidates_job ON candidates(job_id);

-- ─── Interviews ───
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  type TEXT DEFAULT 'video' CHECK (type IN ('phone', 'video', 'in_person', 'technical', 'hr')),
  round INTEGER DEFAULT 1,
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES profiles(id),
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Offer Letters ───
CREATE TABLE offer_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  offered_ctc NUMERIC(14,2) NOT NULL,
  offered_designation TEXT NOT NULL,
  joining_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'withdrawn')),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  document_url TEXT,
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Appraisal Cycles ───
CREATE TABLE appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  self_review_deadline DATE,
  manager_review_deadline DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'self_review', 'manager_review', 'calibration', 'completed', 'closed')),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Performance Reviews ───
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  manager_rating INTEGER CHECK (manager_rating BETWEEN 1 AND 5),
  final_rating INTEGER CHECK (final_rating BETWEEN 1 AND 5),
  self_comment TEXT,
  manager_comment TEXT,
  overall_comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'self_submitted', 'manager_reviewed', 'completed', 'appealed')),
  appraisal_cycle_id UUID NOT NULL REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  reviewer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(appraisal_cycle_id, employee_id)
);

-- ─── KPIs / Goals ───
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('quantitative', 'qualitative', 'project', 'behavioral')),
  weight_percent INTEGER NOT NULL CHECK (weight_percent BETWEEN 1 AND 100),
  target_value TEXT,
  actual_value TEXT,
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  manager_rating INTEGER CHECK (manager_rating BETWEEN 1 AND 5),
  review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Employee Trainings ───
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('internal', 'external', 'online', 'workshop', 'certification')),
  start_date DATE,
  end_date DATE,
  duration_hours NUMERIC(6,2),
  provider TEXT,
  cost NUMERIC(10,2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Employee Trainings Mapping ───
CREATE TABLE employee_trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  completion_status TEXT CHECK (completion_status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  score NUMERIC(5,2),
  certificate_url TEXT,
  completed_at DATE,
  UNIQUE(employee_id, training_id)
);
-- ─── Helper Functions ───
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('super_admin', 'org_admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_hr()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('super_admin', 'org_admin', 'hr_manager')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('super_admin', 'org_admin', 'hr_manager', 'manager')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Organizations ───
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_own" ON organizations
  FOR SELECT USING (id = get_user_org_id() OR get_user_role() = 'super_admin');

CREATE POLICY "org_update_own" ON organizations
  FOR UPDATE USING (id = get_user_org_id() AND is_org_admin());

CREATE POLICY "org_insert_super" ON organizations
  FOR INSERT WITH CHECK (get_user_role() = 'super_admin');

-- ─── Profiles ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profile_select_org" ON profiles
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "profile_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profile_update_hr" ON profiles
  FOR UPDATE USING (org_id = get_user_org_id() AND is_hr());

-- ─── Employees ───
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emp_select_org" ON employees
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "emp_insert_hr" ON employees
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());

CREATE POLICY "emp_update_hr" ON employees
  FOR UPDATE USING (org_id = get_user_org_id() AND is_hr() OR id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "emp_delete_hr" ON employees
  FOR DELETE USING (org_id = get_user_org_id() AND is_org_admin());

-- ─── Departments ───
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dept_select_org" ON departments
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "dept_insert_hr" ON departments
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());

CREATE POLICY "dept_update_hr" ON departments
  FOR UPDATE USING (org_id = get_user_org_id() AND is_hr());

-- ─── Attendance ───
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "att_select_org" ON attendance
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE org_id = get_user_org_id()));

CREATE POLICY "att_insert_self" ON attendance
  FOR INSERT WITH CHECK (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "att_update_hr" ON attendance
  FOR UPDATE USING (is_hr());

-- ─── Leave Requests ───
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lr_select_org" ON leave_requests
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE org_id = get_user_org_id()));

CREATE POLICY "lr_insert_self" ON leave_requests
  FOR INSERT WITH CHECK (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "lr_update_manager" ON leave_requests
  FOR UPDATE USING (is_manager());

-- ─── Payroll ───
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_select_org" ON salary_structures FOR SELECT USING (org_id = get_user_org_id() AND is_hr());
CREATE POLICY "ss_insert_hr" ON salary_structures FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());
CREATE POLICY "ss_update_hr" ON salary_structures FOR UPDATE USING (org_id = get_user_org_id() AND is_hr());

ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_select_org" ON payroll_runs FOR SELECT USING (org_id = get_user_org_id() AND is_hr());
CREATE POLICY "pr_insert_hr" ON payroll_runs FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());
CREATE POLICY "pr_update_hr" ON payroll_runs FOR UPDATE USING (org_id = get_user_org_id() AND is_hr());

ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pi_select_self" ON payroll_items FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE org_id = get_user_org_id()));
CREATE POLICY "pi_select_hr" ON payroll_items FOR SELECT USING (is_hr());

-- ─── Recruitment ───
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jo_select_org" ON job_openings FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "jo_insert_hr" ON job_openings FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());
CREATE POLICY "jo_update_hr" ON job_openings FOR UPDATE USING (org_id = get_user_org_id() AND is_hr());

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cand_select_org" ON candidates FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "cand_insert_hr" ON candidates FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());

-- ─── Performance ───
ALTER TABLE appraisal_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ac_select_org" ON appraisal_cycles FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "ac_insert_hr" ON appraisal_cycles FOR INSERT WITH CHECK (org_id = get_user_org_id() AND is_hr());

ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_select_own" ON performance_reviews FOR SELECT USING (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "pr_select_manager" ON performance_reviews FOR SELECT USING (is_manager());
CREATE POLICY "pr_update_self" ON performance_reviews FOR UPDATE USING (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));

-- ─── Documents ───
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ed_select_own" ON employee_documents FOR SELECT USING (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "ed_select_hr" ON employee_documents FOR SELECT USING (is_hr());
CREATE POLICY "ed_insert_self" ON employee_documents FOR INSERT WITH CHECK (employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid()));

-- ─── Storage Buckets ───
INSERT INTO storage.buckets (id, name, public) VALUES
  ('employee_documents', 'employee_documents', false),
  ('resumes', 'resumes', false),
  ('payslips', 'payslips', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "storage_employee_docs_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'employee_documents' AND auth.role() = 'authenticated');

CREATE POLICY "storage_employee_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'employee_documents' AND auth.role() = 'authenticated');

CREATE POLICY "storage_resumes_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

CREATE POLICY "storage_payslips_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'payslips' AND auth.role() = 'authenticated');

-- Enable replication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE payroll_runs;
-- ─── Default Leave Types ───
INSERT INTO leave_types (name, code, description, days_per_year, max_consecutive_days, max_carry_forward, is_paid, gender_specific, org_id)
SELECT 'Casual Leave', 'CL', 'Urgent/personal work - no reason needed', 12, 3, 0, true, 'both', id FROM organizations
UNION ALL
SELECT 'Sick Leave', 'SL', 'Medical reasons with doctor certificate if >2 days', 10, 5, 0, true, 'both', id FROM organizations
UNION ALL
SELECT 'Earned Leave', 'EL', 'Privilege leave / planned time off', 15, 15, 15, true, 'both', id FROM organizations
UNION ALL
SELECT 'Maternity Leave', 'ML', 'Maternity benefit as per Maternity Benefit Act', 182, 182, 0, true, 'female', id FROM organizations
UNION ALL
SELECT 'Paternity Leave', 'PL', 'Paternity leave for new fathers', 15, 15, 0, true, 'male', id FROM organizations
UNION ALL
SELECT 'Comp Off', 'CO', 'Compensatory off for overtime', 0, 0, 0, true, 'both', id FROM organizations
UNION ALL
SELECT 'Bereavement Leave', 'BL', 'Leave on death of family member', 3, 3, 0, true, 'both', id FROM organizations;

-- ─── National Holidays 2025-26 ───
INSERT INTO holidays (name, date, type, year, description, org_id)
SELECT h.name, h.date, h.type, h.year, h.description, o.id FROM organizations o
CROSS JOIN (VALUES
  ('Republic Day', '2026-01-26'::date, 'national'::text, 2026, 'Republic Day of India'),
  ('Holi', '2026-03-04'::date, 'regional', 2026, 'Festival of Colors'),
  ('Good Friday', '2026-04-03'::date, 'national', 2026, 'Good Friday'),
  ('Eid-ul-Fitr', '2026-04-11'::date, 'regional', 2026, 'Eid'),
  ('Independence Day', '2026-08-15'::date, 'national', 2026, 'Independence Day of India'),
  ('Gandhi Jayanti', '2026-10-02'::date, 'national', 2026, 'Mahatma Gandhi Birthday'),
  ('Dussehra', '2026-10-21'::date, 'regional', 2026, 'Vijayadashami'),
  ('Diwali', '2026-11-08'::date, 'regional', 2026, 'Festival of Lights'),
  ('Guru Nanak Jayanti', '2026-11-25'::date, 'regional', 2026, 'Guru Nanak Birthday'),
  ('Christmas', '2026-12-25'::date, 'national', 2026, 'Christmas Day')
) AS h(name, date, type, year, description);
