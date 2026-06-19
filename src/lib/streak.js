import { supabase } from './supabase.js'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  return Math.round((new Date(a) - new Date(b)) / 86_400_000)
}

export async function completeSession(kid) {
  const today = todayStr()
  let newStreak        = 1
  let alreadyDoneToday = false

  if (kid.last_session_date) {
    const diff = daysBetween(today, kid.last_session_date)
    if (diff === 0)      { newStreak = kid.streak_count; alreadyDoneToday = true }
    else if (diff === 1) { newStreak = kid.streak_count + 1 }
    else                 { newStreak = 1 }
  }

  if (!alreadyDoneToday) {
    await supabase
      .from('kids')
      .update({ streak_count: newStreak, last_session_date: today })
      .eq('id', kid.id)
  }

  return newStreak
}
