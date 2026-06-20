import React from 'react'
import { MAX_HEARTS } from '../lib/xp.js'

export default function TopBar({ hearts = MAX_HEARTS, xp = 0, onBack, title }) {
  return (
    <div className="top-bar slide-down">
      {onBack ? (
        <button onClick={onBack} style={{ fontSize: 22, color: 'var(--ink-soft)', padding: '4px 8px', borderRadius: 8, fontFamily: 'var(--font)', cursor: 'pointer', border: 'none', background: 'none' }}>
          ✕
        </button>
      ) : (
        <div style={{ width: 40 }} />
      )}

      {title ? (
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{title}</span>
      ) : (
        <div className="hearts-row">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span key={i} className={`heart ${i >= hearts ? 'empty' : ''}`}>❤️</span>
          ))}
        </div>
      )}

      <div className="xp-pill">
        <span style={{ fontSize: 14 }}>⚡</span>
        <span>{xp}</span>
      </div>
    </div>
  )
}
