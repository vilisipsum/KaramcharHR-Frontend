import { Button, Heading, Text, Column, Section } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export interface AttendanceAlertEmailProps {
  employeeName: string
  date: string
  type: 'late' | 'absent' | 'half_day' | 'early_departure' | 'missed_punch'
  expectedTime?: string
  actualTime?: string
  shiftName?: string
  actionUrl?: string
  isManagerCopy?: boolean
}

export function AttendanceAlertEmail({
  employeeName,
  date,
  type,
  expectedTime,
  actualTime,
  shiftName,
  actionUrl,
  isManagerCopy = false,
}: AttendanceAlertEmailProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const typeConfig = {
    late: {
      title: isManagerCopy ? `${employeeName} was Late` : 'Late Attendance Alert',
      subtitle: isManagerCopy 
        ? `${employeeName} arrived late on ${formattedDate}`
        : `You were marked late on ${formattedDate}`,
      icon: '⏰',
      bgColor: '#fef3c7',
      borderColor: '#fde68a',
      textColor: '#92400e',
      buttonText: 'View Attendance',
    },
    absent: {
      title: isManagerCopy ? `${employeeName} was Absent` : 'Absence Alert',
      subtitle: isManagerCopy
        ? `${employeeName} was absent on ${formattedDate}`
        : `You were marked absent on ${formattedDate}`,
      icon: '📅',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      buttonText: 'View Attendance',
    },
    half_day: {
      title: isManagerCopy ? `${employeeName} - Half Day` : 'Half Day Recorded',
      subtitle: isManagerCopy
        ? `${employeeName} worked half day on ${formattedDate}`
        : `You were marked half day on ${formattedDate}`,
      icon: '⏱️',
      bgColor: '#fef3c7',
      borderColor: '#fde68a',
      textColor: '#92400e',
      buttonText: 'View Attendance',
    },
    early_departure: {
      title: isManagerCopy ? `${employeeName} Left Early` : 'Early Departure',
      subtitle: isManagerCopy
        ? `${employeeName} departed early on ${formattedDate}`
        : `You departed early on ${formattedDate}`,
      icon: '🚪',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      buttonText: 'View Attendance',
    },
    missed_punch: {
      title: isManagerCopy ? `${employeeName} Missed Punch` : 'Missed Punch Alert',
      subtitle: isManagerCopy
        ? `${employeeName} missed clock in/out on ${formattedDate}`
        : `You missed a punch on ${formattedDate}`,
      icon: '❓',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      buttonText: 'Regularize Attendance',
    },
  }

  const config = typeConfig[type]

  return (
    <EmailLayout previewText={config.subtitle} companyName="KaramcharHR">
      <Section>
        <Column>
          <Section style={alertCardStyles(config.bgColor, config.borderColor)}>
            <Column>
              <Heading as="h2" style={headingStyles(config.textColor)}>
                {config.icon} {config.title}
              </Heading>
              <Text style={subtitleStyles(config.textColor)}>{config.subtitle}</Text>
            </Column>
          </Section>

          <Section style={detailsCardStyles}>
            <Column>
              <Text style={detailsTitleStyles}>Attendance Details</Text>
              <Text style={detailRowStyles}><strong>Date:</strong> {formattedDate}</Text>
              {shiftName && <Text style={detailRowStyles}><strong>Shift:</strong> {shiftName}</Text>}
              {expectedTime && <Text style={detailRowStyles}><strong>Expected:</strong> {expectedTime}</Text>}
              {actualTime && <Text style={detailRowStyles}><strong>Actual:</strong> {actualTime}</Text>}
              <Text style={detailRowStyles}><strong>Status:</strong> {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</Text>
            </Column>
          </Section>

          {isManagerCopy && (
            <Section style={managerNoteStyles}>
              <Column>
                <Text style={managerNoteTextStyle}>
                  This is an automated notification for your team member&apos;s attendance. 
                  Please review and take appropriate action if needed.
                </Text>
              </Column>
            </Section>
          )}

          {actionUrl && (
            <Section style={buttonWrapperStyles}>
              <Column>
                <Button href={actionUrl} style={buttonStyles}>
                  {config.buttonText}
                </Button>
              </Column>
            </Section>
          )}

          <Section style={helpStyles}>
            <Column>
              <Text style={helpTextStyle}>
                If you believe this is an error, please contact HR or your manager to regularize your attendance.
              </Text>
            </Column>
          </Section>
        </Column>
      </Section>
    </EmailLayout>
  )
}

function alertCardStyles(bgColor: string, borderColor: string): React.CSSProperties {
  return {
    backgroundColor: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center',
  }
}

function headingStyles(textColor: string): React.CSSProperties {
  return {
    fontSize: '22px',
    fontWeight: '700',
    color: textColor,
    marginBottom: '8px',
  }
}

function subtitleStyles(textColor: string): React.CSSProperties {
  return {
    color: textColor,
    fontSize: '16px',
    fontWeight: '500',
    opacity: 0.9,
  }
}

const detailsCardStyles: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const detailsTitleStyles: React.CSSProperties = {
  fontWeight: '700',
  color: '#111827',
  marginBottom: '16px',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const detailRowStyles: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '15px',
  marginBottom: '10px',
  lineHeight: 1.6,
}

const managerNoteStyles: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const managerNoteTextStyle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: 1.6,
  fontStyle: 'italic',
}

const buttonWrapperStyles: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
}

const buttonStyles: React.CSSProperties = {
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
}

const helpStyles: React.CSSProperties = {
  padding: '16px',
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
}

const helpTextStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: 1.6,
  textAlign: 'center',
}
