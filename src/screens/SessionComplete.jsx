import React, { useEffect, useState } from 'react'
import { completeSession } from '../lib/streak.js'
import Mascot from '../components/Mascot.jsx'
import StreakBadge from '../components/StreakBadge.jsx'

const MESSAGES = {
  3: ['Amazing! 🎉', 'Nailed it!', 'Perfect score!'],
  2: ['Nice work! 👏', 'So good!', 'Keep it up!'],
  1: ['Good try! 💪', 'You showed up!', 'Tomorrow is the day!'],
}

export default function SessionComplete({ kid, score, onPracticeAgain, onDone }) {
  const [streak, setStreak] = useState(kid.streak_count || 0)
  const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1
  const msgs  = MESSAGES[stars]
  const msg   = msgs[Math.floor(Math.random() * msgs.length)]

  useEffect(() => { completeSession(kid).then(setStreak) }, [])

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingTop: 0 }}>
      <div style={{ marginBottom: 28 }}><Mascot mood="celebrate" size={120} /></div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {[1,2,3].map(i => (
          <span key={i} style={{ fontSize: 44, filter: i > stars ? 'grayscale(1) opacity(0.25)' : 'none', animation: i <= stars ? `pop-in 0.4s ease ${i * 0.15}s both` : 'none' }}>⭐</span>
        ))}
      </div>

      <h2 className="slide-up" style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>{msg}</h2>
      <p style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 24, animation: 'slide-up 0.3s ease 0.1s both' }}>
        {kid.name} got {score} out of 10 right
      </p>

      <div style={{ marginBottom: 40, animation: 'slide-up 0.3s ease 0.2s both' }}>
        <StreakBadge count={streak} size="lg" />
      </div>

      <div className="card" style={{ width: '100%', padding: '16px 20px', marginBottom: 32, animation: 'slide-up 0.3s ease 0.25s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>Score</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)' }}>{score * 10}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--purple-light)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--purple)', width: `${score * 10}%`, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, animation: 'slide-up 0.3s ease 0.3s both' }}>
        <button className="btn-primary" onClick={onPracticeAgain} style={{ background: 'var(--purple)', boxShadow: '0 4px 0 rgba(124,92,252,0.35)' }}>Practice again</button>
        <button className="btn-ghost" onClick={onDone} style={{ textAlign: 'center' }}>Done for today</button>
      </div>
    </div>
  )
}
