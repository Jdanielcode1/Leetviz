import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/container-water')({
  component: ContainerWaterVisualization,
})

const CODE_LINES = [
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

interface TestCase {
  id: number
  name: string
  height: number[]
  expected: number
  explanation: string
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Main Example',
    height: [1, 8, 6, 2, 5, 4, 8, 3, 7],
    expected: 49,
    explanation: 'Lines at index 1 (height 8) and index 8 (height 7), area = 7 × 7 = 49',
  },
  {
    id: 2,
    name: 'Simple Case',
    height: [1, 1],
    expected: 1,
    explanation: 'Only two lines, area = 1 × 1 = 1',
  },
  {
    id: 3,
    name: 'Symmetric',
    height: [4, 3, 2, 1, 4],
    expected: 16,
    explanation: 'First and last lines, area = 4 × 4 = 16',
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  height: number[]
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

function generateSteps(height: number[]): Step[] {
  const steps: Step[] = []
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
  const [showTestCase, setShowTestCase] = useState(false)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.height), [selectedTestCase])
  const step = steps[currentStep]

  const handlePrevious = () => setCurrentStep((s) => Math.max(0, s - 1))
  const handleNext = () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
  const handleReset = () => setCurrentStep(0)

  const maxHeight = Math.max(...step.height)
  const barWidth = 100 / step.height.length

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

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-slate-500 font-code text-sm">#11</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Medium
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">Container With Most Water</h1>
            </div>
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-display transition-colors"
            >
              Back to Problems
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 blueprint-grid min-h-[calc(100vh-80px)]">
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

          <div className="flex items-center gap-4">
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
          </div>

          {showTestCase && (
            <div className="mt-3 p-4 bg-slate-900/70 rounded-lg border border-slate-700 animate-slide-in">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Input:</span>
                  <div className="font-code text-cyan-300 mt-1">height = [{testCase.height.join(', ')}]</div>
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
              <span className="text-slate-500 font-mono text-xs">container_water.py</span>
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
            {/* Bar Chart Container */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
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
                className={`bg-slate-900/70 rounded-xl border p-4 transition-all duration-300 ${
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
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
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
              <h4 className="text-cyan-400 font-medium mb-2">Two Pointers Strategy</h4>
              <p className="text-slate-400">
                Start with maximum width (pointers at both ends). The area is limited by the shorter line,
                so we always move the shorter pointer inward hoping to find a taller line.
              </p>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Why Move the Shorter Side?</h4>
              <p className="text-slate-400">
                Moving the taller side can only decrease or maintain area (width decreases, height still limited by shorter).
                Moving shorter side might find a taller line that increases area.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex gap-6">
            <div>
              <span className="text-slate-500">Time:</span>
              <span className="text-emerald-300 ml-2 font-code">O(n)</span>
            </div>
            <div>
              <span className="text-slate-500">Space:</span>
              <span className="text-emerald-300 ml-2 font-code">O(1)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
