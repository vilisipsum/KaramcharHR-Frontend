import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { render } from 'https://esm.sh/@react-email/render@0.0.12'
import { 
  LeaveRequestNotificationEmail, 
  ExpenseClaimEmail, 
  PayrollNotificationEmail, 
  WelcomeEmail, 
  AttendanceAlertEmail 
} from 'https://esm.sh/@karamcharhr/emails@0.0.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  type: 'leave_request' | 'expense_claim' | 'payroll' | 'welcome' | 'attendance'
  to: string
  data: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { type, to, data }: EmailPayload = await req.json()

    let html: string
    let subject: string

    switch (type) {
      case 'leave_request':
        html = await render(
          LeaveRequestNotificationEmail({
            type: data.status,
            employeeName: data.employee_name,
            approverName: data.approver_name,
            leaveType: data.leave_type,
            startDate: data.start_date,
            endDate: data.end_date,
            totalDays: data.total_days,
            reason: data.reason,
            actionUrl: data.action_url,
            remarks: data.remarks,
          })
        )
        subject = data.status === 'pending' 
          ? `New Leave Request: ${data.employee_name} - ${data.leave_type}`
          : `Leave Request ${data.status}: ${data.leave_type}`
        break

      case 'expense_claim':
        html = await render(
          ExpenseClaimEmail({
            type: data.status,
            employeeName: data.employee_name,
            approverName: data.approver_name,
            category: data.category,
            amount: data.amount,
            currency: data.currency || 'INR',
            date: data.date,
            description: data.description,
            receiptUrl: data.receipt_url,
            actionUrl: data.action_url,
            status: data.status,
            remarks: data.remarks,
          })
        )
        subject = data.status === 'pending'
          ? `New Expense Claim: ${data.employee_name} - ${data.currency} ${data.amount}`
          : `Expense Claim ${data.status}: ${data.category}`
        break

      case 'payroll':
        html = await render(
          PayrollNotificationEmail({
            employeeName: data.employee_name,
            month: data.month,
            year: data.year,
            grossPay: data.gross_pay,
            netPay: data.net_pay,
            currency: data.currency || 'INR',
            payslipUrl: data.payslip_url,
            runStatus: data.status,
          })
        )
        subject = `Payroll ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}: ${data.month}/${data.year}`
        break

      case 'welcome':
        html = await render(
          WelcomeEmail({
            employeeName: data.employee_name,
            employeeCode: data.employee_code,
            department: data.department,
            designation: data.designation,
            joiningDate: data.joining_date,
            loginUrl: data.login_url,
            temporaryPassword: data.temporary_password,
          })
        )
        subject = `Welcome to KaramcharHR, ${data.employee_name}!`
        break

      case 'attendance':
        html = await render(
          AttendanceAlertEmail({
            employeeName: data.employee_name,
            date: data.date,
            type: data.type,
            expectedTime: data.expected_time,
            actualTime: data.actual_time,
            shiftName: data.shift_name,
            actionUrl: data.action_url,
            isManagerCopy: data.is_manager_copy,
          })
        )
        subject = `Attendance Alert: ${data.employee_name} - ${data.type.replace('_', ' ')}`
        break

      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    // Send email via Resend or similar service
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KaramcharHR <hr@karamcharhr.com>',
        to: [to],
        subject,
        html,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || 'Failed to send email')
    }

    // Log email sent
    await supabase.from('email_logs').insert({
      type,
      recipient: to,
      subject,
      status: 'sent',
      resend_id: emailResult.id,
      metadata: data,
    })

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email send error:', error)
    
    // Log failed email
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      await supabase.from('email_logs').insert({
        type: (await req.json()).type,
        recipient: (await req.json()).to,
        status: 'failed',
        error: error.message,
      })
    } catch {}

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})