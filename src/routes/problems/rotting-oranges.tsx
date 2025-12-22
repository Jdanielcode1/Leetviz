import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/rotting-oranges')({
  component: RottingOrangesVisualization,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `You are given an m x n grid where each cell can have one of three values:

- 0 representing an empty cell,
- 1 representing a fresh orange, or
- 2 representing a rotten orange.

Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.`

const EXAMPLES: Array<Example> = [
  {
    input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]',
    output: '4',
    explanation: undefined,
  },
  {
    input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]',
    output: '-1',
    explanation: 'The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.',
  },
  {
    input: 'grid = [[0,2]]',
    output: '0',
    explanation: 'Since there are already no fresh oranges at minute 0, the answer is just 0.',
  },
]

const CONSTRAINTS = [
  'm == grid.length',
  'n == grid[i].length',
  '1 <= m, n <= 10',
  'grid[i][j] is 0, 1, or 2',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  grid: Array<Array<number>>
  queue: Array<[number, number]>
  fresh: number
  time: number
  phase: string
  currentCell: [number, number] | null
  checkingCell: [number, number] | null
  directionName: string | null
  levelSize: number | null
  levelProgress: number
  justInfected: Array<[number, number]>
  scanningCell: [number, number] | null
}

interface TestCaseData {
  grid: Array<Array<number>>
  expected: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Classic Example',
    data: {
      grid: [
        [2, 1, 1],
        [1, 1, 0],
        [0, 1, 1],
      ],
      expected: 4,
    },
  },
  {
    id: 2,
    label: 'Quick Spread',
    data: {
      grid: [
        [2, 1, 1],
        [0, 1, 1],
        [1, 0, 1],
      ],
      expected: -1,
    },
  },
  {
    id: 3,
    label: 'Already Done',
    data: {
      grid: [
        [0, 2],
      ],
      expected: 0,
    },
  },
  {
    id: 4,
    label: 'Multi-Source',
    data: {
      grid: [
        [2, 1, 0, 2],
        [1, 1, 1, 1],
        [0, 1, 1, 0],
      ],
      expected: 2,
    },
  },
]

function deepCopyGrid(grid: Array<Array<number>>): Array<Array<number>> {
  return grid.map(row => [...row])
}

function generateSteps(initialGrid: Array<Array<number>>): Array<Step> {
  const steps: Array<Step> = []
  const grid = deepCopyGrid(initialGrid)
  const queue: Array<[number, number]> = []
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

  const directions: Array<[number, number, string]> = [
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

    const infectedThisLevel: Array<[number, number]> = []

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
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.grid), [testCase.data.grid])
  const step = steps[currentStepIndex]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
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

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
      `}</style>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
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
            testCase.data.expected === -1 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {testCase.data.expected}
          </div>
        </div>
      </div>

      {/* Grid Visualization */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-6 mb-4">
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
      <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 mb-4">
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Multi-Source BFS</h4>
          <p className="text-slate-400">All rotten oranges spread simultaneously each minute.</p>
        </div>
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Level-Order Traversal</h4>
          <p className="text-slate-400">Process entire levels at once to track time accurately.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(m*n)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(m*n)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '994',
        title: 'Rotting Oranges',
        difficulty: 'medium',
        tags: ['Array', 'BFS', 'Matrix'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="rotting_oranges.py"
      activeLineNumber={step.lineNumber}
      visualization={visualization}
      currentStep={{
        description: step.description,
        insight: step.insight,
      }}
      algorithmInsight={algorithmInsight}
      onTestCaseChange={handleTestCaseChange}
      onPrev={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
      onNext={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
      onReset={() => setCurrentStepIndex(0)}
      currentStepIndex={currentStepIndex}
      totalSteps={steps.length}
    />
  )
}
