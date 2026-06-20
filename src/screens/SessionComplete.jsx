import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { calcXP, awardXP } from '../lib/xp.js'
import Mascot from '../components/Mascot.jsx'

export default function SessionComplete({ kid, node, result, onContinue, onBack }) {
  const { correctCount, outOfHearts } = result
  const [xpEarned, setXpEarned] = useState(0)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    async function finish() {
      if (outOfHearts) { setDone(true); return }

      // Update streak
      const today = new Date().toISOString().slice(0, 10)
      let newStreak = 1
      if (kid.last_session_date) {
        const diff = Math.round((new Date(today) - new Date(kid.last_session_date)) / 86_400_000)
        if (diff === 0) newStreak = kid.streak_count
        else if (diff === 1) newStreak = kid.streak_count + 1
        else newStreak = 1
      }

      const xp = calcXP(correctCount, newStreak)
      setXpEarned(xp)
      await awardXP(kid.id, xp)

      // Advance node if passed (7/10 threshold)
      if (correctCount >= 7) {
        const { data: roadmap } = await supabase.from('kids').select('current_node_id').eq('id', kid.id).single()
        if (roadmap && roadmap.current_node_id === node.id) {
          // Advance to next node
          const { data: nextNode } = await supabase.rpc('get_next_node', { current_id: node.id })
          if (nextNode) await supabase.from('kids').update({ current_node_id: nextNode, streak_count: newStreak, last_session_date: today }).eq('id', kid.id)
          else await supabase.from('kids').update({ streak_count: newStreak, last_session_date: today }).eq('id', kid.id)
        }
      } else {
        await supabase.from('kids').update({ streak_count: newStreak, last_session_date: today }).eq('id', kid.id)
      }
      setDone(true)
    }
    finish()
  }, [])

  const stars    = correctCount >= 9 ? 3 : correctCount >= 7 ? 2 : correctCount >= 5 ? 1 : 0
  const passed   = correctCount >= 7
  const mascot   = outOfHearts ? 'wrong' : passed ? 'celebrate' : 'idle'

  const messages = {
    3: ['Perfect! 🔥', 'Flawless!', 'Genius!'],
    2: ['Great work! 🎉', 'So good!', 'Nailed it!'],
    1: ['Nice try! 💪', 'Getting there!', 'Keep going!'],
    0: ['You can do it! 💪', 'Try again!', 'Almost!'],
  }
  const msg = messages[stars][Math.floor(Math.random() * 3)]

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px 40px' }}>
      <div style={{ marginBottom: 24 }}><Mascot mood={mascot} size={110} /></div>

      {outOfHearts ? (
        <>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Out of hearts 💔</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 32 }}>
            Hearts refill tomorrow. Or buy one for 30 XP!
          </p>
        </>
      ) : (
        <>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {[1,2,3].map(i => (
              <span key={i} style={{ fontSize: 42, filter: i > stars ? 'grayscale(1) opacity(0.2)' : 'none', animation: i <= stars ? `pop-in 0.4s ease ${i * 0.15}s both` : 'none' }}>⭐</span>
            ))}
          </div>

          <h2 className="slide-up" style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>{msg}</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 20, animation: 'slide-up 0.25s ease 0.1s both' }}>
            {correctCount} out of 10 correct
          </p>

          {/* XP earned */}
          {xpEarned > 0 && (
            <div className="pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--yellow-light)', border: '2px solid var(--yellow)', borderRadius: 99, marginBottom: 24, fontSize: 18, fontWeight: 800, color: '#7A5500', animation: 'pop-in 0.4s ease 0.3s both' }}>
              ⚡ +{xpEarned} XP earned!
            </div>
          )}

          {/* Score bar */}
          <div className="card" style={{ width: '100%', padding: '14px 18px', marginBottom: 28, animation: 'slide-up 0.25s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: passed ? 'var(--green)' : 'var(--red)' }}>{correctCount * 10}%</span>
            </div>
            <div style={{ height: 10, background: '#E5E5E5', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: passed ? 'var(--green)' : 'var(--red)', width: `${correctCount * 10}%`, transition: 'width 0.8s ease' }} />
            </div>
            {!passed && <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>Get 7/10 to unlock the next level!</p>}
          </div>
        </>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, animation: 'slide-up 0.25s ease 0.3s both' }}>
        {!outOfHearts && passed && (
          <button className="btn-primary" onClick={onContinue}>Continue →</button>
        )}
        <button className={`btn-primary ${!passed || outOfHearts ? '' : 'purple'}`} onClick={onBack} style={{ background: passed && !outOfHearts ? 'var(--purple)' : 'var(--green)' }}>
          {outOfHearts ? 'Back home' : passed ? 'Go to map' : 'Try again'}
        </button>
      </div>
    </div>
  )
}
