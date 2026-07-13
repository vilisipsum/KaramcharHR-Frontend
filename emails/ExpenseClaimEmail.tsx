import { Button, Heading, Text, Column, Section } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export interface ExpenseClaimEmailProps {
  employeeName: string
  employeeCode: string
  category: string
  amount: number
  currency: string
  date: string
  description: string
  receiptUrl?: string
  actionUrl: string
  status?: 'pending' | 'approved' | 'rejected'
  approverName?: string
  remarks?: string
  isManagerCopy?: boolean
}

export function ExpenseClaimEmail({
  employeeName,
  employeeCode,
  category,
  amount,
  currency = 'INR',
  date,
  description,
  receiptUrl,
  actionUrl,
  status = 'pending',
  approverName,
  remarks,
  isManagerCopy = false,
}: ExpenseClaimEmailProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formatAmount = (amt: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amt)

  const statusConfig = {
    pending: {
      title: isManagerCopy ? 'New Expense Claim Submitted' : 'Expense Claim Submitted',
      subtitle: isManagerCopy 
        ? `${employeeName} (${employeeCode}) submitted an expense claim`
        : `Your expense claim for ${formatAmount(amount)} has been submitted`,
      buttonText: isManagerCopy ? 'Review Claim' : 'View Claim',
      cardBg: '#fef3c7',
      cardBorder: '#fde68a',
      textColor: '#92400e',
    },
    approved: {
      title: 'Expense Claim Approved',
      subtitle: `Your expense claim for ${formatAmount(amount)} has been approved`,
      buttonText: 'View Claim',
      cardBg: '#f0fdf4',
      cardBorder: '#bbf7d0',
      textColor: '#166534',
    },
    rejected: {
      title: 'Expense Claim Rejected',
      subtitle: `Your expense claim for ${formatAmount(amount)} has been rejected`,
      buttonText: 'View Claim',
      cardBg: '#fef2f2',
      cardBorder: '#fecaca',
      textColor: '#991b1b',
    }
  }

  const config = statusConfig[status]

  return (
    <EmailLayout previewText={config.subtitle} companyName="KaramcharHR">
      <Section>
        <Column>
          <Section style={alertCardStyles(config.cardBg, config.cardBorder)}>
            <Column>
              <Heading as="h2" style={headingStyles(config.textColor)}>
                {config.title}
              </Heading>
              <Text style={subtitleStyles(config.textColor)}>{config.subtitle}</Text>
            </Column>
          </Section>

          <Section style={detailsCardStyles}>
            <Column>
              <Text style={detailsTitleStyles}>Claim Details</Text>
              <Text style={detailRowStyles}><strong>Employee:</strong> {employeeName} ({employeeCode})</Text>
              <Text style={detailRowStyles}><strong>Category:</strong> {category}</Text>
              <Text style={detailRowStyles}><strong>Amount:</strong> {formatAmount(amount)}</Text>
              <Text style={detailRowStyles}><strong>Date:</strong> {formattedDate}</Text>
              <Text style={detailRowStyles}><strong>Description:</strong> {description}</Text>
              {receiptUrl && (
                <Text style={detailRowStyles}>
                  <strong>Receipt:</strong> <a href={receiptUrl} style={linkStyles}>View Receipt</a>
                </Text>
              )}
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
              <Button href={actionUrl} style={buttonStyles}>
                {config.buttonText}
              </Button>
            </Column>
          </Section>

          <Section style={noteStyles}>
            <Column>
              <Text style={noteTextStyles}>
                {isManagerCopy 
                  ? 'Please review and take action on this expense claim.' 
                  : 'You will be notified once your claim is reviewed.'}
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

const linkStyles: React.CSSProperties = {
  color: '#f59e0b',
  textDecoration: 'underline',
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

const noteStyles: React.CSSProperties = {
  padding: '16px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
}

const noteTextStyles: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: 1.6,
  textAlign: 'center',
}
