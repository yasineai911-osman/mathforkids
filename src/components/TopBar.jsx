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

      {title && (
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{title}</span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: title ? 0 : 'auto' }}>
        {/* Single heart icon + count, replaces 5 separate emojis */}
        <div className="heart-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red)" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-10.2-9.1C.3 9.1 1.2 5.6 4.4 4.2c2.4-1 4.9-.2 6.6 1.7l1 1.1 1-1.1c1.7-1.9 4.2-2.7 6.6-1.7 3.2 1.4 4.1 4.9 2.6 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
          <span className="heart-count">{hearts}</span>
        </div>

        {/* XP pill */}
        <div className="xp-pill">
          <span style={{ fontSize: 14 }}>⚡</span>
          <span>{xp}</span>
        </div>
      </div>
    </div>
  )
}
