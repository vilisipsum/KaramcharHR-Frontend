'use client'


const shifts = [
  { id: '1', name: 'Morning', start: '09:00', end: '18:00', employees: ['Rahul Bose', 'Neha Singh', 'Arjun Joshi'], color: 'from-amber-500/30 to-rose-500/30' },
  { id: '2', name: 'Afternoon', start: '12:00', end: '21:00', employees: ['Sana Malik', 'Kavya Verma'], color: 'from-teal/30 to-emerald-500/30' },
  { id: '3', name: 'Night', start: '21:00', end: '06:00', employees: ['Priya Kapoor'], color: 'from-indigo-500/30 to-purple-500/30' },
  { id: '4', name: 'Flexible', start: '—', end: '—', employees: ['Rohan Sharma', 'Vikram Aditya'], color: 'from-white/10 to-white/5' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
})

const roster: Record<string, Record<string, string[]>> = {}
weekDays.forEach((day, i) => {
  roster[day] = {}
  shifts.forEach(s => {
    if (Math.random() > 0.4) {
      roster[day][s.name] = s.employees.filter(() => Math.random() > 0.3)
    }
  })
})

export default function ShiftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Shift Scheduling</h1>
        <p className="text-slate-500">Manage rosters, rotational shifts, and overtime</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {shifts.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-xs text-slate-500">
              <div className={`w-3 h-3 rounded bg-gradient-to-br ${s.color}`} />
              {s.name}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-500 text-xs hover:text-slate-800 transition-all">◀ Prev</button>
          <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-500 text-xs hover:text-slate-800 transition-all">Next ▶</button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60">
                <th className="text-left px-4 py-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold w-24">Shift</th>
                {weekDays.map((day, i) => (
                  <th key={day} className={`px-4 py-3 text-center ${i === 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    <div className="text-[11px] uppercase tracking-wider font-semibold">{day}</div>
                    <div className="text-[10px] text-slate-800/30">{dates[i]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map(s => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${s.color}`} />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                        <div className="text-[10px] text-slate-800/40">{s.start}–{s.end}</div>
                      </div>
                    </div>
                  </td>
                  {weekDays.map(day => (
                    <td key={day} className="px-4 py-3 text-center">
                      {roster[day][s.name]?.length > 0 ? (
                        <div className="space-y-1">
                          {roster[day][s.name].map((emp, ei) => (
                            <div key={ei} className={`text-[11px] text-slate-700 px-2 py-1 rounded-lg bg-gradient-to-br ${s.color} inline-block`}>
                              {emp.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-800/20 text-xs">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-lg font-bold text-slate-800">4</div>
          <div className="text-xs text-slate-400">Active Shift Patterns</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-lg font-bold text-amber-400">12</div>
          <div className="text-xs text-slate-400">Employees on Rotational</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-lg font-bold text-teal">14h</div>
          <div className="text-xs text-slate-400">Overtime This Week</div>
        </div>
      </div>
    </div>
  )
}
