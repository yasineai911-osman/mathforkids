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

function makeChoices(answer, min = 0, max = 99) {
  const choices = new Set([answer])
  let attempts = 0
  while (choices.size < 3 && attempts < 50) {
    attempts++
    const delta = randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1)
    const c = answer + delta
    if (c >= min && c !== answer) choices.add(c)
  }
  return shuffle([...choices])
}

export function generateEquation(op, maxNum) {
  let a, b, answer, text

  if (op === '+') {
    a = randInt(1, maxNum); b = randInt(1, maxNum - a > 0 ? maxNum - a : 1)
    answer = a + b; text = `${a} + ${b}`
  } else if (op === '-') {
    a = randInt(2, maxNum); b = randInt(1, a)
    answer = a - b; text = `${a} − ${b}`
  } else if (op === '*') {
    const tables = [2, 5, 10]
    a = tables[randInt(0, tables.length - 1)]; b = randInt(1, 10)
    answer = a * b; text = `${a} × ${b}`
  } else if (op === '/') {
    b = [2, 5, 10][randInt(0, 2)]; answer = randInt(1, 10)
    a = b * answer; text = `${a} ÷ ${b}`
  } else {
    // mixed +- 
    const mixOp = Math.random() < 0.5 ? '+' : '-'
    if (mixOp === '+') {
      a = randInt(1, maxNum); b = randInt(1, maxNum - a > 0 ? maxNum - a : 1)
      answer = a + b; text = `${a} + ${b}`
    } else {
      a = randInt(2, maxNum); b = randInt(1, a)
      answer = a - b; text = `${a} − ${b}`
    }
  }

  return { text, answer, choices: makeChoices(answer, 0, maxNum * 2 + 10), type: 'equation' }
}
