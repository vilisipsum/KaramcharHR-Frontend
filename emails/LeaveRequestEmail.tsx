import { Button, Heading, Text, Column, Section } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export interface LeaveRequestEmailProps {
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  actionUrl: string
  status?: 'pending' | 'approved' | 'rejected'
  approverName?: string
  remarks?: string
}

export function LeaveRequestEmail({
  employeeName,
  leaveType,
  startDate,
  endDate,
  totalDays,
  reason,
  actionUrl,
  status = 'pending',
  approverName,
  remarks
}: LeaveRequestEmailProps) {
  const statusConfig = {
    pending: {
      title: 'New Leave Request',
      subtitle: `${employeeName} has requested ${leaveType}`,
      buttonText: 'Review Request',
      buttonVariant: 'primary' as const,
    },
    approved: {
      title: 'Leave Request Approved',
      subtitle: `Your ${leaveType} request has been approved`,
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const,
    },
    rejected: {
      title: 'Leave Request Rejected',
      subtitle: `Your ${leaveType} request has been rejected`,
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const,
    }
  }

  const config = statusConfig[status]

  return (
    <EmailLayout previewText={config.subtitle} companyName="KaramcharHR">
      <Section>
        <Column>
          <Heading as="h2" style={headingStyles}>
            {config.title}
          </Heading>
          <Text style={subtitleStyles}>{config.subtitle}</Text>
          
          <Section style={detailsCardStyles}>
            <Column>
              <Text style={detailsTitleStyles}>Leave Details</Text>
              <Text style={detailRowStyles}><strong>Type:</strong> {leaveType}</Text>
              <Text style={detailRowStyles}><strong>From:</strong> {new Date(startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              <Text style={detailRowStyles}><strong>To:</strong> {new Date(endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              <Text style={detailRowStyles}><strong>Total Days:</strong> {totalDays}</Text>
              <Text style={detailRowStyles}><strong>Reason:</strong> {reason}</Text>
            </Column>
          </Section>

          {status === 'approved' && (
            <Section style={statusCardStyles.approved}>
              <Column>
                <Text style={statusTextStyles.approved}>✓ Approved by {approverName || 'Manager'}</Text>
                {remarks && <Text style={statusRemarksStyles.approved}><strong>Remarks:</strong> {remarks}</Text>}
              </Column>
            </Section>
          )}

          {status === 'rejected' && (
            <Section style={statusCardStyles.rejected}>
              <Column>
                <Text style={statusTextStyles.rejected}>✗ Rejected by {approverName || 'Manager'}</Text>
                {remarks && <Text style={statusRemarksStyles.rejected}><strong>Remarks:</strong> {remarks}</Text>}
              </Column>
            </Section>
          )}

          <Section style={buttonWrapperStyles}>
            <Column>
              <Button href={actionUrl} style={buttonStyles[config.buttonVariant]}>
                {config.buttonText}
              </Button>
            </Column>
          </Section>
        </Column>
      </Section>
    </EmailLayout>
  )
}

const headingStyles: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  marginBottom: '16px',
}

const subtitleStyles: React.CSSProperties = {
  color: '#6b7280',
  marginBottom: '24px',
  fontSize: '16px',
}

const detailsCardStyles: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const detailsTitleStyles: React.CSSProperties = {
  fontWeight: '600',
  color: '#111827',
  marginBottom: '12px',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const detailRowStyles: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '14px',
  marginBottom: '8px',
  lineHeight: 1.6,
}

const statusCardStyles = {
  approved: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,
  rejected: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,
}

const statusTextStyles = {
  approved: {
    color: '#166534',
    fontWeight: '500',
  } as React.CSSProperties,
  rejected: {
    color: '#991b1b',
    fontWeight: '500',
  } as React.CSSProperties,
}

const statusRemarksStyles = {
  approved: {
    color: '#15803d',
    fontSize: '13px',
    marginTop: '8px',
  } as React.CSSProperties,
  rejected: {
    color: '#b91c1c',
    fontSize: '13px',
    marginTop: '8px',
  } as React.CSSProperties,
}

const buttonWrapperStyles: React.CSSProperties = {
  textAlign: 'center',
}

const buttonStyles = {
  primary: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '14px 28px',
    fontWeight: '600',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  secondary: {
    backgroundColor: '#374151',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '14px 28px',
    fontWeight: '600',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
}
