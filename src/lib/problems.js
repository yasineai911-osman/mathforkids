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

// ── Original range-based generator (kept for 'all'/mixed/legacy use) ──
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

// ── Table-locked generator — used for per-table practice/speed nodes ──
// `table` is the fixed operand (e.g. 7 for the ×7 table). The other
// operand varies 1-10 (or 1-12 for + / -, to keep it interesting).
export function generateTableEquation(op, table) {
  let a, b, answer, text

  if (op === '+') {
    a = table; b = randInt(1, 12)
    answer = a + b; text = `${a} + ${b}`
  } else if (op === '-') {
    // table = the number being subtracted (e.g. -7 table: always "_ − 7")
    b = table; a = table + randInt(0, 10)
    answer = a - b; text = `${a} − ${b}`
  } else if (op === '*') {
    a = table; b = randInt(1, 10)
    answer = a * b; text = `${a} × ${b}`
  } else if (op === '/') {
    b = table; const quotient = randInt(1, 10)
    a = b * quotient; answer = quotient; text = `${a} ÷ ${b}`
  }

  return { text, answer, choices: makeChoices(answer, 0, table * 12 + 10), type: 'equation' }
}

// ── Mixed generator across all tables seen in a world (for boss nodes) ──
export function generateMixedEquation(op) {
  const table = randInt(1, 10)
  return generateTableEquation(op, table)
}
