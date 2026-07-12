export function ProgressRing({ value, label, sublabel, size = 96 }: {
  value: number
  label: string
  sublabel?: string
  size?: number
}) {
  const circ = 2 * Math.PI * 42
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#E8577B" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(36,27,78,0.08)" strokeWidth="8" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"
          strokeDasharray="0.5 6" strokeLinecap="round" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ringGrad)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="font-display text-lg">{label}</b>
        {sublabel && <span className="text-[9px] text-muted-foreground font-mono tracking-wider uppercase">{sublabel}</span>}
      </div>
    </div>
  )
}
