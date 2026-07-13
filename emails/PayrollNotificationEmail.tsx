import { Button, Heading, Text, Column, Section } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export interface PayrollNotificationEmailProps {
  employeeName: string
  month: number
  year: number
  grossPay: number
  netPay: number
  currency: string
  payslipUrl: string
  runStatus: 'processed' | 'approved' | 'paid'
}

export function PayrollNotificationEmail({
  employeeName,
  month,
  year,
  grossPay,
  netPay,
  currency = 'INR',
  payslipUrl,
  runStatus,
}: PayrollNotificationEmailProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const monthName = monthNames[month - 1]
  
  const statusMessages = {
    processed: { title: 'Payroll Processed', subtitle: `Your payroll for ${monthName} ${year} has been processed` },
    approved: { title: 'Payroll Approved', subtitle: `Your payroll for ${monthName} ${year} has been approved` },
    paid: { title: 'Salary Credited', subtitle: `Your salary for ${monthName} ${year} has been credited` },
  }

  const config = statusMessages[runStatus]
  const formattedGross = new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(grossPay)
  const formattedNet = new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(netPay)

  return (
    <EmailLayout previewText={config.subtitle} companyName="KaramcharHR">
      <Section>
        <Column>
          <Heading as="h2" style={headingStyles}>
            {config.title}
          </Heading>
          <Text style={subtitleStyles}>{config.subtitle}</Text>
          
          <Section style={summaryCardStyles}>
            <Column>
              <Text style={summaryTitleStyles}>Salary Summary</Text>
              <Section style={summaryRowStyles}>
                <Column style={summaryLabelStyles}>
                  <Text style={summaryLabelStyle}>Gross Pay</Text>
                </Column>
                <Column style={summaryValueStyles}>
                  <Text style={summaryValueStyle}>{formattedGross}</Text>
                </Column>
              </Section>
              <Section style={summaryRowStyles}>
                <Column style={summaryLabelStyles}>
                  <Text style={summaryLabelStyle}>Net Pay</Text>
                </Column>
                <Column style={summaryValueStyles}>
                  <Text style={netPayStyle}>{formattedNet}</Text>
                </Column>
              </Section>
            </Column>
          </Section>

          <Section style={buttonWrapperStyles}>
            <Column>
              <Button href={payslipUrl} style={buttonStyles}>
                View Payslip
              </Button>
            </Column>
          </Section>

          <Section style={noteStyles}>
            <Column>
              <Text style={noteTextStyle}>
                Please log in to your employee portal to download your detailed payslip.
                If you have any questions, please contact HR.
              </Text>
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

const summaryCardStyles: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
}

const summaryTitleStyles: React.CSSProperties = {
  fontWeight: '600',
  color: '#92400e',
  marginBottom: '16px',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'center',
}

const summaryRowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '1px solid #fde68a',
}

const summaryLabelStyles: React.CSSProperties = {
  flex: 1,
  textAlign: 'left',
}

const summaryValueStyles: React.CSSProperties = {
  flex: 1,
  textAlign: 'right',
}

const summaryLabelStyle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500',
}

const summaryValueStyle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
}

const netPayStyle: React.CSSProperties = {
  color: '#166534',
  fontSize: '20px',
  fontWeight: '700',
}

const buttonWrapperStyles: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
}

const buttonStyles: React.CSSProperties = {
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
}

const noteStyles: React.CSSProperties = {
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
}

const noteTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: 1.6,
  textAlign: 'center',
}
