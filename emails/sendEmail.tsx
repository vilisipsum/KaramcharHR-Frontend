import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import { EmailLayout, LeaveRequestEmail, LeaveRequestNotificationEmail, ExpenseClaimEmail, PayrollNotificationEmail, WelcomeEmail, AttendanceAlertEmail } from './index'
import type { LeaveRequestEmailProps } from './LeaveRequestEmail'
import type { LeaveRequestNotificationEmailProps } from './LeaveRequestNotificationEmail'
import type { ExpenseClaimEmailProps } from './ExpenseClaimEmail'
import type { PayrollNotificationEmailProps } from './PayrollNotificationEmail'
import type { WelcomeEmailProps } from './WelcomeEmail'
import type { AttendanceAlertEmailProps } from './AttendanceAlertEmail'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Create transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  try {
    const transporter = createTransporter()
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@karamcharhr.com',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendLeaveRequestEmail(
  to: string,
  data: LeaveRequestEmailProps
): Promise<SendEmailResult> {
  const html = await render(<LeaveRequestEmail {...data} />)
  return sendEmail({
    to,
    subject: data.status === 'pending' 
      ? `New Leave Request from ${data.employeeName}` 
      : `Leave Request ${data.status === 'approved' ? 'Approved' : 'Rejected'}`,
    html,
  })
}

export async function sendLeaveNotificationEmail(
  to: string,
  data: LeaveRequestNotificationEmailProps
): Promise<SendEmailResult> {
  const html = await render(<LeaveRequestNotificationEmail {...data} />)
  const subjects = {
    submitted: `New Leave Request from ${data.employeeName}`,
    approved: `Your Leave Request Approved`,
    rejected: `Your Leave Request Rejected`,
    cancelled: `Leave Request Cancelled by ${data.employeeName}`,
  }
  return sendEmail({
    to,
    subject: subjects[data.type],
    html,
  })
}

export async function sendExpenseClaimEmail(
  to: string,
  data: ExpenseClaimEmailProps
): Promise<SendEmailResult> {
  const html = await render(<ExpenseClaimEmail {...data} />)
  return sendEmail({
    to,
    subject: data.status === 'pending' 
      ? `New Expense Claim from ${data.employeeName}` 
      : `Expense Claim ${data.status === 'approved' ? 'Approved' : 'Rejected'}`,
    html,
  })
}

export async function sendPayrollNotificationEmail(
  to: string,
  data: PayrollNotificationEmailProps
): Promise<SendEmailResult> {
  const html = await render(<PayrollNotificationEmail {...data} />)
  const statusMessages = {
    processed: 'Processed',
    approved: 'Approved',
    paid: 'Credited',
  }
  return sendEmail({
    to,
    subject: `Payroll ${statusMessages[data.runStatus]} - ${data.month}/${data.year}`,
    html,
  })
}

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailProps
): Promise<SendEmailResult> {
  const html = await render(<WelcomeEmail {...data} />)
  return sendEmail({
    to,
    subject: `Welcome to ${data.companyName} - Your Onboarding Details`,
    html,
  })
}

export async function sendAttendanceAlertEmail(
  to: string,
  data: AttendanceAlertEmailProps
): Promise<SendEmailResult> {
  const html = await render(<AttendanceAlertEmail {...data} />)
  return sendEmail({
    to,
    subject: `Attendance Alert - ${data.type}`,
    html,
  })
}

export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    recipients.map(to => sendEmail({ to, subject, html }))
  )

  let success = 0
  let failed = 0
  const errors: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      success++
    } else {
      failed++
      errors.push(`${recipients[index]}: ${result.status === 'rejected' ? result.reason : result.value.error}`)
    }
  })

  return { success, failed, errors }
}