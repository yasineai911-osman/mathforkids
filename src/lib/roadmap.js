// ── Roadmap definition ─────────────────────────────────────────
// 11 nodes + milestone chests. Each node defines the operation,
// max number, question type, and XP reward.

export const ROADMAP = [
  {
    id: 1, type: 'node', op: '+', maxNum: 10, mode: 'equation',
    icon: '⭐', label: 'Add to 10', section: 'Section 1 · Addition',
    sectionTitle: 'Master adding small numbers',
    xpReward: 20, color: 'var(--green)',
  },
  {
    id: 2, type: 'node', op: '+', maxNum: 10, mode: 'situation',
    icon: '📖', label: 'Real life', section: 'Section 1 · Addition',
    sectionTitle: 'Master adding small numbers',
    xpReward: 25, color: 'var(--green)',
  },
  {
    id: 'chest1', type: 'chest', icon: '🎁',
    label: 'Bonus XP!', xpReward: 30,
  },
  {
    id: 3, type: 'node', op: '-', maxNum: 10, mode: 'equation',
    icon: '⭐', label: 'Subtract to 10', section: 'Section 2 · Subtraction',
    sectionTitle: 'Take numbers apart',
    xpReward: 20, color: 'var(--blue)',
  },
  {
    id: 4, type: 'node', op: '-', maxNum: 10, mode: 'situation',
    icon: '📖', label: 'Real life', section: 'Section 2 · Subtraction',
    sectionTitle: 'Take numbers apart',
    xpReward: 25, color: 'var(--blue)',
  },
  {
    id: 5, type: 'node', op: '+-', maxNum: 20, mode: 'equation',
    icon: '⭐', label: '+ − to 20', section: 'Section 3 · Mixed',
    sectionTitle: 'Add and subtract bigger numbers',
    xpReward: 30, color: 'var(--purple)',
  },
  {
    id: 6, type: 'node', op: '+-', maxNum: 20, mode: 'situation',
    icon: '📖', label: 'Real life', section: 'Section 3 · Mixed',
    sectionTitle: 'Add and subtract bigger numbers',
    xpReward: 35, color: 'var(--purple)',
  },
  {
    id: 'chest2', type: 'chest', icon: '🎁',
    label: 'Bonus XP!', xpReward: 50,
  },
  {
    id: 7, type: 'node', op: '*', maxNum: 10, mode: 'equation',
    icon: '⭐', label: 'Times tables', section: 'Section 4 · Multiplication',
    sectionTitle: 'Multiply 2, 5 and 10',
    xpReward: 35, color: 'var(--orange)',
  },
  {
    id: 8, type: 'node', op: '*', maxNum: 10, mode: 'situation',
    icon: '📖', label: 'Real life', section: 'Section 4 · Multiplication',
    sectionTitle: 'Multiply 2, 5 and 10',
    xpReward: 40, color: 'var(--orange)',
  },
  {
    id: 9, type: 'node', op: '/', maxNum: 10, mode: 'equation',
    icon: '⭐', label: 'Divide', section: 'Section 5 · Division',
    sectionTitle: 'Share things equally',
    xpReward: 40, color: 'var(--red)',
  },
  {
    id: 10, type: 'node', op: '/', maxNum: 10, mode: 'situation',
    icon: '📖', label: 'Real life', section: 'Section 5 · Division',
    sectionTitle: 'Share things equally',
    xpReward: 45, color: 'var(--red)',
  },
  {
    id: 'chest3', type: 'chest', icon: '🏆',
    label: 'Grand prize!', xpReward: 100,
  },
  {
    id: 11, type: 'node', op: 'all', maxNum: 50, mode: 'situation',
    icon: '🏆', label: 'Final boss', section: 'Section 6 · Master',
    sectionTitle: 'Show everything you know',
    xpReward: 100, color: 'var(--yellow)',
  },
]

export function getNodeById(id) {
  return ROADMAP.find(n => n.id === id || n.id === Number(id))
}

export function getNodeIndex(id) {
  return ROADMAP.findIndex(n => n.id === id || n.id === Number(id))
}

// Returns 'completed' | 'current' | 'locked'
export function getNodeStatus(nodeId, progress) {
  const idx         = getNodeIndex(nodeId)
  const currentIdx  = getNodeIndex(progress.current_node_id)
  if (idx < currentIdx)  return 'completed'
  if (idx === currentIdx) return 'current'
  return 'locked'
}
