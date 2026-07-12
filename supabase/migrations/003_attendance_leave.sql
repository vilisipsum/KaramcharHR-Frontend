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
