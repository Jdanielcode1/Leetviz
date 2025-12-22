import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/single-element-sorted')({
  component: SingleElementSortedVisualization,
})

const CODE_LINES = [
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

interface TestCase {
  id: number
  name: string
  nums: number[]
  expected: number
  explanation: string
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Single in middle',
    nums: [1, 1, 2, 3, 3, 4, 4, 8, 8],
    expected: 2,
    explanation: '2 appears once at index 2, disrupting the pair pattern',
  },
  {
    id: 2,
    name: 'Single near end',
    nums: [3, 3, 7, 7, 10, 11, 11],
    expected: 10,
    explanation: '10 appears once at index 4',
  },
  {
    id: 3,
    name: 'Single at start',
    nums: [1, 2, 2, 3, 3],
    expected: 1,
    explanation: '1 appears once at index 0',
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  nums: number[]
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

function findSingleIndex(nums: number[]): number {
  for (let i = 0; i < nums.length; i++) {
    if (i === 0 && nums[i] !== nums[i + 1]) return i
    if (i === nums.length - 1 && nums[i] !== nums[i - 1]) return i
    if (nums[i] !== nums[i - 1] && nums[i] !== nums[i + 1]) return i
  }
  return -1
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = []
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
  const [showTestCase, setShowTestCase] = useState(false)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.nums), [selectedTestCase])
  const step = steps[currentStep]

  const handlePrevious = () => setCurrentStep((s) => Math.max(0, s - 1))
  const handleNext = () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
  const handleReset = () => setCurrentStep(0)

  // Build pair color mapping
  const pairColorMap = useMemo(() => {
    const map = new Map<number, number>()
    let colorIndex = 0
    let i = 0
    while (i < testCase.nums.length) {
      if (i === step.singleElementIndex) {
        map.set(i, -1) // Single element marker
        i++
      } else if (i + 1 < testCase.nums.length && testCase.nums[i] === testCase.nums[i + 1]) {
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
  }, [testCase.nums, step.singleElementIndex])

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100 font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        .font-display { font-family: 'Outfit', sans-serif; }
        .font-code { font-family: 'IBM Plex Mono', monospace; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }

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

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
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
                  <span className="text-slate-500 font-mono">#540</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Single Element in a Sorted Array
                </h1>
                <div className="flex gap-2">
                  {['Array', 'Binary Search'].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        {/* Test Case Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-slate-400 text-sm font-display">Test Case:</span>
            <div className="flex gap-2">
              {TEST_CASES.map((tc, i) => (
                <button
                  key={tc.id}
                  onClick={() => {
                    setSelectedTestCase(i)
                    setCurrentStep(0)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-display transition-all ${
                    selectedTestCase === i
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowTestCase(!showTestCase)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showTestCase ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Show Test Case Details
          </button>

          {showTestCase && (
            <div className="mt-3 p-4 bg-slate-900/70 rounded-lg border border-slate-700 animate-slide-in">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Input:</span>
                  <div className="font-code text-cyan-300 mt-1">nums = [{testCase.nums.join(', ')}]</div>
                </div>
                <div>
                  <span className="text-slate-500">Expected Output:</span>
                  <div className="font-code text-emerald-300 mt-1">{testCase.expected}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <span className="text-slate-500 text-sm">Explanation:</span>
                <p className="text-slate-300 text-sm mt-1">{testCase.explanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Code Panel */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
              <span className="text-slate-500 font-mono text-xs">single_element.py</span>
            </div>
            <div className="p-4 font-code text-sm overflow-auto max-h-[500px]">
              {CODE_LINES.map((line) => {
                const isActive = line.num === step.lineNumber
                return (
                  <div
                    key={line.num}
                    className={`flex py-0.5 rounded transition-all duration-200 ${
                      isActive ? 'bg-orange-500/20 border-l-2 border-orange-400 -ml-[2px]' : ''
                    }`}
                  >
                    <span className="w-8 text-right pr-4 text-slate-600 select-none text-xs leading-6">
                      {line.num}
                    </span>
                    <pre className={`leading-6 ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {line.code || ' '}
                    </pre>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="space-y-4">
            {/* Array Visualization */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-4">Array with Pair Highlighting</div>

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
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-code text-sm font-bold transition-all duration-300 ${bgColor} ${borderColor} ${glowClass} ${!isInRange ? 'opacity-40' : ''}`}
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

            {/* Comparison Panel */}
            {step.comparisonResult && (
              <div
                className={`bg-slate-900/70 rounded-xl border p-4 ${
                  step.comparisonResult === 'equal'
                    ? 'border-blue-500/50'
                    : 'border-amber-500/50'
                }`}
              >
                <div className="text-slate-400 text-sm font-display mb-2">Comparison Result</div>
                <div className="font-code text-center">
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
              <div className="bg-slate-900/70 rounded-xl border border-purple-500/30 p-4">
                <div className="text-purple-400 text-sm font-display mb-2">Mid Adjustment</div>
                <div className="font-code text-center">
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
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-3">Variables</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-cyan-500/10 border-cyan-400/50">
                  <div className="text-xs text-slate-500 mb-1">left</div>
                  <div className="font-code text-xl text-cyan-300">{step.left}</div>
                </div>
                <div className="p-3 rounded-lg border bg-purple-500/10 border-purple-400/50">
                  <div className="text-xs text-slate-500 mb-1">mid</div>
                  <div className="font-code text-xl text-purple-300">{step.mid >= 0 ? step.mid : '-'}</div>
                </div>
                <div className="p-3 rounded-lg border bg-orange-500/10 border-orange-400/50">
                  <div className="text-xs text-slate-500 mb-1">right</div>
                  <div className="font-code text-xl text-orange-300">{step.right}</div>
                </div>
              </div>
            </div>

            {/* Step Info */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-cyan-300 font-display font-medium mb-2">{step.description}</div>
              <div className="text-slate-400 text-sm">{step.insight}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-display transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-display transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-500 text-sm font-code">
            Step {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-display transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

          {/* Algorithm Insight */}
          <div className="mt-8 bg-slate-900/70 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-display font-semibold text-slate-100 mb-4">Algorithm Insight</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-cyan-400 font-medium mb-2">Parity Pattern</h4>
                <p className="text-slate-400">
                  Before the single element, pairs start at <span className="text-cyan-300">even</span> indices (E,O).
                  After it, pairs start at <span className="text-orange-300">odd</span> indices (O,E).
                  The single element disrupts this pattern!
                </p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-medium mb-2">Why Adjust Mid to Even?</h4>
                <p className="text-slate-400">
                  By always comparing at an even index, we check the "start" of a potential pair.
                  If <code className="text-purple-300">nums[mid] == nums[mid+1]</code>, the pair is intact → single is on the right.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex gap-6">
              <div>
                <span className="text-slate-500">Time:</span>
                <span className="text-emerald-300 ml-2 font-code">O(log n)</span>
              </div>
              <div>
                <span className="text-slate-500">Space:</span>
                <span className="text-emerald-300 ml-2 font-code">O(1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
