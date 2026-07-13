import { Button, Heading, Text, Column, Section } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export interface WelcomeEmailProps {
  employeeName: string
  companyName: string
  employeeCode: string
  department: string
  designation: string
  dateOfJoining: string
  loginUrl: string
  credentials?: {
    email: string
    password: string
  }
  hrContact?: {
    name: string
    email: string
    phone: string
  }
}

export function WelcomeEmail({
  employeeName,
  companyName,
  employeeCode,
  department,
  designation,
  dateOfJoining,
  loginUrl,
  credentials,
  hrContact,
}: WelcomeEmailProps) {
  const formattedDate = new Date(dateOfJoining).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <EmailLayout previewText={`Welcome to ${companyName}, ${employeeName}!`} companyName={companyName}>
      <Section>
        <Column>
          <Heading as="h2" style={headingStyles}>
            Welcome to {companyName}! 🎉
          </Heading>
          <Text style={welcomeTextStyles}>
            Dear <strong>{employeeName}</strong>,
          </Text>
          <Text style={bodyTextStyles}>
            We're thrilled to welcome you to the {companyName} family! Your journey with us officially begins on <strong>{formattedDate}</strong>.
            We've prepared everything you need to hit the ground running.
          </Text>

          <Section style={detailsCardStyles}>
            <Column>
              <Text style={detailsTitleStyles}>Your Employment Details</Text>
              <Text style={detailRowStyles}><strong>Employee Code:</strong> {employeeCode}</Text>
              <Text style={detailRowStyles}><strong>Department:</strong> {department}</Text>
              <Text style={detailRowStyles}><strong>Designation:</strong> {designation}</Text>
              <Text style={detailRowStyles}><strong>Date of Joining:</strong> {formattedDate}</Text>
            </Column>
          </Section>

          {credentials && (
            <Section style={credentialsCardStyles}>
              <Column>
                <Text style={credentialsTitleStyles}>Your Login Credentials</Text>
                <Text style={detailRowStyles}><strong>Email:</strong> {credentials.email}</Text>
                <Text style={detailRowStyles}><strong>Temporary Password:</strong> {credentials.password}</Text>
                <Text style={credentialsNoteStyles}>
                  <strong>Important:</strong> Please log in and change your password immediately.
                </Text>
              </Column>
            </Section>
          )}

          <Section style={buttonWrapperStyles}>
            <Column>
              <Button href={loginUrl} style={buttonStyles}>
                Access Employee Portal
              </Button>
            </Column>
          </Section>

          {hrContact && (
            <Section style={hrCardStyles}>
              <Column>
                <Text style={hrTitleStyles}>Need Help?</Text>
                <Text style={hrContactStyles}>
                  Your HR contact is <strong>{hrContact.name}</strong>
                </Text>
                <Text style={hrContactStyles}>
                  📧 {hrContact.email} | 📞 {hrContact.phone}
                </Text>
              </Column>
            </Section>
          )}

          <Section style={nextStepsStyles}>
            <Column>
              <Text style={nextStepsTitleStyles}>Your First Week</Text>
              <Text style={nextStepsTextStyles}>
                • Complete your profile and upload documents<br />
                • Review company policies and handbook<br />
                • Set up your payroll and tax information<br />
                • Meet your team and manager<br />
                • Complete mandatory trainings
              </Text>
            </Column>
          </Section>

          <Text style={closingTextStyles}>
            Once again, welcome aboard! We're excited to have you on the team.
          </Text>
          <Text style={closingTextStyles}>
            Best regards,<br />
            <strong>The {companyName} Team</strong>
          </Text>
        </Column>
      </Section>
    </EmailLayout>
  )
}

const headingStyles: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  marginBottom: '16px',
  textAlign: 'center',
}

const welcomeTextStyles: React.CSSProperties = {
  fontSize: '18px',
  color: '#374151',
  marginBottom: '16px',
  textAlign: 'center',
}

const bodyTextStyles: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: 1.7,
  marginBottom: '24px',
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

const credentialsCardStyles: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const credentialsTitleStyles: React.CSSProperties = {
  fontWeight: '600',
  color: '#92400e',
  marginBottom: '12px',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const credentialsNoteStyles: React.CSSProperties = {
  color: '#92400e',
  fontSize: '13px',
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid #fde68a',
}

const buttonWrapperStyles: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
}

const buttonStyles: React.CSSProperties = {
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '16px 32px',
  fontWeight: '600',
  fontSize: '16px',
  textDecoration: 'none',
  display: 'inline-block',
  border: 'none',
  cursor: 'pointer',
}

const hrCardStyles: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const hrTitleStyles: React.CSSProperties = {
  fontWeight: '600',
  color: '#166534',
  marginBottom: '8px',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const hrContactStyles: React.CSSProperties = {
  color: '#15803d',
  fontSize: '14px',
  marginBottom: '4px',
  lineHeight: 1.6,
}

const nextStepsStyles: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const nextStepsTitleStyles: React.CSSProperties = {
  fontWeight: '600',
  color: '#111827',
  marginBottom: '12px',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const nextStepsTextStyles: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: 2,
}

const closingTextStyles: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: 1.7,
  marginBottom: '16px',
  textAlign: 'center',
}
