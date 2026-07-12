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
