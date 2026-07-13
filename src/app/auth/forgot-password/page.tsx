'use client'

import { useActionState } from 'react'
import { forgotPassword } from '../actions'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Reset Password</h2>
        <p className="text-xs text-muted-foreground mt-1">Enter your email and we'll send you a password reset link.</p>
      </div>

      {state?.error && (
        <div className="text-xs text-coral bg-coral/10 rounded-md px-3 py-2 text-center">{state.error}</div>
      )}

      <div className="field">
        <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
        <input name="email" type="email" placeholder="ananya@company.com" required
          className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-50">
        {pending ? 'Sending link...' : 'Send reset link'}
      </button>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Remember your password? <a href="/auth/login" className="text-rose font-semibold">Sign in</a>
      </p>
    </form>
  )
}
