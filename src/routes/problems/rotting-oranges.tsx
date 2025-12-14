import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/rotting-oranges')({
  component: RottingOrangesVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def orangesRotting(self, grid: List[List[int]]) -> int:' },
  { num: 3, code: '        q = collections.deque()' },
  { num: 4, code: '        fresh = 0' },
  { num: 5, code: '        time = 0' },
  { num: 6, code: '' },
  { num: 7, code: '        for r in range(len(grid)):' },
  { num: 8, code: '            for c in range(len(grid[0])):' },
  { num: 9, code: '                if grid[r][c] == 1:' },
  { num: 10, code: '                    fresh += 1' },
  { num: 11, code: '                if grid[r][c] == 2:' },
  { num: 12, code: '                    q.append((r, c))' },
  { num: 13, code: '' },
  { num: 14, code: '        directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]' },
  { num: 15, code: '        while fresh > 0 and q:' },
  { num: 16, code: '            length = len(q)' },
  { num: 17, code: '            for i in range(length):' },
  { num: 18, code: '                r, c = q.popleft()' },
  { num: 19, code: '' },
  { num: 20, code: '                for dr, dc in directions:' },
  { num: 21, code: '                    row, col = r + dr, c + dc' },
  { num: 22, code: '                    if (row in range(len(grid))' },
  { num: 23, code: '                        and col in range(len(grid[0]))' },
  { num: 24, code: '                        and grid[row][col] == 1' },
  { num: 25, code: '                    ):' },
  { num: 26, code: '                        grid[row][col] = 2' },
  { num: 27, code: '                        q.append((row, col))' },
  { num: 28, code: '                        fresh -= 1' },
  { num: 29, code: '            time += 1' },
  { num: 30, code: '        return time if fresh == 0 else -1' },
]

interface TestCase {
  id: number
  name: string
  grid: number[][]
  expected: number
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Classic Example',
    grid: [
      [2, 1, 1],
      [1, 1, 0],
      [0, 1, 1],
    ],
    expected: 4,
  },
  {
    id: 2,
    name: 'Quick Spread',
    grid: [
      [2, 1, 1],
      [0, 1, 1],
      [1, 0, 1],
    ],
    expected: -1,
  },
  {
    id: 3,
    name: 'Already Done',
    grid: [
      [0, 2],
    ],
    expected: 0,
  },
  {
    id: 4,
    name: 'Multi-Source',
    grid: [
      [2, 1, 0, 2],
      [1, 1, 1, 1],
      [0, 1, 1, 0],
    ],
    expected: 2,
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  grid: number[][]
  queue: [number, number][]
  fresh: number
  time: number
  phase: string
  currentCell: [number, number] | null
  checkingCell: [number, number] | null
  directionName: string | null
  levelSize: number | null
  levelProgress: number
  justInfected: [number, number][]
  scanningCell: [number, number] | null
}

function deepCopyGrid(grid: number[][]): number[][] {
  return grid.map(row => [...row])
}

function generateSteps(initialGrid: number[][]): Step[] {
  const steps: Step[] = []
  const grid = deepCopyGrid(initialGrid)
  const queue: [number, number][] = []
  let fresh = 0
  let time = 0
  const rows = grid.length
  const cols = grid[0].length

  // Line 2: Start function
  steps.push({
    lineNumber: 2,
    description: 'Start orangesRotting function',
    insight: 'Multi-source BFS: all rotten oranges spread simultaneously',
    grid: deepCopyGrid(grid),
    queue: [],
    fresh: 0,
    time: 0,
    phase: 'init',
    currentCell: null,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    justInfected: [],
    scanningCell: null,
  })

  // Line 3-5: Initialize variables
  steps.push({
    lineNumber: 3,
    description: 'Initialize empty queue',
    insight: 'Queue will hold coordinates of all rotten oranges',
    grid: deepCopyGrid(grid),
    queue: [],
    fresh: 0,
    time: 0,
    phase: 'init',
    currentCell: null,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    justInfected: [],
    scanningCell: null,
  })

  steps.push({
    lineNumber: 4,
    description: 'Initialize fresh = 0',
    insight: 'Count of fresh oranges - our goal is to make this 0',
    grid: deepCopyGrid(grid),
    queue: [],
    fresh: 0,
    time: 0,
    phase: 'init',
    currentCell: null,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    justInfected: [],
    scanningCell: null,
  })

  steps.push({
    lineNumber: 5,
    description: 'Initialize time = 0',
    insight: 'Minutes counter - increments after each BFS level',
    grid: deepCopyGrid(grid),
    queue: [],
    fresh: 0,
    time: 0,
    phase: 'init',
    currentCell: null,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    justInfected: [],
    scanningCell: null,
  })

  // Scan grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        fresh++
        steps.push({
          lineNumber: 10,
          description: `Found fresh orange at (${r}, ${c}), fresh = ${fresh}`,
          insight: 'Counting fresh oranges to track progress',
          grid: deepCopyGrid(grid),
          queue: [...queue.map(q => [...q] as [number, number])],
          fresh,
          time: 0,
          phase: 'scan',
          currentCell: null,
          checkingCell: null,
          directionName: null,
          levelSize: null,
          levelProgress: 0,
          justInfected: [],
          scanningCell: [r, c],
        })
      }
      if (grid[r][c] === 2) {
        queue.push([r, c])
        steps.push({
          lineNumber: 12,
          description: `Found rotten orange at (${r}, ${c}), added to queue`,
          insight: 'All initially rotten oranges are BFS starting points',
          grid: deepCopyGrid(grid),
          queue: [...queue.map(q => [...q] as [number, number])],
          fresh,
          time: 0,
          phase: 'scan',
          currentCell: null,
          checkingCell: null,
          directionName: null,
          levelSize: null,
          levelProgress: 0,
          justInfected: [],
          scanningCell: [r, c],
        })
      }
    }
  }

  // Setup directions step
  steps.push({
    lineNumber: 14,
    description: 'Define 4 directions: right, left, down, up',
    insight: 'Oranges can only rot adjacent oranges (not diagonal)',
    grid: deepCopyGrid(grid),
    queue: [...queue.map(q => [...q] as [number, number])],
    fresh,
    time: 0,
    phase: 'init-complete',
    currentCell: null,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    justInfected: [],
    scanningCell: null,
  })

  const directions: [number, number, string][] = [
    [0, 1, 'right'],
    [0, -1, 'left'],
    [1, 0, 'down'],
    [-1, 0, 'up'],
  ]

  // BFS loop
  while (fresh > 0 && queue.length > 0) {
    // While check
    steps.push({
      lineNumber: 15,
      description: `Check: fresh=${fresh} > 0 AND queue.length=${queue.length} > 0`,
      insight: 'Continue while there are fresh oranges and rotten ones to spread',
      grid: deepCopyGrid(grid),
      queue: [...queue.map(q => [...q] as [number, number])],
      fresh,
      time,
      phase: 'while-check',
      currentCell: null,
      checkingCell: null,
      directionName: null,
      levelSize: null,
      levelProgress: 0,
      justInfected: [],
      scanningCell: null,
    })

    const levelSize = queue.length
    steps.push({
      lineNumber: 16,
      description: `Level size = ${levelSize} (process all rotten at this minute)`,
      insight: 'Level-order BFS: all oranges at same "distance" rot simultaneously',
      grid: deepCopyGrid(grid),
      queue: [...queue.map(q => [...q] as [number, number])],
      fresh,
      time,
      phase: 'level-start',
      currentCell: null,
      checkingCell: null,
      directionName: null,
      levelSize,
      levelProgress: 0,
      justInfected: [],
      scanningCell: null,
    })

    const infectedThisLevel: [number, number][] = []

    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift()!

      steps.push({
        lineNumber: 18,
        description: `Dequeue (${r}, ${c}) - processing ${i + 1}/${levelSize}`,
        insight: 'Process each rotten orange from previous minute',
        grid: deepCopyGrid(grid),
        queue: [...queue.map(q => [...q] as [number, number])],
        fresh,
        time,
        phase: 'dequeue',
        currentCell: [r, c],
        checkingCell: null,
        directionName: null,
        levelSize,
        levelProgress: i + 1,
        justInfected: [...infectedThisLevel],
        scanningCell: null,
      })

      for (const [dr, dc, dirName] of directions) {
        const row = r + dr
        const col = c + dc

        steps.push({
          lineNumber: 21,
          description: `Check ${dirName}: (${r}, ${c}) + (${dr}, ${dc}) = (${row}, ${col})`,
          insight: `Looking ${dirName} from current rotten orange`,
          grid: deepCopyGrid(grid),
          queue: [...queue.map(q => [...q] as [number, number])],
          fresh,
          time,
          phase: 'check-direction',
          currentCell: [r, c],
          checkingCell: [row, col],
          directionName: dirName,
          levelSize,
          levelProgress: i + 1,
          justInfected: [...infectedThisLevel],
          scanningCell: null,
        })

        // Check if valid
        const inBounds = row >= 0 && row < rows && col >= 0 && col < cols
        const isFresh = inBounds && grid[row][col] === 1

        if (isFresh) {
          grid[row][col] = 2
          queue.push([row, col])
          fresh--
          infectedThisLevel.push([row, col])

          steps.push({
            lineNumber: 26,
            description: `Infect (${row}, ${col})! fresh = ${fresh}`,
            insight: 'Fresh orange becomes rotten, added to queue for next minute',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number])],
            fresh,
            time,
            phase: 'infect',
            currentCell: [r, c],
            checkingCell: [row, col],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            justInfected: [...infectedThisLevel],
            scanningCell: null,
          })
        } else if (!inBounds) {
          steps.push({
            lineNumber: 22,
            description: `(${row}, ${col}) is out of bounds - skip`,
            insight: 'Cannot spread outside the grid',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number])],
            fresh,
            time,
            phase: 'check-invalid',
            currentCell: [r, c],
            checkingCell: [row, col],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            justInfected: [...infectedThisLevel],
            scanningCell: null,
          })
        } else if (grid[row][col] === 0) {
          steps.push({
            lineNumber: 24,
            description: `(${row}, ${col}) is empty - skip`,
            insight: 'No orange to infect in empty cell',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number])],
            fresh,
            time,
            phase: 'check-invalid',
            currentCell: [r, c],
            checkingCell: [row, col],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            justInfected: [...infectedThisLevel],
            scanningCell: null,
          })
        } else {
          steps.push({
            lineNumber: 24,
            description: `(${row}, ${col}) already rotten - skip`,
            insight: 'Already processed or will be processed',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number])],
            fresh,
            time,
            phase: 'check-invalid',
            currentCell: [r, c],
            checkingCell: [row, col],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            justInfected: [...infectedThisLevel],
            scanningCell: null,
          })
        }
      }
    }

    time++
    steps.push({
      lineNumber: 29,
      description: `Minute complete! time = ${time}`,
      insight: `All oranges at distance ${time} from sources are now rotten`,
      grid: deepCopyGrid(grid),
      queue: [...queue.map(q => [...q] as [number, number])],
      fresh,
      time,
      phase: 'level-complete',
      currentCell: null,
      checkingCell: null,
      directionName: null,
      levelSize,
      levelProgress: levelSize,
      justInfected: [...infectedThisLevel],
      scanningCell: null,
    })
  }

  // Final return
  steps.push({
    lineNumber: 30,
    description: fresh === 0
      ? `All oranges rotten! Return ${time}`
      : `${fresh} fresh oranges unreachable! Return -1`,
    insight: fresh === 0
      ? 'Success: every fresh orange was reached by BFS'
      : 'Failure: some oranges isolated from all rotten oranges',
    grid: deepCopyGrid(grid),
    queue: [...queue.map(q => [...q] as [number, number])],
    fresh,
    time,
    phase: 'return',
    currentCell: null,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    justInfected: [],
    scanningCell: null,
  })

  return steps
}

function RottingOrangesVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = useMemo(() => generateSteps(selectedTestCase.grid), [selectedTestCase])
  const step = steps[currentStepIndex]

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))
  }

  const handleTestCaseChange = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setCurrentStepIndex(0)
  }

  const getCellStyle = (value: number, row: number, col: number) => {
    const isCurrentCell = step.currentCell && step.currentCell[0] === row && step.currentCell[1] === col
    const isCheckingCell = step.checkingCell && step.checkingCell[0] === row && step.checkingCell[1] === col
    const isScanning = step.scanningCell && step.scanningCell[0] === row && step.scanningCell[1] === col
    const isJustInfected = step.justInfected.some(([r, c]) => r === row && c === col)

    let baseStyle = ''
    let ringStyle = ''

    if (value === 0) {
      baseStyle = 'bg-slate-700/50 border-slate-600'
    } else if (value === 1) {
      baseStyle = 'bg-orange-400 border-orange-500'
    } else {
      baseStyle = isJustInfected
        ? 'bg-red-600 border-red-500 animate-pulse'
        : 'bg-amber-900 border-amber-800'
    }

    if (isCurrentCell) {
      ringStyle = 'ring-4 ring-purple-400 ring-offset-2 ring-offset-slate-900'
    } else if (isCheckingCell) {
      ringStyle = 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
    } else if (isScanning) {
      ringStyle = 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900'
    }

    return `${baseStyle} ${ringStyle}`
  }

  const getCellContent = (value: number) => {
    if (value === 0) return ''
    if (value === 1) return '🍊'
    return '🤢'
  }

  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: '#0a1628' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }
        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-cyan-400 font-mono text-sm">#994</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Medium
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">
                Rotting Oranges
              </h1>
            </div>
            <a
              href="/"
              className="text-slate-400 hover:text-slate-200 transition-colors font-display"
            >
              Back to Problems
            </a>
          </div>
        </div>
      </div>

      {/* Test Case Selector */}
      <div className="border-b border-slate-700/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-display">Test Case:</span>
            <div className="flex gap-2 flex-wrap">
              {TEST_CASES.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => handleTestCaseChange(tc)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedTestCase.id === tc.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Code Panel */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
              <h2 className="font-display font-semibold text-slate-200">Algorithm</h2>
            </div>
            <div className="p-4 font-mono text-sm overflow-auto max-h-[600px]">
              {CODE_LINES.map((line) => {
                const isActive = line.num === step.lineNumber
                return (
                  <div
                    key={line.num}
                    className={`flex transition-all duration-200 ${
                      isActive ? 'bg-cyan-500/10 -mx-4 px-4 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <span className={`w-8 text-right mr-4 select-none ${
                      isActive ? 'text-cyan-400' : 'text-slate-600'
                    }`}>
                      {line.num}
                    </span>
                    <pre className={`flex-1 ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {line.code || ' '}
                    </pre>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Time Counter */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 text-center">
                <div className="text-slate-400 text-sm font-display mb-1">Time (minutes)</div>
                <div className="text-4xl font-bold font-mono text-cyan-400">{step.time}</div>
              </div>

              {/* Fresh Counter */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 text-center">
                <div className="text-slate-400 text-sm font-display mb-1">Fresh Oranges</div>
                <div className={`text-4xl font-bold font-mono ${
                  step.fresh === 0 ? 'text-emerald-400' : step.fresh <= 2 ? 'text-amber-400' : 'text-orange-400'
                }`}>
                  {step.fresh}
                </div>
              </div>

              {/* Expected Result */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 text-center">
                <div className="text-slate-400 text-sm font-display mb-1">Expected</div>
                <div className={`text-4xl font-bold font-mono ${
                  selectedTestCase.expected === -1 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {selectedTestCase.expected}
                </div>
              </div>
            </div>

            {/* Grid Visualization */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-6 blueprint-grid">
              <h3 className="font-display font-semibold text-slate-300 mb-4">Grid</h3>
              <div className="flex justify-center">
                <div className="inline-grid gap-2" style={{
                  gridTemplateColumns: `repeat(${step.grid[0].length}, minmax(0, 1fr))`
                }}>
                  {step.grid.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl transition-all duration-300 ${getCellStyle(cell, r, c)}`}
                      >
                        {getCellContent(cell)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-700/50 border border-slate-600"></div>
                  <span className="text-slate-400">Empty (0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-400 border border-orange-500 flex items-center justify-center text-xs">🍊</div>
                  <span className="text-slate-400">Fresh (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-900 border border-amber-800 flex items-center justify-center text-xs">🤢</div>
                  <span className="text-slate-400">Rotten (2)</span>
                </div>
              </div>
            </div>

            {/* BFS Queue */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-slate-300">BFS Queue</h3>
                <span className="text-slate-500 font-mono text-sm">
                  {step.levelSize !== null && `Level: ${step.levelProgress}/${step.levelSize}`}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap min-h-[40px]">
                {step.queue.length === 0 ? (
                  <span className="text-slate-600 italic">Empty</span>
                ) : (
                  step.queue.map(([r, c], idx) => (
                    <div
                      key={`${r}-${c}-${idx}`}
                      className={`px-3 py-1.5 rounded-lg font-mono text-sm ${
                        idx === 0
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      ({r}, {c})
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Direction Indicator */}
            {step.directionName && (
              <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
                <h3 className="font-display font-semibold text-slate-300 mb-2">Checking Direction</h3>
                <div className="flex items-center justify-center gap-4">
                  {['up', 'down', 'left', 'right'].map((dir) => (
                    <div
                      key={dir}
                      className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                        step.directionName === dir
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 scale-110'
                          : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
                      }`}
                    >
                      {dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'} {dir}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insight Panel */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-4">
              <h3 className="font-display font-semibold text-purple-300 mb-2">Insight</h3>
              <p className="text-slate-300">{step.insight}</p>
            </div>

            {/* Complexity Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Complexity Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Time Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(m * n)</div>
                  <div className="text-slate-500 text-xs mt-1">Each cell visited at most once</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Space Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(m * n)</div>
                  <div className="text-slate-500 text-xs mt-1">Queue can hold all cells in worst case</div>
                </div>
              </div>
              <div className="text-slate-500 text-xs mt-2 text-center">
                where m = rows, n = columns in the grid
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-300 font-display">{step.description}</p>
        </div>
      </div>
    </div>
  )
}
