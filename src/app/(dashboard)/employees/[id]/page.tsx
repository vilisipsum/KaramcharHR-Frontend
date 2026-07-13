'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatusChip } from '@/components/ui/StatusChip'

export default function EmployeeProfilePage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass p-6 col-span-1">
          <div className="flex flex-col items-center gap-3">
            <Avatar initials="AS" size="lg" />
            <div className="text-center">
              <div className="font-display text-xl font-semibold">Ananya Sharma</div>
              <div className="text-sm text-muted-foreground">Product Designer · EMP-2291</div>
            </div>
            <StatusChip type="present" />
          </div>

          <hr className="my-5 border-border" />

          <div className="space-y-4">
            {[{ k: 'Department', v: 'Product Design' }, { k: 'Manager', v: 'Rohit Kulkarni' }, { k: 'Date of Joining', v: '15 Mar 2022' }, { k: 'Employment Type', v: 'Full-time' }].map((item, i) => (
              <div key={i} className="p-2.5 rounded-sm" style={{ background: 'rgba(36,27,78,0.04)' }}>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{item.k}</div>
                <div className="text-sm font-semibold mt-0.5">{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="glass p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Identity & Bank Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ k: 'PAN', v: 'ABCPS1234K' }, { k: 'Aadhaar', v: 'XXXX XXXX 8842' }, { k: 'UAN', v: '100488229100' }, { k: 'PF Account', v: 'MH/123456/789' }, { k: 'Bank Account', v: 'HDFC Bank ••4471' }, { k: 'IFSC Code', v: 'HDFC0001234' }].map((item, i) => (
                <div key={i} className="p-2.5 rounded-sm" style={{ background: 'rgba(36,27,78,0.04)' }}>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{item.k}</div>
                  <div className="text-sm font-semibold mt-0.5">{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Salary Summary</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Current CTC</span><span className="font-mono">₹ 8,40,000</span></div>
                <div className="flex justify-between text-sm"><span>Basic</span><span className="font-mono">₹ 3,36,000</span></div>
                <div className="flex justify-between text-sm"><span>HRA</span><span className="font-mono">₹ 1,68,000</span></div>
                <div className="flex justify-between text-sm"><span>Last Increment</span><span className="font-mono">Apr 2025 · 12%</span></div>
              </div>
            </div>

            <div className="glass p-5 flex flex-col items-center justify-center">
              <ProgressRing value={92} label="92%" sublabel="ATTENDANCE YTD" />
            </div>
          </div>

          <div className="glass p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Documents</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[{ n: 'Aadhaar Card', s: 'verified' }, { n: 'PAN Card', s: 'verified' }, { n: 'Offer Letter', s: 'verified' }, { n: 'Education', s: 'pending' }].map((d, i) => (
                <div key={i} className="glass-strong rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">{d.s === 'verified' ? '✓' : '○'}</div>
                  <div className="text-xs font-semibold">{d.n}</div>
                  <StatusChip type={d.s === 'verified' ? 'approved' : 'pending'} label={d.s.charAt(0).toUpperCase() + d.s.slice(1)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
