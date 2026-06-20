import { supabase } from './supabase.js'

export const MAX_HEARTS      = 5
export const HEART_XP_COST   = 30   // XP to buy 1 heart
export const XP_PER_CORRECT  = 10
export const STREAK_BONUS    = 0.5  // 50% bonus per streak day (capped at 3x)

export function calcXP(correct, streakDays) {
  const multiplier = Math.min(1 + (streakDays * STREAK_BONUS), 3)
  return Math.round(correct * XP_PER_CORRECT * multiplier)
}

export async function awardXP(kidId, amount) {
  const { data, error } = await supabase.rpc('increment_xp', { kid_id: kidId, amount })
  if (error) console.error('awardXP error:', error)
  return data
}

export async function spendXP(kidId, amount) {
  const { data, error } = await supabase.rpc('spend_xp', { kid_id: kidId, amount })
  if (error) console.error('spendXP error:', error)
  return data  // returns false if not enough XP
}

export async function loseHeart(kidId) {
  const { data, error } = await supabase.rpc('lose_heart', { kid_id: kidId })
  if (error) console.error('loseHeart error:', error)
  return data  // returns new heart count
}

export async function buyHeart(kidId) {
  // Spends XP and adds 1 heart (up to max)
  const { data, error } = await supabase.rpc('buy_heart', { kid_id: kidId, cost: HEART_XP_COST })
  if (error) console.error('buyHeart error:', error)
  return data  // returns { success, hearts, xp }
}

export async function refillHeartsIfNeeded(kid) {
  // Hearts refill daily — if last_heart_refill was not today, reset to 5
  const today = new Date().toISOString().slice(0, 10)
  if (kid.last_heart_refill !== today) {
    await supabase
      .from('kids')
      .update({ hearts: MAX_HEARTS, last_heart_refill: today })
      .eq('id', kid.id)
    return MAX_HEARTS
  }
  return kid.hearts
}
