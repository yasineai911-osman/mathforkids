import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { spendXP } from '../lib/xp.js'

const EMOJI_OPTIONS = ['📺','🎮','🍦','🍕','🎬','🛁','🏃','🎨','🎵','🧸','🎪','🚲']

export default function Rewards({ kid, parent, onKidUpdated }) {
  const [rewards,   setRewards]   = useState([])
  const [showAdd,   setShowAdd]   = useState(false)
  const [newName,   setNewName]   = useState('')
  const [newCost,   setNewCost]   = useState('')
  const [newEmoji,  setNewEmoji]  = useState('📺')
  const [adding,    setAdding]    = useState(false)
  const [certReward, setCertReward] = useState(null)
  const [pinInput,  setPinInput]  = useState('')
  const [pinError,  setPinError]  = useState('')
  const [redeeming, setRedeeming] = useState(null)

  useEffect(() => { loadRewards() }, [])

  async function loadRewards() {
    const { data } = await supabase.from('rewards').select('*').eq('parent_id', parent.id).order('xp_cost')
    setRewards(data || [])
  }

  async function addReward(e) {
    e.preventDefault()
    if (!newName.trim() || !newCost) return
    setAdding(true)
    const { data, error } = await supabase.from('rewards').insert({ parent_id: parent.id, name: newName.trim(), xp_cost: parseInt(newCost), emoji: newEmoji }).select().single()
    if (!error) { setRewards(p => [...p, data]); setNewName(''); setNewCost(''); setNewEmoji('📺'); setShowAdd(false) }
    setAdding(false)
  }

  async function redeemReward(reward) {
    if (kid.xp < reward.xp_cost) return
    setRedeeming(reward)
    setPinInput('')
    setPinError('')
  }

  async function confirmRedeem() {
    if (pinInput !== parent.pin) { setPinError('Wrong PIN. Try again.'); return }
    // Deduct XP
    const success = await spendXP(kid.id, redeeming.xp_cost)
    if (success === false) { setPinError('Not enough XP.'); return }
    // Log redemption
    await supabase.from('redemptions').insert({ kid_id: kid.id, reward_id: redeeming.id, xp_spent: redeeming.xp_cost })
    onKidUpdated({ ...kid, xp: kid.xp - redeeming.xp_cost })
    setCertReward(redeeming)
    setRedeeming(null)
    setPinInput('')
  }

  // ── Certificate screen ──────────────────────────────────────
  if (certReward) {
    return (
      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div className="certificate pop-in" style={{ width: '100%' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>You earned it!</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>{kid.name}</h2>
          <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 20 }}>is allowed to</p>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{certReward.emoji}</div>
          <h3 style={{ fontSize: 26, fontWeight: 900 }}>{certReward.name}</h3>
          <p style={{ fontSize: 13, opacity: 0.6, marginTop: 16 }}>Valid today only · Show this to a parent</p>
        </div>
        <button className="btn-primary" onClick={() => setCertReward(null)} style={{ width: '100%' }}>Done 🎊</button>
      </div>
    )
  }

  // ── PIN modal ───────────────────────────────────────────────
  if (redeeming) {
    return (
      <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <div style={{ fontSize: 56 }}>{redeeming.emoji}</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, textAlign: 'center' }}>Unlock {redeeming.name}?</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600, textAlign: 'center' }}>
          Costs <strong style={{ color: 'var(--purple)' }}>{redeeming.xp_cost} XP</strong>. Parent enters PIN to confirm.
        </p>
        <div style={{ width: '100%' }}>
          <label className="field-label">Parent PIN</label>
          <input className="input-field" type="password" inputMode="numeric" maxLength={4} autoFocus value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="••••" style={{ letterSpacing: '0.4em', fontSize: 24, textAlign: 'center' }} />
          {pinError && <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 700, marginTop: 6 }}>{pinError}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={() => setRedeeming(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={confirmRedeem} className="btn-primary" disabled={pinInput.length !== 4} style={{ flex: 2 }}>Confirm</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 20px 20px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>My Rewards</h2>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 20 }}>
        You have <strong style={{ color: 'var(--purple)' }}>{kid.xp} XP</strong> to spend
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rewards.map((r, idx) => {
          const canAfford = kid.xp >= r.xp_cost
          return (
            <div key={r.id} className={`reward-card ${canAfford ? 'unlocked' : 'locked'}`}
              style={{ animation: `slide-up 0.2s ease ${idx * 0.05}s both` }}
              onClick={() => canAfford && redeemReward(r)}
            >
              <span style={{ fontSize: 36 }}>{r.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: canAfford ? 'var(--green-dark)' : 'var(--ink-soft)', fontWeight: 700, marginTop: 2 }}>
                  ⚡ {r.xp_cost} XP {canAfford ? '· Tap to unlock!' : `· Need ${r.xp_cost - kid.xp} more`}
                </div>
              </div>
              {canAfford ? (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
              ) : (
                <div style={{ fontSize: 20 }}>🔒</div>
              )}
            </div>
          )
        })}

        {/* Add reward (parent) */}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)}
            style={{ padding: '16px', borderRadius: 'var(--radius-xl)', border: '2.5px dashed var(--ink-dim)', background: 'none', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink-dim)'; e.currentTarget.style.color = 'var(--ink-soft)' }}
          >+ Add a reward (parent)</button>
        ) : (
          <form onSubmit={addReward} style={{ padding: '18px', borderRadius: 'var(--radius-xl)', border: '2px solid #F0F0F0', background: 'white', display: 'flex', flexDirection: 'column', gap: 12, animation: 'slide-up 0.2s ease both' }}>
            <label className="field-label">Reward name</label>
            <input className="input-field" autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. 30 min TV" />
            <label className="field-label">XP cost</label>
            <input className="input-field" type="number" inputMode="numeric" value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="e.g. 50" />
            <label className="field-label">Pick emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EMOJI_OPTIONS.map(em => (
                <button key={em} type="button" onClick={() => setNewEmoji(em)}
                  style={{ width: 42, height: 42, borderRadius: 10, border: `2px solid ${newEmoji === em ? 'var(--purple)' : '#E5E5E5'}`, background: newEmoji === em ? 'var(--purple-light)' : 'white', fontSize: 22, cursor: 'pointer', transition: 'all 0.1s' }}>
                  {em}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setShowAdd(false); setNewName(''); setNewCost('') }} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={adding || !newName.trim() || !newCost} style={{ flex: 2, fontSize: 14, padding: '12px' }}>{adding ? 'Adding...' : 'Add reward'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
