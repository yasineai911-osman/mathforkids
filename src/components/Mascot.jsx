import React from 'react'

export default function Mascot({ mood = 'idle', color = '#FFD03A', size = 160 }) {
  const eyeStyle = {
    width: 10,
    height: mood === 'correct' ? 6 : 10,
    borderRadius: mood === 'correct' ? '0 0 8px 8px' : '50%',
    background: '#111',
    display: 'inline-block',
  }

  const containerAnim = {
    correct:   'bounce 0.6s ease',
    wrong:     'wiggle 0.4s ease',
    celebrate: 'bounce 0.5s ease 0s, bounce 0.5s ease 0.55s',
    idle:      'none',
  }[mood]

  const blobs = {
    idle:      '60% 40% 55% 45% / 50% 60% 40% 50%',
    correct:   '55% 45% 60% 40% / 60% 40% 55% 45%',
    wrong:     '45% 55% 40% 60% / 40% 55% 50% 50%',
    celebrate: '50% 50% 60% 40% / 60% 40% 50% 50%',
  }[mood]

  const glow = {
    correct:   '0 0 0 12px rgba(76,175,130,0.18)',
    wrong:     '0 0 0 12px rgba(255,107,107,0.18)',
    celebrate: '0 0 0 16px rgba(124,92,252,0.18)',
    idle:      'none',
  }[mood]

  const moodColor = {
    correct:   '#4CAF82',
    wrong:     '#FF6B6B',
    celebrate: '#7C5CFC',
    idle:      color,
  }[mood]

  return (
    <div style={{
      width: size, height: size,
      borderRadius: blobs,
      background: moodColor,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10,
      animation: containerAnim,
      boxShadow: glow,
      transition: 'background 0.25s, border-radius 0.3s, box-shadow 0.3s',
      position: 'relative', userSelect: 'none',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={eyeStyle} />
        <div style={eyeStyle} />
      </div>
      <div style={{
        width: mood === 'wrong' ? 20 : 28,
        height: mood === 'wrong' ? 4 : 10,
        borderRadius: mood === 'wrong' ? '0 0 8px 8px' : '0 0 30px 30px',
        background: '#111',
        transform: mood === 'wrong' ? 'scaleY(-1)' : 'none',
        transition: 'all 0.2s',
      }} />
      {mood === 'celebrate' && (
        <>
          <span style={{ position: 'absolute', top: -14, right: -10, fontSize: 20, animation: 'pop-in 0.3s ease' }}>✨</span>
          <span style={{ position: 'absolute', bottom: -10, left: -14, fontSize: 16, animation: 'pop-in 0.4s ease 0.1s both' }}>⭐</span>
        </>
      )}
    </div>
  )
}
