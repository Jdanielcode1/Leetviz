import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/single-element-sorted')({
  component: SingleElementSortedVisualization,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def singleNonDuplicate(self, nums: List[int]) -> int:' },
  { num: 3, code: '        left, right = 0, len(nums) - 1' },
  { num: 4, code: '' },
  { num: 5, code: '        while left < right:' },
  { num: 6, code: '            mid = left + (right - left) // 2' },
  { num: 7, code: '' },
  { num: 8, code: '            if mid % 2 == 1:' },
  { num: 9, code: '                mid -= 1' },
  { num: 10, code: '' },
  { num: 11, code: '            if nums[mid] == nums[mid + 1]:' },
  { num: 12, code: '                left = mid + 2' },
  { num: 13, code: '            else:' },
  { num: 14, code: '                right = mid' },
  { num: 15, code: '' },
  { num: 16, code: '        return nums[left]' },
]

const PROBLEM_DESCRIPTION = `You are given a sorted array consisting of only integers where every element appears exactly twice, except for one element which appears exactly once.

Return the single element that appears only once.

Your solution must run in O(log n) time and O(1) space.`

const EXAMPLES: Array<Example> = [
  {
    input: 'nums = [1,1,2,3,3,4,4,8,8]',
    output: '2',
    explanation: '2 appears once at index 2, disrupting the pair pattern.',
  },
  {
    input: 'nums = [3,3,7,7,10,11,11]',
    output: '10',
    explanation: '10 appears once at index 4.',
  },
  {
    input: 'nums = [1,2,2,3,3]',
    output: '1',
    explanation: '1 appears once at index 0.',
  },
]

const CONSTRAINTS = [
  '1 <= nums.length <= 10^5',
  '0 <= nums[i] <= 10^5',
]

interface TestCaseData {
  nums: Array<number>
  expected: number
  explanation: string
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Single in middle',
    data: {
      nums: [1, 1, 2, 3, 3, 4, 4, 8, 8],
      expected: 2,
      explanation: '2 appears once at index 2, disrupting the pair pattern',
    },
  },
  {
    id: 2,
    label: 'Single near end',
    data: {
      nums: [3, 3, 7, 7, 10, 11, 11],
      expected: 10,
      explanation: '10 appears once at index 4',
    },
  },
  {
    id: 3,
    label: 'Single at start',
    data: {
      nums: [1, 2, 2, 3, 3],
      expected: 1,
      explanation: '1 appears once at index 0',
    },
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  nums: Array<number>
  left: number
  right: number
  mid: number
  originalMid: number | null
  phase: 'init' | 'loop-check' | 'calc-mid' | 'check-parity' | 'adjust-mid' | 'compare' | 'move-left' | 'move-right' | 'found'
  comparisonResult: 'equal' | 'not-equal' | null
  highlightMid: boolean
  highlightMidPlusOne: boolean
  singleElementIndex: number
}

function findSingleIndex(nums: Array<number>): number {
  for (let i = 0; i < nums.length; i++) {
    if (i === 0 && nums[i] !== nums[i + 1]) return i
    if (i === nums.length - 1 && nums[i] !== nums[i - 1]) return i
    if (nums[i] !== nums[i - 1] && nums[i] !== nums[i + 1]) return i
  }
  return -1
}

function generateSteps(nums: Array<number>): Array<Step> {
  const steps: Array<Step> = []
  const singleElementIndex = findSingleIndex(nums)

  // Init
  steps.push({
    lineNumber: 2,
    description: 'Start singleNonDuplicate function',
    insight: 'We use binary search with a parity trick to find the single element in O(log n)',
    nums,
    left: 0,
    right: nums.length - 1,
    mid: -1,
    originalMid: null,
    phase: 'init',
    comparisonResult: null,
    highlightMid: false,
    highlightMidPlusOne: false,
    singleElementIndex,
  })

  steps.push({
    lineNumber: 3,
    description: `Initialize left = 0, right = ${nums.length - 1}`,
    insight: 'Search the entire array initially',
    nums,
    left: 0,
    right: nums.length - 1,
    mid: -1,
    originalMid: null,
    phase: 'init',
    comparisonResult: null,
    highlightMid: false,
    highlightMidPlusOne: false,
    singleElementIndex,
  })

  let left = 0
  let right = nums.length - 1

  while (left < right) {
    // Loop check
    steps.push({
      lineNumber: 5,
      description: `Check: left (${left}) < right (${right})? Yes, continue`,
      insight: 'Binary search continues until pointers converge',
      nums,
      left,
      right,
      mid: -1,
      originalMid: null,
      phase: 'loop-check',
      comparisonResult: null,
      highlightMid: false,
      highlightMidPlusOne: false,
      singleElementIndex,
    })

    // Calculate mid
    let mid = left + Math.floor((right - left) / 2)
    const originalMid = mid

    steps.push({
      lineNumber: 6,
      description: `Calculate mid = ${left} + (${right} - ${left}) // 2 = ${mid}`,
      insight: `Mid index is ${mid}, which is ${mid % 2 === 0 ? 'EVEN' : 'ODD'}`,
      nums,
      left,
      right,
      mid,
      originalMid,
      phase: 'calc-mid',
      comparisonResult: null,
      highlightMid: true,
      highlightMidPlusOne: false,
      singleElementIndex,
    })

    // Check parity
    const isOdd = mid % 2 === 1
    steps.push({
      lineNumber: 8,
      description: `Check: mid (${mid}) % 2 == 1? ${isOdd ? 'Yes, mid is odd' : 'No, mid is even'}`,
      insight: isOdd
        ? 'Mid is odd - we need to adjust to ensure we check at the start of a potential pair'
        : 'Mid is already even - no adjustment needed',
      nums,
      left,
      right,
      mid,
      originalMid,
      phase: 'check-parity',
      comparisonResult: null,
      highlightMid: true,
      highlightMidPlusOne: false,
      singleElementIndex,
    })

    // Adjust mid if odd
    if (isOdd) {
      mid -= 1
      steps.push({
        lineNumber: 9,
        description: `Adjust mid: mid -= 1 → mid = ${mid}`,
        insight: 'By always checking even indices, we ensure consistent pair-start comparisons',
        nums,
        left,
        right,
        mid,
        originalMid,
        phase: 'adjust-mid',
        comparisonResult: null,
        highlightMid: true,
        highlightMidPlusOne: false,
        singleElementIndex,
      })
    }

    // Compare nums[mid] with nums[mid+1]
    const isEqual = nums[mid] === nums[mid + 1]
    steps.push({
      lineNumber: 11,
      description: `Compare: nums[${mid}] (${nums[mid]}) == nums[${mid + 1}] (${nums[mid + 1]})? ${isEqual ? 'Yes' : 'No'}`,
      insight: isEqual
        ? 'Normal pair at even index → single element must be on the RIGHT'
        : 'Pattern broken → single element is on the LEFT (or at mid)',
      nums,
      left,
      right,
      mid,
      originalMid: null,
      phase: 'compare',
      comparisonResult: isEqual ? 'equal' : 'not-equal',
      highlightMid: true,
      highlightMidPlusOne: true,
      singleElementIndex,
    })

    if (isEqual) {
      left = mid + 2
      steps.push({
        lineNumber: 12,
        description: `Move left: left = mid + 2 = ${left}`,
        insight: 'Skip past this complete pair - search the right half',
        nums,
        left,
        right,
        mid,
        originalMid: null,
        phase: 'move-left',
        comparisonResult: 'equal',
        highlightMid: false,
        highlightMidPlusOne: false,
        singleElementIndex,
      })
    } else {
      right = mid
      steps.push({
        lineNumber: 14,
        description: `Move right: right = mid = ${right}`,
        insight: 'Single element is at mid or to its left - search the left half',
        nums,
        left,
        right,
        mid,
        originalMid: null,
        phase: 'move-right',
        comparisonResult: 'not-equal',
        highlightMid: false,
        highlightMidPlusOne: false,
        singleElementIndex,
      })
    }
  }

  // Loop exit check
  steps.push({
    lineNumber: 5,
    description: `Check: left (${left}) < right (${right})? No, loop ends`,
    insight: 'Pointers have converged - we found the single element!',
    nums,
    left,
    right,
    mid: left,
    originalMid: null,
    phase: 'found',
    comparisonResult: null,
    highlightMid: false,
    highlightMidPlusOne: false,
    singleElementIndex,
  })

  // Return
  steps.push({
    lineNumber: 16,
    description: `Return nums[${left}] = ${nums[left]}`,
    insight: `The single element is ${nums[left]}!`,
    nums,
    left,
    right,
    mid: left,
    originalMid: null,
    phase: 'found',
    comparisonResult: null,
    highlightMid: false,
    highlightMidPlusOne: false,
    singleElementIndex,
  })

  return steps
}

// Color palette for pairs
const PAIR_COLORS = [
  { bg: 'bg-blue-500/30', border: 'border-blue-400' },
  { bg: 'bg-purple-500/30', border: 'border-purple-400' },
  { bg: 'bg-pink-500/30', border: 'border-pink-400' },
  { bg: 'bg-amber-500/30', border: 'border-amber-400' },
  { bg: 'bg-teal-500/30', border: 'border-teal-400' },
]

function SingleElementSortedVisualization() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTestCase, setSelectedTestCase] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.nums), [testCase.data.nums])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Build pair color mapping
  const pairColorMap = useMemo(() => {
    const map = new Map<number, number>()
    let colorIndex = 0
    let i = 0
    while (i < testCase.data.nums.length) {
      if (i === step.singleElementIndex) {
        map.set(i, -1) // Single element marker
        i++
      } else if (i + 1 < testCase.data.nums.length && testCase.data.nums[i] === testCase.data.nums[i + 1]) {
        map.set(i, colorIndex)
        map.set(i + 1, colorIndex)
        colorIndex = (colorIndex + 1) % PAIR_COLORS.length
        i += 2
      } else {
        map.set(i, -1)
        i++
      }
    }
    return map
  }, [testCase.data.nums, step.singleElementIndex])

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 20px rgba(251, 146, 60, 0.4); }
        .glow-purple { box-shadow: 0 0 20px rgba(192, 132, 252, 0.4); }
        .glow-green { box-shadow: 0 0 20px rgba(74, 222, 128, 0.4); }
        .glow-emerald { box-shadow: 0 0 25px rgba(52, 211, 153, 0.5); }

        @keyframes pulse-found {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(52, 211, 153, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(52, 211, 153, 0.6); }
        }
        .animate-pulse-found {
          animation: pulse-found 1s ease-in-out infinite;
        }
      `}</style>

      {/* Array Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Array with Pair Highlighting</span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {step.nums.map((num, i) => {
              const isLeft = i === step.left
              const isRight = i === step.right
              const isMid = step.highlightMid && i === step.mid
              const isMidPlusOne = step.highlightMidPlusOne && i === step.mid + 1
              const isSingle = i === step.singleElementIndex
              const isInRange = i >= step.left && i <= step.right
              const isFound = step.phase === 'found' && i === step.left

              const pairColorIdx = pairColorMap.get(i) ?? -1
              const pairColor = pairColorIdx >= 0 ? PAIR_COLORS[pairColorIdx] : null

              let bgColor = 'bg-slate-700/50'
              let borderColor = 'border-slate-600'
              let glowClass = ''

              if (isFound) {
                bgColor = 'bg-emerald-500/40'
                borderColor = 'border-emerald-400'
                glowClass = 'animate-pulse-found'
              } else if (isSingle && isInRange) {
                bgColor = 'bg-emerald-500/30'
                borderColor = 'border-emerald-400'
              } else if (isMid) {
                bgColor = 'bg-purple-500/40'
                borderColor = 'border-purple-400'
                glowClass = 'glow-purple'
              } else if (isMidPlusOne) {
                bgColor = 'bg-purple-500/20'
                borderColor = 'border-purple-300'
              } else if (pairColor && isInRange) {
                bgColor = pairColor.bg
                borderColor = pairColor.border
              } else if (!isInRange) {
                bgColor = 'bg-slate-800/30'
                borderColor = 'border-slate-700/50'
              }

              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${bgColor} ${borderColor} ${glowClass} ${!isInRange ? 'opacity-40' : ''}`}
                  >
                    {num}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">{i}</span>
                  <span className={`text-[9px] ${i % 2 === 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
                    {i % 2 === 0 ? 'E' : 'O'}
                  </span>
                  <div className="flex gap-0.5 mt-0.5 h-4">
                    {isLeft && <span className="text-[8px] px-1 rounded bg-cyan-500/30 text-cyan-300">L</span>}
                    {isMid && <span className="text-[8px] px-1 rounded bg-purple-500/30 text-purple-300">M</span>}
                    {isRight && <span className="text-[8px] px-1 rounded bg-orange-500/30 text-orange-300">R</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">E</span>
              <span className="text-slate-500">= Even</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-400">O</span>
              <span className="text-slate-500">= Odd</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400"></div>
              <span className="text-slate-500">= Single</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Panel */}
      {step.comparisonResult && (
        <div
          className={`rounded-xl border p-4 ${
            step.comparisonResult === 'equal'
              ? 'bg-blue-500/10 border-blue-500/50'
              : 'bg-amber-500/10 border-amber-500/50'
          }`}
        >
          <div className="text-slate-400 text-sm font-mono mb-2">Comparison Result</div>
          <div className="font-mono text-center">
            <span className="text-purple-300">nums[{step.mid}]</span>
            <span className="text-slate-400"> ({step.nums[step.mid]}) </span>
            <span className={step.comparisonResult === 'equal' ? 'text-emerald-400' : 'text-red-400'}>
              {step.comparisonResult === 'equal' ? '==' : '!='}
            </span>
            <span className="text-purple-300"> nums[{step.mid + 1}]</span>
            <span className="text-slate-400"> ({step.nums[step.mid + 1]})</span>
          </div>
          <div className={`text-center text-sm mt-2 ${step.comparisonResult === 'equal' ? 'text-blue-300' : 'text-amber-300'}`}>
            {step.comparisonResult === 'equal'
              ? '→ Normal pair at even index → Search RIGHT'
              : '→ Pattern broken → Search LEFT (or at mid)'}
          </div>
        </div>
      )}

      {/* Mid Adjustment */}
      {step.originalMid !== null && step.originalMid !== step.mid && (
        <div className="bg-slate-800/50 rounded-xl border border-purple-500/30 p-4">
          <div className="text-purple-400 text-sm font-mono mb-2">Mid Adjustment</div>
          <div className="font-mono text-center">
            <span className="text-slate-400">Original mid: </span>
            <span className="text-orange-300">{step.originalMid}</span>
            <span className="text-slate-400"> (odd) → Adjusted to: </span>
            <span className="text-purple-300">{step.mid}</span>
            <span className="text-slate-400"> (even)</span>
          </div>
          <div className="text-center text-xs text-slate-500 mt-1">
            Always check at the start of a potential pair
          </div>
        </div>
      )}

      {/* Variables */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-400 text-sm font-mono mb-3">Variables</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border bg-cyan-500/10 border-cyan-400/50">
            <div className="text-xs text-slate-500 mb-1">left</div>
            <div className="font-mono text-xl text-cyan-300">{step.left}</div>
          </div>
          <div className="p-3 rounded-lg border bg-purple-500/10 border-purple-400/50">
            <div className="text-xs text-slate-500 mb-1">mid</div>
            <div className="font-mono text-xl text-purple-300">{step.mid >= 0 ? step.mid : '-'}</div>
          </div>
          <div className="p-3 rounded-lg border bg-orange-500/10 border-orange-400/50">
            <div className="text-xs text-slate-500 mb-1">right</div>
            <div className="font-mono text-xl text-orange-300">{step.right}</div>
          </div>
        </div>
      </div>
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Parity Pattern</h4>
          <p className="text-slate-400">
            Before the single element, pairs start at <span className="text-cyan-300">even</span> indices (E,O).
            After it, pairs start at <span className="text-orange-300">odd</span> indices (O,E).
            The single element disrupts this pattern!
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Why Adjust Mid to Even?</h4>
          <p className="text-slate-400">
            By always comparing at an even index, we check the "start" of a potential pair.
            If <code className="text-purple-300">nums[mid] == nums[mid+1]</code>, the pair is intact → single is on the right.
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
          <span className="text-emerald-400 font-mono">Time: O(log n)</span>
        </div>
        <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
          <span className="text-emerald-400 font-mono">Space: O(1)</span>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '540',
        title: 'Single Element in a Sorted Array',
        difficulty: 'medium',
        tags: ['Array', 'Binary Search'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="single_element.py"
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
