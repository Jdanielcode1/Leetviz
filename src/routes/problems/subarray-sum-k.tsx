import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/subarray-sum-k')({
  component: SubarraySumK,
})

const CODE_LINES: Array<CodeLine> = [
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

const EXAMPLES: Array<Example> = [
  {
    input: 'nums = [1,1,1], k = 2',
    output: '2',
    explanation: 'There are 2 subarrays with sum 2: [1,1] starting at index 0, and [1,1] starting at index 1.',
  },
  {
    input: 'nums = [1,2,3], k = 3',
    output: '2',
    explanation: 'There are 2 subarrays with sum 3: [1,2] and [3].',
  },
]

const CONSTRAINTS = [
  '1 <= nums.length <= 2 * 10^4',
  '-1000 <= nums[i] <= 1000',
  '-10^7 <= k <= 10^7',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  currentIndex: number
  nums: Array<number>
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

interface TestCaseData {
  nums: Array<number>
  k: number
  expected: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: '[1,1,1], k=2', data: { nums: [1, 1, 1], k: 2, expected: 2 } },
  { id: 2, label: '[1,2,3], k=3', data: { nums: [1, 2, 3], k: 3, expected: 2 } },
  { id: 3, label: '[3,4,7,2,-3,1,4,2], k=7', data: { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7, expected: 4 } },
]

function generateSteps(nums: Array<number>, k: number): Array<Step> {
  const steps: Array<Step> = []

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
  const steps = useMemo(() => generateSteps(testCase.data.nums, testCase.data.k), [testCase.data.nums, testCase.data.k])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Convert Map to sorted array for display
  const prefixSumsArray = Array.from(step.prefixSums.entries()).sort((a, b) => a[0] - b[0])

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
        .glow-orange { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
        .glow-green { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
      `}</style>

      {/* Array Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">Array (k = {step.k})</span>
        </div>
        <div className="p-4">
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">State Variables</span>
        </div>
        <div className="p-4">
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">prefixSums HashMap</span>
        </div>
        <div className="p-4">
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

      {/* Completion */}
      {step.phase === 'complete' && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-emerald-400 font-mono">Result: {step.res} subarray(s)</div>
              <div className="text-slate-500 font-mono text-xs">
                Expected: {testCase.data.expected}
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
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Prefix Sum Trick</h4>
          <p className="text-slate-400">
            If prefixSum[j] - prefixSum[i] = k, then the subarray from i+1 to j sums to k.
            We rearrange: prefixSum[i] = prefixSum[j] - k.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">HashMap Storage</h4>
          <p className="text-slate-400">
            We store counts of each prefix sum seen so far. When we compute curSum - k,
            the count tells us how many valid subarrays end at current position.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Why {'{0: 1}'}?</h4>
          <p className="text-slate-400">
            The initial {'{0: 1}'} handles subarrays starting from index 0.
            If curSum itself equals k, then diff=0 and we need that base case.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(n)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '560',
        title: 'Subarray Sum Equals K',
        difficulty: 'medium',
        tags: ['Array', 'Hash Table', 'Prefix Sum'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="subarray_sum.py"
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
