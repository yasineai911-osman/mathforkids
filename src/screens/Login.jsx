import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login({ onLogin }) {
  const [phone,   setPhone]   = useState('')
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 7) { setError('Phone number too short.'); return }
    if (pin.length !== 4)      { setError('PIN must be 4 digits.'); return }
    setLoading(true)
    try {
      const { data: existing } = await supabase.from('parents').select('*').eq('phone', cleanPhone).maybeSingle()
      if (existing) {
        if (existing.pin !== pin) { setError('Wrong PIN.'); return }
        onLogin(existing); return
      }
      const { data: created, error: err } = await supabase.from('parents').insert({ phone: cleanPhone, pin }).select().single()
      if (err) throw err
      onLogin(created)
    } catch { setError('Something went wrong.') }
    finally  { setLoading(false) }
  }

  return (
    <div className="screen" style={{ justifyContent: 'center', padding: '0 24px 40px' }}>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <div style={{ width: 90, height: 90, borderRadius: '60% 40% 55% 45%/50% 60% 40% 50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, animation: 'bounce 2s ease infinite' }}>
          ⭐
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center' }}>Ten a Day</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600, textAlign: 'center' }}>
          Learn math. Earn rewards. Every day.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">Parent phone number</label>
          <input className="input-field" type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value)} placeholder="514 555 0100" />
        </div>
        <div>
          <label className="field-label">4-digit PIN</label>
          <input className="input-field" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" style={{ letterSpacing: '0.4em' }} />
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 5, fontWeight: 600 }}>New here? This creates your account.</p>
        </div>
        {error && <div style={{ padding: '11px 14px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? 'One sec...' : 'Let\'s go →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-dim)', marginTop: 20, fontWeight: 600 }}>
        No email needed · No data sold · Kids stay safe
      </p>
    </div>
  )
}
