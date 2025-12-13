import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/rotate-image')({
  component: RotateImage,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def rotate(self, matrix: List[List[int]]) -> None:' },
  { num: 3, code: '        n = len(matrix)' },
  { num: 4, code: '' },
  { num: 5, code: '        # Step 1: Transpose the matrix' },
  { num: 6, code: '        for i in range(n):' },
  { num: 7, code: '            for j in range(i + 1, n):' },
  { num: 8, code: '                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]' },
  { num: 9, code: '' },
  { num: 10, code: '        # Step 2: Reverse each row' },
  { num: 11, code: '        for i in range(n):' },
  { num: 12, code: '            matrix[i].reverse()' },
]

const PROBLEM_DESCRIPTION = `You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).

You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.`

interface Step {
  lineNumber: number
  description: string
  insight: string
  matrix: number[][]
  phase: 'init' | 'transpose' | 'reverse' | 'complete'
  highlightCells: [number, number][]  // cells being swapped
  swapArrow: { from: [number, number]; to: [number, number] } | null
  currentRow: number | null
}

interface TestCase {
  id: number
  matrix: number[][]
  expected: number[][]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]],
  },
  {
    id: 2,
    matrix: [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]],
    expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]],
  },
]

function deepCopy(matrix: number[][]): number[][] {
  return matrix.map(row => [...row])
}

function generateSteps(initialMatrix: number[][]): Step[] {
  const steps: Step[] = []
  const n = initialMatrix.length
  let matrix = deepCopy(initialMatrix)

  // Initial state
  steps.push({
    lineNumber: 3,
    description: `Initialize n = ${n}`,
    insight: `We have a ${n}x${n} matrix. We'll rotate it 90° clockwise using transpose + reverse.`,
    matrix: deepCopy(matrix),
    phase: 'init',
    highlightCells: [],
    swapArrow: null,
    currentRow: null,
  })

  // Step 1: Transpose
  steps.push({
    lineNumber: 5,
    description: 'Step 1: Transpose the matrix',
    insight: 'Transposing swaps elements across the main diagonal (top-left to bottom-right).',
    matrix: deepCopy(matrix),
    phase: 'transpose',
    highlightCells: [],
    swapArrow: null,
    currentRow: null,
  })

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Show the swap
      steps.push({
        lineNumber: 8,
        description: `Swap matrix[${i}][${j}] ↔ matrix[${j}][${i}]`,
        insight: `Swapping ${matrix[i][j]} and ${matrix[j][i]} across the diagonal.`,
        matrix: deepCopy(matrix),
        phase: 'transpose',
        highlightCells: [[i, j], [j, i]],
        swapArrow: { from: [i, j], to: [j, i] },
        currentRow: null,
      })

      // Perform the swap
      const temp = matrix[i][j]
      matrix[i][j] = matrix[j][i]
      matrix[j][i] = temp

      // Show result
      steps.push({
        lineNumber: 8,
        description: `Swapped: matrix[${i}][${j}]=${matrix[i][j]}, matrix[${j}][${i}]=${matrix[j][i]}`,
        insight: 'Elements swapped successfully.',
        matrix: deepCopy(matrix),
        phase: 'transpose',
        highlightCells: [[i, j], [j, i]],
        swapArrow: null,
        currentRow: null,
      })
    }
  }

  // After transpose
  steps.push({
    lineNumber: 10,
    description: 'Transpose complete. Step 2: Reverse each row',
    insight: 'After transposing, we reverse each row to complete the 90° clockwise rotation.',
    matrix: deepCopy(matrix),
    phase: 'reverse',
    highlightCells: [],
    swapArrow: null,
    currentRow: null,
  })

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    steps.push({
      lineNumber: 11,
      description: `Reversing row ${i}`,
      insight: `Row ${i} before: [${matrix[i].join(', ')}]`,
      matrix: deepCopy(matrix),
      phase: 'reverse',
      highlightCells: matrix[i].map((_, j) => [i, j] as [number, number]),
      swapArrow: null,
      currentRow: i,
    })

    matrix[i].reverse()

    steps.push({
      lineNumber: 12,
      description: `Row ${i} reversed`,
      insight: `Row ${i} after: [${matrix[i].join(', ')}]`,
      matrix: deepCopy(matrix),
      phase: 'reverse',
      highlightCells: matrix[i].map((_, j) => [i, j] as [number, number]),
      swapArrow: null,
      currentRow: i,
    })
  }

  // Complete
  steps.push({
    lineNumber: 12,
    description: 'Rotation complete!',
    insight: 'The matrix has been rotated 90° clockwise in-place.',
    matrix: deepCopy(matrix),
    phase: 'complete',
    highlightCells: [],
    swapArrow: null,
    currentRow: null,
  })

  return steps
}

function RotateImage() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.matrix), [testCase.matrix])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const n = step.matrix.length
  const cellSize = n <= 3 ? 64 : 56

  const isHighlighted = (row: number, col: number) => {
    return step.highlightCells.some(([r, c]) => r === row && c === col)
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .code-highlight {
          background: linear-gradient(90deg, rgba(251, 146, 60, 0.15) 0%, transparent 100%);
          border-left: 2px solid #fb923c;
        }

        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
        }

        .glow-orange {
          box-shadow: 0 0 15px rgba(251, 146, 60, 0.4);
        }

        .glow-purple {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }

        .diagonal-line {
          background: linear-gradient(135deg, transparent 49%, rgba(34, 211, 238, 0.3) 49%, rgba(34, 211, 238, 0.3) 51%, transparent 51%);
        }
      `}</style>

      <div className="blueprint-grid min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <a
                href="/"
                className="text-slate-500 hover:text-cyan-400 transition-colors font-mono text-sm"
              >
                &larr; Back
              </a>
              <span className="text-slate-700">/</span>
              <span className="text-cyan-400 font-mono text-sm">problems</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-slate-500 font-mono">#48</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Rotate Image
                </h1>
                <div className="flex gap-2">
                  {['Array', 'Matrix', 'Math'].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="mb-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 font-mono text-sm whitespace-pre-line">{PROBLEM_DESCRIPTION}</p>
          </div>

          {/* Test Case Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-slate-500 font-mono text-sm">TEST CASE:</span>
              <div className="flex gap-2 flex-wrap">
                {TEST_CASES.map((tc, idx) => (
                  <button
                    key={tc.id}
                    onClick={() => handleTestCaseChange(idx)}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      selectedTestCase === idx
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {tc.matrix.length}x{tc.matrix.length} Matrix
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setCurrentStep(0)}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm border border-slate-700"
            >
              Reset
            </button>
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm border border-slate-700"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            >
              Next →
            </button>
            <span className="text-slate-500 font-mono text-sm">
              Step {currentStep + 1} / {steps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Code Panel */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-slate-500 font-mono text-xs">rotate_image.py</span>
              </div>
              <div className="p-4 font-mono text-sm overflow-x-auto">
                {CODE_LINES.map((line) => (
                  <div
                    key={line.num}
                    className={`flex py-0.5 rounded transition-all duration-200 ${
                      step.lineNumber === line.num ? 'code-highlight' : ''
                    }`}
                  >
                    <span className="w-8 text-right pr-4 text-slate-600 select-none flex-shrink-0">
                      {line.num}
                    </span>
                    <code className={`whitespace-pre ${step.lineNumber === line.num ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {line.code || ' '}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualization Panel */}
            <div className="space-y-6">
              {/* Phase Indicator */}
              <div className="flex gap-4">
                <div className={`flex-1 p-3 rounded-lg border ${
                  step.phase === 'transpose'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500'
                }`}>
                  <div className="font-mono text-sm">Step 1: Transpose</div>
                  <div className="text-xs opacity-70">Swap across diagonal</div>
                </div>
                <div className={`flex-1 p-3 rounded-lg border ${
                  step.phase === 'reverse'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500'
                }`}>
                  <div className="font-mono text-sm">Step 2: Reverse Rows</div>
                  <div className="text-xs opacity-70">Reverse each row</div>
                </div>
              </div>

              {/* Matrix Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">MATRIX</span>
                </div>
                <div className="p-6 flex justify-center">
                  <div
                    className="inline-grid gap-1 p-2 bg-slate-800/30 rounded-lg"
                    style={{
                      gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
                    }}
                  >
                    {step.matrix.map((row, i) =>
                      row.map((val, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`flex items-center justify-center font-mono text-lg rounded-lg transition-all duration-300 ${
                            isHighlighted(i, j)
                              ? step.phase === 'transpose'
                                ? 'bg-purple-500/30 border-2 border-purple-400 text-purple-200 glow-purple'
                                : 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-200 glow-cyan'
                              : step.currentRow === i
                              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                              : 'bg-slate-800 border border-slate-600 text-slate-300'
                          }`}
                          style={{ width: cellSize, height: cellSize }}
                        >
                          {val}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Index labels */}
                <div className="px-6 pb-4">
                  <div className="flex justify-center gap-1" style={{ paddingLeft: cellSize / 2 }}>
                    {Array.from({ length: n }).map((_, j) => (
                      <div
                        key={j}
                        className="text-slate-600 font-mono text-xs text-center"
                        style={{ width: cellSize + 4 }}
                      >
                        col {j}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Swap Indicator */}
              {step.swapArrow && (
                <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
                  <div className="flex items-center justify-center gap-4 font-mono">
                    <div className="text-purple-300">
                      [{step.swapArrow.from[0]}][{step.swapArrow.from[1]}]
                    </div>
                    <div className="text-purple-400">⟷</div>
                    <div className="text-purple-300">
                      [{step.swapArrow.to[0]}][{step.swapArrow.to[1]}]
                    </div>
                  </div>
                  <div className="text-center text-purple-400/70 text-sm mt-2">
                    Swapping across the main diagonal
                  </div>
                </div>
              )}

              {/* Insight Panel */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">CURRENT STEP</span>
                </div>
                <div className="p-6">
                  <p className="text-slate-200 font-display text-lg mb-3">{step.description}</p>
                  <p className="text-slate-400 font-display">{step.insight}</p>
                </div>
              </div>

              {/* Result */}
              {step.phase === 'complete' && (
                <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-emerald-400 font-mono text-lg">
                        Matrix rotated 90° clockwise!
                      </div>
                      <div className="text-slate-500 font-mono text-sm">
                        In-place rotation complete
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-slate-200 font-display font-semibold text-lg mb-4">Algorithm Insight</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-purple-400 font-mono mb-2">Why Transpose?</h4>
                <p className="text-slate-400">
                  Transposing swaps rows with columns. Element at [i][j] moves to [j][i].
                  This is half of the rotation transformation.
                </p>
              </div>
              <div>
                <h4 className="text-cyan-400 font-mono mb-2">Why Reverse?</h4>
                <p className="text-slate-400">
                  After transpose, reversing each row completes the 90° clockwise rotation.
                  For counter-clockwise, reverse columns instead.
                </p>
              </div>
              <div>
                <h4 className="text-orange-400 font-mono mb-2">In-Place</h4>
                <p className="text-slate-400">
                  Both operations modify the matrix directly using swaps,
                  requiring no extra space beyond temporary variables.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(n²)</h4>
                <p className="text-slate-400">
                  Two passes over the n×n matrix: one for transpose, one for reversing rows.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(1)</h4>
                <p className="text-slate-400">
                  In-place rotation using only swap operations. No additional matrix needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
