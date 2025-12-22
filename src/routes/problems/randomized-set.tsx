import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/randomized-set')({
  component: RandomizedSetVisualization,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `Implement the RandomizedSet class:

- RandomizedSet() Initializes the RandomizedSet object.
- bool insert(int val) Inserts an item val into the set if not present. Returns true if the item was not present, false otherwise.
- bool remove(int val) Removes an item val from the set if present. Returns true if the item was present, false otherwise.
- int getRandom() Returns a random element from the current set of elements (it's guaranteed that at least one element exists when this method is called). Each element must have the same probability of being returned.

You must implement the functions of the class such that each function works in average O(1) time complexity.`

const EXAMPLES: Array<Example> = [
  {
    input: `["RandomizedSet", "insert", "remove", "insert", "getRandom", "remove", "insert", "getRandom"]
[[], [1], [2], [2], [], [1], [2], []]`,
    output: `[null, true, false, true, 2, true, false, 2]`,
    explanation: `RandomizedSet randomizedSet = new RandomizedSet();
randomizedSet.insert(1); // Inserts 1 to the set. Returns true as 1 was inserted successfully.
randomizedSet.remove(2); // Returns false as 2 does not exist in the set.
randomizedSet.insert(2); // Inserts 2 to the set, returns true. Set now contains [1,2].
randomizedSet.getRandom(); // getRandom() should return either 1 or 2 randomly.
randomizedSet.remove(1); // Removes 1 from the set, returns true. Set now contains [2].
randomizedSet.insert(2); // 2 was already in the set, so return false.
randomizedSet.getRandom(); // Since 2 is the only number in the set, getRandom() will always return 2.`,
  },
]

const CONSTRAINTS = [
  '-2^31 <= val <= 2^31 - 1',
  'At most 2 * 10^5 calls will be made to insert, remove, and getRandom',
  'There will be at least one element in the data structure when getRandom is called',
]

interface Operation {
  type: 'insert' | 'remove' | 'getRandom'
  val?: number
  expected: boolean | number | null
}

interface TestCaseData {
  operations: Array<Operation>
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  values: Array<number>
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

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Example 1',
    data: {
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
  },
  {
    id: 2,
    label: 'Swap Trick',
    data: {
      operations: [
        { type: 'insert', val: 1, expected: true },
        { type: 'insert', val: 2, expected: true },
        { type: 'insert', val: 3, expected: true },
        { type: 'remove', val: 1, expected: true },
        { type: 'remove', val: 2, expected: true },
      ],
    },
  },
  {
    id: 3,
    label: 'Single Element',
    data: {
      operations: [
        { type: 'insert', val: 5, expected: true },
        { type: 'getRandom', expected: 5 },
        { type: 'remove', val: 5, expected: true },
        { type: 'insert', val: 10, expected: true },
      ],
    },
  },
]

function generateSteps(operations: Array<Operation>): Array<Step> {
  const steps: Array<Step> = []
  const values: Array<number> = []
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
        highlightArrayIndex: exists ? valuesIdx.get(val) ?? null : null,
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
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.operations), [testCase.data.operations])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const getResultColor = (result: boolean | number | null) => {
    if (result === null) return 'text-slate-400'
    if (result === true) return 'text-emerald-400'
    if (result === false) return 'text-rose-400'
    return 'text-cyan-400'
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        @keyframes swap-arrow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-swap { animation: swap-arrow 0.5s ease-in-out infinite; }
      `}</style>

      {/* Current Operation */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-slate-300">Current Operation</h3>
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="font-mono font-semibold text-slate-300 mb-4">Data Structures</h3>

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
          <h3 className="font-mono font-semibold text-amber-300 mb-2">
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Why Combine Array + HashMap?</h3>
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
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Time Complexity</div>
          <div className="text-emerald-400 font-mono text-lg">O(1) average</div>
          <div className="text-slate-500 text-xs mt-1">All operations</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Space Complexity</div>
          <div className="text-emerald-400 font-mono text-lg">O(n)</div>
          <div className="text-slate-500 text-xs mt-1">Array + HashMap storage</div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '380',
        title: 'Insert Delete GetRandom O(1)',
        difficulty: 'medium',
        tags: ['Array', 'Hash Table', 'Design'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="randomized_set.py"
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
