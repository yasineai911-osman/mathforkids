import React, { useState } from 'react'
import TopBar    from '../components/TopBar.jsx'
import BottomNav from '../components/BottomNav.jsx'
import Roadmap   from './Roadmap.jsx'
import Rewards   from './Rewards.jsx'

export default function KidHome({ kid, parent, onStartNode, onBack, onKidUpdated }) {
  const [tab, setTab] = useState('class')

  return (
    <div className="screen screen-with-nav screen-with-topbar">
      <TopBar hearts={kid.hearts} xp={kid.xp} onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'class'   && <Roadmap   kid={kid} onStartNode={onStartNode} />}
        {tab === 'rewards' && <Rewards   kid={kid} parent={parent} onKidUpdated={onKidUpdated} />}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
