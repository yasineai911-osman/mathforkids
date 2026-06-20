import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { refillHeartsIfNeeded, MAX_HEARTS } from '../lib/xp.js'

const BLOB_COLORS = ['#FFD03A', '#7C5CFC', '#58CC02', '#FF9600', '#1CB0F6']

export default function KidPicker({ parent, onSelectKid, onLogout }) {
  const [kids,    setKids]    = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name,    setName]    = useState('')
  const [adding,  setAdding]  = useState(false)

  useEffect(() => { loadKids() }, [])

  async function loadKids() {
    setLoading(true)
    const { data } = await supabase.from('kids').select('*').eq('parent_id', parent.id).order('created_at')
    // Refill hearts for any kid whose last refill was not today
    const refreshed = await Promise.all((data || []).map(async kid => {
      const hearts = await refillHeartsIfNeeded(kid)
      return { ...kid, hearts }
    }))
    setKids(refreshed)
    setLoading(false)
  }

  async function addKid(e) {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    const { data, error } = await supabase.from('kids')
      .insert({ parent_id: parent.id, name: name.trim(), hearts: MAX_HEARTS, xp: 0, streak_count: 0, current_node_id: 1 })
      .select().single()
    if (!error) { setKids(p => [...p, data]); setName(''); setShowAdd(false) }
    setAdding(false)
  }

  return (
    <div className="screen" style={{ padding: '0 20px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>⭐</span>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em' }}>Ten a Day</span>
        </div>
        <button className="btn-ghost" onClick={onLogout} style={{ padding: '7px 14px', fontSize: 13 }}>Sign out</button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 24 }}>Who's practising today?</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 30 }}>⏳</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {kids.map((kid, idx) => (
            <button key={kid.id} onClick={() => onSelectKid(kid)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 'var(--radius-xl)', border: '2px solid #F0F0F0', background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', animation: `slide-up 0.25s ease ${idx * 0.05}s both` }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#F0F0F0'}
            >
              {/* Blob avatar */}
              <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: '60% 40% 55% 45%/50% 60% 40% 50%', background: BLOB_COLORS[idx % BLOB_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#111', border: `3px solid ${BLOB_COLORS[idx % BLOB_COLORS.length]}44` }}>
                {kid.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>{kid.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 2 }}>
                  {kid.streak_count > 0 ? `🔥 ${kid.streak_count} day streak · ` : ''} ⚡ {kid.xp} XP
                </div>
              </div>
              {/* Hearts preview */}
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                  <span key={i} style={{ fontSize: 14, filter: i >= kid.hearts ? 'grayscale(1)' : 'none', opacity: i >= kid.hearts ? 0.25 : 1 }}>❤️</span>
                ))}
              </div>
              <span style={{ color: 'var(--ink-dim)', fontSize: 18 }}>›</span>
            </button>
          ))}

          {/* Add kid */}
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)}
              style={{ padding: '17px', borderRadius: 'var(--radius-xl)', border: '2.5px dashed var(--ink-dim)', background: 'none', color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', animation: `slide-up 0.25s ease ${kids.length * 0.05}s both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink-dim)'; e.currentTarget.style.color = 'var(--ink-soft)' }}
            >+ Add a kid</button>
          ) : (
            <form onSubmit={addKid} style={{ padding: '18px', borderRadius: 'var(--radius-xl)', border: '2px solid #F0F0F0', background: 'white', display: 'flex', flexDirection: 'column', gap: 12, animation: 'slide-up 0.2s ease both' }}>
              <label className="field-label">Kid's first name</label>
              <input className="input-field" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emma" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => { setShowAdd(false); setName('') }} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={adding || !name.trim()} style={{ flex: 2, padding: '12px 20px', fontSize: 14 }}>{adding ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
