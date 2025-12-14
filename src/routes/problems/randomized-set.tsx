import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/randomized-set')({
  component: RandomizedSetVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class RandomizedSet:' },
  { num: 2, code: '    def __init__(self):' },
  { num: 3, code: '        self.values = []' },
  { num: 4, code: '        self.valuesIdx = {}  # value: index' },
  { num: 5, code: '' },
  { num: 6, code: '    def insert(self, val: int) -> bool:' },
  { num: 7, code: '        if val in self.valuesIdx:' },
  { num: 8, code: '            return False' },
  { num: 9, code: '        self.valuesIdx[val] = len(self.values)' },
  { num: 10, code: '        self.values.append(val)' },
  { num: 11, code: '        return True' },
  { num: 12, code: '' },
  { num: 13, code: '    def remove(self, val: int) -> bool:' },
  { num: 14, code: '        if val not in self.valuesIdx:' },
  { num: 15, code: '            return False' },
  { num: 16, code: '        index = self.valuesIdx[val]' },
  { num: 17, code: '        self.valuesIdx[self.values[-1]] = index' },
  { num: 18, code: '        del self.valuesIdx[val]' },
  { num: 19, code: '        self.values[index] = self.values[-1]' },
  { num: 20, code: '        self.values.pop()' },
  { num: 21, code: '        return True' },
  { num: 22, code: '' },
  { num: 23, code: '    def getRandom(self) -> int:' },
  { num: 24, code: '        index = random.randint(0, len(self.values) - 1)' },
  { num: 25, code: '        return self.values[index]' },
]

interface Operation {
  type: 'insert' | 'remove' | 'getRandom'
  val?: number
  expected: boolean | number | null
}

interface TestCase {
  id: number
  name: string
  operations: Operation[]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Example 1',
    operations: [
      { type: 'insert', val: 1, expected: true },
      { type: 'remove', val: 2, expected: false },
      { type: 'insert', val: 2, expected: true },
      { type: 'getRandom', expected: null },
      { type: 'remove', val: 1, expected: true },
      { type: 'insert', val: 2, expected: false },
      { type: 'getRandom', expected: null },
    ],
  },
  {
    id: 2,
    name: 'Swap Trick',
    operations: [
      { type: 'insert', val: 1, expected: true },
      { type: 'insert', val: 2, expected: true },
      { type: 'insert', val: 3, expected: true },
      { type: 'remove', val: 1, expected: true },
      { type: 'remove', val: 2, expected: true },
    ],
  },
  {
    id: 3,
    name: 'Single Element',
    operations: [
      { type: 'insert', val: 5, expected: true },
      { type: 'getRandom', expected: 5 },
      { type: 'remove', val: 5, expected: true },
      { type: 'insert', val: 10, expected: true },
    ],
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  values: number[]
  valuesIdx: Map<number, number>
  operation: string
  operationVal: number | null
  result: boolean | number | null
  phase: string
  highlightArrayIndex: number | null
  highlightMapKey: number | null
  swapFrom: number | null
  swapTo: number | null
}

function generateSteps(operations: Operation[]): Step[] {
  const steps: Step[] = []
  const values: number[] = []
  const valuesIdx = new Map<number, number>()

  // Initial state
  steps.push({
    lineNumber: 2,
    description: 'Initialize RandomizedSet',
    insight: 'Use array for O(1) random access + hashmap for O(1) lookup. They complement each other!',
    values: [],
    valuesIdx: new Map(),
    operation: 'init',
    operationVal: null,
    result: null,
    phase: 'init',
    highlightArrayIndex: null,
    highlightMapKey: null,
    swapFrom: null,
    swapTo: null,
  })

  steps.push({
    lineNumber: 3,
    description: 'self.values = []',
    insight: 'Array stores actual values - enables O(1) random access by index',
    values: [],
    valuesIdx: new Map(),
    operation: 'init',
    operationVal: null,
    result: null,
    phase: 'init-array',
    highlightArrayIndex: null,
    highlightMapKey: null,
    swapFrom: null,
    swapTo: null,
  })

  steps.push({
    lineNumber: 4,
    description: 'self.valuesIdx = {}',
    insight: 'Hashmap stores value→index mapping - enables O(1) existence check',
    values: [],
    valuesIdx: new Map(),
    operation: 'init',
    operationVal: null,
    result: null,
    phase: 'init-map',
    highlightArrayIndex: null,
    highlightMapKey: null,
    swapFrom: null,
    swapTo: null,
  })

  for (const op of operations) {
    if (op.type === 'insert') {
      const val = op.val!

      steps.push({
        lineNumber: 6,
        description: `insert(${val})`,
        insight: 'Insert appends to end (O(1)) and records position in hashmap',
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'insert',
        operationVal: val,
        result: null,
        phase: 'insert-start',
        highlightArrayIndex: null,
        highlightMapKey: null,
        swapFrom: null,
        swapTo: null,
      })

      // Check if exists
      const exists = valuesIdx.has(val)
      steps.push({
        lineNumber: 7,
        description: `Check: ${val} in valuesIdx? ${exists ? 'Yes' : 'No'}`,
        insight: exists ? 'Value already exists - cannot insert duplicates' : 'Value not found - proceed with insertion',
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'insert',
        operationVal: val,
        result: null,
        phase: 'insert-check',
        highlightArrayIndex: null,
        highlightMapKey: exists ? val : null,
        swapFrom: null,
        swapTo: null,
      })

      if (exists) {
        steps.push({
          lineNumber: 8,
          description: 'return False',
          insight: 'Duplicate detected - return False without modification',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'insert',
          operationVal: val,
          result: false,
          phase: 'insert-duplicate',
          highlightArrayIndex: null,
          highlightMapKey: val,
          swapFrom: null,
          swapTo: null,
        })
      } else {
        // Record in map
        valuesIdx.set(val, values.length)
        steps.push({
          lineNumber: 9,
          description: `valuesIdx[${val}] = ${values.length}`,
          insight: `Map value ${val} to index ${values.length} (where it will be appended)`,
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'insert',
          operationVal: val,
          result: null,
          phase: 'insert-map',
          highlightArrayIndex: null,
          highlightMapKey: val,
          swapFrom: null,
          swapTo: null,
        })

        // Append to array
        values.push(val)
        steps.push({
          lineNumber: 10,
          description: `values.append(${val})`,
          insight: 'Append to end is O(1) - no shifting needed!',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'insert',
          operationVal: val,
          result: null,
          phase: 'insert-append',
          highlightArrayIndex: values.length - 1,
          highlightMapKey: val,
          swapFrom: null,
          swapTo: null,
        })

        steps.push({
          lineNumber: 11,
          description: 'return True',
          insight: 'Successfully inserted!',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'insert',
          operationVal: val,
          result: true,
          phase: 'insert-success',
          highlightArrayIndex: values.length - 1,
          highlightMapKey: val,
          swapFrom: null,
          swapTo: null,
        })
      }
    } else if (op.type === 'remove') {
      const val = op.val!

      steps.push({
        lineNumber: 13,
        description: `remove(${val})`,
        insight: 'Remove uses "swap with last" trick - swap target with last element, then pop!',
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'remove',
        operationVal: val,
        result: null,
        phase: 'remove-start',
        highlightArrayIndex: null,
        highlightMapKey: null,
        swapFrom: null,
        swapTo: null,
      })

      // Check if exists
      const exists = valuesIdx.has(val)
      steps.push({
        lineNumber: 14,
        description: `Check: ${val} not in valuesIdx? ${!exists ? 'True (not found)' : 'False (found)'}`,
        insight: exists ? 'Value found - proceed with removal' : 'Value not in set - nothing to remove',
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'remove',
        operationVal: val,
        result: null,
        phase: 'remove-check',
        highlightArrayIndex: exists ? valuesIdx.get(val) : null,
        highlightMapKey: exists ? val : null,
        swapFrom: null,
        swapTo: null,
      })

      if (!exists) {
        steps.push({
          lineNumber: 15,
          description: 'return False',
          insight: 'Value not found - return False',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: false,
          phase: 'remove-not-found',
          highlightArrayIndex: null,
          highlightMapKey: null,
          swapFrom: null,
          swapTo: null,
        })
      } else {
        // Get index
        const index = valuesIdx.get(val)!
        steps.push({
          lineNumber: 16,
          description: `index = valuesIdx[${val}] = ${index}`,
          insight: `Value ${val} is at index ${index} in the array`,
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: null,
          phase: 'remove-get-index',
          highlightArrayIndex: index,
          highlightMapKey: val,
          swapFrom: null,
          swapTo: null,
        })

        // Update last element's index in map
        const lastVal = values[values.length - 1]
        valuesIdx.set(lastVal, index)
        steps.push({
          lineNumber: 17,
          description: `valuesIdx[${lastVal}] = ${index}`,
          insight: `Update last element (${lastVal})'s position to ${index} - it will be swapped there`,
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: null,
          phase: 'remove-update-map',
          highlightArrayIndex: values.length - 1,
          highlightMapKey: lastVal,
          swapFrom: values.length - 1,
          swapTo: index,
        })

        // Delete from map
        valuesIdx.delete(val)
        steps.push({
          lineNumber: 18,
          description: `del valuesIdx[${val}]`,
          insight: `Remove ${val} from hashmap - it no longer exists in our set`,
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: null,
          phase: 'remove-del-map',
          highlightArrayIndex: index,
          highlightMapKey: null,
          swapFrom: values.length - 1,
          swapTo: index,
        })

        // Swap in array
        values[index] = lastVal
        steps.push({
          lineNumber: 19,
          description: `values[${index}] = values[-1] = ${lastVal}`,
          insight: 'Move last element to the deletion position - the SWAP!',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: null,
          phase: 'remove-swap',
          highlightArrayIndex: index,
          highlightMapKey: lastVal,
          swapFrom: null,
          swapTo: null,
        })

        // Pop from array
        values.pop()
        steps.push({
          lineNumber: 20,
          description: 'values.pop()',
          insight: 'Pop from end is O(1) - no shifting needed! This is the key trick.',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: null,
          phase: 'remove-pop',
          highlightArrayIndex: null,
          highlightMapKey: null,
          swapFrom: null,
          swapTo: null,
        })

        steps.push({
          lineNumber: 21,
          description: 'return True',
          insight: 'Successfully removed using swap-with-last trick!',
          values: [...values],
          valuesIdx: new Map(valuesIdx),
          operation: 'remove',
          operationVal: val,
          result: true,
          phase: 'remove-success',
          highlightArrayIndex: null,
          highlightMapKey: null,
          swapFrom: null,
          swapTo: null,
        })
      }
    } else if (op.type === 'getRandom') {
      steps.push({
        lineNumber: 23,
        description: 'getRandom()',
        insight: 'Random selection is O(1) because array allows direct index access!',
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'getRandom',
        operationVal: null,
        result: null,
        phase: 'random-start',
        highlightArrayIndex: null,
        highlightMapKey: null,
        swapFrom: null,
        swapTo: null,
      })

      const randomIndex = Math.floor(Math.random() * values.length)
      steps.push({
        lineNumber: 24,
        description: `index = random(0, ${values.length - 1}) = ${randomIndex}`,
        insight: 'Generate random index in O(1)',
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'getRandom',
        operationVal: null,
        result: null,
        phase: 'random-index',
        highlightArrayIndex: randomIndex,
        highlightMapKey: null,
        swapFrom: null,
        swapTo: null,
      })

      const randomVal = values[randomIndex]
      steps.push({
        lineNumber: 25,
        description: `return values[${randomIndex}] = ${randomVal}`,
        insight: `Array index access is O(1) - returned ${randomVal}!`,
        values: [...values],
        valuesIdx: new Map(valuesIdx),
        operation: 'getRandom',
        operationVal: null,
        result: randomVal,
        phase: 'random-result',
        highlightArrayIndex: randomIndex,
        highlightMapKey: randomVal,
        swapFrom: null,
        swapTo: null,
      })
    }
  }

  return steps
}

function RandomizedSetVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = useMemo(() => generateSteps(selectedTestCase.operations), [selectedTestCase])
  const step = steps[currentStepIndex]

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))
  }

  const handleTestCaseChange = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setCurrentStepIndex(0)
  }

  const getResultColor = (result: boolean | number | null) => {
    if (result === null) return 'text-slate-400'
    if (result === true) return 'text-emerald-400'
    if (result === false) return 'text-rose-400'
    return 'text-cyan-400'
  }

  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: '#0a1628' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }
        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        @keyframes swap-arrow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-swap { animation: swap-arrow 0.5s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-cyan-400 font-mono text-sm">#380</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Medium
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">
                Insert Delete GetRandom O(1)
              </h1>
            </div>
            <a
              href="/"
              className="text-slate-400 hover:text-slate-200 transition-colors font-display"
            >
              Back to Problems
            </a>
          </div>
        </div>
      </div>

      {/* Test Case Selector */}
      <div className="border-b border-slate-700/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-display">Test Case:</span>
            <div className="flex gap-2 flex-wrap">
              {TEST_CASES.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => handleTestCaseChange(tc)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedTestCase.id === tc.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Code Panel */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
              <h2 className="font-display font-semibold text-slate-200">Algorithm</h2>
            </div>
            <div className="p-4 font-mono text-sm overflow-auto max-h-[600px]">
              {CODE_LINES.map((line) => {
                const isActive = line.num === step.lineNumber
                return (
                  <div
                    key={line.num}
                    className={`flex transition-all duration-200 ${
                      isActive ? 'bg-cyan-500/10 -mx-4 px-4 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <span
                      className={`w-8 text-right mr-4 select-none ${
                        isActive ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    >
                      {line.num}
                    </span>
                    <pre className={`flex-1 ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {line.code || ' '}
                    </pre>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="space-y-4">
            {/* Current Operation */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-slate-300">Current Operation</h3>
                {step.result !== null && (
                  <span className={`font-mono text-lg font-bold ${getResultColor(step.result)}`}>
                    → {String(step.result)}
                  </span>
                )}
              </div>
              <div className="mt-2 font-mono text-xl">
                <span className="text-purple-400">{step.operation}</span>
                {step.operationVal !== null && (
                  <span className="text-slate-300">({step.operationVal})</span>
                )}
              </div>
            </div>

            {/* Data Structures Visualization */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 blueprint-grid">
              <h3 className="font-display font-semibold text-slate-300 mb-4">Data Structures</h3>

              {/* Array (values) */}
              <div className="mb-6">
                <div className="text-cyan-400 text-sm mb-2 font-mono flex items-center gap-2">
                  <span>self.values</span>
                  <span className="text-slate-500 text-xs">(Array - O(1) random access)</span>
                </div>
                <div className="flex items-center gap-1 min-h-[60px]">
                  {step.values.length === 0 ? (
                    <div className="text-slate-600 font-mono text-sm">[ empty ]</div>
                  ) : (
                    step.values.map((val, idx) => {
                      const isHighlighted = step.highlightArrayIndex === idx
                      const isSwapFrom = step.swapFrom === idx
                      const isSwapTo = step.swapTo === idx
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-lg transition-all ${
                              isHighlighted
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400'
                                : isSwapFrom || isSwapTo
                                  ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                                  : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            {val}
                          </div>
                          <span className="text-slate-500 text-xs mt-1">[{idx}]</span>
                          {(isSwapFrom || isSwapTo) && (
                            <span className="text-amber-400 text-xs animate-swap">
                              {isSwapFrom ? '↗' : '↙'}
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Hashmap (valuesIdx) */}
              <div>
                <div className="text-orange-400 text-sm mb-2 font-mono flex items-center gap-2">
                  <span>self.valuesIdx</span>
                  <span className="text-slate-500 text-xs">(HashMap - O(1) lookup)</span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[50px]">
                  {step.valuesIdx.size === 0 ? (
                    <div className="text-slate-600 font-mono text-sm">{'{ empty }'}</div>
                  ) : (
                    Array.from(step.valuesIdx.entries()).map(([key, value]) => {
                      const isHighlighted = step.highlightMapKey === key
                      return (
                        <div
                          key={key}
                          className={`px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
                            isHighlighted
                              ? 'bg-orange-500/30 border-orange-400 text-orange-200'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className={isHighlighted ? 'text-orange-300' : 'text-slate-300'}>
                            {key}
                          </span>
                          <span className="text-slate-600 mx-1">:</span>
                          <span className={isHighlighted ? 'text-cyan-300' : 'text-cyan-500'}>
                            {value}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Swap Explanation (for remove) */}
            {step.phase.startsWith('remove') && step.swapFrom !== null && step.swapTo !== null && (
              <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-4">
                <h3 className="font-display font-semibold text-amber-300 mb-2">
                  Swap-With-Last Trick
                </h3>
                <div className="text-slate-300 text-sm">
                  Move element from index <span className="text-cyan-400">{step.swapFrom}</span> to
                  index <span className="text-cyan-400">{step.swapTo}</span>, then pop from end!
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  This avoids O(n) shifting - removal becomes O(1)
                </div>
              </div>
            )}

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-4">
              <h3 className="font-display font-semibold text-purple-300 mb-2">Insight</h3>
              <p className="text-slate-300">{step.insight}</p>
            </div>

            {/* Why This Works */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Why Combine Array + HashMap?</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
                  <div className="text-cyan-400 font-medium mb-1">Array Strengths</div>
                  <ul className="text-slate-400 space-y-1">
                    <li>• O(1) random access</li>
                    <li>• O(1) append to end</li>
                    <li>• O(1) pop from end</li>
                  </ul>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                  <div className="text-orange-400 font-medium mb-1">HashMap Strengths</div>
                  <ul className="text-slate-400 space-y-1">
                    <li>• O(1) existence check</li>
                    <li>• O(1) value lookup</li>
                    <li>• O(1) insert/delete</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Complexity Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Complexity Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Time Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(1) average</div>
                  <div className="text-slate-500 text-xs mt-1">All operations</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Space Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(n)</div>
                  <div className="text-slate-500 text-xs mt-1">Array + HashMap storage</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-300 font-display">{step.description}</p>
        </div>
      </div>
    </div>
  )
}
