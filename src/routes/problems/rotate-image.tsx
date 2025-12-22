import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/rotate-image')({
  component: RotateImage,
})

const CODE_LINES: Array<CodeLine> = [
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

const EXAMPLES: Array<Example> = [
  {
    input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
    output: '[[7,4,1],[8,5,2],[9,6,3]]',
    explanation: 'Rotate the matrix 90 degrees clockwise.',
  },
  {
    input: 'matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]',
    output: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]',
    explanation: 'Rotate the 4x4 matrix 90 degrees clockwise.',
  },
]

const CONSTRAINTS = [
  'n == matrix.length == matrix[i].length',
  '1 <= n <= 20',
  '-1000 <= matrix[i][j] <= 1000',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  matrix: Array<Array<number>>
  phase: 'init' | 'transpose' | 'reverse' | 'complete'
  highlightCells: Array<[number, number]>  // cells being swapped
  swapArrow: { from: [number, number]; to: [number, number] } | null
  currentRow: number | null
}

interface TestCaseData {
  matrix: Array<Array<number>>
  expected: Array<Array<number>>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: '3x3 Matrix',
    data: {
      matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]],
    },
  },
  {
    id: 2,
    label: '4x4 Matrix',
    data: {
      matrix: [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]],
      expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]],
    },
  },
]

function deepCopy(matrix: Array<Array<number>>): Array<Array<number>> {
  return matrix.map(row => [...row])
}

function generateSteps(initialMatrix: Array<Array<number>>): Array<Step> {
  const steps: Array<Step> = []
  const n = initialMatrix.length
  const matrix = deepCopy(initialMatrix)

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
  const steps = useMemo(() => generateSteps(testCase.data.matrix), [testCase.data.matrix])
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

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
        .diagonal-line {
          background: linear-gradient(135deg, transparent 49%, rgba(34, 211, 238, 0.3) 49%, rgba(34, 211, 238, 0.3) 51%, transparent 51%);
        }
      `}</style>

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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">MATRIX</span>
        </div>
        <div className="p-6 flex justify-center">
          <div
            className="inline-grid gap-1 p-2 bg-slate-900/30 rounded-lg"
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div>
          <h4 className="text-purple-400 font-mono mb-1">Why Transpose?</h4>
          <p className="text-slate-400">
            Transposing swaps rows with columns. Element at [i][j] moves to [j][i].
            This is half of the rotation transformation.
          </p>
        </div>
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Why Reverse?</h4>
          <p className="text-slate-400">
            After transpose, reversing each row completes the 90° clockwise rotation.
            For counter-clockwise, reverse columns instead.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">In-Place</h4>
          <p className="text-slate-400">
            Both operations modify the matrix directly using swaps,
            requiring no extra space beyond temporary variables.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 text-xs mt-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-purple-400 font-mono mb-1">Time Complexity: O(n²)</h4>
          <p className="text-slate-400">
            Two passes over the n×n matrix: one for transpose, one for reversing rows.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-pink-400 font-mono mb-1">Space Complexity: O(1)</h4>
          <p className="text-slate-400">
            In-place rotation using only swap operations. No additional matrix needed.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '48',
        title: 'Rotate Image',
        difficulty: 'medium',
        tags: ['Array', 'Math', 'Matrix'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="rotate_image.py"
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
