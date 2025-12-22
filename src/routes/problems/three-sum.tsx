import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/three-sum')({
  component: ThreeSum,
})

const CODE_LINES: Array<CodeLine> = [
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

const EXAMPLES: Array<Example> = [
  {
    input: 'nums = [-1,0,1,2,-1,-4]',
    output: '[[-1,-1,2],[-1,0,1]]',
    explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0. The distinct triplets are [-1,0,1] and [-1,-1,2].',
  },
  {
    input: 'nums = [0,1,1]',
    output: '[]',
    explanation: 'The only possible triplet does not sum up to 0.',
  },
  {
    input: 'nums = [0,0,0]',
    output: '[[0,0,0]]',
    explanation: 'The only possible triplet sums up to 0.',
  },
]

const CONSTRAINTS = [
  '3 <= nums.length <= 3000',
  '-10^5 <= nums[i] <= 10^5',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  originalNums: Array<number>
  nums: Array<number>
  i: number | null
  l: number | null
  r: number | null
  currentSum: number | null
  result: Array<Array<number>>
  phase: 'init' | 'sort' | 'fix-i' | 'skip-pos' | 'skip-dup' | 'init-pointers' | 'calc-sum' | 'move-r' | 'move-l' | 'found' | 'skip-dup-l' | 'complete'
}

interface TestCaseData {
  nums: Array<number>
  expected: Array<Array<number>>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: '[-1,0,1,2,-1,-4]', data: { nums: [-1, 0, 1, 2, -1, -4], expected: [[-1, -1, 2], [-1, 0, 1]] } },
  { id: 2, label: '[0,1,1]', data: { nums: [0, 1, 1], expected: [] } },
  { id: 3, label: '[0,0,0]', data: { nums: [0, 0, 0], expected: [[0, 0, 0]] } },
]

function generateSteps(originalNums: Array<number>): Array<Step> {
  const steps: Array<Step> = []
  const nums = [...originalNums].sort((a, b) => a - b)
  const result: Array<Array<number>> = []

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
  const steps = useMemo(() => generateSteps(testCase.data.nums), [testCase.data.nums])
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

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
      `}</style>

      {/* Array Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">Sorted Array</span>
          {step.currentSum !== null && (
            <span className={`font-mono text-sm ${getSumColor(step.currentSum)}`}>
              Sum: {step.currentSum} {step.currentSum === 0 ? '✓' : step.currentSum > 0 ? '(too high)' : '(too low)'}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {step.nums.map((num, idx) => {
              const isI = idx === step.i
              const isL = idx === step.l
              const isR = idx === step.r

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="h-5 text-xs font-mono flex gap-1">
                    {isI && <span className="text-orange-400">i</span>}
                    {isL && <span className="text-cyan-400">l</span>}
                    {isR && <span className="text-purple-400">r</span>}
                  </div>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono text-sm transition-all duration-300 ${
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
                  <span className="text-slate-600 text-xs mt-1 font-mono">{idx}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sum Calculation */}
      {step.i !== null && step.l !== null && step.r !== null && step.currentSum !== null && (
        <div className={`rounded-xl border p-3 ${
          step.currentSum === 0
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : step.currentSum > 0
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        }`}>
          <div className="flex items-center justify-center gap-2 font-mono text-sm">
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Found Triplets ({step.result.length})</span>
        </div>
        <div className="p-4">
          {step.result.length === 0 ? (
            <div className="text-center text-slate-600 font-mono text-sm">No triplets found yet</div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {step.result.map((triplet, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-sm glow-green"
                >
                  [{triplet.join(', ')}]
                </div>
              ))}
            </div>
          )}
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
              <div className="text-emerald-400 font-mono">Found {step.result.length} triplet(s)</div>
              <div className="text-slate-500 font-mono text-xs">
                Expected: {testCase.data.expected.length} triplet(s)
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
          <h4 className="text-orange-400 font-mono mb-1">Fix First Element</h4>
          <p className="text-slate-400">Iterate through array, fixing one element at a time.</p>
        </div>
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Two Pointer Technique</h4>
          <p className="text-slate-400">Move left/right pointers based on sum comparison.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n²)</span>
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
        number: '15',
        title: '3Sum',
        difficulty: 'medium',
        tags: ['Array', 'Two Pointers', 'Sorting'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="three_sum.py"
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
