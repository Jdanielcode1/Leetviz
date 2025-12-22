import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/fruit-into-baskets')({
  component: FruitIntoBasketsVisualization,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `You are visiting a farm that has a single row of fruit trees arranged from left to right. The trees are represented by an integer array fruits where fruits[i] is the type of fruit the ith tree produces.

You want to collect as much fruit as possible. However, the owner has some strict rules that you must follow:

• You only have two baskets, and each basket can only hold a single type of fruit. There is no limit on the amount of fruit each basket can hold.
• Starting from any tree of your choice, you must pick exactly one fruit from every tree (including the start tree) while moving to the right. The picked fruits must fit in one of your baskets.
• Once you reach a tree with fruit that cannot fit in your baskets, you must stop.

Given the integer array fruits, return the maximum number of fruits you can pick.`

const EXAMPLES: Array<Example> = [
  {
    input: 'fruits = [1,2,1]',
    output: '3',
    explanation: 'We can pick from all 3 trees.',
  },
  {
    input: 'fruits = [0,1,2,2]',
    output: '3',
    explanation: 'We can pick from trees [1,2,2]. If we had started at the first tree, we would only pick from trees [0,1].',
  },
  {
    input: 'fruits = [1,2,3,2,2]',
    output: '4',
    explanation: 'We can pick from trees [2,3,2,2]. If we had started at the first tree, we would only pick from trees [1,2].',
  },
]

const CONSTRAINTS = [
  '1 <= fruits.length <= 10^5',
  '0 <= fruits[i] < fruits.length',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  fruits: Array<number>
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

interface TestCaseData {
  fruits: Array<number>
  expected: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'All trees pickable',
    data: {
      fruits: [1, 2, 1],
      expected: 3,
    },
  },
  {
    id: 2,
    label: 'Must skip first tree',
    data: {
      fruits: [0, 1, 2, 2],
      expected: 3,
    },
  },
  {
    id: 3,
    label: 'Contraction needed',
    data: {
      fruits: [1, 2, 3, 2, 2],
      expected: 4,
    },
  },
]

function generateSteps(fruits: Array<number>): Array<Step> {
  const steps: Array<Step> = []

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

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.fruits), [testCase.data.fruits])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
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
      `}</style>

      {/* Fruit Array with Window */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Fruit Trees (Sliding Window)</span>
        </div>
        <div className="p-4">
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
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 ${
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
      </div>

      {/* Baskets (HashMap) */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Baskets (fruit_count)</span>
        </div>
        <div className="p-4">
          <div className="flex justify-center gap-4">
            {step.fruitCount.size === 0 ? (
              <div className="text-slate-500 text-sm font-mono">{ }</div>
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
                    <div className={`font-mono text-sm ${colors.text}`}>
                      Type {fruitType}
                    </div>
                    <div className={`font-mono text-2xl font-bold mt-1 ${colors.text}`}>
                      ×{count}
                    </div>
                  </div>
                )
              })
            )}

            {step.justDeleted !== null && (
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-red-400/50 bg-red-500/10 opacity-50">
                <div className="text-2xl mb-2">❌</div>
                <div className="font-mono text-sm text-red-300">
                  Type {step.justDeleted}
                </div>
                <div className="font-mono text-sm text-red-400 mt-1">
                  removed
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variables */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Variables</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg border ${step.highlightStart ? 'bg-orange-500/20 border-orange-400' : 'bg-slate-800/50 border-slate-600'}`}>
              <div className="text-xs text-slate-500 mb-1">start</div>
              <div className="font-mono text-xl text-orange-300">{step.start}</div>
            </div>
            <div className={`p-3 rounded-lg border ${step.highlightEnd ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-800/50 border-slate-600'}`}>
              <div className="text-xs text-slate-500 mb-1">end</div>
              <div className="font-mono text-xl text-cyan-300">{step.end >= 0 ? step.end : '-'}</div>
            </div>
            <div className={`p-3 rounded-lg border ${step.phase === 'update-max' ? 'bg-emerald-500/20 border-emerald-400 glow-green' : 'bg-slate-800/50 border-slate-600'}`}>
              <div className="text-xs text-slate-500 mb-1">max_len</div>
              <div className="font-mono text-xl text-emerald-300">{step.maxLen}</div>
            </div>
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
              <div className="text-emerald-400 font-mono">Maximum fruits: {step.maxLen}</div>
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
          <h4 className="text-cyan-400 font-mono mb-1">Pattern: Sliding Window + HashMap</h4>
          <p className="text-slate-400">
            The window expands by moving <span className="text-cyan-300">end</span> right, adding fruits to our count.
            When we exceed 2 fruit types, we contract by moving <span className="text-orange-300">start</span> right
            until we're back to 2 types.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Why It Works</h4>
          <p className="text-slate-400">
            Each element is visited at most twice (once by end, once by start), giving us O(n) time.
            The hashmap tracks at most 3 fruit types, so space is O(1).
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
        number: '904',
        title: 'Fruit Into Baskets',
        difficulty: 'medium',
        tags: ['Array', 'Hash Table', 'Sliding Window'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="fruit_into_baskets.py"
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
