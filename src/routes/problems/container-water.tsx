import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/container-water')({
  component: ContainerWaterVisualization,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def maxArea(self, height: List[int]) -> int:' },
  { num: 3, code: '        max_area = 0' },
  { num: 4, code: '        left = 0' },
  { num: 5, code: '        right = len(height) - 1' },
  { num: 6, code: '' },
  { num: 7, code: '        while left < right:' },
  { num: 8, code: '            width = right - left' },
  { num: 9, code: '            h = min(height[left], height[right])' },
  { num: 10, code: '            area = width * h' },
  { num: 11, code: '            max_area = max(max_area, area)' },
  { num: 12, code: '' },
  { num: 13, code: '            if height[left] < height[right]:' },
  { num: 14, code: '                left += 1' },
  { num: 15, code: '            else:' },
  { num: 16, code: '                right -= 1' },
  { num: 17, code: '' },
  { num: 18, code: '        return max_area' },
]

const PROBLEM_DESCRIPTION = `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.`

const EXAMPLES: Array<Example> = [
  {
    input: 'height = [1,8,6,2,5,4,8,3,7]',
    output: '49',
    explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.',
  },
  {
    input: 'height = [1,1]',
    output: '1',
  },
]

const CONSTRAINTS = [
  'n == height.length',
  '2 <= n <= 10^5',
  '0 <= height[i] <= 10^4',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  height: Array<number>
  left: number
  right: number
  maxArea: number
  currentArea: number
  currentWidth: number
  currentHeight: number
  phase: 'init' | 'calc-area' | 'check-max' | 'compare-heights' | 'move-left' | 'move-right' | 'complete'
  highlightLeft: boolean
  highlightRight: boolean
  newMaxFound: boolean
  bestLeft: number | null
  bestRight: number | null
}

interface TestCaseData {
  height: Array<number>
  expected: number
  explanation: string
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Main Example',
    data: {
      height: [1, 8, 6, 2, 5, 4, 8, 3, 7],
      expected: 49,
      explanation: 'Lines at index 1 (height 8) and index 8 (height 7), area = 7 × 7 = 49',
    },
  },
  {
    id: 2,
    label: 'Simple Case',
    data: {
      height: [1, 1],
      expected: 1,
      explanation: 'Only two lines, area = 1 × 1 = 1',
    },
  },
  {
    id: 3,
    label: 'Symmetric',
    data: {
      height: [4, 3, 2, 1, 4],
      expected: 16,
      explanation: 'First and last lines, area = 4 × 4 = 16',
    },
  },
]

function generateSteps(height: Array<number>): Array<Step> {
  const steps: Array<Step> = []
  let bestLeft: number | null = null
  let bestRight: number | null = null

  // Init steps
  steps.push({
    lineNumber: 2,
    description: 'Start maxArea function',
    insight: 'We need to find two lines that form a container holding the most water',
    height,
    left: 0,
    right: height.length - 1,
    maxArea: 0,
    currentArea: 0,
    currentWidth: 0,
    currentHeight: 0,
    phase: 'init',
    highlightLeft: false,
    highlightRight: false,
    newMaxFound: false,
    bestLeft: null,
    bestRight: null,
  })

  steps.push({
    lineNumber: 3,
    description: 'Initialize max_area = 0',
    insight: 'We will track the maximum area found so far',
    height,
    left: 0,
    right: height.length - 1,
    maxArea: 0,
    currentArea: 0,
    currentWidth: 0,
    currentHeight: 0,
    phase: 'init',
    highlightLeft: false,
    highlightRight: false,
    newMaxFound: false,
    bestLeft: null,
    bestRight: null,
  })

  steps.push({
    lineNumber: 4,
    description: 'Initialize left = 0',
    insight: 'Left pointer starts at the beginning',
    height,
    left: 0,
    right: height.length - 1,
    maxArea: 0,
    currentArea: 0,
    currentWidth: 0,
    currentHeight: 0,
    phase: 'init',
    highlightLeft: true,
    highlightRight: false,
    newMaxFound: false,
    bestLeft: null,
    bestRight: null,
  })

  steps.push({
    lineNumber: 5,
    description: `Initialize right = ${height.length - 1}`,
    insight: 'Right pointer starts at the end - we begin with maximum width',
    height,
    left: 0,
    right: height.length - 1,
    maxArea: 0,
    currentArea: 0,
    currentWidth: 0,
    currentHeight: 0,
    phase: 'init',
    highlightLeft: true,
    highlightRight: true,
    newMaxFound: false,
    bestLeft: null,
    bestRight: null,
  })

  let left = 0
  let right = height.length - 1
  let maxArea = 0

  while (left < right) {
    // While condition check
    steps.push({
      lineNumber: 7,
      description: `Check: left (${left}) < right (${right})? Yes, continue`,
      insight: 'We continue until the pointers meet',
      height,
      left,
      right,
      maxArea,
      currentArea: 0,
      currentWidth: 0,
      currentHeight: 0,
      phase: 'calc-area',
      highlightLeft: true,
      highlightRight: true,
      newMaxFound: false,
      bestLeft,
      bestRight,
    })

    // Calculate width
    const width = right - left
    steps.push({
      lineNumber: 8,
      description: `width = right - left = ${right} - ${left} = ${width}`,
      insight: 'Width is the horizontal distance between the two lines',
      height,
      left,
      right,
      maxArea,
      currentArea: 0,
      currentWidth: width,
      currentHeight: 0,
      phase: 'calc-area',
      highlightLeft: true,
      highlightRight: true,
      newMaxFound: false,
      bestLeft,
      bestRight,
    })

    // Calculate height (min of two)
    const h = Math.min(height[left], height[right])
    steps.push({
      lineNumber: 9,
      description: `h = min(height[${left}], height[${right}]) = min(${height[left]}, ${height[right]}) = ${h}`,
      insight: 'Water level is limited by the shorter line',
      height,
      left,
      right,
      maxArea,
      currentArea: 0,
      currentWidth: width,
      currentHeight: h,
      phase: 'calc-area',
      highlightLeft: true,
      highlightRight: true,
      newMaxFound: false,
      bestLeft,
      bestRight,
    })

    // Calculate area
    const area = width * h
    steps.push({
      lineNumber: 10,
      description: `area = width × h = ${width} × ${h} = ${area}`,
      insight: 'Container area is width times the water level height',
      height,
      left,
      right,
      maxArea,
      currentArea: area,
      currentWidth: width,
      currentHeight: h,
      phase: 'calc-area',
      highlightLeft: true,
      highlightRight: true,
      newMaxFound: false,
      bestLeft,
      bestRight,
    })

    // Update max
    const newMaxFound = area > maxArea
    if (newMaxFound) {
      bestLeft = left
      bestRight = right
    }
    maxArea = Math.max(maxArea, area)

    steps.push({
      lineNumber: 11,
      description: `max_area = max(${maxArea - (newMaxFound ? area - (maxArea - area) : 0)}, ${area}) = ${maxArea}`,
      insight: newMaxFound ? `New maximum found! Area ${area} beats previous best` : `Area ${area} doesn't beat current max of ${maxArea}`,
      height,
      left,
      right,
      maxArea,
      currentArea: area,
      currentWidth: width,
      currentHeight: h,
      phase: 'check-max',
      highlightLeft: true,
      highlightRight: true,
      newMaxFound,
      bestLeft,
      bestRight,
    })

    // Compare heights
    const leftSmaller = height[left] < height[right]
    steps.push({
      lineNumber: 13,
      description: `height[${left}] (${height[left]}) ${leftSmaller ? '<' : '>='} height[${right}] (${height[right]})`,
      insight: leftSmaller
        ? 'Left side is shorter - moving right wouldn\'t help (still limited by left)'
        : 'Right side is shorter or equal - moving left wouldn\'t help',
      height,
      left,
      right,
      maxArea,
      currentArea: area,
      currentWidth: width,
      currentHeight: h,
      phase: 'compare-heights',
      highlightLeft: true,
      highlightRight: true,
      newMaxFound: false,
      bestLeft,
      bestRight,
    })

    if (leftSmaller) {
      left++
      steps.push({
        lineNumber: 14,
        description: `left += 1 → left = ${left}`,
        insight: 'Move left pointer right to try finding a taller line',
        height,
        left,
        right,
        maxArea,
        currentArea: 0,
        currentWidth: 0,
        currentHeight: 0,
        phase: 'move-left',
        highlightLeft: true,
        highlightRight: false,
        newMaxFound: false,
        bestLeft,
        bestRight,
      })
    } else {
      right--
      steps.push({
        lineNumber: 16,
        description: `right -= 1 → right = ${right}`,
        insight: 'Move right pointer left to try finding a taller line',
        height,
        left,
        right,
        maxArea,
        currentArea: 0,
        currentWidth: 0,
        currentHeight: 0,
        phase: 'move-right',
        highlightLeft: false,
        highlightRight: true,
        newMaxFound: false,
        bestLeft,
        bestRight,
      })
    }
  }

  // Loop done
  steps.push({
    lineNumber: 7,
    description: `Check: left (${left}) < right (${right})? No, loop ends`,
    insight: 'Pointers have met - we\'ve checked all possible containers',
    height,
    left,
    right,
    maxArea,
    currentArea: 0,
    currentWidth: 0,
    currentHeight: 0,
    phase: 'complete',
    highlightLeft: false,
    highlightRight: false,
    newMaxFound: false,
    bestLeft,
    bestRight,
  })

  // Return
  steps.push({
    lineNumber: 18,
    description: `Return max_area = ${maxArea}`,
    insight: `The maximum water container holds ${maxArea} units`,
    height,
    left,
    right,
    maxArea,
    currentArea: 0,
    currentWidth: 0,
    currentHeight: 0,
    phase: 'complete',
    highlightLeft: false,
    highlightRight: false,
    newMaxFound: false,
    bestLeft,
    bestRight,
  })

  return steps
}

function ContainerWaterVisualization() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTestCase, setSelectedTestCase] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.height), [testCase.data.height])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const maxHeight = Math.max(...step.height)
  const barWidth = 100 / step.height.length

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 20px rgba(251, 146, 60, 0.4); }
        .glow-green { box-shadow: 0 0 20px rgba(74, 222, 128, 0.4); }
        .glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }

        @keyframes pulse-water {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-water {
          animation: pulse-water 2s ease-in-out infinite;
        }

        @keyframes new-max {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-new-max {
          animation: new-max 0.5s ease-out;
        }
      `}</style>

      {/* Bar Chart Container */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-400 text-sm font-display mb-4">Container Visualization</div>

        <div className="relative h-48 flex items-end justify-center gap-1">
          {/* Water fill */}
          {step.currentHeight > 0 && step.left < step.right && (
            <div
              className="absolute bg-blue-500/30 border border-blue-400/50 rounded animate-pulse-water transition-all duration-300"
              style={{
                left: `${(step.left + 0.5) * barWidth}%`,
                right: `${(step.height.length - step.right - 0.5) * barWidth}%`,
                height: `${(step.currentHeight / maxHeight) * 100}%`,
                bottom: 0,
              }}
            />
          )}

          {/* Bars */}
          {step.height.map((h, i) => {
            const isLeft = i === step.left
            const isRight = i === step.right
            const isBestLeft = i === step.bestLeft
            const isBestRight = i === step.bestRight
            const isOutside = i < step.left || i > step.right

            let barColor = 'bg-slate-600'
            let glowClass = ''
            let borderColor = 'border-slate-500'

            if (step.phase === 'complete' && (isBestLeft || isBestRight)) {
              barColor = 'bg-emerald-500'
              borderColor = 'border-emerald-400'
              glowClass = 'glow-green'
            } else if (isLeft && step.highlightLeft) {
              barColor = 'bg-cyan-500'
              borderColor = 'border-cyan-400'
              glowClass = 'glow-cyan'
            } else if (isRight && step.highlightRight) {
              barColor = 'bg-orange-500'
              borderColor = 'border-orange-400'
              glowClass = 'glow-orange'
            } else if (isOutside) {
              barColor = 'bg-slate-700/50'
              borderColor = 'border-slate-600/50'
            }

            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ width: `${barWidth - 1}%` }}
              >
                <div
                  className={`w-full rounded-t border-2 ${barColor} ${borderColor} ${glowClass} transition-all duration-300`}
                  style={{ height: `${(h / maxHeight) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-[10px] text-slate-500 mt-1">{i}</span>
                <span className="text-[10px] text-slate-400">{h}</span>
                {isLeft && step.highlightLeft && (
                  <span className="text-[9px] text-cyan-400 font-bold">L</span>
                )}
                {isRight && step.highlightRight && (
                  <span className="text-[9px] text-orange-400 font-bold">R</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Area Calculation */}
      {step.currentArea > 0 && (
        <div
          className={`bg-slate-800/50 rounded-xl border p-4 transition-all duration-300 ${
            step.newMaxFound ? 'border-emerald-500/50 glow-green animate-new-max' : 'border-slate-700'
          }`}
        >
          <div className="text-slate-400 text-sm font-display mb-2">Area Calculation</div>
          <div className="font-code text-center">
            <span className="text-slate-400">area = </span>
            <span className="text-cyan-300">width</span>
            <span className="text-slate-400"> × </span>
            <span className="text-orange-300">height</span>
          </div>
          <div className="font-code text-center text-lg mt-2">
            <span className="text-emerald-300">{step.currentArea}</span>
            <span className="text-slate-500"> = </span>
            <span className="text-cyan-300">{step.currentWidth}</span>
            <span className="text-slate-500"> × </span>
            <span className="text-orange-300">{step.currentHeight}</span>
          </div>
          {step.newMaxFound && (
            <div className="text-center text-emerald-400 text-sm mt-2 font-display">New Maximum Found!</div>
          )}
        </div>
      )}

      {/* Variables */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-400 text-sm font-display mb-3">Variables</div>
        <div className="grid grid-cols-4 gap-3">
          <div
            className={`p-3 rounded-lg border ${step.highlightLeft ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-800/50 border-slate-600'}`}
          >
            <div className="text-xs text-slate-500 mb-1">left</div>
            <div className="font-code text-xl text-cyan-300">{step.left}</div>
          </div>
          <div
            className={`p-3 rounded-lg border ${step.highlightRight ? 'bg-orange-500/20 border-orange-400' : 'bg-slate-800/50 border-slate-600'}`}
          >
            <div className="text-xs text-slate-500 mb-1">right</div>
            <div className="font-code text-xl text-orange-300">{step.right}</div>
          </div>
          <div
            className={`p-3 rounded-lg border ${step.newMaxFound ? 'bg-emerald-500/20 border-emerald-400 glow-green' : 'bg-slate-800/50 border-slate-600'}`}
          >
            <div className="text-xs text-slate-500 mb-1">max_area</div>
            <div className="font-code text-xl text-emerald-300">{step.maxArea}</div>
          </div>
          <div className="p-3 rounded-lg border bg-slate-800/50 border-slate-600">
            <div className="text-xs text-slate-500 mb-1">current</div>
            <div className="font-code text-xl text-blue-300">{step.currentArea || '-'}</div>
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
              <div className="text-emerald-400 font-mono">Maximum area: {step.maxArea}</div>
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
          <h4 className="text-cyan-400 font-mono mb-1">Two Pointers Strategy</h4>
          <p className="text-slate-400">
            Start with maximum width (pointers at both ends). The area is limited by the shorter line,
            so we always move the shorter pointer inward hoping to find a taller line.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Why Move the Shorter Side?</h4>
          <p className="text-slate-400">
            Moving the taller side can only decrease or maintain area (width decreases, height still limited by shorter).
            Moving shorter side might find a taller line that increases area.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n)</span>
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
        number: '11',
        title: 'Container With Most Water',
        difficulty: 'medium',
        tags: ['Array', 'Two Pointers', 'Greedy'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="container_water.py"
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
