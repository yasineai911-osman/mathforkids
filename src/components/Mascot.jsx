import React from 'react'

export default function Mascot({ mood = 'idle', size = 120 }) {
  const colors  = { idle: '#FFD03A', correct: '#58CC02', wrong: '#FF4B4B', celebrate: '#7C5CFC' }
  const blobs   = { idle: '60% 40% 55% 45%/50% 60% 40% 50%', correct: '55% 45% 60% 40%/60% 40% 55% 45%', wrong: '45% 55% 40% 60%/40% 55% 50% 50%', celebrate: '50% 50% 60% 40%/60% 40% 50% 50%' }
  const anims   = { correct: 'bounce 0.5s ease', wrong: 'wiggle 0.4s ease', celebrate: 'bounce 0.5s ease 0s, bounce 0.5s ease 0.5s', idle: 'none' }
  const eyeH    = mood === 'correct' ? 5 : 10
  const eyeR    = mood === 'correct' ? '0 0 6px 6px' : '50%'
  const mouthW  = mood === 'wrong' ? 18 : 26
  const mouthH  = mood === 'wrong' ? 4 : 9
  const mouthFlip = mood === 'wrong' ? 'scaleY(-1)' : 'none'

  return (
    <div className="mascot" style={{ width: size, height: size, background: colors[mood], borderRadius: blobs[mood], animation: anims[mood], position: 'relative' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 10, height: eyeH, borderRadius: eyeR, background: '#111' }} />
        <div style={{ width: 10, height: eyeH, borderRadius: eyeR, background: '#111' }} />
      </div>
      <div style={{ width: mouthW, height: mouthH, borderRadius: '0 0 20px 20px', background: '#111', transform: mouthFlip, transition: 'all 0.2s' }} />
      {mood === 'celebrate' && <>
        <span style={{ position: 'absolute', top: -12, right: -8, fontSize: 18, animation: 'pop-in 0.3s ease' }}>✨</span>
        <span style={{ position: 'absolute', bottom: -8, left: -12, fontSize: 14, animation: 'pop-in 0.4s ease 0.1s both' }}>⭐</span>
      </>}
    </div>
  )
}
