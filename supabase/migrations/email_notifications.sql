-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('leave_request', 'expense_claim', 'payroll', 'welcome', 'attendance')),
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  resend_id TEXT,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_logs_type ON email_logs(type);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_logs_select_hr" ON email_logs
  FOR SELECT USING (is_hr());

-- Function to send leave request notification
CREATE OR REPLACE FUNCTION notify_leave_request()
RETURNS TRIGGER AS $$
DECLARE
  approver_email TEXT;
  employee_email TEXT;
  is_manager BOOLEAN;
BEGIN
  -- Get employee email
  SELECT profiles.email INTO employee_email
  FROM profiles
  JOIN employees ON profiles.id = employees.profiles_id
  WHERE employees.id = NEW.employee_id;

  -- Get approver email (manager or HR)
  IF NEW.status = 'pending' THEN
    -- Notify manager
    SELECT profiles.email INTO approver_email
    FROM profiles
    JOIN employees mgr ON profiles.id = mgr.profiles_id
    WHERE mgr.id = (
      SELECT manager_id FROM employees WHERE id = NEW.employee_id
    );
    
    -- If no manager, notify HR
    IF approver_email IS NULL THEN
      SELECT profiles.email INTO approver_email
      FROM profiles
      WHERE profiles.org_id = NEW.org_id
      AND profiles.role IN ('org_admin', 'hr_manager')
      LIMIT 1;
    END IF;
  ELSE
    -- Notify employee of approval/rejection
    approver_email := employee_email;
  END IF;

  -- Send email via edge function
  IF approver_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'leave_request',
        'to', approver_email,
        'data', jsonb_build_object(
          'status', NEW.status,
          'employee_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.employee_id),
          'approver_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.approved_by),
          'leave_type', (SELECT name FROM leave_types WHERE id = NEW.leave_type_id),
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'total_days', NEW.total_days,
          'reason', NEW.reason,
          'action_url', 'https://app.karamcharhr.com/leaves/' || NEW.id,
          'remarks', NEW.remarks
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send expense claim notification
CREATE OR REPLACE FUNCTION notify_expense_claim()
RETURNS TRIGGER AS $$
DECLARE
  approver_email TEXT;
  employee_email TEXT;
BEGIN
  -- Get employee email
  SELECT profiles.email INTO employee_email
  FROM profiles
  JOIN employees ON profiles.id = employees.profiles_id
  WHERE employees.id = NEW.employee_id;

  -- Get approver email
  IF NEW.status = 'pending' THEN
    SELECT profiles.email INTO approver_email
    FROM profiles
    JOIN employees mgr ON profiles.id = mgr.profiles_id
    WHERE mgr.id = (
      SELECT manager_id FROM employees WHERE id = NEW.employee_id
    );
    
    IF approver_email IS NULL THEN
      SELECT profiles.email INTO approver_email
      FROM profiles
      WHERE profiles.org_id = NEW.org_id
      AND profiles.role IN ('org_admin', 'hr_manager')
      LIMIT 1;
    END IF;
  ELSE
    approver_email := employee_email;
  END IF;

  IF approver_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'expense_claim',
        'to', approver_email,
        'data', jsonb_build_object(
          'status', NEW.status,
          'employee_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.employee_id),
          'approver_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.approved_by),
          'category', (SELECT name FROM expense_categories WHERE id = NEW.category_id),
          'amount', NEW.amount,
          'currency', NEW.currency,
          'date', NEW.expense_date,
          'description', NEW.description,
          'receipt_url', NEW.receipt_url,
          'action_url', 'https://app.karamcharhr.com/expenses/' || NEW.id,
          'remarks', NEW.remarks
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send payroll notification
CREATE OR REPLACE FUNCTION notify_payroll()
RETURNS TRIGGER AS $$
DECLARE
  employee_email TEXT;
BEGIN
  -- Get all employees in the payroll run
  FOR employee_email IN
    SELECT profiles.email
    FROM profiles
    JOIN employees ON profiles.id = employees.profiles_id
    JOIN payroll_items ON employees.id = payroll_items.employee_id
    WHERE payroll_items.payroll_run_id = NEW.id
    AND payroll_items.net_pay > 0
  LOOP
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'payroll',
        'to', employee_email,
        'data', jsonb_build_object(
          'employee_name', (SELECT first_name || ' ' || last_name FROM employees WHERE profiles_id = profiles.id AND profiles.email = employee_email),
          'month', NEW.month,
          'year', NEW.year,
          'gross_pay', (SELECT gross_earnings FROM payroll_items WHERE employee_id = employees.id AND payroll_run_id = NEW.id),
          'net_pay', (SELECT net_pay FROM payroll_items WHERE employee_id = employees.id AND payroll_run_id = NEW.id),
          'currency', 'INR',
          'payslip_url', 'https://app.karamcharhr.com/payroll/' || NEW.id || '/payslip',
          'status', NEW.status
        )
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send welcome email
CREATE OR REPLACE FUNCTION notify_welcome_employee()
RETURNS TRIGGER AS $$
DECLARE
  employee_email TEXT;
  temp_password TEXT;
BEGIN
  -- Only send for new employees
  IF TG_OP = 'INSERT' THEN
    SELECT profiles.email INTO employee_email
    FROM profiles
    JOIN employees ON profiles.id = employees.profiles_id
    WHERE employees.id = NEW.id;

    -- Generate temporary password
    temp_password := substr(md5(random()::text || clock_timestamp()::text), 1, 10);

    IF employee_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'type', 'welcome',
          'to', employee_email,
          'data', jsonb_build_object(
            'employee_name', NEW.first_name || ' ' || NEW.last_name,
            'employee_code', NEW.employee_code,
            'department', (SELECT name FROM departments WHERE id = NEW.department_id),
            'designation', (SELECT title FROM designations WHERE id = NEW.designation_id),
            'joining_date', NEW.date_of_joining,
            'login_url', 'https://app.karamcharhr.com/login',
            'temporary_password', temp_password
          )
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send attendance alerts
CREATE OR REPLACE FUNCTION notify_attendance_alert()
RETURNS TRIGGER AS $$
DECLARE
  employee_email TEXT;
  manager_email TEXT;
  shift_start TIME;
  shift_end TIME;
BEGIN
  -- Get employee email
  SELECT profiles.email INTO employee_email
  FROM profiles
  JOIN employees ON profiles.id = employees.profiles_id
  WHERE employees.id = NEW.employee_id;

  -- Get manager email
  SELECT profiles.email INTO manager_email
  FROM profiles
  JOIN employees mgr ON profiles.id = mgr.profiles_id
  WHERE mgr.id = (
    SELECT manager_id FROM employees WHERE id = NEW.employee_id
  );

  -- Get shift times if applicable
  IF NEW.shift_id IS NOT NULL THEN
    SELECT start_time, end_time INTO shift_start, shift_end
    FROM shifts WHERE id = NEW.shift_id;
  END IF;

  -- Send to employee
  IF employee_email IS NOT NULL AND NEW.status IN ('late', 'absent', 'half_day', 'early_departure', 'missed_punch') THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'attendance',
        'to', employee_email,
        'data', jsonb_build_object(
          'employee_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.employee_id),
          'date', NEW.date,
          'type', NEW.status,
          'expected_time', shift_start,
          'actual_time', CASE WHEN NEW.status = 'late' THEN NEW.clock_in ELSE NEW.clock_out END,
          'shift_name', (SELECT name FROM shifts WHERE id = NEW.shift_id),
          'action_url', 'https://app.karamcharhr.com/attendance',
          'is_manager_copy', false
        )
      )
    );
  END IF;

  -- Send to manager
  IF manager_email IS NOT NULL AND NEW.status IN ('absent', 'missed_punch') THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'attendance',
        'to', manager_email,
        'data', jsonb_build_object(
          'employee_name', (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.employee_id),
          'date', NEW.date,
          'type', NEW.status,
          'expected_time', shift_start,
          'actual_time', CASE WHEN NEW.status = 'late' THEN NEW.clock_in ELSE NEW.clock_out END,
          'shift_name', (SELECT name FROM shifts WHERE id = NEW.shift_id),
          'action_url', 'https://app.karamcharhr.com/attendance',
          'is_manager_copy', true
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_leave_request_notification ON leave_requests;
CREATE TRIGGER trigger_leave_request_notification
  AFTER INSERT OR UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION notify_leave_request();

DROP TRIGGER IF EXISTS trigger_expense_claim_notification ON expense_claims;
CREATE TRIGGER trigger_expense_claim_notification
  AFTER INSERT OR UPDATE ON expense_claims
  FOR EACH ROW EXECUTE FUNCTION notify_expense_claim();

DROP TRIGGER IF EXISTS trigger_payroll_notification ON payroll_runs;
CREATE TRIGGER trigger_payroll_notification
  AFTER UPDATE ON payroll_runs
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_payroll();

DROP TRIGGER IF EXISTS trigger_welcome_employee ON employees;
CREATE TRIGGER trigger_welcome_employee
  AFTER INSERT ON employees
  FOR EACH ROW EXECUTE FUNCTION notify_welcome_employee();

DROP TRIGGER IF EXISTS trigger_attendance_alert ON attendance;
CREATE TRIGGER trigger_attendance_alert
  AFTER INSERT OR UPDATE ON attendance
  FOR EACH ROW WHEN (NEW.status IN ('late', 'absent', 'half_day', 'early_departure', 'missed_punch'))
  EXECUTE FUNCTION notify_attendance_alert();