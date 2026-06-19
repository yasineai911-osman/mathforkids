import React from 'react'

export default function ProgressBeads({ total = 10, filled = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i < filled ? 22 : 10,
          height: 10,
          borderRadius: 99,
          background: i < filled ? 'var(--purple)' : 'var(--ink-dim)',
          opacity: i < filled ? 1 : 0.4,
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      ))}
    </div>
  )
}
