import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/fruit-into-baskets')({
  component: FruitIntoBasketsVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'def totalFruit(fruits: list[int]) -> int:' },
  { num: 2, code: '    start = 0' },
  { num: 3, code: '    max_len = 0' },
  { num: 4, code: '    fruit_count = {}' },
  { num: 5, code: '' },
  { num: 6, code: '    for end in range(len(fruits)):' },
  { num: 7, code: '        fruit = fruits[end]' },
  { num: 8, code: '        if fruit in fruit_count:' },
  { num: 9, code: '            fruit_count[fruit] += 1' },
  { num: 10, code: '        else:' },
  { num: 11, code: '            fruit_count[fruit] = 1' },
  { num: 12, code: '' },
  { num: 13, code: '        while len(fruit_count) > 2:' },
  { num: 14, code: '            fruit_count[fruits[start]] -= 1' },
  { num: 15, code: '            if fruit_count[fruits[start]] == 0:' },
  { num: 16, code: '                del fruit_count[fruits[start]]' },
  { num: 17, code: '            start += 1' },
  { num: 18, code: '' },
  { num: 19, code: '        max_len = max(max_len, end - start + 1)' },
  { num: 20, code: '' },
  { num: 21, code: '    return max_len' },
]

interface TestCase {
  id: number
  name: string
  fruits: number[]
  expected: number
  explanation: string
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'All trees pickable',
    fruits: [1, 2, 1],
    expected: 3,
    explanation: 'Can pick all 3 trees (types 1 and 2 fit in 2 baskets)',
  },
  {
    id: 2,
    name: 'Must skip first tree',
    fruits: [0, 1, 2, 2],
    expected: 3,
    explanation: 'Pick [1, 2, 2] - starting at tree 0 only gives [0, 1]',
  },
  {
    id: 3,
    name: 'Contraction needed',
    fruits: [1, 2, 3, 2, 2],
    expected: 4,
    explanation: 'Pick [2, 3, 2, 2] - window contracts when 3rd type appears',
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  fruits: number[]
  start: number
  end: number
  maxLen: number
  fruitCount: Map<number, number>
  phase: 'init' | 'expand' | 'add-fruit' | 'check-overflow' | 'contract' | 'decrement' | 'delete-fruit' | 'update-max' | 'complete'
  currentFruit: number | null
  windowValid: boolean
  highlightStart: boolean
  highlightEnd: boolean
  highlightBasket: number | null
  justDeleted: number | null
}

function generateSteps(fruits: number[]): Step[] {
  const steps: Step[] = []

  // Initial state
  steps.push({
    lineNumber: 1,
    description: 'Start the totalFruit function',
    insight: 'This sliding window problem finds the longest subarray with at most 2 distinct values',
    fruits,
    start: 0,
    end: -1,
    maxLen: 0,
    fruitCount: new Map(),
    phase: 'init',
    currentFruit: null,
    windowValid: true,
    highlightStart: false,
    highlightEnd: false,
    highlightBasket: null,
    justDeleted: null,
  })

  // Initialize variables
  steps.push({
    lineNumber: 2,
    description: 'Initialize start = 0 (left window boundary)',
    insight: 'The start pointer marks where our picking window begins',
    fruits,
    start: 0,
    end: -1,
    maxLen: 0,
    fruitCount: new Map(),
    phase: 'init',
    currentFruit: null,
    windowValid: true,
    highlightStart: true,
    highlightEnd: false,
    highlightBasket: null,
    justDeleted: null,
  })

  steps.push({
    lineNumber: 3,
    description: 'Initialize max_len = 0 (best result so far)',
    insight: 'We track the maximum window size that used only 2 fruit types',
    fruits,
    start: 0,
    end: -1,
    maxLen: 0,
    fruitCount: new Map(),
    phase: 'init',
    currentFruit: null,
    windowValid: true,
    highlightStart: false,
    highlightEnd: false,
    highlightBasket: null,
    justDeleted: null,
  })

  steps.push({
    lineNumber: 4,
    description: 'Initialize empty fruit_count hashmap',
    insight: 'This hashmap tracks how many of each fruit type are in our current window',
    fruits,
    start: 0,
    end: -1,
    maxLen: 0,
    fruitCount: new Map(),
    phase: 'init',
    currentFruit: null,
    windowValid: true,
    highlightStart: false,
    highlightEnd: false,
    highlightBasket: null,
    justDeleted: null,
  })

  let start = 0
  let maxLen = 0
  const fruitCount = new Map<number, number>()

  for (let end = 0; end < fruits.length; end++) {
    const fruit = fruits[end]

    // Expand window - move end pointer
    steps.push({
      lineNumber: 6,
      description: `Move end pointer to index ${end}`,
      insight: 'Expanding the window to include the next tree',
      fruits,
      start,
      end,
      maxLen,
      fruitCount: new Map(fruitCount),
      phase: 'expand',
      currentFruit: fruit,
      windowValid: fruitCount.size <= 2,
      highlightStart: false,
      highlightEnd: true,
      highlightBasket: null,
      justDeleted: null,
    })

    // Get current fruit
    steps.push({
      lineNumber: 7,
      description: `Current fruit = ${fruit} at index ${end}`,
      insight: `We encounter a tree with fruit type ${fruit}`,
      fruits,
      start,
      end,
      maxLen,
      fruitCount: new Map(fruitCount),
      phase: 'expand',
      currentFruit: fruit,
      windowValid: fruitCount.size <= 2,
      highlightStart: false,
      highlightEnd: true,
      highlightBasket: null,
      justDeleted: null,
    })

    // Add to map
    const existed = fruitCount.has(fruit)
    if (existed) {
      steps.push({
        lineNumber: 8,
        description: `Fruit ${fruit} already in basket, increment count`,
        insight: 'This fruit type is already in one of our baskets',
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'add-fruit',
        currentFruit: fruit,
        windowValid: fruitCount.size <= 2,
        highlightStart: false,
        highlightEnd: true,
        highlightBasket: fruit,
        justDeleted: null,
      })

      fruitCount.set(fruit, fruitCount.get(fruit)! + 1)

      steps.push({
        lineNumber: 9,
        description: `fruit_count[${fruit}] = ${fruitCount.get(fruit)}`,
        insight: `Now have ${fruitCount.get(fruit)} of fruit type ${fruit} in window`,
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'add-fruit',
        currentFruit: fruit,
        windowValid: fruitCount.size <= 2,
        highlightStart: false,
        highlightEnd: true,
        highlightBasket: fruit,
        justDeleted: null,
      })
    } else {
      steps.push({
        lineNumber: 10,
        description: `Fruit ${fruit} is new, add to basket`,
        insight: 'This is a new fruit type - need a new basket for it',
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'add-fruit',
        currentFruit: fruit,
        windowValid: fruitCount.size <= 2,
        highlightStart: false,
        highlightEnd: true,
        highlightBasket: fruit,
        justDeleted: null,
      })

      fruitCount.set(fruit, 1)

      steps.push({
        lineNumber: 11,
        description: `fruit_count[${fruit}] = 1`,
        insight: `Added fruit type ${fruit} to a basket (count = 1)`,
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'add-fruit',
        currentFruit: fruit,
        windowValid: fruitCount.size <= 2,
        highlightStart: false,
        highlightEnd: true,
        highlightBasket: fruit,
        justDeleted: null,
      })
    }

    // Check overflow and contract
    if (fruitCount.size > 2) {
      steps.push({
        lineNumber: 13,
        description: `Window has ${fruitCount.size} fruit types - too many!`,
        insight: 'We have 3 fruit types but only 2 baskets - must shrink window',
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'check-overflow',
        currentFruit: fruit,
        windowValid: false,
        highlightStart: true,
        highlightEnd: false,
        highlightBasket: null,
        justDeleted: null,
      })
    }

    while (fruitCount.size > 2) {
      const startFruit = fruits[start]

      steps.push({
        lineNumber: 14,
        description: `Decrement count of fruit ${startFruit} at start (index ${start})`,
        insight: 'Remove one fruit from the left side of window',
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'contract',
        currentFruit: startFruit,
        windowValid: false,
        highlightStart: true,
        highlightEnd: false,
        highlightBasket: startFruit,
        justDeleted: null,
      })

      fruitCount.set(startFruit, fruitCount.get(startFruit)! - 1)

      steps.push({
        lineNumber: 14,
        description: `fruit_count[${startFruit}] = ${fruitCount.get(startFruit)}`,
        insight: `Decremented fruit ${startFruit} count`,
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'decrement',
        currentFruit: startFruit,
        windowValid: false,
        highlightStart: true,
        highlightEnd: false,
        highlightBasket: startFruit,
        justDeleted: null,
      })

      if (fruitCount.get(startFruit) === 0) {
        steps.push({
          lineNumber: 15,
          description: `Count is 0, check if we should delete fruit ${startFruit}`,
          insight: 'When count reaches 0, we remove the fruit type from our tracking',
          fruits,
          start,
          end,
          maxLen,
          fruitCount: new Map(fruitCount),
          phase: 'delete-fruit',
          currentFruit: startFruit,
          windowValid: false,
          highlightStart: true,
          highlightEnd: false,
          highlightBasket: startFruit,
          justDeleted: null,
        })

        fruitCount.delete(startFruit)

        steps.push({
          lineNumber: 16,
          description: `Deleted fruit ${startFruit} from basket`,
          insight: `Fruit type ${startFruit} is no longer in our window - basket freed!`,
          fruits,
          start,
          end,
          maxLen,
          fruitCount: new Map(fruitCount),
          phase: 'delete-fruit',
          currentFruit: startFruit,
          windowValid: fruitCount.size <= 2,
          highlightStart: true,
          highlightEnd: false,
          highlightBasket: null,
          justDeleted: startFruit,
        })
      }

      start++

      steps.push({
        lineNumber: 17,
        description: `Move start to ${start}`,
        insight: 'Shrink window from left by moving start pointer right',
        fruits,
        start,
        end,
        maxLen,
        fruitCount: new Map(fruitCount),
        phase: 'contract',
        currentFruit: null,
        windowValid: fruitCount.size <= 2,
        highlightStart: true,
        highlightEnd: false,
        highlightBasket: null,
        justDeleted: null,
      })
    }

    // Update max
    const windowSize = end - start + 1
    const newMax = Math.max(maxLen, windowSize)
    const improved = newMax > maxLen

    steps.push({
      lineNumber: 19,
      description: `Window size = ${windowSize}, max_len = max(${maxLen}, ${windowSize}) = ${newMax}`,
      insight: improved
        ? `New best! Found a window of size ${windowSize} with only 2 fruit types`
        : `Window size ${windowSize} doesn't beat our best of ${maxLen}`,
      fruits,
      start,
      end,
      maxLen: newMax,
      fruitCount: new Map(fruitCount),
      phase: 'update-max',
      currentFruit: null,
      windowValid: true,
      highlightStart: false,
      highlightEnd: false,
      highlightBasket: null,
      justDeleted: null,
    })

    maxLen = newMax
  }

  // Final return
  steps.push({
    lineNumber: 21,
    description: `Return max_len = ${maxLen}`,
    insight: `The maximum number of fruits we can collect with 2 baskets is ${maxLen}`,
    fruits,
    start,
    end: fruits.length - 1,
    maxLen,
    fruitCount: new Map(fruitCount),
    phase: 'complete',
    currentFruit: null,
    windowValid: true,
    highlightStart: false,
    highlightEnd: false,
    highlightBasket: null,
    justDeleted: null,
  })

  return steps
}

// Color mapping for different fruit types
const FRUIT_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: 'bg-red-500/30', border: 'border-red-400', text: 'text-red-300' },
  1: { bg: 'bg-amber-500/30', border: 'border-amber-400', text: 'text-amber-300' },
  2: { bg: 'bg-emerald-500/30', border: 'border-emerald-400', text: 'text-emerald-300' },
  3: { bg: 'bg-purple-500/30', border: 'border-purple-400', text: 'text-purple-300' },
  4: { bg: 'bg-cyan-500/30', border: 'border-cyan-400', text: 'text-cyan-300' },
  5: { bg: 'bg-pink-500/30', border: 'border-pink-400', text: 'text-pink-300' },
}

function getFruitColor(fruitType: number) {
  return FRUIT_COLORS[fruitType % Object.keys(FRUIT_COLORS).length]
}

function FruitIntoBasketsVisualization() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [showTestCase, setShowTestCase] = useState(false)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.fruits), [selectedTestCase])
  const step = steps[currentStep]

  const handlePrevious = () => setCurrentStep((s) => Math.max(0, s - 1))
  const handleNext = () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
  const handleReset = () => setCurrentStep(0)

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
        .glow-red { box-shadow: 0 0 20px rgba(248, 113, 113, 0.4); }
        .glow-purple { box-shadow: 0 0 20px rgba(192, 132, 252, 0.4); }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(248, 113, 113, 0.5); }
          50% { border-color: rgba(248, 113, 113, 1); }
        }
        .animate-pulse-border {
          animation: pulse-border 1s ease-in-out infinite;
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
                <span className="text-slate-500 font-code text-sm">#904</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Medium
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">
                Fruit Into Baskets
              </h1>
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
                  <div className="font-code text-cyan-300 mt-1">
                    fruits = [{testCase.fruits.join(', ')}]
                  </div>
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
              <span className="text-slate-400 text-sm font-display">Python Code</span>
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
            {/* Fruit Array with Window */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-4">Fruit Trees (Sliding Window)</div>

              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {step.fruits.map((fruit, i) => {
                  const inWindow = step.end >= 0 && i >= step.start && i <= step.end
                  const isStart = i === step.start && step.end >= 0
                  const isEnd = i === step.end
                  const colors = getFruitColor(fruit)

                  let glowClass = ''
                  if (step.highlightStart && isStart) glowClass = 'glow-orange'
                  else if (step.highlightEnd && isEnd) glowClass = 'glow-cyan'
                  else if (inWindow && !step.windowValid) glowClass = 'glow-red'

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-code text-lg font-bold transition-all duration-300 ${
                          inWindow
                            ? `${colors.bg} ${colors.border} ${colors.text} ${glowClass}`
                            : 'bg-slate-800/50 border-slate-600 text-slate-500'
                        } ${!step.windowValid && inWindow ? 'animate-pulse-border' : ''}`}
                      >
                        {fruit}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">{i}</span>
                      <div className="flex gap-1 mt-1 h-4">
                        {isStart && step.end >= 0 && (
                          <span className="text-[10px] px-1 rounded bg-orange-500/30 text-orange-300">start</span>
                        )}
                        {isEnd && (
                          <span className="text-[10px] px-1 rounded bg-cyan-500/30 text-cyan-300">end</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Window Info */}
              <div className="flex justify-center gap-4 text-sm">
                <div className={`px-3 py-1 rounded-lg ${step.windowValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {step.fruitCount.size} fruit types {step.windowValid ? '(valid)' : '(overflow!)'}
                </div>
                {step.end >= 0 && (
                  <div className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
                    Window size: {step.end - step.start + 1}
                  </div>
                )}
              </div>
            </div>

            {/* Baskets (HashMap) */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-4">Baskets (fruit_count)</div>

              <div className="flex justify-center gap-4">
                {step.fruitCount.size === 0 ? (
                  <div className="text-slate-500 text-sm font-code">{ }</div>
                ) : (
                  Array.from(step.fruitCount.entries()).map(([fruitType, count]) => {
                    const colors = getFruitColor(fruitType)
                    const isHighlighted = step.highlightBasket === fruitType

                    return (
                      <div
                        key={fruitType}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                          colors.bg
                        } ${colors.border} ${
                          isHighlighted ? 'glow-cyan scale-105' : ''
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {fruitType === 0 ? '🍎' : fruitType === 1 ? '🍌' : fruitType === 2 ? '🍇' : fruitType === 3 ? '🍐' : '🍊'}
                        </div>
                        <div className={`font-code text-sm ${colors.text}`}>
                          Type {fruitType}
                        </div>
                        <div className={`font-code text-2xl font-bold mt-1 ${colors.text}`}>
                          ×{count}
                        </div>
                      </div>
                    )
                  })
                )}

                {step.justDeleted !== null && (
                  <div className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-red-400/50 bg-red-500/10 opacity-50">
                    <div className="text-2xl mb-2">❌</div>
                    <div className="font-code text-sm text-red-300">
                      Type {step.justDeleted}
                    </div>
                    <div className="font-code text-sm text-red-400 mt-1">
                      removed
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Variables */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-3">Variables</div>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border ${step.highlightStart ? 'bg-orange-500/20 border-orange-400' : 'bg-slate-800/50 border-slate-600'}`}>
                  <div className="text-xs text-slate-500 mb-1">start</div>
                  <div className="font-code text-xl text-orange-300">{step.start}</div>
                </div>
                <div className={`p-3 rounded-lg border ${step.highlightEnd ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-800/50 border-slate-600'}`}>
                  <div className="text-xs text-slate-500 mb-1">end</div>
                  <div className="font-code text-xl text-cyan-300">{step.end >= 0 ? step.end : '-'}</div>
                </div>
                <div className={`p-3 rounded-lg border ${step.phase === 'update-max' ? 'bg-emerald-500/20 border-emerald-400 glow-green' : 'bg-slate-800/50 border-slate-600'}`}>
                  <div className="text-xs text-slate-500 mb-1">max_len</div>
                  <div className="font-code text-xl text-emerald-300">{step.maxLen}</div>
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
              <h4 className="text-cyan-400 font-medium mb-2">Pattern: Sliding Window + HashMap</h4>
              <p className="text-slate-400">
                The window expands by moving <span className="text-cyan-300">end</span> right, adding fruits to our count.
                When we exceed 2 fruit types, we contract by moving <span className="text-orange-300">start</span> right
                until we're back to 2 types.
              </p>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Why It Works</h4>
              <p className="text-slate-400">
                Each element is visited at most twice (once by end, once by start), giving us O(n) time.
                The hashmap tracks at most 3 fruit types, so space is O(1).
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
