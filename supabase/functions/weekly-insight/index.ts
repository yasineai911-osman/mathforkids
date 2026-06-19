import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { kid_id } = await req.json()
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: attempts } = await supabase
      .from('attempts').select('problem, correct_answer, kid_answer, is_correct')
      .eq('kid_id', kid_id).gte('created_at', since).limit(100)

    if (!attempts || attempts.length === 0) {
      return new Response(JSON.stringify({ insight: 'No practice this week yet — come back after a session!' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const total   = attempts.length
    const correct = attempts.filter(a => a.is_correct).length
    const pct     = Math.round((correct / total) * 100)
    const wrong   = attempts.filter(a => !a.is_correct).slice(0, 10).map(a => `${a.problem} = ${a.correct_answer} (got ${a.kid_answer})`).join(', ')

    const prompt = `You are a supportive elementary math coach writing a one-sentence insight for a parent. This week their child answered ${total} problems and got ${pct}% correct. Wrong answers: ${wrong || 'none'}. Write one warm, specific encouraging sentence under 25 words.`

    const aiRes  = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 80 }),
    })
    const aiJson  = await aiRes.json()
    const insight = aiJson.choices?.[0]?.message?.content?.trim() ?? `${pct}% accuracy this week — keep going!`

    return new Response(JSON.stringify({ insight }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
