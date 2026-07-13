'use client'

import { useActionState, useState } from 'react'
import { login } from '../actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="text-xs text-coral bg-coral/10 rounded-md px-3 py-2">{state.error}</div>
      )}
      <div className="field">
        <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
        <input name="email" type="email" placeholder="ananya@company.com" required
          className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
      </div>
      <div className="field">
        <div className="flex justify-between items-center mb-1">
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Password</label>
          <a href="/auth/forgot-password" className="text-[11px] text-rose hover:underline font-semibold">Forgot Password?</a>
        </div>
        <div className="relative">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            required
            className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer text-xs font-semibold"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-50">
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account? <a href="/auth/register" className="text-rose font-semibold">Register</a>
      </p>
    </form>
  )
}
