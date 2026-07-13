'use client'

import { useActionState } from 'react'
import { setupOrganization } from '../auth/actions'
import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs'
import { LogoHorizontal } from '@/components/brand/LogoHorizontal'

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(setupOrganization, null)

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <BackgroundBlobs />
      <div className="relative z-10 glass p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <LogoHorizontal size="md" showTagline={false} />
          </div>
          <div className="font-display font-semibold text-xl mt-1">Set up your organization</div>
          <p className="text-sm text-muted-foreground mt-2">Welcome! Let&apos;s get your company set up in KaramcharHR.</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="text-xs text-coral bg-coral/10 rounded-md px-3 py-2">{state.error}</div>
          )}

          <div className="field">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Company Name</label>
            <input name="name" type="text" placeholder="Acme Corp" required
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
          </div>

          <div className="field">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Company Size</label>
            <select name="size"
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm">
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          <div className="field">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Industry</label>
            <select name="industry"
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm">
              <option value="technology">Technology</option>
              <option value="finance">Finance & Banking</option>
              <option value="healthcare">Healthcare</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-50">
            {pending ? 'Setting up...' : 'Create organization'}
          </button>
        </form>
      </div>
    </div>
  )
}
