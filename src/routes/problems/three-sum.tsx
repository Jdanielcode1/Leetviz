import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/three-sum')({
  component: ThreeSum,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def threeSum(self, nums: List[int]) -> List[List[int]]:' },
  { num: 3, code: '        res = []' },
  { num: 4, code: '        nums.sort()' },
  { num: 5, code: '' },
  { num: 6, code: '        for i, a in enumerate(nums):' },
  { num: 7, code: '            if a > 0:' },
  { num: 8, code: '                break' },
  { num: 9, code: '' },
  { num: 10, code: '            if i > 0 and a == nums[i - 1]:' },
  { num: 11, code: '                continue' },
  { num: 12, code: '' },
  { num: 13, code: '            l, r = i + 1, len(nums) - 1' },
  { num: 14, code: '            while l < r:' },
  { num: 15, code: '                threeSum = a + nums[l] + nums[r]' },
  { num: 16, code: '                if threeSum > 0:' },
  { num: 17, code: '                    r -= 1' },
  { num: 18, code: '                elif threeSum < 0:' },
  { num: 19, code: '                    l += 1' },
  { num: 20, code: '                else:' },
  { num: 21, code: '                    res.append([a, nums[l], nums[r]])' },
  { num: 22, code: '                    l += 1' },
  { num: 23, code: '                    r -= 1' },
  { num: 24, code: '                    while nums[l] == nums[l - 1] and l < r:' },
  { num: 25, code: '                        l += 1' },
  { num: 26, code: '' },
  { num: 27, code: '        return res' },
]

const PROBLEM_DESCRIPTION = `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] where nums[i] + nums[j] + nums[k] == 0, and the indices i, j and k are all distinct.

The output should not contain any duplicate triplets.`

interface Step {
  lineNumber: number
  description: string
  insight: string
  originalNums: number[]
  nums: number[]
  i: number | null
  l: number | null
  r: number | null
  currentSum: number | null
  result: number[][]
  phase: 'init' | 'sort' | 'fix-i' | 'skip-pos' | 'skip-dup' | 'init-pointers' | 'calc-sum' | 'move-r' | 'move-l' | 'found' | 'skip-dup-l' | 'complete'
}

interface TestCase {
  id: number
  nums: number[]
  expected: number[][]
}

const TEST_CASES: TestCase[] = [
  { id: 1, nums: [-1, 0, 1, 2, -1, -4], expected: [[-1, -1, 2], [-1, 0, 1]] },
  { id: 2, nums: [0, 1, 1], expected: [] },
  { id: 3, nums: [0, 0, 0], expected: [[0, 0, 0]] },
]

function generateSteps(originalNums: number[]): Step[] {
  const steps: Step[] = []
  const nums = [...originalNums].sort((a, b) => a - b)
  const result: number[][] = []

  // Init
  steps.push({
    lineNumber: 3,
    description: 'Initialize empty result array',
    insight: 'We will collect all valid triplets that sum to zero.',
    originalNums,
    nums: [...originalNums],
    i: null,
    l: null,
    r: null,
    currentSum: null,
    result: [],
    phase: 'init',
  })

  // Sort
  steps.push({
    lineNumber: 4,
    description: `Sort array: [${originalNums.join(', ')}] → [${nums.join(', ')}]`,
    insight: 'Sorting enables the two-pointer technique and makes duplicate detection easy.',
    originalNums,
    nums: [...nums],
    i: null,
    l: null,
    r: null,
    currentSum: null,
    result: [],
    phase: 'sort',
  })

  for (let i = 0; i < nums.length; i++) {
    const a = nums[i]

    // Check positive break
    if (a > 0) {
      steps.push({
        lineNumber: 7,
        description: `a = ${a} > 0, break`,
        insight: 'Since array is sorted, all remaining numbers are positive. No triplet can sum to 0.',
        originalNums,
        nums: [...nums],
        i,
        l: null,
        r: null,
        currentSum: null,
        result: [...result],
        phase: 'skip-pos',
      })
      break
    }

    // Fix i
    steps.push({
      lineNumber: 6,
      description: `Fix i=${i}, a = nums[${i}] = ${a}`,
      insight: `We fix the first element and use two pointers for the remaining two.`,
      originalNums,
      nums: [...nums],
      i,
      l: null,
      r: null,
      currentSum: null,
      result: [...result],
      phase: 'fix-i',
    })

    // Skip duplicate i
    if (i > 0 && a === nums[i - 1]) {
      steps.push({
        lineNumber: 10,
        description: `Skip duplicate: nums[${i}] = ${a} == nums[${i - 1}] = ${nums[i - 1]}`,
        insight: 'Skip duplicate values for the first element to avoid duplicate triplets.',
        originalNums,
        nums: [...nums],
        i,
        l: null,
        r: null,
        currentSum: null,
        result: [...result],
        phase: 'skip-dup',
      })
      continue
    }

    let l = i + 1
    let r = nums.length - 1

    // Init pointers
    steps.push({
      lineNumber: 13,
      description: `Initialize pointers: l = ${l}, r = ${r}`,
      insight: 'Left pointer starts after i, right pointer at the end.',
      originalNums,
      nums: [...nums],
      i,
      l,
      r,
      currentSum: null,
      result: [...result],
      phase: 'init-pointers',
    })

    while (l < r) {
      const threeSum = a + nums[l] + nums[r]

      // Calculate sum
      steps.push({
        lineNumber: 15,
        description: `threeSum = ${a} + ${nums[l]} + ${nums[r]} = ${threeSum}`,
        insight: `Calculate sum of triplet (nums[${i}], nums[${l}], nums[${r}]).`,
        originalNums,
        nums: [...nums],
        i,
        l,
        r,
        currentSum: threeSum,
        result: [...result],
        phase: 'calc-sum',
      })

      if (threeSum > 0) {
        steps.push({
          lineNumber: 17,
          description: `Sum ${threeSum} > 0, move r left: r = ${r - 1}`,
          insight: 'Sum too large. Moving right pointer left decreases the sum.',
          originalNums,
          nums: [...nums],
          i,
          l,
          r,
          currentSum: threeSum,
          result: [...result],
          phase: 'move-r',
        })
        r--
      } else if (threeSum < 0) {
        steps.push({
          lineNumber: 19,
          description: `Sum ${threeSum} < 0, move l right: l = ${l + 1}`,
          insight: 'Sum too small. Moving left pointer right increases the sum.',
          originalNums,
          nums: [...nums],
          i,
          l,
          r,
          currentSum: threeSum,
          result: [...result],
          phase: 'move-l',
        })
        l++
      } else {
        // Found triplet
        result.push([a, nums[l], nums[r]])
        steps.push({
          lineNumber: 21,
          description: `Found triplet! [${a}, ${nums[l]}, ${nums[r]}]`,
          insight: 'Sum equals 0. Add triplet to result.',
          originalNums,
          nums: [...nums],
          i,
          l,
          r,
          currentSum: 0,
          result: [...result],
          phase: 'found',
        })

        l++
        r--

        // Skip duplicates for l
        while (l < r && nums[l] === nums[l - 1]) {
          steps.push({
            lineNumber: 24,
            description: `Skip duplicate l: nums[${l}] = ${nums[l]} == nums[${l - 1}]`,
            insight: 'Skip duplicate left values to avoid duplicate triplets.',
            originalNums,
            nums: [...nums],
            i,
            l,
            r,
            currentSum: null,
            result: [...result],
            phase: 'skip-dup-l',
          })
          l++
        }
      }
    }
  }

  // Complete
  steps.push({
    lineNumber: 27,
    description: `Return ${result.length} triplet(s)`,
    insight: result.length > 0
      ? `Found triplets: ${result.map(t => `[${t.join(',')}]`).join(', ')}`
      : 'No triplets found that sum to zero.',
    originalNums,
    nums: [...nums],
    i: null,
    l: null,
    r: null,
    currentSum: null,
    result: [...result],
    phase: 'complete',
  })

  return steps
}

function ThreeSum() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.nums), [testCase.nums])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const getSumColor = (sum: number | null) => {
    if (sum === null) return 'text-slate-400'
    if (sum === 0) return 'text-emerald-400'
    if (sum > 0) return 'text-red-400'
    return 'text-blue-400'
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

        .glow-orange {
          box-shadow: 0 0 15px rgba(251, 146, 60, 0.4);
        }

        .glow-cyan {
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
        }

        .glow-purple {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }

        .glow-green {
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
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
                  <span className="text-slate-500 font-mono">#15</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  3Sum
                </h1>
                <div className="flex gap-2">
                  {['Array', 'Two Pointers', 'Sorting'].map((tag) => (
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
                    [{tc.nums.join(',')}]
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
                <span className="text-slate-500 font-mono text-xs">three_sum.py</span>
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
              {/* Array Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-slate-300 font-mono text-sm">SORTED ARRAY</span>
                  {step.currentSum !== null && (
                    <span className={`font-mono text-sm ${getSumColor(step.currentSum)}`}>
                      Sum: {step.currentSum} {step.currentSum === 0 ? '✓' : step.currentSum > 0 ? '(too high)' : '(too low)'}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {step.nums.map((num, idx) => {
                      const isI = idx === step.i
                      const isL = idx === step.l
                      const isR = idx === step.r

                      return (
                        <div key={idx} className="flex flex-col items-center">
                          {/* Pointer labels */}
                          <div className="h-6 text-xs font-mono flex gap-1">
                            {isI && <span className="text-orange-400">i</span>}
                            {isL && <span className="text-cyan-400">l</span>}
                            {isR && <span className="text-purple-400">r</span>}
                          </div>
                          {/* Cell */}
                          <div
                            className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-lg transition-all duration-300 ${
                              isI
                                ? 'bg-orange-500/30 border-2 border-orange-400 text-orange-300 glow-orange'
                                : isL
                                ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 glow-cyan'
                                : isR
                                ? 'bg-purple-500/30 border-2 border-purple-400 text-purple-300 glow-purple'
                                : 'bg-slate-800 border border-slate-600 text-slate-300'
                            }`}
                          >
                            {num}
                          </div>
                          {/* Index */}
                          <span className="text-slate-600 text-xs mt-1 font-mono">{idx}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Current Sum Calculation */}
              {step.i !== null && step.l !== null && step.r !== null && step.currentSum !== null && (
                <div className={`rounded-xl border p-4 ${
                  step.currentSum === 0
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : step.currentSum > 0
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}>
                  <div className="flex items-center justify-center gap-2 font-mono text-lg">
                    <span className="text-orange-400">{step.nums[step.i]}</span>
                    <span className="text-slate-500">+</span>
                    <span className="text-cyan-400">{step.nums[step.l]}</span>
                    <span className="text-slate-500">+</span>
                    <span className="text-purple-400">{step.nums[step.r]}</span>
                    <span className="text-slate-500">=</span>
                    <span className={getSumColor(step.currentSum)}>{step.currentSum}</span>
                  </div>
                </div>
              )}

              {/* Found Triplets */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">FOUND TRIPLETS ({step.result.length})</span>
                </div>
                <div className="p-6">
                  {step.result.length === 0 ? (
                    <div className="text-center text-slate-600 font-mono">No triplets found yet</div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {step.result.map((triplet, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono glow-green"
                        >
                          [{triplet.join(', ')}]
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                        Found {step.result.length} triplet(s)
                      </div>
                      <div className="text-slate-500 font-mono text-sm">
                        Expected: {testCase.expected.length} triplet(s)
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
                <h4 className="text-orange-400 font-mono mb-2">Fix First Element</h4>
                <p className="text-slate-400">
                  Iterate through array, fixing one element at a time.
                  For each fixed element, use two pointers to find pairs.
                </p>
              </div>
              <div>
                <h4 className="text-cyan-400 font-mono mb-2">Two Pointer Technique</h4>
                <p className="text-slate-400">
                  After sorting, move left/right pointers based on sum.
                  Too high? Move right left. Too low? Move left right.
                </p>
              </div>
              <div>
                <h4 className="text-purple-400 font-mono mb-2">Skip Duplicates</h4>
                <p className="text-slate-400">
                  Skip duplicate values for both the fixed element and
                  left pointer to avoid duplicate triplets in result.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(n²)</h4>
                <p className="text-slate-400">
                  Sorting takes O(n log n). For each element, two-pointer scan is O(n). Total: O(n²).
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(1) or O(n)</h4>
                <p className="text-slate-400">
                  Depends on sorting implementation. Excluding output array, O(1) extra space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
