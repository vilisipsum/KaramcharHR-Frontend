import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GoogleBusinessProfileCard } from '@/components/layout/GoogleBusinessProfileCard'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="glass p-5 col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">Organization Settings</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Company Name</label>
              <input type="text" defaultValue="Acme Corp" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Company Slug</label>
              <input type="text" defaultValue="acme-corp" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
              <input type="email" defaultValue="hr@acme.com" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Phone</label>
              <input type="text" defaultValue="+91 98765 43210" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Address</label>
              <input type="text" defaultValue="Mumbai, Maharashtra" className="w-full px-3.5 py-2.5 rounded-md border border-border bg-white/75 dark:bg-[rgba(32,25,60,0.7)] text-foreground outline-none focus:border-rose text-sm" />
            </div>
            <div className="field">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Plan</label>
              <input type="text" defaultValue="Pro — ₹2,499/mo" disabled className="w-full px-3.5 py-2.5 rounded-md border border-border bg-muted/10 text-muted-foreground text-sm" />
            </div>
          </div>
          <button className="btn btn-primary mt-6">Save changes</button>
        </div>

        <div className="glass p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">Quick Settings</div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Toggle dark theme</div>
              </div>
              <div className="w-10 h-5 rounded-full bg-muted/30 relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-muted-foreground absolute top-0.5 left-0.5" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Leave approvals, payroll</div>
              </div>
              <div className="w-10 h-5 rounded-full bg-teal/30 relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-teal absolute top-0.5 right-0.5" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Auto Punch Reminder</div>
                <div className="text-xs text-muted-foreground">Remind at 9:30 AM</div>
              </div>
              <div className="w-10 h-5 rounded-full bg-muted/30 relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-muted-foreground absolute top-0.5 left-0.5" />
              </div>
            </div>
          </div>

          <hr className="my-5 border-border" />

          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Team Members</div>
          <div className="space-y-3">
            {[
              { name: 'Ananya Sharma', role: 'HR Admin', badge: 'You' },
              { name: 'Rohit Kulkarni', role: 'Manager' },
              { name: 'Priya Nair', role: 'Manager' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
                {m.badge && <span className="text-[10px] font-mono uppercase bg-rose/10 text-rose px-2 py-0.5 rounded-full">{m.badge}</span>}
              </div>
            ))}
          </div>
        </div>

        <GoogleBusinessProfileCard />
      </div>
    </DashboardLayout>
  )
}
