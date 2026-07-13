'use client'

import { useState } from 'react'
import { StatusChip } from '@/components/ui/StatusChip'

const assetTypes = ['laptop', 'desktop', 'monitor', 'phone', 'tablet', 'headset', 'keyboard', 'mouse', 'accessory', 'furniture', 'vehicle', 'other'] as const

const mockAssets = [
  { id: '1', name: 'MacBook Pro 16"', type: 'laptop' as const, brand: 'Apple', serial: 'SN-2401-MBP', assigned: 'Rahul Bose', status: 'assigned' as const },
  { id: '2', name: 'Dell UltraSharp 27"', type: 'monitor' as const, brand: 'Dell', serial: 'SN-2402-DEL', assigned: 'Neha Singh', status: 'assigned' as const },
  { id: '3', name: 'iPhone 15 Pro', type: 'phone' as const, brand: 'Apple', serial: 'SN-2403-IPH', assigned: null, status: 'available' as const },
  { id: '4', name: 'Logitech MX Keys', type: 'keyboard' as const, brand: 'Logitech', serial: 'SN-2404-LOG', assigned: 'Arjun Joshi', status: 'assigned' as const },
  { id: '5', name: 'Sony WH-1000XM5', type: 'headset' as const, brand: 'Sony', serial: 'SN-2405-SNY', assigned: null, status: 'maintenance' as const },
  { id: '6', name: 'iPad Air M2', type: 'tablet' as const, brand: 'Apple', serial: 'SN-2406-IPD', assigned: 'Kavya Verma', status: 'assigned' as const },
]

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  available: 'success', assigned: 'info', maintenance: 'warning', retired: 'error', lost: 'error',
}

export default function AssetsPage() {
  const [assets] = useState(mockAssets)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = filter === 'all' ? assets : assets.filter(a => a.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Asset Management</h1>
          <p className="text-white/60">Track company devices, furniture, and inventory</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50">
            <option value="all" className="bg-[#1a1a2e]">All Assets</option>
            <option value="available" className="bg-[#1a1a2e]">Available</option>
            <option value="assigned" className="bg-[#1a1a2e]">Assigned</option>
            <option value="maintenance" className="bg-[#1a1a2e]">Maintenance</option>
          </select>
          <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all text-sm">
            {view === 'grid' ? '☰' : '⊞'}
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="glass rounded-2xl p-5 space-y-3 hover:border-amber-500/20 transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center text-lg">
                  {a.type === 'laptop' ? '💻' : a.type === 'monitor' ? '🖥' : a.type === 'phone' ? '📱' : a.type === 'headset' ? '🎧' : a.type === 'keyboard' ? '⌨' : a.type === 'tablet' ? '📋' : '📦'}
                </div>
                <StatusChip type={statusColors[a.status]} label={a.status} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{a.name}</div>
                <div className="text-xs text-white/50">{a.brand} · {a.serial}</div>
              </div>
              {a.assigned && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  Assigned to {a.assigned}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-[11px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Asset</th>
                <th className="text-left px-5 py-3 font-semibold">Type</th>
                <th className="text-left px-5 py-3 font-semibold">Serial</th>
                <th className="text-left px-5 py-3 font-semibold">Assigned To</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 text-white font-medium">{a.name}</td>
                  <td className="px-5 py-3.5 text-white/60">{a.type}</td>
                  <td className="px-5 py-3.5 text-white/40 font-mono text-xs">{a.serial}</td>
                  <td className="px-5 py-3.5 text-white/70">{a.assigned || '—'}</td>
                  <td className="px-5 py-3.5 text-center"><StatusChip type={statusColors[a.status]} label={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-lg font-bold text-white">{assets.length}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Total Assets</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-lg font-bold text-teal">{assets.filter(a => a.status === 'available').length}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Available</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-lg font-bold text-amber-400">{assets.filter(a => a.status === 'assigned').length}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Assigned</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-lg font-bold text-rose-400">{assets.filter(a => a.status === 'maintenance').length}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Maintenance</div>
        </div>
      </div>
    </div>
  )
}
