// ── Roadmap definition v3 ──────────────────────────────────────
// 4 worlds (+ − × ÷), fixed unlock order.
// Each world = 10 tables (1-10), each table = 3 nodes:
//   1. table   — practice that single table until mastered
//   2. irl     — real-life word problem using only that table
//   3. speed   — timed challenge using only that table
// After all 10 tables in a world are done, 2 boss nodes:
//   1. world-irl   — mixed real-life problems across the whole world
//   2. world-speed — mixed timed challenge across the whole world
// Total: 4 × (10 × 3 + 2) = 128 nodes

const WORLDS = [
  { op: '+', name: 'Addition',       color: 'var(--green)',  light: 'var(--green-light)',  dark: 'var(--green-dark)',  icon: '➕' },
  { op: '-', name: 'Subtraction',    color: 'var(--blue)',   light: 'var(--blue-light)',   dark: '#0E8FD0',            icon: '➖' },
  { op: '*', name: 'Multiplication', color: 'var(--orange)', light: 'var(--orange-light)', dark: '#CC7700',            icon: '✖️' },
  { op: '/', name: 'Division',       color: 'var(--red)',    light: 'var(--red-light)',    dark: 'var(--red-dark)',    icon: '➗' },
]

const STAGE_META = {
  table: { icon: '⭐', labelSuffix: '',          xpReward: 20, mode: 'table' },
  irl:   { icon: '📖', labelSuffix: ' · Real life', xpReward: 25, mode: 'situation' },
  speed: { icon: '⚡', labelSuffix: ' · Speed',     xpReward: 30, mode: 'speed' },
}

function buildRoadmap() {
  const nodes = []
  let order = 0

  WORLDS.forEach((world, wIdx) => {
    const section = `World ${wIdx + 1} · ${world.name}`

    for (let table = 1; table <= 10; table++) {
      const sectionTitle = `Master the ${world.op === '*' ? '×' : world.op === '/' ? '÷' : world.op}${table} table`

      ;(['table', 'irl', 'speed']).forEach(stage => {
        const meta = STAGE_META[stage]
        order++
        nodes.push({
          id: order,
          type: 'node',
          op: world.op,
          table,                       // which single table this node drills
          scope: 'table',              // 'table' = single table, 'world' = mixed
          mode: meta.mode,
          icon: meta.icon,
          label: `${world.op === '*' ? '×' : world.op === '/' ? '÷' : world.op}${table}${meta.labelSuffix}`,
          section,
          sectionTitle,
          xpReward: meta.xpReward,
          color: world.color,
          colorLight: world.light,
          colorDark: world.dark,
          world: wIdx,
        })
      })
    }

    // End-of-world boss nodes — mixed across all 10 tables
    order++
    nodes.push({
      id: order, type: 'node', op: world.op, table: null, scope: 'world',
      mode: 'situation', icon: '🌍',
      label: `${world.name} · Mixed real life`,
      section, sectionTitle: `Show what you know — all of ${world.name}`,
      xpReward: 60, color: world.color, colorLight: world.light, colorDark: world.dark, world: wIdx,
    })

    order++
    nodes.push({
      id: order, type: 'node', op: world.op, table: null, scope: 'world',
      mode: 'speed', icon: '🏆',
      label: `${world.name} · Final speed run`,
      section, sectionTitle: `Show what you know — all of ${world.name}`,
      xpReward: 80, color: world.color, colorLight: world.light, colorDark: world.dark, world: wIdx,
    })
  })

  return nodes
}

export const ROADMAP = buildRoadmap()

export function getNodeById(id) {
  return ROADMAP.find(n => n.id === id || n.id === Number(id))
}

export function getNodeIndex(id) {
  return ROADMAP.findIndex(n => n.id === id || n.id === Number(id))
}

// Returns 'completed' | 'current' | 'locked'
export function getNodeStatus(nodeId, progress) {
  const idx        = getNodeIndex(nodeId)
  const currentIdx = getNodeIndex(progress.current_node_id)
  if (idx < currentIdx)  return 'completed'
  if (idx === currentIdx) return 'current'
  return 'locked'
}

// Helper: get all nodes belonging to one world (for section banners / progress bars)
export function getWorldNodes(worldIdx) {
  return ROADMAP.filter(n => n.world === worldIdx)
}

export const WORLD_COUNT = WORLDS.length
export { WORLDS }
