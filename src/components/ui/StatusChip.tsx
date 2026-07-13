type StatusType = 'present' | 'leave' | 'absent' | 'approved' | 'pending' | 'rejected' | 'reimbursed' | 'processed' | 'draft' | 'closed' | 'active' | 'self_submitted' | 'manager_reviewed' | 'completed' | 'success' | 'warning' | 'info' | 'error' | 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost' | 'planned' | 'in_progress'

const statusConfig: Record<StatusType, { dot: string; label: string }> = {
  present: { dot: '#2FD4B0', label: 'Present' },
  leave: { dot: '#FFB020', label: 'On Leave' },
  absent: { dot: '#FF6161', label: 'Absent' },
  approved: { dot: '#2FD4B0', label: 'Approved' },
  pending: { dot: '#FFB020', label: 'Pending' },
  rejected: { dot: '#FF6161', label: 'Rejected' },
  reimbursed: { dot: '#2FD4B0', label: 'Reimbursed' },
  processed: { dot: '#2FD4B0', label: 'Processed' },
  draft: { dot: '#9990B8', label: 'Draft' },
  closed: { dot: '#9990B8', label: 'Closed' },
  active: { dot: '#2FD4B0', label: 'Active' },
  self_submitted: { dot: '#FFB020', label: 'Self Submitted' },
  manager_reviewed: { dot: '#2FD4B0', label: 'Manager Reviewed' },
  completed: { dot: '#2FD4B0', label: 'Completed' },
  success: { dot: '#2FD4B0', label: 'Success' },
  warning: { dot: '#FFB020', label: 'Warning' },
  info: { dot: '#6670FF', label: 'Info' },
  error: { dot: '#FF6161', label: 'Error' },
  available: { dot: '#2FD4B0', label: 'Available' },
  assigned: { dot: '#6670FF', label: 'Assigned' },
  maintenance: { dot: '#FFB020', label: 'Maintenance' },
  retired: { dot: '#9990B8', label: 'Retired' },
  lost: { dot: '#FF6161', label: 'Lost' },
  planned: { dot: '#9990B8', label: 'Planned' },
  in_progress: { dot: '#FFB020', label: 'In Progress' },
}

export function StatusChip({ type, label }: { type: StatusType; label?: string }) {
  const s = statusConfig[type]
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full min-h-[28px] sm:px-3 sm:py-1.5"
      style={{ background: `${s.dot}15`, color: s.dot }}>
      <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
      {label || s.label}
    </span>
  )
}
