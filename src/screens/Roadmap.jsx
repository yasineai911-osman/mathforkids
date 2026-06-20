import React, { useEffect, useRef } from 'react'
import { ROADMAP, getNodeStatus } from '../lib/roadmap.js'

const NODE_GAP   = 90    // vertical distance between consecutive nodes
const BANNER_GAP = 150   // extra vertical space reserved for a world banner
const BANNER_HEIGHT = 78 // approx rendered height of a section banner card
const AMPLITUDE  = 64    // how far left/right the path swings from center (Duolingo-style: gentle, not edge-to-edge)
const CENTER_X   = 210   // center of the 420-wide viewBox
const WAVE_NODES = 6     // how many nodes make up one full left-right-left cycle

// Smooth sine-wave x position for a given node index — this is what makes
// the path curve continuously instead of jumping between 3 fixed columns.
function waveX(idx) {
  const angle = (idx / WAVE_NODES) * Math.PI * 2
  return CENTER_X + Math.sin(angle) * AMPLITUDE
}

// Precompute every node's (x, y) position, reserving extra vertical space
// above any node that starts a new world (for its banner).
function computeLayout() {
  let y = 70
  let lastWorld = -1
  return ROADMAP.map((node, idx) => {
    const showBanner = node.world !== lastWorld
    if (showBanner) {
      lastWorld = node.world
      y += BANNER_GAP
    }
    const top = y
    const x   = waveX(idx)
    y += NODE_GAP
    return { node, top, x, showBanner, waveIdx: idx }
  })
}

// Build a single smooth SVG path string through every node's (x, y),
// using a Catmull-Rom-to-bezier conversion so the curve flows naturally
// through each point rather than connecting them with straight segments.
function buildSmoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].top}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.top + (p2.top - p0.top) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.top - (p3.top - p1.top) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.top}`
  }
  return d
}

export default function Roadmap({ kid, onStartNode }) {
  const progress = { current_node_id: kid.current_node_id || 1 }
  const currentNodeRef = useRef(null)

  const layout = computeLayout()
  const totalHeight = layout.length ? layout[layout.length - 1].top + 200 : 600

  // Auto-scroll to the kid's current node on mount
  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ block: 'center', behavior: 'auto' })
    }
  }, [])

  // Split the path into "completed/current" vs "locked" segments so we can
  // color the traveled portion differently from what's still ahead —
  // build one continuous path, then a second path only for the locked tail.
  const fullPathD = buildSmoothPath(layout)

  // Find the index of the first locked node, to know where the solid
  // (traveled) path ends and the upcoming path begins.
  const firstLockedIdx = layout.findIndex(({ node }) => getNodeStatus(node.id, progress) === 'locked')
  const travelEndIdx = firstLockedIdx === -1 ? layout.length - 1 : firstLockedIdx
  const traveledPoints = layout.slice(0, travelEndIdx + 1)
  const lockedPoints   = layout.slice(Math.max(travelEndIdx, 0))
  const traveledPathD  = buildSmoothPath(traveledPoints)
  const lockedPathD    = buildSmoothPath(lockedPoints)

  // Traveled path takes the color of whichever world the kid is currently in
  const traveledColor = layout[travelEndIdx]?.node.color || 'var(--green)'

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <div style={{ position: 'relative', minHeight: totalHeight, padding: '12px 0 60px' }}>
        {/* Smooth winding path */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox={`0 0 420 ${totalHeight}`} preserveAspectRatio="xMidYMin meet">
          {/* Upcoming (locked) path — solid, light grey (no dashes, matches Duolingo) */}
          {lockedPathD && (
            <path d={lockedPathD} fill="none" stroke="#E5E5E5" strokeWidth="14" strokeLinecap="round" />
          )}
          {/* Traveled path — solid, current world's color */}
          {traveledPathD && (
            <path d={traveledPathD} fill="none" stroke={traveledColor} strokeWidth="14" strokeLinecap="round" />
          )}
        </svg>

        {/* Nodes + section banners */}
        {layout.map(({ node, top, x, showBanner }) => {
          const status = getNodeStatus(node.id, progress)
          const isCurrent = status === 'current'
          const isBoss = node.scope === 'world'
          const leftPct = (x / 420) * 100

          return (
            <React.Fragment key={node.id}>
              {showBanner && (
                <div
                  className="section-banner"
                  style={{
                    position: 'absolute',
                    top: top - BANNER_GAP + 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 40px)',
                    maxWidth: 380,
                    height: BANNER_HEIGHT,
                  }}
                >
                  <div className="section-label">{node.section}</div>
                  <div className="section-title">{node.sectionTitle}</div>
                </div>
              )}

              <div
                ref={isCurrent ? currentNodeRef : null}
                style={{ position: 'absolute', top, left: `${leftPct}%`, transform: 'translateX(-50%)' }}
              >
                {isCurrent && (
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99, letterSpacing: '0.08em', whiteSpace: 'nowrap', animation: 'bounce 2s ease infinite' }}>
                    START
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--ink)' }} />
                  </div>
                )}

                <button
                  className={`node-btn ${status}`}
                  style={{
                    ...(isBoss ? { width: 76, height: 76 } : null),
                    '--world-color': node.color,
                    '--world-color-dark': node.colorDark,
                  }}
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
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
