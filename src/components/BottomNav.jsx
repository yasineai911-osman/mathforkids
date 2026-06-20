import React from 'react'

const TABS = [
  { id: 'class',   label: 'My Class',   icon: '🗺️' },
  { id: 'rewards', label: 'My Rewards', icon: '🎁' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
