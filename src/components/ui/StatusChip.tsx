type StatusType = 'present' | 'leave' | 'absent' | 'approved' | 'pending' | 'rejected' | 'processed' | 'draft' | 'closed' | 'active' | 'self_submitted' | 'manager_reviewed' | 'completed'

const statusConfig: Record<StatusType, { dot: string; label: string }> = {
  present: { dot: '#2FD4B0', label: 'Present' },
  leave: { dot: '#FFB020', label: 'On Leave' },
  absent: { dot: '#FF6161', label: 'Absent' },
  approved: { dot: '#2FD4B0', label: 'Approved' },
  pending: { dot: '#FFB020', label: 'Pending' },
  rejected: { dot: '#FF6161', label: 'Rejected' },
  processed: { dot: '#2FD4B0', label: 'Processed' },
  draft: { dot: '#9990B8', label: 'Draft' },
  closed: { dot: '#9990B8', label: 'Closed' },
  active: { dot: '#2FD4B0', label: 'Active' },
  self_submitted: { dot: '#FFB020', label: 'Self Submitted' },
  manager_reviewed: { dot: '#2FD4B0', label: 'Manager Reviewed' },
  completed: { dot: '#2FD4B0', label: 'Completed' },
}

export function StatusChip({ type, label }: { type: StatusType; label?: string }) {
  const s = statusConfig[type]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: `${s.dot}15`, color: s.dot }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {label || s.label}
    </span>
  )
}
