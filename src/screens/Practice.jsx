import React, { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { generateProblem } from '../lib/problems.js'
import ProgressBeads from '../components/ProgressBeads.jsx'
import Mascot from '../components/Mascot.jsx'

const SESSION_LENGTH = 10
const FEEDBACK_DELAY = 800

const CHOICE_BASE = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '100%', padding: '20px 24px',
  borderRadius: 'var(--radius-lg)',
  fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em',
  border: '2.5px solid transparent', cursor: 'pointer',
  transition: 'all 0.15s', boxShadow: '0 4px 0 rgba(0,0,0,0.10)',
  fontFamily: 'var(--font)',
}

function choiceStyle(choice, answer, selected, feedback) {
  if (!feedback) return { ...CHOICE_BASE, background: 'var(--white)', color: 'var(--ink)' }
  if (choice === answer) return { ...CHOICE_BASE, background: 'var(--green-light)', color: 'var(--green)', borderColor: 'var(--green)', boxShadow: '0 4px 0 rgba(76,175,130,0.25)' }
  if (choice === selected && feedback === 'wrong') return { ...CHOICE_BASE, background: 'var(--red-light)', color: 'var(--red)', borderColor: 'var(--red)', boxShadow: '0 4px 0 rgba(255,107,107,0.2)' }
  return { ...CHOICE_BASE, background: 'var(--white)', color: 'var(--ink-dim)', opacity: 0.45 }
}

export default function Practice({ kid, onFinish, onBack }) {
  const [index,        setIndex]        = useState(0)
  const [problem,      setProblem]      = useState(() => generateProblem(kid.grade))
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback,     setFeedback]     = useState(null)
  const [selected,     setSelected]     = useState(null)
  const [locked,       setLocked]       = useState(false)

  const handleAnswer = useCallback(async (choice) => {
    if (locked) return
    setLocked(true)
    setSelected(choice)
    const isCorrect = choice === problem.answer
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setCorrectCount(c => c + 1)

    supabase.from('attempts').insert({
      kid_id: kid.id, problem: problem.text,
      correct_answer: problem.answer, kid_answer: choice, is_correct: isCorrect,
    }).then(() => {})

    setTimeout(() => {
      const nextIndex = index + 1
      if (nextIndex >= SESSION_LENGTH) {
        onFinish(correctCount + (isCorrect ? 1 : 0))
      } else {
        setIndex(nextIndex); setProblem(generateProblem(kid.grade))
        setFeedback(null); setSelected(null); setLocked(false)
      }
    }, FEEDBACK_DELAY)
  }, [locked, problem, index, correctCount, kid, onFinish])

  const mascotMood = feedback === 'correct' ? 'correct' : feedback === 'wrong' ? 'wrong' : 'idle'

  return (
    <div className="screen" style={{ paddingTop: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 24px' }}>
        <button onClick={onBack} className="btn-ghost" style={{ padding: '8px 12px', fontSize: 20 }}>←</button>
        <ProgressBeads total={SESSION_LENGTH} filled={index} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', minWidth: 32, textAlign: 'right' }}>{index + 1}/{SESSION_LENGTH}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <Mascot mood={mascotMood} color="var(--yellow)" size={130} />
        <div key={problem.text} className="pop-in" style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, textAlign: 'center' }}>
          {problem.text}
        </div>
        {feedback === 'wrong' && (
          <div className="pop-in" style={{ padding: '10px 20px', background: 'var(--red-light)', borderRadius: 99, fontSize: 14, fontWeight: 800, color: 'var(--red)' }}>
            Almost! It's {problem.answer}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
        {problem.choices.map(choice => (
          <button key={choice} disabled={locked} onClick={() => handleAnswer(choice)}
            style={choiceStyle(choice, problem.answer, selected, feedback)}
            onMouseEnter={e => { if (!locked) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = '' }}
          >{choice}</button>
        ))}
      </div>
    </div>
  )
}
