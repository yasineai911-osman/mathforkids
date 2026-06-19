import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import StreakBadge from '../components/StreakBadge.jsx'

const BLOB_COLORS = ['#FFD03A', '#7C5CFC', '#4CAF82', '#FF6B6B', '#FF9B3A']

function StatPill({ label, value, color = 'var(--purple)' }) {
  return (
    <div style={{ flex: 1, padding: '14px 16px', background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: '-0.03em', marginBottom: 3 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

function KidCard({ kid, stats, insight, onGetInsight, insightLoading, idx }) {
  const accuracy = stats?.accuracy ?? null
  const total    = stats?.total    ?? null

  return (
    <div className="card" style={{ padding: '20px', animation: `slide-up 0.3s ease ${idx * 0.08}s both` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%', background: BLOB_COLORS[idx % BLOB_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>
          {kid.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 2 }}>{kid.name}</div>
          {kid.streak_count > 0 && <StreakBadge count={kid.streak_count} size="sm" />}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <StatPill label="Questions" value={total}    color="var(--ink)" />
        <StatPill label="Accuracy"  value={accuracy != null ? `${accuracy}%` : null} color="var(--green)" />
        <StatPill label="Streak"    value={`${kid.streak_count || 0}d`} color="#7A5A00" />
      </div>

      {accuracy != null && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: accuracy >= 80 ? 'var(--green)' : accuracy >= 60 ? 'var(--purple)' : 'var(--red)' }}>{accuracy}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: accuracy >= 80 ? 'var(--green)' : accuracy >= 60 ? 'var(--purple)' : 'var(--red)', width: `${accuracy}%`, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      )}

      {insight ? (
        <div style={{ padding: '12px 16px', background: 'var(--purple-light)', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, color: '#4a3a8a', lineHeight: 1.6 }}>
          💡 {insight}
        </div>
      ) : (
        <button onClick={() => onGetInsight(kid)} disabled={insightLoading}
          style={{ width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--purple-light)', background: 'none', color: 'var(--purple)', fontSize: 13, fontWeight: 800, cursor: insightLoading ? 'not-allowed' : 'pointer', opacity: insightLoading ? 0.6 : 1, transition: 'all 0.15s', fontFamily: 'var(--font)' }}
          onMouseEnter={e => { if (!insightLoading) e.currentTarget.style.background = 'var(--purple-light)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
        >
          {insightLoading ? 'Thinking...' : "✨ Get this week's insight"}
        </button>
      )}
    </div>
  )
}

export default function ParentDashboard({ parent, onBack }) {
  const [kids,           setKids]           = useState([])
  const [stats,          setStats]          = useState({})
  const [insights,       setInsights]       = useState({})
  const [insightLoading, setInsightLoading] = useState(null)
  const [loading,        setLoading]        = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: kidsData } = await supabase.from('kids').select('*').eq('parent_id', parent.id)
    setKids(kidsData || [])
    for (const kid of kidsData || []) {
      const { data: attempts } = await supabase.from('attempts').select('is_correct').eq('kid_id', kid.id)
      const total   = attempts?.length || 0
      const correct = attempts?.filter(a => a.is_correct).length || 0
      setStats(s => ({ ...s, [kid.id]: { total, accuracy: total ? Math.round((correct / total) * 100) : null } }))
    }
    setLoading(false)
  }

  async function getInsight(kid) {
    setInsightLoading(kid.id)
    try {
      const { data, error } = await supabase.functions.invoke('weekly-insight', { body: { kid_id: kid.id } })
      if (error) throw error
      setInsights(i => ({ ...i, [kid.id]: data.insight }))
    } catch {
      setInsights(i => ({ ...i, [kid.id]: "Couldn't get an insight right now." }))
    } finally {
      setInsightLoading(null)
    }
  }

  return (
    <div className="screen" style={{ paddingTop: 0, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 28px' }}>
        <button onClick={onBack} className="btn-ghost" style={{ padding: '8px 12px', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em' }}>Progress</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 28 }}>⏳</div>
      ) : kids.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👶</div>
          <p style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>No kids added yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {kids.map((kid, idx) => (
            <KidCard key={kid.id} kid={kid} idx={idx} stats={stats[kid.id]} insight={insights[kid.id]} onGetInsight={getInsight} insightLoading={insightLoading === kid.id} />
          ))}
        </div>
      )}
    </div>
  )
}
