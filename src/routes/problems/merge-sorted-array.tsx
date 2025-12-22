import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/merge-sorted-array')({
  component: MergeSortedArray,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'def merge(nums1: List[int], m: int, nums2: List[int], n: int):' },
  { num: 2, code: '    midx = m - 1      # pointer for nums1' },
  { num: 3, code: '    nidx = n - 1      # pointer for nums2' },
  { num: 4, code: '    right = m + n - 1 # write position' },
  { num: 5, code: '' },
  { num: 6, code: '    while nidx >= 0:' },
  { num: 7, code: '        if midx >= 0 and nums1[midx] > nums2[nidx]:' },
  { num: 8, code: '            nums1[right] = nums1[midx]' },
  { num: 9, code: '            midx -= 1' },
  { num: 10, code: '        else:' },
  { num: 11, code: '            nums1[right] = nums2[nidx]' },
  { num: 12, code: '            nidx -= 1' },
  { num: 13, code: '' },
  { num: 14, code: '        right -= 1' },
]

const PROBLEM_DESCRIPTION = `Merge nums1 and nums2 into a single array sorted in non-decreasing order.

The final sorted array should be stored inside nums1. nums1 has length m + n, where the first m elements are valid and the last n elements are placeholders (zeros).`

const EXAMPLES: Array<Example> = [
  {
    input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
    output: '[1,2,2,3,5,6]',
    explanation: 'Merge from end: compare 3 vs 6 → place 6, compare 3 vs 5 → place 5, compare 3 vs 2 → place 3, compare 2 vs 2 → place 2 (from nums2), nidx < 0, done!',
  },
  {
    input: 'nums1 = [1], m = 1, nums2 = [], n = 0',
    output: '[1]',
    explanation: 'nums2 is empty. nums1 already contains the result.',
  },
  {
    input: 'nums1 = [0], m = 0, nums2 = [1], n = 1',
    output: '[1]',
    explanation: 'nums1 has no valid elements. Copy all from nums2 to nums1.',
  },
]

const CONSTRAINTS = [
  'nums1.length == m + n',
  'nums2.length == n',
  '0 <= m, n <= 200',
  '1 <= m + n <= 200',
  '-10^9 <= nums1[i], nums2[j] <= 10^9',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  nums1: Array<number>
  nums2: Array<number>
  m: number
  n: number
  midx: number
  nidx: number
  right: number
  comparing: boolean
  comparisonResult: 'nums1' | 'nums2' | null
  mergedIndices: Array<number>
  usedNums2Indices: Array<number>
  done: boolean
}

interface TestCaseData {
  nums1: Array<number>
  m: number
  nums2: Array<number>
  n: number
  expected: Array<number>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Example 1: Basic merge',
    data: {
      nums1: [1, 2, 3, 0, 0, 0],
      m: 3,
      nums2: [2, 5, 6],
      n: 3,
      expected: [1, 2, 2, 3, 5, 6],
    },
  },
  {
    id: 2,
    label: 'Example 2: nums2 empty',
    data: {
      nums1: [1],
      m: 1,
      nums2: [],
      n: 0,
      expected: [1],
    },
  },
  {
    id: 3,
    label: 'Example 3: nums1 empty',
    data: {
      nums1: [0],
      m: 0,
      nums2: [1],
      n: 1,
      expected: [1],
    },
  },
]

function generateSteps(nums1Initial: Array<number>, m: number, nums2Initial: Array<number>, n: number): Array<Step> {
  const steps: Array<Step> = []
  const nums1 = [...nums1Initial]
  const nums2 = [...nums2Initial]
  const mergedIndices: Array<number> = []
  const usedNums2Indices: Array<number> = []

  let midx = m - 1
  let nidx = n - 1
  let right = m + n - 1

  // Initial step
  steps.push({
    lineNumber: 1,
    description: `merge(nums1, m=${m}, nums2, n=${n})`,
    insight: `Merge two sorted arrays. nums1 has ${m} valid elements and ${n} placeholder slots.`,
    nums1: [...nums1],
    nums2: [...nums2],
    m,
    n,
    midx,
    nidx,
    right,
    comparing: false,
    comparisonResult: null,
    mergedIndices: [...mergedIndices],
    usedNums2Indices: [...usedNums2Indices],
    done: false,
  })

  // Initialize pointers
  steps.push({
    lineNumber: 2,
    description: `midx = ${m} - 1 = ${midx}`,
    insight: `midx points to the last valid element in nums1${midx >= 0 ? ` (value: ${nums1[midx]})` : ' (no valid elements)'}.`,
    nums1: [...nums1],
    nums2: [...nums2],
    m,
    n,
    midx,
    nidx,
    right,
    comparing: false,
    comparisonResult: null,
    mergedIndices: [...mergedIndices],
    usedNums2Indices: [...usedNums2Indices],
    done: false,
  })

  steps.push({
    lineNumber: 3,
    description: `nidx = ${n} - 1 = ${nidx}`,
    insight: `nidx points to the last element in nums2${nidx >= 0 ? ` (value: ${nums2[nidx]})` : ' (array is empty)'}.`,
    nums1: [...nums1],
    nums2: [...nums2],
    m,
    n,
    midx,
    nidx,
    right,
    comparing: false,
    comparisonResult: null,
    mergedIndices: [...mergedIndices],
    usedNums2Indices: [...usedNums2Indices],
    done: false,
  })

  steps.push({
    lineNumber: 4,
    description: `right = ${m} + ${n} - 1 = ${right}`,
    insight: 'right is the write position where we place the next largest element.',
    nums1: [...nums1],
    nums2: [...nums2],
    m,
    n,
    midx,
    nidx,
    right,
    comparing: false,
    comparisonResult: null,
    mergedIndices: [...mergedIndices],
    usedNums2Indices: [...usedNums2Indices],
    done: false,
  })

  // Main loop
  while (nidx >= 0) {
    steps.push({
      lineNumber: 6,
      description: `nidx (${nidx}) >= 0? Yes, continue loop`,
      insight: 'Still have elements in nums2 to merge.',
      nums1: [...nums1],
      nums2: [...nums2],
      m,
      n,
      midx,
      nidx,
      right,
      comparing: false,
      comparisonResult: null,
      mergedIndices: [...mergedIndices],
      usedNums2Indices: [...usedNums2Indices],
      done: false,
    })

    const midxValid = midx >= 0
    const nums1Val = midxValid ? nums1[midx] : null
    const nums2Val = nums2[nidx]

    if (midxValid) {
      steps.push({
        lineNumber: 7,
        description: `Compare nums1[${midx}]=${nums1Val} vs nums2[${nidx}]=${nums2Val}`,
        insight: `Is ${nums1Val} > ${nums2Val}? ${nums1Val! > nums2Val ? 'Yes' : 'No'}`,
        nums1: [...nums1],
        nums2: [...nums2],
        m,
        n,
        midx,
        nidx,
        right,
        comparing: true,
        comparisonResult: null,
        mergedIndices: [...mergedIndices],
        usedNums2Indices: [...usedNums2Indices],
        done: false,
      })
    }

    if (midxValid && nums1Val! > nums2Val) {
      // Take from nums1
      steps.push({
        lineNumber: 8,
        description: `nums1[${right}] = nums1[${midx}] = ${nums1Val}`,
        insight: `${nums1Val} is larger, place it at position ${right}.`,
        nums1: [...nums1],
        nums2: [...nums2],
        m,
        n,
        midx,
        nidx,
        right,
        comparing: true,
        comparisonResult: 'nums1',
        mergedIndices: [...mergedIndices],
        usedNums2Indices: [...usedNums2Indices],
        done: false,
      })

      nums1[right] = nums1[midx]
      mergedIndices.push(right)

      steps.push({
        lineNumber: 9,
        description: `midx -= 1 → ${midx - 1}`,
        insight: 'Move nums1 pointer left to the next element.',
        nums1: [...nums1],
        nums2: [...nums2],
        m,
        n,
        midx,
        nidx,
        right,
        comparing: false,
        comparisonResult: 'nums1',
        mergedIndices: [...mergedIndices],
        usedNums2Indices: [...usedNums2Indices],
        done: false,
      })

      midx -= 1
    } else {
      // Take from nums2
      if (!midxValid) {
        steps.push({
          lineNumber: 7,
          description: `midx (${midx}) < 0, take from nums2`,
          insight: 'No more valid elements in nums1, take from nums2.',
          nums1: [...nums1],
          nums2: [...nums2],
          m,
          n,
          midx,
          nidx,
          right,
          comparing: false,
          comparisonResult: null,
          mergedIndices: [...mergedIndices],
          usedNums2Indices: [...usedNums2Indices],
          done: false,
        })
      }

      steps.push({
        lineNumber: 11,
        description: `nums1[${right}] = nums2[${nidx}] = ${nums2Val}`,
        insight: `${!midxValid ? 'No choice but to take' : nums2Val + ' is larger (or equal), take'} from nums2.`,
        nums1: [...nums1],
        nums2: [...nums2],
        m,
        n,
        midx,
        nidx,
        right,
        comparing: true,
        comparisonResult: 'nums2',
        mergedIndices: [...mergedIndices],
        usedNums2Indices: [...usedNums2Indices],
        done: false,
      })

      nums1[right] = nums2[nidx]
      mergedIndices.push(right)
      usedNums2Indices.push(nidx)

      steps.push({
        lineNumber: 12,
        description: `nidx -= 1 → ${nidx - 1}`,
        insight: 'Move nums2 pointer left to the next element.',
        nums1: [...nums1],
        nums2: [...nums2],
        m,
        n,
        midx,
        nidx,
        right,
        comparing: false,
        comparisonResult: 'nums2',
        mergedIndices: [...mergedIndices],
        usedNums2Indices: [...usedNums2Indices],
        done: false,
      })

      nidx -= 1
    }

    steps.push({
      lineNumber: 14,
      description: `right -= 1 → ${right - 1}`,
      insight: 'Move write position left for the next iteration.',
      nums1: [...nums1],
      nums2: [...nums2],
      m,
      n,
      midx,
      nidx,
      right,
      comparing: false,
      comparisonResult: null,
      mergedIndices: [...mergedIndices],
      usedNums2Indices: [...usedNums2Indices],
      done: false,
    })

    right -= 1
  }

  // Loop ends
  steps.push({
    lineNumber: 6,
    description: `nidx (${nidx}) >= 0? No, exit loop`,
    insight: 'All elements from nums2 have been merged. Remaining nums1 elements are already in place!',
    nums1: [...nums1],
    nums2: [...nums2],
    m,
    n,
    midx,
    nidx,
    right,
    comparing: false,
    comparisonResult: null,
    mergedIndices: [...mergedIndices],
    usedNums2Indices: [...usedNums2Indices],
    done: true,
  })

  return steps
}

function MergeSortedArray() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(
    () => generateSteps(testCase.data.nums1, testCase.data.m, testCase.data.nums2, testCase.data.n),
    [testCase.data.nums1, testCase.data.m, testCase.data.nums2, testCase.data.n]
  )
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
      `}</style>

      {/* Pointer Values */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-xl border p-3 text-center ${
          step.midx >= 0 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="text-xs font-mono text-slate-500 mb-1">midx (nums1)</div>
          <div className={`text-2xl font-mono font-bold ${step.midx >= 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
            {step.midx}
          </div>
        </div>
        <div className={`rounded-xl border p-3 text-center ${
          step.nidx >= 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="text-xs font-mono text-slate-500 mb-1">nidx (nums2)</div>
          <div className={`text-2xl font-mono font-bold ${step.nidx >= 0 ? 'text-orange-400' : 'text-slate-600'}`}>
            {step.nidx}
          </div>
        </div>
        <div className={`rounded-xl border p-3 text-center ${
          step.right >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="text-xs font-mono text-slate-500 mb-1">right (write)</div>
          <div className={`text-2xl font-mono font-bold ${step.right >= 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
            {step.right}
          </div>
        </div>
      </div>

      {/* nums1 Array */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-cyan-400 font-mono text-sm">nums1</span>
          <span className="text-slate-500 font-mono text-xs">m = {step.m}</span>
        </div>
        <div className="p-4">
          <div className="flex gap-2 flex-wrap justify-center">
            {step.nums1.map((val, idx) => {
              const isValidOriginal = idx < step.m
              const isMerged = step.mergedIndices.includes(idx)
              const isMidxPos = idx === step.midx
              const isRightPos = idx === step.right
              const isBeingWritten = step.comparisonResult && isRightPos

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-lg font-semibold transition-all duration-300 ${
                      isMerged
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 glow-green'
                        : isBeingWritten
                        ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300 glow-orange'
                        : isMidxPos
                        ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300 glow-cyan'
                        : isRightPos
                        ? 'bg-emerald-500/10 border-2 border-dashed border-emerald-500/50 text-slate-400'
                        : isValidOriginal
                        ? 'bg-slate-800 border border-slate-600 text-slate-200'
                        : 'bg-slate-800/30 border border-slate-700/50 text-slate-600'
                    }`}
                  >
                    {val}
                  </div>
                  <div className="text-xs font-mono text-slate-600 mt-1">{idx}</div>
                  <div className="flex gap-1 mt-1 h-4">
                    {isMidxPos && <span className="text-xs text-cyan-400">m</span>}
                    {isRightPos && <span className="text-xs text-emerald-400">r</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* nums2 Array */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-orange-400 font-mono text-sm">nums2</span>
          <span className="text-slate-500 font-mono text-xs">n = {step.n}</span>
        </div>
        <div className="p-4">
          {step.nums2.length === 0 ? (
            <div className="text-center text-slate-600 font-mono py-2">Empty array</div>
          ) : (
            <div className="flex gap-2 flex-wrap justify-center">
              {step.nums2.map((val, idx) => {
                const isUsed = step.usedNums2Indices.includes(idx)
                const isNidxPos = idx === step.nidx

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-lg font-semibold transition-all duration-300 ${
                        isUsed
                          ? 'bg-slate-800/30 border border-slate-700/50 text-slate-600'
                          : isNidxPos
                          ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-300 glow-orange'
                          : 'bg-slate-800 border border-slate-600 text-slate-200'
                      }`}
                    >
                      {val}
                    </div>
                    <div className="text-xs font-mono text-slate-600 mt-1">{idx}</div>
                    <div className="h-4 mt-1">
                      {isNidxPos && <span className="text-xs text-orange-400">n</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Display */}
      {step.comparing && step.midx >= 0 && step.nidx >= 0 && (
        <div className={`rounded-xl border p-4 ${
          step.comparisonResult === 'nums1'
            ? 'bg-cyan-500/10 border-cyan-500/30'
            : step.comparisonResult === 'nums2'
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="text-sm font-mono mb-2 text-slate-400">COMPARING</div>
          <div className="flex items-center justify-center gap-4 font-mono text-xl">
            <span className={step.comparisonResult === 'nums1' ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
              nums1[{step.midx}] = {step.nums1[step.midx]}
            </span>
            <span className="text-slate-500">vs</span>
            <span className={step.comparisonResult === 'nums2' ? 'text-orange-300 font-bold' : 'text-slate-400'}>
              nums2[{step.nidx}] = {step.nums2[step.nidx]}
            </span>
          </div>
          {step.comparisonResult && (
            <div className="text-center mt-2">
              <span className={`text-sm ${
                step.comparisonResult === 'nums1' ? 'text-cyan-400' : 'text-orange-400'
              }`}>
                Take from {step.comparisonResult === 'nums1' ? 'nums1' : 'nums2'} →
                place at position {step.right}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Completion */}
      {step.done && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4 glow-green">
          <div className="text-emerald-400 font-mono text-lg font-semibold text-center">
            Merge Complete!
          </div>
          <div className="text-center text-slate-400 mt-2 font-mono">
            Result: [{step.nums1.join(', ')}]
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
          <h4 className="text-cyan-400 font-mono mb-1">Why Merge from End?</h4>
          <p className="text-slate-400">
            Merging from the start would overwrite elements we still need.
            The end has empty slots (placeholders), so no data is lost.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Three Pointers</h4>
          <p className="text-slate-400">
            midx: last valid in nums1. nidx: last in nums2.
            right: where to write next. All move leftward.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Why Loop on nidx?</h4>
          <p className="text-slate-400">
            When nums2 is exhausted (nidx &lt; 0), remaining nums1 elements
            are already in correct positions. No more work needed!
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(m + n)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(1)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '88',
        title: 'Merge Sorted Array',
        difficulty: 'easy',
        tags: ['Array', 'Two Pointers', 'Sorting'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="merge_sorted_array.py"
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
