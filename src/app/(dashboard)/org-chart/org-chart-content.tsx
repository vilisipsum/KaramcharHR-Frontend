'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'

interface OrgChartContentProps {
  orgChart: Array<{
    id: string
    first_name: string | null
    last_name: string | null
    employee_code: string
    role: { title: string } | null
    manager_id: string | null
    department: { name: string } | null
    initials: string
    children: any[]
  }>
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
          <div className={`font-bold text-white ${level === 0 ? 'text-base' : 'text-sm'}`}>{node.first_name} {node.last_name}</div>
          <div className="text-[10px] text-slate-800/40">{node.role?.title || '—'}</div>
        </div>
        {node.children && node.children.length > 0 && (
          <span className="text-slate-800/30 text-xs ml-2">{expanded ? '▼' : '▶'}</span>
        )}
      </div>
      {node.children && node.children.length > 0 && expanded && (
        <div className="flex items-start justify-center gap-6 mt-4 relative">
          {/* Vertical line from parent down */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-100" />
          
          {node.children.map((child: any, i: number) => {
            const isFirst = i === 0
            const isLast = i === node.children.length - 1
            return (
              <div key={i} className="flex flex-col items-center relative">
                {/* Horizontal and vertical connectors to children */}
                <div className="absolute top-0 w-full h-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-100" />
                  {node.children.length > 1 && (
                    <div className={`absolute top-0 h-0.5 bg-slate-100 ${
                      isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'
                    }`} />
                  )}
                </div>
                <div className="mt-8">
                  <OrgNode node={child} level={level + 1} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function OrgChartContent({ orgChart }: OrgChartContentProps) {
  // Helper to collect tree stats recursively
  const getTreeStats = (nodes: any[]) => {
    let count = 0
    const departments = new Set<string>()
    let maxDepth = 0

    const traverse = (node: any, depth: number) => {
      count++
      if (node.department?.name) {
        departments.add(node.department.name)
      }
      maxDepth = Math.max(maxDepth, depth)
      if (node.children) {
        node.children.forEach((child: any) => traverse(child, depth + 1))
      }
    }

    nodes.forEach(node => traverse(node, 1))

    return {
      totalEmployees: count,
      departmentsCount: departments.size || 0,
      levelsCount: maxDepth
    }
  }

  const stats = getTreeStats(orgChart)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Organization Chart</h1>
        <p className="text-slate-500">Interactive reporting structure and department hierarchy</p>
      </div>

      <div className="glass rounded-2xl p-8 overflow-x-auto">
        <div className="flex justify-center min-w-[600px] max-w-full">
          {orgChart.length === 0 ? (
            <div className="text-slate-500 text-sm py-12">No active employees found to chart.</div>
          ) : (
            orgChart.map((node, i) => (
              <div key={i} className="flex flex-col items-center">
                <OrgNode node={node} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center text-teal text-lg">👥</div>
          <div>
            <div className="text-lg font-bold text-slate-800">{stats.totalEmployees}</div>
            <div className="text-xs text-slate-800/40">Total Employees</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 text-lg">🏢</div>
          <div>
            <div className="text-lg font-bold text-slate-800">{stats.departmentsCount}</div>
            <div className="text-xs text-slate-800/40">Departments</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-400/20 flex items-center justify-center text-rose-400 text-lg">📊</div>
          <div>
            <div className="text-lg font-bold text-slate-800">{stats.levelsCount}</div>
            <div className="text-xs text-slate-800/40">Reporting Levels</div>
          </div>
        </div>
      </div>
    </div>
  )
}