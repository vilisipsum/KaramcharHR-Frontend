import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Avatar } from '@/components/ui/Avatar'
import { StatusChip } from '@/components/ui/StatusChip'

const steps = [
  { title: 'Offer accepted', desc: 'Signed offer letter received', done: true },
  { title: 'Documents uploaded', desc: 'PAN, Aadhaar, education certificates', done: true },
  { title: 'Background verification', desc: 'In progress with verification partner', current: true },
  { title: 'Induction & asset handover', desc: 'Scheduled for 1 Aug, 10:00 AM', pending: true },
]

export default function RecruitmentPage() {
  return (
    <DashboardLayout>
      <div className="glass p-5 mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Candidate pipeline — Product Designer, Noida</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Applied · 24', candidates: [{ i: 'KV', n: 'Kavya Verma', r: '4y exp' }, { i: 'AJ', n: 'Arjun Joshi', r: '2y exp' }] },
            { title: 'Interview · 8', candidates: [{ i: 'NS', n: 'Neha Singh', r: '5y exp' }] },
            { title: 'Offer · 2', candidates: [{ i: 'RB', n: 'Rahul Bose', r: '6y exp' }] },
            { title: 'Hired · 1', candidates: [{ i: 'SM', n: 'Sana Malik', r: 'Joins 1 Aug' }] },
          ].map((col, ci) => (
            <div key={ci} className="glass-strong rounded-lg p-3">
              <h4 className="font-mono text-[11px] uppercase text-muted-foreground mx-2 mb-3">{col.title}</h4>
              {col.candidates.map((c, j) => (
                <div key={j} className="glass-strong rounded-md p-3 flex gap-2.5 items-center mb-2">
                  <Avatar initials={c.i} size="sm" index={j + ci} />
                  <div>
                    <div className="font-semibold text-xs">{c.n}</div>
                    <div className="text-[10px] text-muted-foreground">{c.r}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Onboarding checklist — Sana Malik</div>
        <div className="flex flex-col">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 pb-5 relative last:pb-0">
              {i < steps.length - 1 && <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-border" />}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 ${
                s.done ? 'bg-teal text-white' : s.current ? 'bg-gradient-to-r from-marigold to-rose text-white' : 'bg-muted/30 text-muted-foreground'
              }`}>
                {s.done ? '✓' : i + 1}
              </div>
              <div>
                <div className="font-semibold text-sm">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
