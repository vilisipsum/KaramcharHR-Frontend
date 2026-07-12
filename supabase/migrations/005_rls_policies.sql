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
