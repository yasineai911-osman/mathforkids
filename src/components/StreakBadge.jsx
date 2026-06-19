import React from 'react'

export default function StreakBadge({ count = 0, size = 'md' }) {
  const sizes = {
    sm: { font: 13, pad: '4px 10px', gap: 4, icon: 14 },
    md: { font: 16, pad: '7px 14px', gap: 5, icon: 18 },
    lg: { font: 24, pad: '12px 20px', gap: 8, icon: 26 },
  }
  const s = sizes[size] || sizes.md

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      padding: s.pad, background: 'var(--yellow-light)',
      borderRadius: 99, fontWeight: 800, fontSize: s.font,
      color: '#7A5A00', letterSpacing: '-0.01em',
    }}>
      <span style={{ fontSize: s.icon }}>🔥</span>
      <span>{count} day streak</span>
    </div>
  )
}
