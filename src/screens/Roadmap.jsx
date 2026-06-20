import React from 'react'
import { ROADMAP, getNodeStatus } from '../lib/roadmap.js'

// Winding path: nodes alternate left-center-right
const POSITIONS = ['center', 'right', 'center', 'left', 'center', 'right', 'center', 'left', 'center', 'right', 'center', 'left', 'center', 'center']

function getLeft(pos) {
  if (pos === 'left')   return '18%'
  if (pos === 'right')  return '64%'
  return '38%'
}

export default function Roadmap({ kid, onStartNode }) {
  const progress = { current_node_id: kid.current_node_id || 1 }

  // Find current section for banner
  const currentNode = ROADMAP.find(n => n.id === progress.current_node_id || n.id === Number(progress.current_node_id))
  const section     = currentNode?.section || 'Section 1 · Addition'
  const sectionTitle = currentNode?.sectionTitle || 'Master adding small numbers'

  return (
    <div style={{ padding: '12px 0 40px', position: 'relative' }}>
      {/* Section banner */}
      <div className="section-banner" style={{ marginBottom: 24 }}>
        <div className="section-label">{section}</div>
        <div className="section-title">{sectionTitle}</div>
      </div>

      {/* Path container */}
      <div style={{ position: 'relative', minHeight: ROADMAP.length * 110 + 60 }}>
        {/* SVG winding path line */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox={`0 0 420 ${ROADMAP.length * 110 + 60}`} preserveAspectRatio="none">
          {ROADMAP.map((node, idx) => {
            if (idx === 0) return null
            const prev = ROADMAP[idx - 1]
            const prevPos = POSITIONS[idx - 1] || 'center'
            const currPos = POSITIONS[idx]     || 'center'
            const y1 = (idx - 1) * 110 + 34 + 60
            const y2 = idx       * 110 + 34 + 60
            const x1 = prevPos === 'left' ? 420 * 0.255 : prevPos === 'right' ? 420 * 0.705 : 420 * 0.48
            const x2 = currPos === 'left' ? 420 * 0.255 : currPos === 'right' ? 420 * 0.705 : 420 * 0.48
            const status = getNodeStatus(node.id, progress)
            return (
              <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={status === 'locked' ? '#E5E5E5' : '#D7F5B1'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={status === 'locked' ? '10 8' : 'none'}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {ROADMAP.map((node, idx) => {
          const pos    = POSITIONS[idx] || 'center'
          const status = node.type === 'chest' ? 'chest' : getNodeStatus(node.id, progress)
          const top    = idx * 110 + 60
          const left   = getLeft(pos)
          const isCurrent = status === 'current'

          return (
            <div key={node.id} style={{ position: 'absolute', top, left, transform: 'translateX(-50%)' }}>
              {/* "START" tooltip on current node */}
              {isCurrent && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99, letterSpacing: '0.08em', whiteSpace: 'nowrap', animation: 'bounce 2s ease infinite' }}>
                  START
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--ink)' }} />
                </div>
              )}

              <button
                className={`node-btn ${status === 'chest' ? 'chest' : status}`}
                onClick={() => {
                  if (status === 'current') onStartNode(node)
                  else if (status === 'completed') onStartNode(node) // replay
                }}
                disabled={status === 'locked'}
                title={node.label}
              >
                <span style={{ fontSize: node.type === 'chest' ? 30 : 26 }}>{node.icon}</span>

                {/* Star rating for completed nodes */}
                {status === 'completed' && node.type !== 'chest' && (
                  <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
                    {[1,2,3].map(s => <span key={s} style={{ fontSize: 9 }}>⭐</span>)}
                  </div>
                )}
              </button>

              <div className="node-label" style={{ top: node.type === 'chest' ? 'calc(100% + 20px)' : 'calc(100% + 22px)' }}>
                {node.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
