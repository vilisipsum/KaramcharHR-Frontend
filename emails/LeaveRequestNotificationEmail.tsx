import { Button, Heading, Text, Column, Section } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export interface LeaveRequestNotificationEmailProps {
  type: 'submitted' | 'approved' | 'rejected' | 'cancelled'
  employeeName: string
  approverName?: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  actionUrl?: string
  remarks?: string
}

export function LeaveRequestNotificationEmail({
  type,
  employeeName,
  approverName,
  leaveType,
  startDate,
  endDate,
  totalDays,
  reason,
  actionUrl,
  remarks,
}: LeaveRequestNotificationEmailProps) {
  const configs = {
    submitted: {
      title: 'New Leave Request',
      subtitle: `${employeeName} has submitted a leave request`,
      buttonText: 'Review Request',
      buttonBg: '#f59e0b',
    },
    approved: {
      title: 'Leave Request Approved',
      subtitle: `Your ${leaveType} request has been approved`,
      buttonText: 'View Details',
      buttonBg: '#10b981',
    },
    rejected: {
      title: 'Leave Request Rejected',
      subtitle: `Your ${leaveType} request has been rejected`,
      buttonText: 'View Details',
      buttonBg: '#ef4444',
    },
    cancelled: {
      title: 'Leave Request Cancelled',
      subtitle: `${employeeName} has cancelled their leave request`,
      buttonText: 'View Details',
      buttonBg: '#6b7280',
    },
  }

  const config = configs[type]
  const formattedStart = new Date(startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
  const formattedEnd = new Date(endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

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
              <Text style={detailRowStyles}><strong>From:</strong> {formattedStart}</Text>
              <Text style={detailRowStyles}><strong>To:</strong> {formattedEnd}</Text>
              <Text style={detailRowStyles}><strong>Total Days:</strong> {totalDays}</Text>
              <Text style={detailRowStyles}><strong>Reason:</strong> {reason}</Text>
            </Column>
          </Section>

          {(type === 'approved' || type === 'rejected') && approverName && (
            <Section style={approverCardStyles}>
              <Column>
                <Text style={approverTitleStyles}>Action By</Text>
                <Text style={approverNameStyles}>{approverName}</Text>
              </Column>
            </Section>
          )}

          {remarks && (
            <Section style={remarksCardStyles}>
              <Column>
                <Text style={remarksTitleStyles}>Remarks</Text>
                <Text style={remarksTextStyles}>{remarks}</Text>
              </Column>
            </Section>
          )}

          {actionUrl && (
            <Section style={buttonWrapperStyles}>
              <Column>
                <Button href={actionUrl} style={buttonStyles(config.buttonBg)}>
                  {config.buttonText}
                </Button>
              </Column>
            </Section>
          )}
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

const approverCardStyles: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const approverTitleStyles: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#166534',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

const approverNameStyles: React.CSSProperties = {
  color: '#15803d',
  fontWeight: '500',
}

const remarksCardStyles: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const remarksTitleStyles: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#92400e',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
}

const remarksTextStyles: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: 1.6,
}

const buttonWrapperStyles: React.CSSProperties = {
  textAlign: 'center',
}

function buttonStyles(bgColor: string): React.CSSProperties {
  return {
    backgroundColor: bgColor,
    color: '#ffffff',
    borderRadius: '8px',
    padding: '14px 28px',
    fontWeight: '600',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer',
  }
}
