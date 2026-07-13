'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'

const orgData = {
  name: 'Rohan Sharma',
  role: 'CEO / Founder',
  initials: 'RS',
  children: [
    {
      name: 'Neha Singh',
      role: 'VP Engineering',
      initials: 'NS',
      children: [
        { name: 'Arjun Joshi', role: 'Tech Lead', initials: 'AJ', children: [{ name: 'Kavya Verma', role: 'Frontend Dev', initials: 'KV' }, { name: 'Rahul Bose', role: 'Backend Dev', initials: 'RB' }] },
        { name: 'Sana Malik', role: 'QA Lead', initials: 'SM', children: [{ name: 'Priya Kapoor', role: 'QA Engineer', initials: 'PK' }] },
      ],
    },
    {
      name: 'Vikram Aditya',
      role: 'VP People',
      initials: 'VA',
      children: [
        { name: 'Aarav Patel', role: 'HR Manager', initials: 'AP', children: [{ name: 'Ishita Gupta', role: 'HR Executive', initials: 'IG' }] },
      ],
    },
    {
      name: 'Ananya Reddy',
      role: 'VP Finance',
      initials: 'AR',
      children: [
        { name: 'Deepak Kumar', role: 'Finance Manager', initials: 'DK' },
      ],
    },
  ],
}

function OrgNode({ node, level = 0 }: { node: any; level?: number }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="flex flex-col items-center">
      <div className={`glass-strong rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-amber-500/30 transition-all ${level === 0 ? 'px-5 py-4' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <Avatar initials={node.initials} size={level === 0 ? 'md' : 'sm'} index={level} />
        <div>
          <div className={`font-bold text-white ${level === 0 ? 'text-base' : 'text-sm'}`}>{node.name}</div>
          <div className="text-[10px] text-white/40">{node.role}</div>
        </div>
        {node.children && (
          <span className="text-white/30 text-xs ml-2">{expanded ? '▼' : '▶'}</span>
        )}
      </div>
      {node.children && expanded && (
        <div className="flex items-start justify-center gap-6 mt-3 relative">
          <div className="absolute top-0 left-[50%] w-0.5 h-3 bg-white/10" />
          {node.children.map((child: any, i: number) => (
            <div key={i} className="flex flex-col items-center relative">
              <div className="absolute top-0 w-full h-3">
                <div className="absolute top-0 left-[50%] w-0.5 h-3 bg-white/10" />
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/10" />
              </div>
              <div className="mt-6">
                <OrgNode node={child} level={level + 1} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Organization Chart</h1>
        <p className="text-white/60">Interactive reporting structure and department hierarchy</p>
      </div>

      <div className="glass rounded-2xl p-8 overflow-x-auto">
        <div className="flex justify-center min-w-[600px]">
          <OrgNode node={orgData} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center text-teal text-lg">👥</div>
          <div>
            <div className="text-lg font-bold text-white">12</div>
            <div className="text-xs text-white/40">Total Employees</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 text-lg">🏢</div>
          <div>
            <div className="text-lg font-bold text-white">3</div>
            <div className="text-xs text-white/40">Departments</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-400/20 flex items-center justify-center text-rose-400 text-lg">📊</div>
          <div>
            <div className="text-lg font-bold text-white">4</div>
            <div className="text-xs text-white/40">Levels</div>
          </div>
        </div>
      </div>
    </div>
  )
}
