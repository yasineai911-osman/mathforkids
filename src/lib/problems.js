const MAX_BY_LEVEL = { 1: 10, 2: 20, 3: 50 }

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateProblem(level = 1) {
  const max = MAX_BY_LEVEL[level] ?? 10
  const op  = Math.random() < 0.5 ? '+' : '-'

  let a = randInt(1, max)
  let b = randInt(1, max)
  if (op === '-' && b > a) [a, b] = [b, a]

  const answer = op === '+' ? a + b : a - b

  const choices = new Set([answer])
  let attempts = 0
  while (choices.size < 3 && attempts < 40) {
    attempts++
    const delta     = randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1)
    const candidate = answer + delta
    if (candidate >= 0 && candidate !== answer) choices.add(candidate)
  }

  return { text: `${a} ${op} ${b}`, answer, choices: shuffle([...choices]) }
}
