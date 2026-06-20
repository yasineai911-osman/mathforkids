import React, { useState } from 'react'
import { ROADMAP, getNodeStatus, getWorldNodes, WORLDS, WORLD_COUNT } from '../lib/roadmap.js'

// Winding path: nodes alternate left-center-right
const POSITIONS = ['center', 'right', 'left']
function getPos(i) { return POSITIONS[i % POSITIONS.length] }
function getLeft(pos) {
  if (pos === 'left')  return '18%'
  if (pos === 'right') return '64%'
  return '38%'
}

export default function Roadmap({ kid, onStartNode }) {
  const progress = { current_node_id: kid.current_node_id || 1 }
  const currentGlobalIdx = ROADMAP.findIndex(n => n.id === progress.current_node_id || n.id === Number(progress.current_node_id))
  const currentNode = ROADMAP[currentGlobalIdx] || ROADMAP[0]

  // Default the visible world to whichever world the kid is currently on
  const [viewWorld, setViewWorld] = useState(currentNode.world || 0)

  const worldNodes  = getWorldNodes(viewWorld)
  const worldLocked = viewWorld > (currentNode.world || 0) // can't preview a world not yet reached

  const section      = worldNodes[0]?.section
  const sectionTitle = `World ${viewWorld + 1} of ${WORLD_COUNT}`

  return (
    <div style={{ padding: '12px 0 40px', position: 'relative' }}>
      {/* World switcher */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px', overflowX: 'auto' }}>
        {WORLDS.map((w, i) => {
          const reached = i <= (currentNode.world || 0)
          const active  = i === viewWorld
          return (
            <button
              key={i}
              onClick={() => reached && setViewWorld(i)}
              disabled={!reached}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 99,
                border: `2px solid ${active ? w.color : '#E5E5E5'}`,
                background: active ? w.color : reached ? 'white' : '#F5F5F5',
                color: active ? 'white' : reached ? 'var(--ink)' : '#B0B0B0',
                fontWeight: 800, fontSize: 13, cursor: reached ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font)',
              }}
            >
              <span>{w.icon}</span>{w.name}
            </button>
          )
        })}
      </div>

      {/* Section banner */}
      <div className="section-banner" style={{ marginBottom: 24, marginLeft: 20, marginRight: 20 }}>
        <div className="section-label">{section}</div>
        <div className="section-title">{sectionTitle}</div>
      </div>

      {worldLocked ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-soft)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <p style={{ fontWeight: 700 }}>Finish {WORLDS[currentNode.world]?.name} first to unlock this world!</p>
        </div>
      ) : (
        <div style={{ position: 'relative', minHeight: worldNodes.length * 110 + 60 }}>
          {/* SVG winding path line */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox={`0 0 420 ${worldNodes.length * 110 + 60}`} preserveAspectRatio="none">
            {worldNodes.map((node, idx) => {
              if (idx === 0) return null
              const prevPos = getPos(idx - 1)
              const currPos = getPos(idx)
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
          {worldNodes.map((node, idx) => {
            const pos    = getPos(idx)
            const status = getNodeStatus(node.id, progress)
            const top    = idx * 110 + 60
            const left   = getLeft(pos)
            const isCurrent = status === 'current'
            const isBoss = node.scope === 'world'

            return (
              <div key={node.id} style={{ position: 'absolute', top, left, transform: 'translateX(-50%)' }}>
                {isCurrent && (
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99, letterSpacing: '0.08em', whiteSpace: 'nowrap', animation: 'bounce 2s ease infinite' }}>
                    START
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--ink)' }} />
                  </div>
                )}

                <button
                  className={`node-btn ${status}`}
                  style={isBoss ? { width: 76, height: 76 } : undefined}
                  onClick={() => {
                    if (status === 'current' || status === 'completed') onStartNode(node)
                  }}
                  disabled={status === 'locked'}
                  title={node.label}
                >
                  <span style={{ fontSize: isBoss ? 30 : 24 }}>{node.icon}</span>

                  {status === 'completed' && (
                    <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
                      {[1,2,3].map(s => <span key={s} style={{ fontSize: 9 }}>⭐</span>)}
                    </div>
                  )}
                </button>

                <div className="node-label" style={{ top: 'calc(100% + 22px)' }}>
                  {node.label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
