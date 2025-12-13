import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/subarray-sum-k')({
  component: SubarraySumK,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def subarraySum(self, nums: List[int], k: int) -> int:' },
  { num: 3, code: '        res = 0' },
  { num: 4, code: '        curSum = 0' },
  { num: 5, code: '        prefixSums = { 0 : 1 }' },
  { num: 6, code: '' },
  { num: 7, code: '        for n in nums:' },
  { num: 8, code: '            curSum += n' },
  { num: 9, code: '            diff = curSum - k' },
  { num: 10, code: '' },
  { num: 11, code: '            res += prefixSums.get(diff, 0)' },
  { num: 12, code: '            prefixSums[curSum] = 1 + prefixSums.get(curSum, 0)' },
  { num: 13, code: '' },
  { num: 14, code: '        return res' },
]

const PROBLEM_DESCRIPTION = `Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.

A subarray is a contiguous non-empty sequence of elements within an array.`

interface Step {
  lineNumber: number
  description: string
  insight: string
  currentIndex: number
  nums: number[]
  k: number
  res: number
  curSum: number
  diff: number | null
  prefixSums: Map<number, number>
  highlightLookup: number | null
  highlightUpdate: number | null
  foundCount: number
  phase: 'init' | 'loop' | 'add-num' | 'calc-diff' | 'lookup' | 'update-map' | 'complete'
}

interface TestCase {
  id: number
  nums: number[]
  k: number
  expected: number
}

const TEST_CASES: TestCase[] = [
  { id: 1, nums: [1, 1, 1], k: 2, expected: 2 },
  { id: 2, nums: [1, 2, 3], k: 3, expected: 2 },
  { id: 3, nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7, expected: 4 },
]

function generateSteps(nums: number[], k: number): Step[] {
  const steps: Step[] = []

  // Initial state - res
  steps.push({
    lineNumber: 3,
    description: 'Initialize result counter to 0',
    insight: 'res will count the total number of subarrays that sum to k.',
    currentIndex: -1,
    nums,
    k,
    res: 0,
    curSum: 0,
    diff: null,
    prefixSums: new Map(),
    highlightLookup: null,
    highlightUpdate: null,
    foundCount: 0,
    phase: 'init',
  })

  // curSum init
  steps.push({
    lineNumber: 4,
    description: 'Initialize running sum to 0',
    insight: 'curSum tracks the prefix sum from index 0 to current position.',
    currentIndex: -1,
    nums,
    k,
    res: 0,
    curSum: 0,
    diff: null,
    prefixSums: new Map(),
    highlightLookup: null,
    highlightUpdate: null,
    foundCount: 0,
    phase: 'init',
  })

  // prefixSums init
  const prefixSums = new Map<number, number>([[0, 1]])
  steps.push({
    lineNumber: 5,
    description: 'Initialize prefixSums with {0: 1}',
    insight: 'We start with prefix sum 0 having count 1. This handles subarrays starting from index 0.',
    currentIndex: -1,
    nums,
    k,
    res: 0,
    curSum: 0,
    diff: null,
    prefixSums: new Map(prefixSums),
    highlightLookup: null,
    highlightUpdate: 0,
    foundCount: 0,
    phase: 'init',
  })

  let res = 0
  let curSum = 0

  for (let i = 0; i < nums.length; i++) {
    const n = nums[i]

    // Loop start
    steps.push({
      lineNumber: 7,
      description: `Processing element nums[${i}] = ${n}`,
      insight: `Iterating through the array. Current element is ${n}.`,
      currentIndex: i,
      nums,
      k,
      res,
      curSum,
      diff: null,
      prefixSums: new Map(prefixSums),
      highlightLookup: null,
      highlightUpdate: null,
      foundCount: 0,
      phase: 'loop',
    })

    // Add to curSum
    const oldCurSum = curSum
    curSum += n
    steps.push({
      lineNumber: 8,
      description: `curSum = ${oldCurSum} + ${n} = ${curSum}`,
      insight: `Update running prefix sum. curSum now represents sum of nums[0..${i}].`,
      currentIndex: i,
      nums,
      k,
      res,
      curSum,
      diff: null,
      prefixSums: new Map(prefixSums),
      highlightLookup: null,
      highlightUpdate: null,
      foundCount: 0,
      phase: 'add-num',
    })

    // Calculate diff
    const diff = curSum - k
    steps.push({
      lineNumber: 9,
      description: `diff = ${curSum} - ${k} = ${diff}`,
      insight: `We're looking for a previous prefix sum of ${diff}. If found, the subarray between that point and now sums to k.`,
      currentIndex: i,
      nums,
      k,
      res,
      curSum,
      diff,
      prefixSums: new Map(prefixSums),
      highlightLookup: diff,
      highlightUpdate: null,
      foundCount: 0,
      phase: 'calc-diff',
    })

    // Lookup diff in prefixSums
    const foundCount = prefixSums.get(diff) || 0
    const oldRes = res
    res += foundCount
    steps.push({
      lineNumber: 11,
      description: foundCount > 0
        ? `Found ${foundCount} occurrence(s) of prefix sum ${diff}. res = ${oldRes} + ${foundCount} = ${res}`
        : `Prefix sum ${diff} not found. res stays at ${res}`,
      insight: foundCount > 0
        ? `Each occurrence of prefix sum ${diff} marks a starting point for a valid subarray ending at index ${i}.`
        : `No previous prefix sum equals ${diff}, so no valid subarray ends at this position.`,
      currentIndex: i,
      nums,
      k,
      res,
      curSum,
      diff,
      prefixSums: new Map(prefixSums),
      highlightLookup: diff,
      highlightUpdate: null,
      foundCount,
      phase: 'lookup',
    })

    // Update prefixSums
    const oldCount = prefixSums.get(curSum) || 0
    prefixSums.set(curSum, oldCount + 1)
    steps.push({
      lineNumber: 12,
      description: `prefixSums[${curSum}] = ${oldCount + 1}`,
      insight: `Record that we've seen prefix sum ${curSum}. Now ${oldCount + 1} subarray(s) from index 0 sum to ${curSum}.`,
      currentIndex: i,
      nums,
      k,
      res,
      curSum,
      diff,
      prefixSums: new Map(prefixSums),
      highlightLookup: null,
      highlightUpdate: curSum,
      foundCount: 0,
      phase: 'update-map',
    })
  }

  // Return result
  steps.push({
    lineNumber: 14,
    description: `Return ${res}`,
    insight: `Total of ${res} subarray(s) found that sum to ${k}.`,
    currentIndex: -1,
    nums,
    k,
    res,
    curSum,
    diff: null,
    prefixSums: new Map(prefixSums),
    highlightLookup: null,
    highlightUpdate: null,
    foundCount: 0,
    phase: 'complete',
  })

  return steps
}

function SubarraySumK() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.nums, testCase.k), [testCase.nums, testCase.k])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Convert Map to sorted array for display
  const prefixSumsArray = Array.from(step.prefixSums.entries()).sort((a, b) => a[0] - b[0])

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
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
        }

        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
        }

        .glow-green {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
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
                  <span className="text-slate-500 font-mono">#560</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Subarray Sum Equals K
                </h1>
                <div className="flex gap-2">
                  {['Array', 'Hash Table', 'Prefix Sum'].map((tag) => (
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
                    [{tc.nums.join(',')}], k={tc.k} → {tc.expected}
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
                <span className="text-slate-500 font-mono text-xs">subarray_sum.py</span>
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
                  <span className="text-slate-300 font-mono text-sm">ARRAY (k = {step.k})</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {step.nums.map((num, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-lg transition-all duration-300 ${
                            idx === step.currentIndex
                              ? 'bg-orange-500/30 border-2 border-orange-400 text-orange-300 glow-orange'
                              : idx < step.currentIndex
                              ? 'bg-slate-800/50 border border-slate-700 text-slate-500'
                              : 'bg-slate-800 border border-slate-600 text-slate-300'
                          }`}
                        >
                          {num}
                        </div>
                        <span className="text-slate-600 text-xs mt-1 font-mono">{idx}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* State Variables */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">STATE VARIABLES</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-slate-500 text-xs font-mono mb-2">res</div>
                      <div className={`text-3xl font-mono ${step.foundCount > 0 ? 'text-green-400' : 'text-cyan-400'}`}>
                        {step.res}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-slate-500 text-xs font-mono mb-2">curSum</div>
                      <div className="text-3xl font-mono text-orange-400">{step.curSum}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-slate-500 text-xs font-mono mb-2">diff</div>
                      <div className="text-3xl font-mono text-purple-400">
                        {step.diff !== null ? step.diff : '-'}
                      </div>
                    </div>
                  </div>
                  {step.diff !== null && (
                    <div className="mt-4 text-center text-slate-500 font-mono text-sm">
                      diff = curSum - k = {step.curSum} - {step.k} = {step.diff}
                    </div>
                  )}
                </div>
              </div>

              {/* Prefix Sums HashMap */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">PREFIXSUMS HASHMAP</span>
                </div>
                <div className="p-6">
                  {prefixSumsArray.length === 0 ? (
                    <div className="text-center text-slate-600 font-mono py-4">{'{ }'}</div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {prefixSumsArray.map(([key, value]) => (
                        <div
                          key={key}
                          className={`px-4 py-3 rounded-lg font-mono transition-all duration-300 ${
                            step.highlightLookup === key
                              ? 'bg-purple-500/30 border-2 border-purple-400 text-purple-300'
                              : step.highlightUpdate === key
                              ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 glow-cyan'
                              : 'bg-slate-800 border border-slate-600 text-slate-300'
                          }`}
                        >
                          <span className="text-slate-500">{key}</span>
                          <span className="mx-2">:</span>
                          <span className={step.highlightUpdate === key ? 'text-cyan-300' : ''}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-center text-slate-600 font-mono text-xs">
                    prefixSum → count of occurrences
                  </div>
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
                        Result: {step.res} subarray(s)
                      </div>
                      <div className="text-slate-500 font-mono text-sm">
                        Expected: {testCase.expected}
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
                <h4 className="text-cyan-400 font-mono mb-2">Prefix Sum Trick</h4>
                <p className="text-slate-400">
                  If prefixSum[j] - prefixSum[i] = k, then the subarray from i+1 to j sums to k.
                  We rearrange: prefixSum[i] = prefixSum[j] - k.
                </p>
              </div>
              <div>
                <h4 className="text-orange-400 font-mono mb-2">HashMap Storage</h4>
                <p className="text-slate-400">
                  We store counts of each prefix sum seen so far. When we compute curSum - k,
                  the count tells us how many valid subarrays end at current position.
                </p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-mono mb-2">Why {'{0: 1}'}?</h4>
                <p className="text-slate-400">
                  The initial {'{0: 1}'} handles subarrays starting from index 0.
                  If curSum itself equals k, then diff=0 and we need that base case.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(n)</h4>
                <p className="text-slate-400">
                  Single pass through the array. HashMap operations (get/set) are O(1) average.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(n)</h4>
                <p className="text-slate-400">
                  HashMap stores at most n+1 unique prefix sums in the worst case.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
