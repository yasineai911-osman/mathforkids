import React, { useState, useEffect } from 'react'
import Login           from './screens/Login.jsx'
import KidPicker       from './screens/KidPicker.jsx'
import Practice        from './screens/Practice.jsx'
import SessionComplete from './screens/SessionComplete.jsx'
import ParentDashboard from './screens/ParentDashboard.jsx'

const STORAGE_KEY = 'ten-a-day:parent'

export default function App() {
  const [screen,    setScreen]    = useState('loading')
  const [parent,    setParent]    = useState(null)
  const [activeKid, setActiveKid] = useState(null)
  const [lastScore, setLastScore] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setParent(JSON.parse(saved))
        setScreen('kidPicker')
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setScreen('login')
      }
    } else {
      setScreen('login')
    }
  }, [])

  function handleLogin(parentRecord) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parentRecord))
    setParent(parentRecord)
    setScreen('kidPicker')
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setParent(null)
    setActiveKid(null)
    setScreen('login')
  }

  function startPractice(kid) {
    setActiveKid(kid)
    setScreen('practice')
  }

  function finishPractice(score) {
    setLastScore(score)
    setScreen('sessionComplete')
  }

  if (screen === 'loading') {
    return (
      <div className="app-shell">
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
            background: 'var(--yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, animation: 'bounce 1s ease infinite',
          }}>⭐</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {screen === 'login'    && <Login onLogin={handleLogin} />}
      {screen === 'kidPicker' && parent && (
        <KidPicker
          parent={parent}
          onStartPractice={startPractice}
          onOpenDashboard={() => setScreen('dashboard')}
          onLogout={handleLogout}
        />
      )}
      {screen === 'practice' && activeKid && (
        <Practice kid={activeKid} onFinish={finishPractice} onBack={() => setScreen('kidPicker')} />
      )}
      {screen === 'sessionComplete' && activeKid && (
        <SessionComplete
          kid={activeKid}
          score={lastScore}
          onPracticeAgain={() => setScreen('practice')}
          onDone={() => setScreen('kidPicker')}
        />
      )}
      {screen === 'dashboard' && parent && (
        <ParentDashboard parent={parent} onBack={() => setScreen('kidPicker')} />
      )}
    </div>
  )
}
