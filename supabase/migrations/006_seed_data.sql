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
