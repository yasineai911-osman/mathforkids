import React, { useEffect, useRef } from 'react'
import { ROADMAP, getNodeStatus } from '../lib/roadmap.js'

// Winding path: nodes alternate left-center-right, repeating
const POSITIONS = ['center', 'right', 'left']
function getPos(i) { return POSITIONS[i % POSITIONS.length] }
function getLeft(pos) {
  if (pos === 'left')  return '18%'
  if (pos === 'right') return '64%'
  return '38%'
}

const NODE_GAP   = 110
const BANNER_GAP = 110 // extra vertical space reserved when a world banner appears

// Precompute each node's vertical position, accounting for extra space
// reserved above every node that starts a new world (for its banner).
function computeLayout() {
  let y = 60
  let lastWorld = -1
  return ROADMAP.map((node) => {
    const showBanner = node.world !== lastWorld
    if (showBanner) {
      lastWorld = node.world
      y += BANNER_GAP
    }
    const top = y
    y += NODE_GAP
    return { node, top, showBanner }
  })
}

export default function Roadmap({ kid, onStartNode }) {
  const progress = { current_node_id: kid.current_node_id || 1 }
  const currentIdx = ROADMAP.findIndex(n => n.id === progress.current_node_id || n.id === Number(progress.current_node_id))
  const currentNodeRef = useRef(null)

  const layout = computeLayout()
  const totalHeight = layout.length ? layout[layout.length - 1].top + 200 : 600

  // Auto-scroll to the kid's current node on mount, so they don't have to
  // manually scroll through everything they've already finished.
  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ block: 'center', behavior: 'auto' })
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', minHeight: totalHeight, padding: '12px 0 60px' }}>
        {/* SVG winding path line, spans the entire roadmap */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox={`0 0 420 ${totalHeight}`} preserveAspectRatio="none">
          {layout.map(({ top }, idx) => {
            if (idx === 0) return null
            const prevPos = getPos(idx - 1)
            const currPos = getPos(idx)
            const prevTop = layout[idx - 1].top
            const y1 = prevTop + 34
            const y2 = top + 34
            const x1 = prevPos === 'left' ? 420 * 0.255 : prevPos === 'right' ? 420 * 0.705 : 420 * 0.48
            const x2 = currPos === 'left' ? 420 * 0.255 : currPos === 'right' ? 420 * 0.705 : 420 * 0.48
            const status = getNodeStatus(layout[idx].node.id, progress)
            return (
              <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={status === 'locked' ? '#E5E5E5' : '#D7F5B1'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={status === 'locked' ? '10 8' : 'none'}
              />
            )
          })}
        </svg>

        {/* Nodes + section banners */}
        {layout.map(({ node, top, showBanner }, idx) => {
          const pos    = getPos(idx)
          const status = getNodeStatus(node.id, progress)
          const left   = getLeft(pos)
          const isCurrent = status === 'current'
          const isBoss = node.scope === 'world'

          return (
            <React.Fragment key={node.id}>
              {showBanner && (
                <div
                  className="section-banner"
                  style={{
                    position: 'absolute',
                    top: top - BANNER_GAP + 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 40px)',
                    maxWidth: 380,
                  }}
                >
                  <div className="section-label">{node.section}</div>
                  <div className="section-title">{node.sectionTitle}</div>
                </div>
              )}

              <div
                ref={isCurrent ? currentNodeRef : null}
                style={{ position: 'absolute', top, left, transform: 'translateX(-50%)' }}
              >
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
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
