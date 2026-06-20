import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { generateTableEquation, generateMixedEquation } from '../lib/problems.js'
import { MAX_HEARTS } from '../lib/xp.js'
import Mascot from '../components/Mascot.jsx'

const SESSION_LENGTH  = 10
const FEEDBACK_MS     = 900
const SPEED_SECONDS    = 5   // per-question timer for speed nodes

const OP_LABELS = { '+': 'Addition', '-': 'Subtraction', '*': 'Multiplication', '/': 'Division' }

async function fetchSituationQuestion(node) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-question', {
      body: { op: node.op, maxNum: node.scope === 'world' ? null : node.table, level: node.id }
    })
    if (error || !data?.question) throw new Error('failed')
    return { text: data.question, answer: data.answer, choices: data.choices, type: 'situation' }
  } catch {
    // Fallback to a plain table/mixed equation if the AI call fails
    const eq = node.scope === 'world' ? generateMixedEquation(node.op) : generateTableEquation(node.op, node.table)
    return { ...eq, type: 'equation' }
  }
}

function buildEquationQuestion(node) {
  const eq = node.scope === 'world' ? generateMixedEquation(node.op) : generateTableEquation(node.op, node.table)
  return { ...eq, type: 'equation' }
}

export default function Practice({ node, kid, onFinish, onBack }) {
  const [questions,    setQuestions]    = useState([])
  const [index,        setIndex]        = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [hearts,       setHearts]       = useState(kid.hearts)
  const [feedback,     setFeedback]     = useState(null)
  const [selected,     setSelected]     = useState(null)
  const [locked,       setLocked]       = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [timeLeft,     setTimeLeft]     = useState(SPEED_SECONDS)

  const isSpeed = node.mode === 'speed'
  const isIRL   = node.mode === 'situation'

  // Pre-generate all questions for this node based on its mode
  useEffect(() => {
    async function buildQuestions() {
      const qs = []
      for (let i = 0; i < SESSION_LENGTH; i++) {
        if (isIRL) {
          qs.push(await fetchSituationQuestion(node))
        } else {
          // table-practice and speed nodes both use plain equations,
          // scoped to a single table or mixed across the world
          qs.push(buildEquationQuestion(node))
        }
      }
      setQuestions(qs)
      setLoading(false)
    }
    buildQuestions()
  }, [])

  const current  = questions[index]
  const progress = (index / SESSION_LENGTH) * 100

  // Speed-mode countdown per question
  useEffect(() => {
    if (!isSpeed || loading || locked || !current) return
    setTimeLeft(SPEED_SECONDS)
    const tick = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(tick)
          handleAnswer(null) // time ran out — counts as wrong
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [index, loading, isSpeed])

  const handleAnswer = useCallback(async (choice) => {
    if (locked || !current) return
    setLocked(true)
    setSelected(choice)
    const isCorrect = choice === current.answer

    if (!isCorrect) {
      const newHearts = hearts - 1
      setHearts(newHearts)
      await supabase.from('kids').update({ hearts: newHearts }).eq('id', kid.id)
      if (newHearts <= 0) {
        setFeedback('wrong')
        setTimeout(() => onFinish({ correctCount, totalHearts: 0, outOfHearts: true }), 1400)
        return
      }
    } else {
      setCorrectCount(c => c + 1)
    }
    setFeedback(isCorrect ? 'correct' : 'wrong')

    supabase.from('attempts').insert({ kid_id: kid.id, problem: current.text, correct_answer: current.answer, kid_answer: choice, is_correct: isCorrect, node_id: node.id }).then(() => {})

    setTimeout(() => {
      const next = index + 1
      if (next >= SESSION_LENGTH) {
        onFinish({ correctCount: correctCount + (isCorrect ? 1 : 0), totalHearts: isCorrect ? hearts : hearts - 1, outOfHearts: false })
      } else {
        setIndex(next); setFeedback(null); setSelected(null); setLocked(false)
      }
    }, FEEDBACK_MS)
  }, [locked, current, hearts, index, correctCount, kid, node, onFinish])

  const mascotMood = feedback === 'correct' ? 'correct' : feedback === 'wrong' ? 'wrong' : 'idle'

  if (loading) {
    return (
      <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>⏳</div>
        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: 'var(--ink-soft)' }}>Getting your questions ready...</p>
      </div>
    )
  }

  return (
    <div className="screen" style={{ paddingBottom: feedback ? 160 : 0 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 12px' }}>
        <button onClick={onBack} style={{ fontSize: 18, color: 'var(--ink-soft)', padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>✕</button>
        <div className="practice-progress">
          <div className="practice-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {/* Single heart icon + count */}
        <div className="heart-pill" style={{ flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--red)" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-10.2-9.1C.3 9.1 1.2 5.6 4.4 4.2c2.4-1 4.9-.2 6.6 1.7l1 1.1 1-1.1c1.7-1.9 4.2-2.7 6.6-1.7 3.2 1.4 4.1 4.9 2.6 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
          <span className="heart-count">{hearts}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', gap: 0 }}>
        {/* Mode badge */}
        {current && (
          <div style={{ marginBottom: 20, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="difficulty-badge" style={{ background: isIRL ? 'var(--purple-light)' : isSpeed ? 'var(--yellow-light)' : 'var(--blue-light)', color: isIRL ? 'var(--purple)' : isSpeed ? '#7A5500' : 'var(--blue)' }}>
              {isIRL ? '🌍 Real life' : isSpeed ? '⚡ Speed' : `🔢 ${OP_LABELS[node.op]}`}
              &nbsp;· {node.scope === 'world' ? 'Mixed' : `Table ${node.table}`}
            </span>
            {isSpeed && (
              <span style={{ fontSize: 13, fontWeight: 800, color: timeLeft <= 2 ? 'var(--red)' : 'var(--ink-soft)' }}>
                ⏱ {timeLeft}s
              </span>
            )}
          </div>
        )}

        {/* Mascot + question */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginBottom: 28, flex: 1, justifyContent: 'center' }}>
          <Mascot mood={mascotMood} size={100} />
          {current && (
            <div key={index} className="pop-in" style={{ textAlign: 'center' }}>
              {current.type === 'situation' ? (
                <p style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.4, color: 'var(--ink)', maxWidth: 320 }}>{current.text}</p>
              ) : (
                <p style={{ fontSize: 58, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{current.text}</p>
              )}
            </div>
          )}
        </div>

        {/* Answer choices */}
        {current && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 24 }}>
            {current.choices.map((choice, i) => {
              let cls = 'answer-btn'
              if (feedback) {
                if (choice === current.answer) cls += ' correct'
                else if (choice === selected)  cls += ' wrong'
                else                            cls += ' dimmed'
              }
              return (
                <button key={i} className={cls} disabled={locked} onClick={() => handleAnswer(choice)}>
                  {choice}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Feedback footer */}
      {feedback && (
        <div className={`feedback-footer ${feedback}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{feedback === 'correct' ? '✅' : '❌'}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: feedback === 'correct' ? 'var(--green-dark)' : 'var(--red-dark)' }}>
                {feedback === 'correct' ? 'Correct! +10 XP' : `The answer is ${current?.answer}`}
              </div>
              {feedback === 'wrong' && hearts <= 1 && (
                <div style={{ fontSize: 13, color: 'var(--red)', fontWeight: 700, marginTop: 2 }}>Last heart! Be careful ❤️</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
