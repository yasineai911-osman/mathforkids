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
    if (cleanPhone.length < 7) { setError('That phone number looks too short.'); return }
    if (pin.length !== 4)      { setError('Your PIN should be 4 digits.'); return }

    setLoading(true)
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('parents').select('*').eq('phone', cleanPhone).maybeSingle()
      if (fetchErr) throw fetchErr
      if (existing) {
        if (existing.pin !== pin) { setError('Wrong PIN for this number.'); return }
        onLogin(existing); return
      }
      const { data: created, error: insertErr } = await supabase
        .from('parents').insert({ phone: cleanPhone, pin }).select().single()
      if (insertErr) throw insertErr
      onLogin(created)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen" style={{ justifyContent: 'center', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div className="pop-in" style={{
          width: 100, height: 100,
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          background: 'var(--yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
        }}>⭐</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>Ten a Day</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 600 }}>Two minutes of math, every day.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="field-label">Your phone number</label>
          <input className="input-field" type="tel" inputMode="numeric" value={phone}
            onChange={e => setPhone(e.target.value)} placeholder="514 555 0100" />
        </div>
        <div>
          <label className="field-label">4-digit PIN</label>
          <input className="input-field" type="password" inputMode="numeric" maxLength={4}
            value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••" style={{ letterSpacing: '0.4em' }} />
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6, fontWeight: 600 }}>
            First time? This creates your account.
          </p>
        </div>
        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>
            {error}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'One sec...' : 'Continue →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-dim)', marginTop: 24, fontWeight: 600 }}>
        No email needed. Nothing about your kid leaves this app.
      </p>
    </div>
  )
}
