import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/shortest-path-binary-matrix')({
  component: ShortestPathBinaryMatrixVisualization,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def shortestPathBinaryMatrix(self, grid):' },
  { num: 3, code: '        q = collections.deque([(0, 0, 1)])' },
  { num: 4, code: '' },
  { num: 5, code: '        if grid[0][0] or grid[-1][-1]:' },
  { num: 6, code: '            return -1' },
  { num: 7, code: '' },
  { num: 8, code: '        while q:' },
  { num: 9, code: '            length = len(q)' },
  { num: 10, code: '            for _ in range(length):' },
  { num: 11, code: '                i, j, cost = q.popleft()' },
  { num: 12, code: '' },
  { num: 13, code: '                if i == len(grid)-1 and j == len(grid)-1:' },
  { num: 14, code: '                    return cost' },
  { num: 15, code: '' },
  { num: 16, code: '                for a, b in [(i-1,j-1),(i-1,j),(i-1,j+1),(i,j-1),(i,j+1),(i+1,j-1),(i+1,j),(i+1,j+1)]:' },
  { num: 17, code: '                    if 0 <= a < len(grid) and 0 <= b < len(grid) and not grid[a][b]:' },
  { num: 18, code: '                        grid[a][b] = 1' },
  { num: 19, code: '                        q.append((a, b, cost + 1))' },
  { num: 20, code: '' },
  { num: 21, code: '        return -1' },
]

const PROBLEM_DESCRIPTION = `Given an n x n binary matrix grid, return the length of the shortest clear path in the matrix. If there is no clear path, return -1.

A clear path in a binary matrix is a path from the top-left cell (i.e., (0, 0)) to the bottom-right cell (i.e., (n - 1, n - 1)) such that:

• All the visited cells of the path are 0.
• All the adjacent cells of the path are 8-directionally connected (i.e., they are different and they share an edge or a corner).

The length of a clear path is the number of visited cells of this path.`

const EXAMPLES: Array<Example> = [
  {
    input: 'grid = [[0,1],[1,0]]',
    output: '2',
    explanation: 'There is one clear path from (0,0) to (1,1): (0,0) -> (1,1).',
  },
  {
    input: 'grid = [[0,0,0],[1,1,0],[1,1,0]]',
    output: '4',
    explanation: 'There is one clear path: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2).',
  },
  {
    input: 'grid = [[1,0,0],[1,1,0],[1,1,0]]',
    output: '-1',
    explanation: 'The starting cell is blocked, so there is no path.',
  },
]

const CONSTRAINTS = [
  'n == grid.length',
  'n == grid[i].length',
  '1 <= n <= 100',
  'grid[i][j] is 0 or 1',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  grid: Array<Array<number>>
  queue: Array<[number, number, number]>
  phase: string
  currentCell: [number, number] | null
  currentCost: number
  checkingCell: [number, number] | null
  directionName: string | null
  levelSize: number | null
  levelProgress: number
  visited: Array<string>
  foundPath: boolean
  pathLength: number | null
}

interface TestCaseData {
  grid: Array<Array<number>>
  expected: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Diagonal Path',
    data: {
      grid: [
        [0, 1],
        [1, 0],
      ],
      expected: 2,
    },
  },
  {
    id: 2,
    label: 'Path Exists',
    data: {
      grid: [
        [0, 0, 0],
        [1, 1, 0],
        [1, 1, 0],
      ],
      expected: 4,
    },
  },
  {
    id: 3,
    label: 'Blocked Start',
    data: {
      grid: [
        [1, 0, 0],
        [1, 1, 0],
        [1, 1, 0],
      ],
      expected: -1,
    },
  },
  {
    id: 4,
    label: 'Larger Grid',
    data: {
      grid: [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 1, 0, 0],
      ],
      expected: 4,
    },
  },
]

function deepCopyGrid(grid: Array<Array<number>>): Array<Array<number>> {
  return grid.map(row => [...row])
}

function generateSteps(initialGrid: Array<Array<number>>): Array<Step> {
  const steps: Array<Step> = []
  const grid = deepCopyGrid(initialGrid)
  const queue: Array<[number, number, number]> = []
  const n = grid.length
  const visited: Array<string> = []

  // Line 2: Start function
  steps.push({
    lineNumber: 2,
    description: 'Start shortestPathBinaryMatrix function',
    insight: 'BFS finds shortest path in unweighted graphs - perfect for grid traversal',
    grid: deepCopyGrid(grid),
    queue: [],
    phase: 'init',
    currentCell: null,
    currentCost: 0,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    visited: [],
    foundPath: false,
    pathLength: null,
  })

  // Line 3: Initialize queue with start
  steps.push({
    lineNumber: 3,
    description: 'Initialize queue with (0, 0, 1) - start cell with cost 1',
    insight: 'Cost starts at 1 because the path includes the starting cell',
    grid: deepCopyGrid(grid),
    queue: [[0, 0, 1]],
    phase: 'init',
    currentCell: [0, 0],
    currentCost: 1,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    visited: [],
    foundPath: false,
    pathLength: null,
  })

  // Line 5: Check if start or end is blocked
  const startBlocked = grid[0][0] === 1
  const endBlocked = grid[n - 1][n - 1] === 1

  steps.push({
    lineNumber: 5,
    description: `Check if start or end is blocked: grid[0][0]=${grid[0][0]}, grid[${n-1}][${n-1}]=${grid[n-1][n-1]}`,
    insight: startBlocked || endBlocked
      ? 'Path impossible - start or end cell is blocked!'
      : 'Both start and end are clear - path might exist',
    grid: deepCopyGrid(grid),
    queue: [[0, 0, 1]],
    phase: 'check-blocked',
    currentCell: null,
    currentCost: 1,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    visited: [],
    foundPath: false,
    pathLength: null,
  })

  if (startBlocked || endBlocked) {
    steps.push({
      lineNumber: 6,
      description: 'Return -1 - no path possible',
      insight: 'Cannot reach goal if start or end is blocked',
      grid: deepCopyGrid(grid),
      queue: [],
      phase: 'return-blocked',
      currentCell: null,
      currentCost: 0,
      checkingCell: null,
      directionName: null,
      levelSize: null,
      levelProgress: 0,
      visited: [],
      foundPath: false,
      pathLength: -1,
    })
    return steps
  }

  // Initialize BFS
  queue.push([0, 0, 1])
  grid[0][0] = 1 // Mark as visited
  visited.push('0,0')

  const directions: Array<[number, number, string]> = [
    [-1, -1, '↖ top-left'],
    [-1, 0, '↑ up'],
    [-1, 1, '↗ top-right'],
    [0, -1, '← left'],
    [0, 1, '→ right'],
    [1, -1, '↙ bottom-left'],
    [1, 0, '↓ down'],
    [1, 1, '↘ bottom-right'],
  ]

  // BFS loop
  while (queue.length > 0) {
    // While check
    steps.push({
      lineNumber: 8,
      description: `Check: queue.length = ${queue.length} > 0`,
      insight: 'Continue while there are cells to explore',
      grid: deepCopyGrid(grid),
      queue: [...queue.map(q => [...q] as [number, number, number])],
      phase: 'while-check',
      currentCell: null,
      currentCost: queue[0]?.[2] || 0,
      checkingCell: null,
      directionName: null,
      levelSize: null,
      levelProgress: 0,
      visited: [...visited],
      foundPath: false,
      pathLength: null,
    })

    const levelSize = queue.length
    steps.push({
      lineNumber: 9,
      description: `Level size = ${levelSize} (all cells at same distance)`,
      insight: 'Level-order BFS ensures we find shortest path first',
      grid: deepCopyGrid(grid),
      queue: [...queue.map(q => [...q] as [number, number, number])],
      phase: 'level-start',
      currentCell: null,
      currentCost: queue[0]?.[2] || 0,
      checkingCell: null,
      directionName: null,
      levelSize,
      levelProgress: 0,
      visited: [...visited],
      foundPath: false,
      pathLength: null,
    })

    for (let i = 0; i < levelSize; i++) {
      const [r, c, cost] = queue.shift()!

      steps.push({
        lineNumber: 11,
        description: `Dequeue (${r}, ${c}) with cost ${cost}`,
        insight: `Processing cell at distance ${cost} from start`,
        grid: deepCopyGrid(grid),
        queue: [...queue.map(q => [...q] as [number, number, number])],
        phase: 'dequeue',
        currentCell: [r, c],
        currentCost: cost,
        checkingCell: null,
        directionName: null,
        levelSize,
        levelProgress: i + 1,
        visited: [...visited],
        foundPath: false,
        pathLength: null,
      })

      // Check if reached goal
      if (r === n - 1 && c === n - 1) {
        steps.push({
          lineNumber: 13,
          description: `Check: (${r}, ${c}) == (${n-1}, ${n-1})? YES!`,
          insight: 'Reached the goal! BFS guarantees this is the shortest path',
          grid: deepCopyGrid(grid),
          queue: [...queue.map(q => [...q] as [number, number, number])],
          phase: 'goal-check',
          currentCell: [r, c],
          currentCost: cost,
          checkingCell: null,
          directionName: null,
          levelSize,
          levelProgress: i + 1,
          visited: [...visited],
          foundPath: true,
          pathLength: cost,
        })

        steps.push({
          lineNumber: 14,
          description: `Return ${cost} - shortest path found!`,
          insight: `The shortest clear path has ${cost} cells`,
          grid: deepCopyGrid(grid),
          queue: [...queue.map(q => [...q] as [number, number, number])],
          phase: 'return-found',
          currentCell: [r, c],
          currentCost: cost,
          checkingCell: null,
          directionName: null,
          levelSize,
          levelProgress: i + 1,
          visited: [...visited],
          foundPath: true,
          pathLength: cost,
        })
        return steps
      }

      steps.push({
        lineNumber: 13,
        description: `Check: (${r}, ${c}) == (${n-1}, ${n-1})? No, continue exploring`,
        insight: 'Not at goal yet, check all 8 neighbors',
        grid: deepCopyGrid(grid),
        queue: [...queue.map(q => [...q] as [number, number, number])],
        phase: 'goal-check',
        currentCell: [r, c],
        currentCost: cost,
        checkingCell: null,
        directionName: null,
        levelSize,
        levelProgress: i + 1,
        visited: [...visited],
        foundPath: false,
        pathLength: null,
      })

      // Check all 8 directions
      for (const [dr, dc, dirName] of directions) {
        const newR = r + dr
        const newC = c + dc

        steps.push({
          lineNumber: 16,
          description: `Check ${dirName}: (${r}, ${c}) + (${dr}, ${dc}) = (${newR}, ${newC})`,
          insight: `Looking ${dirName} - 8-directional movement includes diagonals`,
          grid: deepCopyGrid(grid),
          queue: [...queue.map(q => [...q] as [number, number, number])],
          phase: 'check-direction',
          currentCell: [r, c],
          currentCost: cost,
          checkingCell: [newR, newC],
          directionName: dirName,
          levelSize,
          levelProgress: i + 1,
          visited: [...visited],
          foundPath: false,
          pathLength: null,
        })

        const inBounds = newR >= 0 && newR < n && newC >= 0 && newC < n
        const isClear = inBounds && grid[newR][newC] === 0

        if (isClear) {
          grid[newR][newC] = 1 // Mark as visited
          queue.push([newR, newC, cost + 1])
          visited.push(`${newR},${newC}`)

          steps.push({
            lineNumber: 18,
            description: `(${newR}, ${newC}) is clear! Mark visited, add to queue with cost ${cost + 1}`,
            insight: 'Found a new cell to explore',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number, number])],
            phase: 'add-to-queue',
            currentCell: [r, c],
            currentCost: cost,
            checkingCell: [newR, newC],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            visited: [...visited],
            foundPath: false,
            pathLength: null,
          })
        } else if (!inBounds) {
          steps.push({
            lineNumber: 17,
            description: `(${newR}, ${newC}) is out of bounds - skip`,
            insight: 'Cannot move outside the grid',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number, number])],
            phase: 'skip-oob',
            currentCell: [r, c],
            currentCost: cost,
            checkingCell: [newR, newC],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            visited: [...visited],
            foundPath: false,
            pathLength: null,
          })
        } else {
          steps.push({
            lineNumber: 17,
            description: `(${newR}, ${newC}) is blocked or visited - skip`,
            insight: 'Cell is either a wall (1) or already explored',
            grid: deepCopyGrid(grid),
            queue: [...queue.map(q => [...q] as [number, number, number])],
            phase: 'skip-blocked',
            currentCell: [r, c],
            currentCost: cost,
            checkingCell: [newR, newC],
            directionName: dirName,
            levelSize,
            levelProgress: i + 1,
            visited: [...visited],
            foundPath: false,
            pathLength: null,
          })
        }
      }
    }
  }

  // No path found
  steps.push({
    lineNumber: 21,
    description: 'Queue empty, no path found - return -1',
    insight: 'Explored all reachable cells but never reached the goal',
    grid: deepCopyGrid(grid),
    queue: [],
    phase: 'return-not-found',
    currentCell: null,
    currentCost: 0,
    checkingCell: null,
    directionName: null,
    levelSize: null,
    levelProgress: 0,
    visited: [...visited],
    foundPath: false,
    pathLength: -1,
  })

  return steps
}

function ShortestPathBinaryMatrixVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.grid), [testCase.data.grid])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const n = testCase.data.grid.length

  const getCellStyle = (row: number, col: number, _value: number) => {
    const isStart = row === 0 && col === 0
    const isGoal = row === n - 1 && col === n - 1
    const isCurrentCell = step.currentCell && step.currentCell[0] === row && step.currentCell[1] === col
    const isCheckingCell = step.checkingCell && step.checkingCell[0] === row && step.checkingCell[1] === col
    const isVisited = step.visited.includes(`${row},${col}`)
    const originalValue = testCase.data.grid[row][col]

    let baseStyle = ''
    let ringStyle = ''

    // Determine base color
    if (originalValue === 1) {
      baseStyle = 'bg-slate-800 border-slate-700' // Wall
    } else if (isVisited) {
      baseStyle = 'bg-blue-500/30 border-blue-500/50' // Visited clear cell
    } else {
      baseStyle = 'bg-slate-100 border-slate-300' // Unvisited clear cell
    }

    // Add special highlights
    if (isStart) {
      baseStyle = isVisited ? 'bg-emerald-500/40 border-emerald-500' : 'bg-emerald-400 border-emerald-500'
    }
    if (isGoal) {
      baseStyle = step.foundPath
        ? 'bg-yellow-400 border-yellow-500 animate-pulse'
        : isVisited
          ? 'bg-yellow-500/40 border-yellow-500'
          : 'bg-yellow-300 border-yellow-400'
    }

    // Add rings for current/checking
    if (isCurrentCell) {
      ringStyle = 'ring-4 ring-purple-400 ring-offset-2 ring-offset-slate-900'
    } else if (isCheckingCell) {
      ringStyle = 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
    }

    return `${baseStyle} ${ringStyle}`
  }

  const getCellContent = (row: number, col: number) => {
    const isStart = row === 0 && col === 0
    const isGoal = row === n - 1 && col === n - 1
    const originalValue = testCase.data.grid[row][col]

    if (originalValue === 1) return '█'
    if (isStart) return 'S'
    if (isGoal) return 'G'
    return ''
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Current Cost */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-slate-400 text-sm font-display mb-1">Current Cost</div>
          <div className="text-4xl font-bold font-mono text-cyan-400">{step.currentCost}</div>
        </div>

        {/* Queue Size */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-slate-400 text-sm font-display mb-1">Queue Size</div>
          <div className="text-4xl font-bold font-mono text-purple-400">{step.queue.length}</div>
        </div>

        {/* Expected Result */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-slate-400 text-sm font-display mb-1">Expected</div>
          <div className={`text-4xl font-bold font-mono ${
            testCase.data.expected === -1 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {testCase.data.expected}
          </div>
        </div>
      </div>

      {/* Grid Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="font-display font-semibold text-slate-300 mb-4">Grid ({n}x{n})</h3>
        <div className="flex justify-center">
          <div className="inline-grid gap-1" style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`
          }}>
            {step.grid.map((row, r) =>
              row.map((_, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all duration-300 ${getCellStyle(r, c, step.grid[r][c])}`}
                >
                  <span className={testCase.data.grid[r][c] === 1 ? 'text-slate-600' : 'text-slate-800'}>
                    {getCellContent(r, c)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-400 border border-emerald-500 flex items-center justify-center text-xs font-bold text-slate-800">S</div>
            <span className="text-slate-400">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-300 border border-yellow-400 flex items-center justify-center text-xs font-bold text-slate-800">G</div>
            <span className="text-slate-400">Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 border border-slate-300"></div>
            <span className="text-slate-400">Clear (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700"></div>
            <span className="text-slate-400">Blocked (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500/30 border border-blue-500/50"></div>
            <span className="text-slate-400">Visited</span>
          </div>
        </div>
      </div>

      {/* BFS Queue */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
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
            step.queue.map(([r, c, cost], idx) => (
              <div
                key={`${r}-${c}-${idx}`}
                className={`px-3 py-1.5 rounded-lg font-mono text-sm ${
                  idx === 0
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                ({r},{c}):{cost}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direction Indicator */}
      {step.directionName && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h3 className="font-display font-semibold text-slate-300 mb-2">Checking Direction (8-way)</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['↖ top-left', '↑ up', '↗ top-right', null],
              ['← left', null, '→ right', null],
              ['↙ bottom-left', '↓ down', '↘ bottom-right', null],
            ].flat().filter(Boolean).map((dir) => (
              <div
                key={dir}
                className={`px-3 py-2 rounded-lg font-mono text-xs transition-all text-center ${
                  step.directionName === dir
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 scale-105'
                    : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
                }`}
              >
                {dir}
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
          <h4 className="text-cyan-400 font-mono mb-1">BFS for Shortest Path</h4>
          <p className="text-slate-400">BFS guarantees the shortest path in unweighted grids by exploring cells level by level.</p>
        </div>
        <div>
          <h4 className="text-purple-400 font-mono mb-1">8-Directional Movement</h4>
          <p className="text-slate-400">Can move horizontally, vertically, or diagonally to any adjacent cell.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-emerald-400 font-mono">Time: O(n²)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(n²)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '1091',
        title: 'Shortest Path in Binary Matrix',
        difficulty: 'medium',
        tags: ['Array', 'BFS', 'Matrix'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="shortest_path_binary_matrix.py"
      activeLineNumber={step.lineNumber}
      visualization={visualization}
      currentStep={{
        description: step.description,
        insight: step.insight,
      }}
      algorithmInsight={algorithmInsight}
      onTestCaseChange={handleTestCaseChange}
      onPrev={() => setCurrentStep(Math.max(0, currentStep - 1))}
      onNext={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
      onReset={() => setCurrentStep(0)}
      currentStepIndex={currentStep}
      totalSteps={steps.length}
    />
  )
}
