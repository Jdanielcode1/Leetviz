import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/ordered-stream')({
  component: OrderedStreamVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class OrderedStream:' },
  { num: 2, code: '' },
  { num: 3, code: '    def __init__(self, n: int):' },
  { num: 4, code: '        self.stream = {}' },
  { num: 5, code: '        self.pointer = 1' },
  { num: 6, code: '' },
  { num: 7, code: '    def insert(self, idKey: int, value: str) -> List[str]:' },
  { num: 8, code: '        self.stream[idKey] = value' },
  { num: 9, code: '        output = []' },
  { num: 10, code: '' },
  { num: 11, code: '        while self.pointer in self.stream:' },
  { num: 12, code: '            output.append(self.stream.get(self.pointer))' },
  { num: 13, code: '            self.pointer += 1' },
  { num: 14, code: '' },
  { num: 15, code: '        return output' },
]

interface Operation {
  type: 'init' | 'insert'
  args: number | [number, string]
}

interface TestCase {
  id: number
  name: string
  n: number
  operations: Operation[]
  expectedOutputs: (null | string[])[]
  explanation: string[]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Main Example',
    n: 5,
    operations: [
      { type: 'init', args: 5 },
      { type: 'insert', args: [3, 'ccccc'] },
      { type: 'insert', args: [1, 'aaaaa'] },
      { type: 'insert', args: [2, 'bbbbb'] },
      { type: 'insert', args: [5, 'eeeee'] },
      { type: 'insert', args: [4, 'ddddd'] },
    ],
    expectedOutputs: [null, [], ['aaaaa'], ['bbbbb', 'ccccc'], [], ['ddddd', 'eeeee']],
    explanation: [
      'OrderedStream(5) - Initialize stream with 5 slots',
      'insert(3, "ccccc") - Slot 3 filled, but pointer at 1 (empty), return []',
      'insert(1, "aaaaa") - Slot 1 filled, pointer moves 1→2, return ["aaaaa"]',
      'insert(2, "bbbbb") - Slot 2 filled, consecutive with 3, pointer 2→4, return ["bbbbb", "ccccc"]',
      'insert(5, "eeeee") - Slot 5 filled, but slot 4 empty, return []',
      'insert(4, "ddddd") - Slot 4 filled, consecutive with 5, pointer 4→6, return ["ddddd", "eeeee"]',
    ],
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  stream: Map<number, string>
  pointer: number
  n: number
  currentInsert: { id: number; value: string } | null
  output: string[]
  allOutputs: (string[] | null)[]
  concatenated: string[]
  phase: 'init' | 'insert-value' | 'check-pointer' | 'collect' | 'advance-pointer' | 'return' | 'complete'
  highlightSlot: number | null
  highlightOutput: boolean
  slotsReturning: number[]
  operationIndex: number
}

function generateSteps(testCase: TestCase): Step[] {
  const steps: Step[] = []
  const stream = new Map<number, string>()
  let pointer = 1
  const allOutputs: (string[] | null)[] = []
  const concatenated: string[] = []

  // Initial state - class definition
  steps.push({
    lineNumber: 1,
    description: 'Define the OrderedStream class',
    insight: 'This design problem uses a hashmap for O(1) insertions and lookups',
    stream: new Map(stream),
    pointer: 1,
    n: testCase.n,
    currentInsert: null,
    output: [],
    allOutputs: [...allOutputs],
    concatenated: [...concatenated],
    phase: 'init',
    highlightSlot: null,
    highlightOutput: false,
    slotsReturning: [],
    operationIndex: -1,
  })

  // Constructor
  steps.push({
    lineNumber: 3,
    description: `Initialize OrderedStream(${testCase.n})`,
    insight: 'The constructor takes n, but with hashmap we do not actually need it!',
    stream: new Map(stream),
    pointer: 1,
    n: testCase.n,
    currentInsert: null,
    output: [],
    allOutputs: [...allOutputs],
    concatenated: [...concatenated],
    phase: 'init',
    highlightSlot: null,
    highlightOutput: false,
    slotsReturning: [],
    operationIndex: 0,
  })

  steps.push({
    lineNumber: 4,
    description: 'Initialize empty hashmap: stream = {}',
    insight: 'Using a hashmap instead of array - no need to allocate n slots upfront',
    stream: new Map(stream),
    pointer: 1,
    n: testCase.n,
    currentInsert: null,
    output: [],
    allOutputs: [...allOutputs],
    concatenated: [...concatenated],
    phase: 'init',
    highlightSlot: null,
    highlightOutput: false,
    slotsReturning: [],
    operationIndex: 0,
  })

  steps.push({
    lineNumber: 5,
    description: 'Set pointer = 1 (1-indexed)',
    insight: 'The pointer tracks the next ID we expect to return',
    stream: new Map(stream),
    pointer: 1,
    n: testCase.n,
    currentInsert: null,
    output: [],
    allOutputs: [...allOutputs],
    concatenated: [...concatenated],
    phase: 'init',
    highlightSlot: null,
    highlightOutput: false,
    slotsReturning: [],
    operationIndex: 0,
  })

  allOutputs.push(null)

  // Process each insert operation
  for (let opIdx = 1; opIdx < testCase.operations.length; opIdx++) {
    const op = testCase.operations[opIdx]
    if (op.type !== 'insert') continue

    const [idKey, value] = op.args as [number, string]
    let output: string[] = []
    const slotsReturning: number[] = []

    // Start insert method
    steps.push({
      lineNumber: 7,
      description: `Call insert(${idKey}, "${value}")`,
      insight: `Inserting value at position ${idKey}`,
      stream: new Map(stream),
      pointer,
      n: testCase.n,
      currentInsert: { id: idKey, value },
      output: [],
      allOutputs: [...allOutputs],
      concatenated: [...concatenated],
      phase: 'insert-value',
      highlightSlot: idKey,
      highlightOutput: false,
      slotsReturning: [],
      operationIndex: opIdx,
    })

    // Insert into stream
    stream.set(idKey, value)

    steps.push({
      lineNumber: 8,
      description: `stream[${idKey}] = "${value}"`,
      insight: `Stored value at position ${idKey} in the hashmap`,
      stream: new Map(stream),
      pointer,
      n: testCase.n,
      currentInsert: { id: idKey, value },
      output: [],
      allOutputs: [...allOutputs],
      concatenated: [...concatenated],
      phase: 'insert-value',
      highlightSlot: idKey,
      highlightOutput: false,
      slotsReturning: [],
      operationIndex: opIdx,
    })

    // Initialize output
    steps.push({
      lineNumber: 9,
      description: 'Initialize output = []',
      insight: 'We will collect consecutive values starting from pointer',
      stream: new Map(stream),
      pointer,
      n: testCase.n,
      currentInsert: { id: idKey, value },
      output: [],
      allOutputs: [...allOutputs],
      concatenated: [...concatenated],
      phase: 'insert-value',
      highlightSlot: null,
      highlightOutput: false,
      slotsReturning: [],
      operationIndex: opIdx,
    })

    // While loop - check and collect
    const startPointer = pointer
    while (stream.has(pointer)) {
      // Check condition
      steps.push({
        lineNumber: 11,
        description: `Check: pointer ${pointer} in stream? Yes!`,
        insight: `Position ${pointer} has value "${stream.get(pointer)}" - we can return it`,
        stream: new Map(stream),
        pointer,
        n: testCase.n,
        currentInsert: { id: idKey, value },
        output: [...output],
        allOutputs: [...allOutputs],
        concatenated: [...concatenated],
        phase: 'check-pointer',
        highlightSlot: pointer,
        highlightOutput: false,
        slotsReturning: [...slotsReturning],
        operationIndex: opIdx,
      })

      // Collect value
      const val = stream.get(pointer)!
      output.push(val)
      slotsReturning.push(pointer)

      steps.push({
        lineNumber: 12,
        description: `output.append("${val}")`,
        insight: `Added "${val}" to output, output is now [${output.map((v) => `"${v}"`).join(', ')}]`,
        stream: new Map(stream),
        pointer,
        n: testCase.n,
        currentInsert: { id: idKey, value },
        output: [...output],
        allOutputs: [...allOutputs],
        concatenated: [...concatenated],
        phase: 'collect',
        highlightSlot: pointer,
        highlightOutput: true,
        slotsReturning: [...slotsReturning],
        operationIndex: opIdx,
      })

      // Advance pointer
      pointer++

      steps.push({
        lineNumber: 13,
        description: `pointer += 1 → pointer = ${pointer}`,
        insight: 'Move to next position to check for more consecutive values',
        stream: new Map(stream),
        pointer,
        n: testCase.n,
        currentInsert: { id: idKey, value },
        output: [...output],
        allOutputs: [...allOutputs],
        concatenated: [...concatenated],
        phase: 'advance-pointer',
        highlightSlot: pointer,
        highlightOutput: false,
        slotsReturning: [...slotsReturning],
        operationIndex: opIdx,
      })
    }

    // Check failed or loop done
    if (output.length === 0) {
      steps.push({
        lineNumber: 11,
        description: `Check: pointer ${pointer} in stream? No`,
        insight: `Position ${pointer} is empty - cannot return anything yet`,
        stream: new Map(stream),
        pointer,
        n: testCase.n,
        currentInsert: { id: idKey, value },
        output: [...output],
        allOutputs: [...allOutputs],
        concatenated: [...concatenated],
        phase: 'check-pointer',
        highlightSlot: pointer,
        highlightOutput: false,
        slotsReturning: [],
        operationIndex: opIdx,
      })
    } else if (pointer <= testCase.n && !stream.has(pointer)) {
      steps.push({
        lineNumber: 11,
        description: `Check: pointer ${pointer} in stream? No - stop collecting`,
        insight: `Position ${pointer} is empty, we've collected all consecutive values`,
        stream: new Map(stream),
        pointer,
        n: testCase.n,
        currentInsert: { id: idKey, value },
        output: [...output],
        allOutputs: [...allOutputs],
        concatenated: [...concatenated],
        phase: 'check-pointer',
        highlightSlot: pointer,
        highlightOutput: false,
        slotsReturning: [...slotsReturning],
        operationIndex: opIdx,
      })
    }

    // Return output
    concatenated.push(...output)
    allOutputs.push([...output])

    steps.push({
      lineNumber: 15,
      description: `Return [${output.map((v) => `"${v}"`).join(', ')}]`,
      insight:
        output.length === 0
          ? 'No consecutive values available from pointer position'
          : `Returned ${output.length} consecutive value(s), pointer moved from ${startPointer} to ${pointer}`,
      stream: new Map(stream),
      pointer,
      n: testCase.n,
      currentInsert: null,
      output: [...output],
      allOutputs: [...allOutputs],
      concatenated: [...concatenated],
      phase: 'return',
      highlightSlot: null,
      highlightOutput: output.length > 0,
      slotsReturning: [...slotsReturning],
      operationIndex: opIdx,
    })
  }

  // Complete
  steps.push({
    lineNumber: 15,
    description: 'All operations complete!',
    insight: `Final concatenated result: [${concatenated.map((v) => `"${v}"`).join(', ')}] - values in sorted order!`,
    stream: new Map(stream),
    pointer,
    n: testCase.n,
    currentInsert: null,
    output: [],
    allOutputs: [...allOutputs],
    concatenated: [...concatenated],
    phase: 'complete',
    highlightSlot: null,
    highlightOutput: false,
    slotsReturning: [],
    operationIndex: -1,
  })

  return steps
}

// Color mapping for values
const VALUE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  aaaaa: { bg: 'bg-red-500/30', border: 'border-red-400', text: 'text-red-300' },
  bbbbb: { bg: 'bg-amber-500/30', border: 'border-amber-400', text: 'text-amber-300' },
  ccccc: { bg: 'bg-emerald-500/30', border: 'border-emerald-400', text: 'text-emerald-300' },
  ddddd: { bg: 'bg-purple-500/30', border: 'border-purple-400', text: 'text-purple-300' },
  eeeee: { bg: 'bg-cyan-500/30', border: 'border-cyan-400', text: 'text-cyan-300' },
}

function getValueColor(value: string) {
  return VALUE_COLORS[value] || { bg: 'bg-slate-500/30', border: 'border-slate-400', text: 'text-slate-300' }
}

function OrderedStreamVisualization() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [showTestCase, setShowTestCase] = useState(false)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase), [selectedTestCase])
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
        .glow-purple { box-shadow: 0 0 20px rgba(192, 132, 252, 0.4); }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 25px rgba(34, 211, 238, 0.6); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1s ease-in-out infinite;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-arrow {
          animation: bounce-arrow 0.5s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-slate-500 font-code text-sm">#1656</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                  Easy
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">Design an Ordered Stream</h1>
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
              <div className="space-y-2 text-sm font-code">
                {testCase.explanation.map((exp, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-slate-500">{i}.</span>
                    <span className="text-slate-300">{exp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Code Panel */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
              <span className="text-slate-400 text-sm font-display">Python Code (Bloomberg Variation)</span>
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
                    <span className="w-8 text-right pr-4 text-slate-600 select-none text-xs leading-6">{line.num}</span>
                    <pre className={`leading-6 ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>{line.code || ' '}</pre>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="space-y-4">
            {/* Stream Visualization */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-4">Stream (HashMap)</div>

              <div className="flex gap-2 justify-center mb-2">
                {Array.from({ length: step.n }, (_, i) => i + 1).map((slot) => {
                  const value = step.stream.get(slot)
                  const isEmpty = !value
                  const isHighlighted = step.highlightSlot === slot
                  const isReturning = step.slotsReturning.includes(slot)
                  const isPointer = slot === step.pointer
                  const colors = value ? getValueColor(value) : null

                  let borderClass = 'border-slate-600 border-dashed'
                  let bgClass = 'bg-slate-800/30'
                  let glowClass = ''

                  if (value && colors) {
                    borderClass = `${colors.border} border-solid`
                    bgClass = colors.bg
                  }

                  if (isHighlighted && step.phase === 'insert-value') {
                    glowClass = 'glow-cyan animate-pulse-glow'
                  } else if (isReturning) {
                    glowClass = 'glow-green'
                    borderClass = 'border-emerald-400'
                  } else if (isPointer && step.phase === 'check-pointer') {
                    glowClass = 'glow-orange'
                  }

                  return (
                    <div key={slot} className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center font-code text-xs transition-all duration-300 ${borderClass} ${bgClass} ${glowClass}`}
                      >
                        {isEmpty ? (
                          <span className="text-slate-600">—</span>
                        ) : (
                          <span className={colors?.text || 'text-slate-300'}>{value}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">{slot}</span>
                      {isPointer && (
                        <div className="flex flex-col items-center mt-1">
                          <svg
                            className={`w-4 h-4 text-orange-400 ${step.phase === 'advance-pointer' ? 'animate-bounce-arrow' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-[10px] text-orange-400">ptr</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current Operation */}
            {step.currentInsert && (
              <div className="bg-slate-900/70 rounded-xl border border-cyan-500/30 p-4 glow-cyan">
                <div className="text-cyan-400 text-sm font-display mb-2">Current Operation</div>
                <div className="font-code text-lg text-center">
                  insert({step.currentInsert.id}, "{step.currentInsert.value}")
                </div>
              </div>
            )}

            {/* Variables */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-3">Variables</div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-lg border ${step.phase === 'advance-pointer' ? 'bg-orange-500/20 border-orange-400 glow-orange' : 'bg-slate-800/50 border-slate-600'}`}
                >
                  <div className="text-xs text-slate-500 mb-1">pointer</div>
                  <div className="font-code text-xl text-orange-300">{step.pointer}</div>
                </div>
                <div
                  className={`p-3 rounded-lg border ${step.highlightOutput ? 'bg-emerald-500/20 border-emerald-400 glow-green' : 'bg-slate-800/50 border-slate-600'}`}
                >
                  <div className="text-xs text-slate-500 mb-1">output</div>
                  <div className="font-code text-sm text-emerald-300">
                    [{step.output.map((v) => `"${v}"`).join(', ')}]
                  </div>
                </div>
              </div>
            </div>

            {/* Output History */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-4">
              <div className="text-slate-400 text-sm font-display mb-3">Output History</div>
              <div className="space-y-2">
                {step.allOutputs.map((output, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-code">
                    <span className="text-slate-500 w-6">#{i}</span>
                    {output === null ? (
                      <span className="text-slate-500">null</span>
                    ) : (
                      <span className={output.length > 0 ? 'text-emerald-300' : 'text-slate-400'}>
                        [{output.map((v) => `"${v}"`).join(', ')}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Concatenated Result */}
            <div className="bg-slate-900/70 rounded-xl border border-purple-500/30 p-4">
              <div className="text-purple-400 text-sm font-display mb-2">Concatenated Result</div>
              <div className="font-code text-sm text-purple-300">
                [{step.concatenated.map((v) => `"${v}"`).join(', ')}]
              </div>
              {step.phase === 'complete' && (
                <div className="mt-2 text-xs text-slate-500">Values returned in sorted order!</div>
              )}
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
              <h4 className="text-cyan-400 font-medium mb-2">Key Insight: Pointer Only Moves Forward</h4>
              <p className="text-slate-400">
                The pointer tracks the smallest ID we haven't returned yet. It only advances when we find consecutive
                filled positions, never moves backward.
              </p>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Bloomberg Variation: HashMap vs Array</h4>
              <p className="text-slate-400">
                Using a hashmap instead of an array means we don't need to know <code className="text-amber-300">n</code>{' '}
                upfront. We just check if <code className="text-amber-300">pointer in stream</code> with O(1) lookup.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex gap-6">
            <div>
              <span className="text-slate-500">Time:</span>
              <span className="text-emerald-300 ml-2 font-code">O(n) total</span>
            </div>
            <div>
              <span className="text-slate-500">Space:</span>
              <span className="text-emerald-300 ml-2 font-code">O(n)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
