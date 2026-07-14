export function StatCard({ label, value, trend, children }: {
  label: string
  value: string | React.ReactNode
  trend?: string
  children?: React.ReactNode
}) {
  return (
    <div className="glass p-5 flex flex-col gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-display text-3xl sm:text-4xl leading-tight">{value}</span>
      {trend && <span className="font-mono text-xs text-teal">{trend}</span>}
      {children}
    </div>
  )
}
