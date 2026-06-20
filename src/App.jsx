import React, { useState, useEffect } from 'react'
import Login           from './screens/Login.jsx'
import KidPicker       from './screens/KidPicker.jsx'
import KidHome         from './screens/KidHome.jsx'
import Practice        from './screens/Practice.jsx'
import SessionComplete from './screens/SessionComplete.jsx'

const STORAGE_KEY = 'ten-a-day:parent'

// Screens: loading | login | kidPicker | kidHome | practice | sessionComplete

export default function App() {
  const [screen,      setScreen]      = useState('loading')
  const [parent,      setParent]      = useState(null)
  const [kid,         setKid]         = useState(null)
  const [activeNode,  setActiveNode]  = useState(null)
  const [lastResult,  setLastResult]  = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setParent(JSON.parse(saved)); setScreen('kidPicker') }
      catch { localStorage.removeItem(STORAGE_KEY); setScreen('login') }
    } else {
      setScreen('login')
    }
  }, [])

  function handleLogin(p) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    setParent(p); setScreen('kidPicker')
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setParent(null); setKid(null); setScreen('login')
  }

  function handleSelectKid(k) {
    setKid(k); setScreen('kidHome')
  }

  function handleStartNode(node) {
    if (kid.hearts <= 0) return  // out of hearts, can't start
    setActiveNode(node); setScreen('practice')
  }

  function handleFinishPractice(result) {
    setLastResult(result); setScreen('sessionComplete')
  }

  function handleKidUpdated(updatedKid) {
    setKid(updatedKid)
  }

  // Loading splash
  if (screen === 'loading') return (
    <div className="app-shell">
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '60% 40% 55% 45%/50% 60% 40% 50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, animation: 'bounce 1s ease infinite' }}>⭐</div>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      {screen === 'login'    && <Login onLogin={handleLogin} />}

      {screen === 'kidPicker' && parent && (
        <KidPicker parent={parent} onSelectKid={handleSelectKid} onLogout={handleLogout} />
      )}

      {screen === 'kidHome' && kid && (
        <KidHome
          kid={kid}
          parent={parent}
          onStartNode={handleStartNode}
          onBack={() => setScreen('kidPicker')}
          onKidUpdated={handleKidUpdated}
        />
      )}

      {screen === 'practice' && kid && activeNode && (
        <Practice
          node={activeNode}
          kid={kid}
          onFinish={handleFinishPractice}
          onBack={() => setScreen('kidHome')}
        />
      )}

      {screen === 'sessionComplete' && kid && activeNode && lastResult && (
        <SessionComplete
          kid={kid}
          node={activeNode}
          result={lastResult}
          onContinue={() => setScreen('kidHome')}
          onBack={() => setScreen('kidHome')}
        />
      )}
    </div>
  )
}
