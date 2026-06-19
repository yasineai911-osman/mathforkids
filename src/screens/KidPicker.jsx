import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import StreakBadge from '../components/StreakBadge.jsx'

const LEVELS = [
  { value: 1, label: 'Just starting',       hint: 'Numbers up to 10', color: '#4CAF82' },
  { value: 2, label: 'Getting comfortable',  hint: 'Numbers up to 20', color: '#7C5CFC' },
  { value: 3, label: 'Confident',            hint: 'Numbers up to 50', color: '#FFD03A' },
]
const BLOB_COLORS = ['#FFD03A', '#7C5CFC', '#4CAF82', '#FF6B6B', '#FF9B3A']

export default function KidPicker({ parent, onStartPractice, onOpenDashboard, onLogout }) {
  const [kids,    setKids]    = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name,    setName]    = useState('')
  const [level,   setLevel]   = useState(1)
  const [adding,  setAdding]  = useState(false)

  useEffect(() => { loadKids() }, [])

  async function loadKids() {
    setLoading(true)
    const { data } = await supabase.from('kids').select('*')
      .eq('parent_id', parent.id).order('created_at', { ascending: true })
    setKids(data || [])
    setLoading(false)
  }

  async function addKid(e) {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    const { data, error } = await supabase
      .from('kids').insert({ parent_id: parent.id, name: name.trim(), grade: level })
      .select().single()
    if (!error) { setKids(prev => [...prev, data]); setName(''); setLevel(1); setShowAdd(false) }
    setAdding(false)
  }

  return (
    <div className="screen" style={{ paddingTop: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 0', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>⭐</span>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em' }}>Ten a Day</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-ghost" onClick={onOpenDashboard} style={{ padding: '8px 14px' }}>Progress</button>
          <button className="btn-ghost" onClick={onLogout} style={{ padding: '8px 14px' }}>Sign out</button>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 28 }}>Who's practising today?</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-dim)', fontSize: 28 }}>⏳</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {kids.map((kid, idx) => (
            <button key={kid.id} onClick={() => onStartPractice(kid)} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s, box-shadow 0.15s', animation: `slide-up 0.3s ease ${idx * 0.06}s both` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%', background: BLOB_COLORS[idx % BLOB_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#111' }}>
                {kid.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 3 }}>{kid.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{LEVELS.find(l => l.value === kid.grade)?.label}</div>
              </div>
              {kid.streak_count > 0 && <StreakBadge count={kid.streak_count} size="sm" />}
              <span style={{ color: 'var(--ink-dim)', fontSize: 18 }}>›</span>
            </button>
          ))}

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)}
              style={{ padding: '18px', borderRadius: 'var(--radius-lg)', border: '2.5px dashed var(--ink-dim)', background: 'none', color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', animation: `slide-up 0.3s ease ${kids.length * 0.06}s both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink-dim)'; e.currentTarget.style.color = 'var(--ink-soft)' }}
            >+ Add a kid</button>
          ) : (
            <form onSubmit={addKid} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'slide-up 0.25s ease both' }}>
              <label className="field-label">Kid's first name</label>
              <input className="input-field" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emma" />
              <label className="field-label" style={{ marginBottom: -6 }}>Level</label>
              {LEVELS.map(l => (
                <label key={l.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${level === l.value ? l.color : 'transparent'}`, background: level === l.value ? `${l.color}18` : 'rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span>
                    <span style={{ fontSize: 14, fontWeight: 800, display: 'block' }}>{l.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{l.hint}</span>
                  </span>
                  <input type="radio" name="level" checked={level === l.value} onChange={() => setLevel(l.value)} style={{ accentColor: l.color, width: 18, height: 18 }} />
                </label>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowAdd(false); setName(''); setLevel(1) }} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={adding || !name.trim()} style={{ flex: 2 }}>{adding ? 'Adding...' : 'Add kid'}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
