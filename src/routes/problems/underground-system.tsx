import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/underground-system')({
  component: UndergroundSystem,
})

const CODE_LINES = [
  { num: 1, code: 'class UndergroundSystem:' },
  { num: 2, code: '    def __init__(self):' },
  { num: 3, code: '        self.checkInMap = {}  # id -> (station, time)' },
  { num: 4, code: '        self.totalMap = {}    # (start, end) -> [total, count]' },
  { num: 5, code: '' },
  { num: 6, code: '    def checkIn(self, id: int, stationName: str, t: int):' },
  { num: 7, code: '        self.checkInMap[id] = (stationName, t)' },
  { num: 8, code: '' },
  { num: 9, code: '    def checkOut(self, id: int, endStation: str, t: int):' },
  { num: 10, code: '        start, time = self.checkInMap[id]' },
  { num: 11, code: '        route = (start, endStation)' },
  { num: 12, code: '        if route not in self.totalMap:' },
  { num: 13, code: '            self.totalMap[route] = [0, 0]' },
  { num: 14, code: '        self.totalMap[route][0] += t - time' },
  { num: 15, code: '        self.totalMap[route][1] += 1' },
  { num: 16, code: '' },
  { num: 17, code: '    def getAverageTime(self, start: str, end: str) -> float:' },
  { num: 18, code: '        total, count = self.totalMap[(start, end)]' },
  { num: 19, code: '        return total / count' },
]

const PROBLEM_DESCRIPTION = `An underground railway system tracks customer travel times between different stations to calculate average travel times.

Implement checkIn, checkOut, and getAverageTime operations.`

interface CheckInEntry {
  station: string
  time: number
}

interface RouteStats {
  totalTime: number
  count: number
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  operation: 'init' | 'checkIn' | 'checkOut' | 'getAverageTime'
  checkInMap: Map<number, CheckInEntry>
  totalMap: Map<string, RouteStats>
  highlightCheckIn: number | null
  highlightRoute: string | null
  result: number | null
  travelTime: number | null
}

interface Operation {
  type: 'checkIn' | 'checkOut' | 'getAverageTime'
  args: (string | number)[]
  comment?: string
}

interface TestCase {
  id: number
  name: string
  operations: Operation[]
  expectedOutputs: (number | null)[]
  explanation: string[]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Example 1: Multiple routes',
    operations: [
      { type: 'checkIn', args: [45, 'Leyton', 3] },
      { type: 'checkIn', args: [32, 'Paradise', 8] },
      { type: 'checkIn', args: [27, 'Leyton', 10] },
      { type: 'checkOut', args: [45, 'Waterloo', 15], comment: 'Customer 45 "Leyton" → "Waterloo" in 15-3 = 12' },
      { type: 'checkOut', args: [27, 'Waterloo', 20], comment: 'Customer 27 "Leyton" → "Waterloo" in 20-10 = 10' },
      { type: 'checkOut', args: [32, 'Cambridge', 22], comment: 'Customer 32 "Paradise" → "Cambridge" in 22-8 = 14' },
      { type: 'getAverageTime', args: ['Paradise', 'Cambridge'], comment: '(14) / 1 = 14.00000' },
      { type: 'getAverageTime', args: ['Leyton', 'Waterloo'], comment: '(10 + 12) / 2 = 11.00000' },
      { type: 'checkIn', args: [10, 'Leyton', 24] },
      { type: 'getAverageTime', args: ['Leyton', 'Waterloo'], comment: 'Still 11.00000 (no new trips)' },
      { type: 'checkOut', args: [10, 'Waterloo', 38], comment: 'Customer 10 "Leyton" → "Waterloo" in 38-24 = 14' },
      { type: 'getAverageTime', args: ['Leyton', 'Waterloo'], comment: '(10 + 12 + 14) / 3 = 12.00000' },
    ],
    expectedOutputs: [null, null, null, null, null, null, 14.0, 11.0, null, 11.0, null, 12.0],
    explanation: [
      'UndergroundSystem undergroundSystem = new UndergroundSystem();',
      'undergroundSystem.checkIn(45, "Leyton", 3);',
      'undergroundSystem.checkIn(32, "Paradise", 8);',
      'undergroundSystem.checkIn(27, "Leyton", 10);',
      'undergroundSystem.checkOut(45, "Waterloo", 15);  // Customer 45 "Leyton" -> "Waterloo" in 15-3 = 12',
      'undergroundSystem.checkOut(27, "Waterloo", 20);  // Customer 27 "Leyton" -> "Waterloo" in 20-10 = 10',
      'undergroundSystem.checkOut(32, "Cambridge", 22); // Customer 32 "Paradise" -> "Cambridge" in 22-8 = 14',
      'undergroundSystem.getAverageTime("Paradise", "Cambridge"); // return 14.00000. One trip "Paradise" -> "Cambridge", (14) / 1 = 14',
      'undergroundSystem.getAverageTime("Leyton", "Waterloo");    // return 11.00000. Two trips "Leyton" -> "Waterloo", (10 + 12) / 2 = 11',
      'undergroundSystem.checkIn(10, "Leyton", 24);',
      'undergroundSystem.getAverageTime("Leyton", "Waterloo");    // return 11.00000',
      'undergroundSystem.checkOut(10, "Waterloo", 38);  // Customer 10 "Leyton" -> "Waterloo" in 38-24 = 14',
      'undergroundSystem.getAverageTime("Leyton", "Waterloo");    // return 12.00000. Three trips "Leyton" -> "Waterloo", (10 + 12 + 14) / 3 = 12',
    ],
  },
  {
    id: 2,
    name: 'Example 2: Single route',
    operations: [
      { type: 'checkIn', args: [10, 'Leyton', 3] },
      { type: 'checkOut', args: [10, 'Paradise', 8], comment: 'Customer 10 "Leyton" → "Paradise" in 8-3 = 5' },
      { type: 'getAverageTime', args: ['Leyton', 'Paradise'], comment: '(5) / 1 = 5.00000' },
      { type: 'checkIn', args: [5, 'Leyton', 10] },
      { type: 'checkOut', args: [5, 'Paradise', 16], comment: 'Customer 5 "Leyton" → "Paradise" in 16-10 = 6' },
      { type: 'getAverageTime', args: ['Leyton', 'Paradise'], comment: '(5 + 6) / 2 = 5.50000' },
      { type: 'checkIn', args: [2, 'Leyton', 21] },
      { type: 'checkOut', args: [2, 'Paradise', 30], comment: 'Customer 2 "Leyton" → "Paradise" in 30-21 = 9' },
      { type: 'getAverageTime', args: ['Leyton', 'Paradise'], comment: '(5 + 6 + 9) / 3 = 6.66667' },
    ],
    expectedOutputs: [null, null, 5.0, null, null, 5.5, null, null, 6.66667],
    explanation: [
      'UndergroundSystem undergroundSystem = new UndergroundSystem();',
      'undergroundSystem.checkIn(10, "Leyton", 3);',
      'undergroundSystem.checkOut(10, "Paradise", 8); // Customer 10 "Leyton" -> "Paradise" in 8-3 = 5',
      'undergroundSystem.getAverageTime("Leyton", "Paradise"); // return 5.00000, (5) / 1 = 5',
      'undergroundSystem.checkIn(5, "Leyton", 10);',
      'undergroundSystem.checkOut(5, "Paradise", 16); // Customer 5 "Leyton" -> "Paradise" in 16-10 = 6',
      'undergroundSystem.getAverageTime("Leyton", "Paradise"); // return 5.50000, (5 + 6) / 2 = 5.5',
      'undergroundSystem.checkIn(2, "Leyton", 21);',
      'undergroundSystem.checkOut(2, "Paradise", 30); // Customer 2 "Leyton" -> "Paradise" in 30-21 = 9',
      'undergroundSystem.getAverageTime("Leyton", "Paradise"); // return 6.66667, (5 + 6 + 9) / 3 = 6.66667',
    ],
  },
]

function generateSteps(operations: Operation[]): Step[] {
  const steps: Step[] = []
  const checkInMap = new Map<number, CheckInEntry>()
  const totalMap = new Map<string, RouteStats>()

  // Init
  steps.push({
    lineNumber: 2,
    description: 'Initialize UndergroundSystem',
    insight: 'Create two hashmaps: checkInMap for active passengers, totalMap for route statistics.',
    operation: 'init',
    checkInMap: new Map(checkInMap),
    totalMap: new Map(totalMap),
    highlightCheckIn: null,
    highlightRoute: null,
    result: null,
    travelTime: null,
  })

  for (const op of operations) {
    if (op.type === 'checkIn') {
      const [id, station, time] = op.args as [number, string, number]

      steps.push({
        lineNumber: 6,
        description: `checkIn(${id}, "${station}", ${time})`,
        insight: `Customer ${id} checks in at ${station} at time ${time}.`,
        operation: 'checkIn',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: id,
        highlightRoute: null,
        result: null,
        travelTime: null,
      })

      checkInMap.set(id, { station, time })

      steps.push({
        lineNumber: 7,
        description: `checkInMap[${id}] = ("${station}", ${time})`,
        insight: `Store passenger's start station and time. They can be checked in at only one place.`,
        operation: 'checkIn',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: id,
        highlightRoute: null,
        result: null,
        travelTime: null,
      })
    } else if (op.type === 'checkOut') {
      const [id, endStation, t] = op.args as [number, string, number]
      const entry = checkInMap.get(id)!
      const travelTime = t - entry.time
      const routeKey = `${entry.station}→${endStation}`

      steps.push({
        lineNumber: 9,
        description: `checkOut(${id}, "${endStation}", ${t})`,
        insight: op.comment || `Customer ${id} checks out at ${endStation} at time ${t}.`,
        operation: 'checkOut',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: id,
        highlightRoute: null,
        result: null,
        travelTime: null,
      })

      steps.push({
        lineNumber: 10,
        description: `Get check-in info: start="${entry.station}", time=${entry.time}`,
        insight: `Look up where customer ${id} checked in.`,
        operation: 'checkOut',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: id,
        highlightRoute: null,
        result: null,
        travelTime: null,
      })

      steps.push({
        lineNumber: 14,
        description: `Travel time: ${t} - ${entry.time} = ${travelTime} minutes`,
        insight: `Customer ${id} traveled from ${entry.station} to ${endStation} in ${travelTime} minutes.`,
        operation: 'checkOut',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: id,
        highlightRoute: routeKey,
        result: null,
        travelTime,
      })

      // Update totalMap
      const existing = totalMap.get(routeKey) || { totalTime: 0, count: 0 }
      totalMap.set(routeKey, {
        totalTime: existing.totalTime + travelTime,
        count: existing.count + 1,
      })

      steps.push({
        lineNumber: 15,
        description: `Update route stats: ${routeKey}`,
        insight: `Total: ${totalMap.get(routeKey)!.totalTime} mins, Count: ${totalMap.get(routeKey)!.count} trips`,
        operation: 'checkOut',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: null,
        highlightRoute: routeKey,
        result: null,
        travelTime: null,
      })
    } else if (op.type === 'getAverageTime') {
      const [start, end] = op.args as [string, string]
      const routeKey = `${start}→${end}`
      const stats = totalMap.get(routeKey)!
      const avg = stats.totalTime / stats.count

      steps.push({
        lineNumber: 17,
        description: `getAverageTime("${start}", "${end}")`,
        insight: `Query average travel time from ${start} to ${end}.`,
        operation: 'getAverageTime',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: null,
        highlightRoute: routeKey,
        result: null,
        travelTime: null,
      })

      steps.push({
        lineNumber: 19,
        description: `Return ${stats.totalTime} / ${stats.count} = ${avg.toFixed(5)}`,
        insight: op.comment || `Average of ${stats.count} trip(s): ${avg.toFixed(5)} minutes.`,
        operation: 'getAverageTime',
        checkInMap: new Map(checkInMap),
        totalMap: new Map(totalMap),
        highlightCheckIn: null,
        highlightRoute: routeKey,
        result: avg,
        travelTime: null,
      })
    }
  }

  return steps
}

function UndergroundSystem() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showTestCase, setShowTestCase] = useState(false)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.operations), [testCase.operations])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const checkInArray = Array.from(step.checkInMap.entries())
  const totalArray = Array.from(step.totalMap.entries())

  // Generate input/output arrays for display
  const inputMethods = useMemo(() => {
    const methods = ['UndergroundSystem', ...testCase.operations.map(op => op.type)]
    return JSON.stringify(methods)
  }, [testCase.operations])

  const inputArgs = useMemo(() => {
    const args = [[], ...testCase.operations.map(op => op.args)]
    return JSON.stringify(args)
  }, [testCase.operations])

  const outputArray = useMemo(() => {
    const outputs = [null, ...testCase.expectedOutputs]
    return JSON.stringify(outputs.map(v => v === null ? null : Number(v.toFixed(5))))
  }, [testCase.expectedOutputs])

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
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
        }

        .glow-orange {
          box-shadow: 0 0 15px rgba(251, 146, 60, 0.4);
        }

        .glow-green {
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
        }

        .glow-purple {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
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
                  <span className="text-slate-500 font-mono">#1396</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Design Underground System
                </h1>
                <div className="flex gap-2">
                  {['Hash Table', 'Design', 'String'].map((tag) => (
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
                    {tc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Show Test Case Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowTestCase(!showTestCase)}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showTestCase ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showTestCase ? 'Hide' : 'Show'} Test Case Details
            </button>

            {showTestCase && (
              <div className="mt-4 bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 space-y-4">
                  {/* Input */}
                  <div>
                    <div className="text-cyan-400 font-mono text-sm mb-2">Input</div>
                    <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-all">{inputMethods}</pre>
                      <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-all mt-1">{inputArgs}</pre>
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <div className="text-emerald-400 font-mono text-sm mb-2">Output</div>
                    <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-all">{outputArray}</pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <div className="text-orange-400 font-mono text-sm mb-2">Explanation</div>
                    <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                      {testCase.explanation.map((line, idx) => (
                        <pre key={idx} className="text-slate-400 font-mono text-xs">{line}</pre>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <span className="text-slate-500 font-mono text-xs">underground_system.py</span>
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
              {/* Current Operation */}
              <div className={`rounded-xl border p-4 ${
                step.operation === 'checkIn'
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : step.operation === 'checkOut'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : step.operation === 'getAverageTime'
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="text-sm font-mono mb-2 text-slate-400">CURRENT OPERATION</div>
                <div className="font-mono text-lg">
                  {step.operation === 'checkIn' && <span className="text-cyan-400">checkIn</span>}
                  {step.operation === 'checkOut' && <span className="text-orange-400">checkOut</span>}
                  {step.operation === 'getAverageTime' && <span className="text-purple-400">getAverageTime</span>}
                  {step.operation === 'init' && <span className="text-slate-400">__init__</span>}
                </div>
                {step.travelTime !== null && (
                  <div className="mt-2 text-emerald-400 font-mono">
                    Travel time: {step.travelTime} minutes
                  </div>
                )}
                {step.result !== null && (
                  <div className="mt-2 text-emerald-400 font-mono text-xl glow-green">
                    Result: {step.result.toFixed(5)}
                  </div>
                )}
              </div>

              {/* checkInMap */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-cyan-400 font-mono text-sm">checkInMap</span>
                  <span className="text-slate-500 font-mono text-xs">
                    {checkInArray.length} active passenger(s)
                  </span>
                </div>
                <div className="p-4">
                  {checkInArray.length === 0 ? (
                    <div className="text-center text-slate-600 font-mono py-2">No active check-ins</div>
                  ) : (
                    <div className="space-y-2">
                      {checkInArray.map(([id, entry]) => (
                        <div
                          key={id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                            step.highlightCheckIn === id
                              ? 'bg-cyan-500/20 border border-cyan-500/50 glow-cyan'
                              : 'bg-slate-800/50 border border-slate-700'
                          }`}
                        >
                          <div className="font-mono">
                            <span className="text-slate-500">ID:</span>
                            <span className="text-cyan-300 ml-2">{id}</span>
                          </div>
                          <div className="font-mono text-sm">
                            <span className="text-orange-300">{entry.station}</span>
                            <span className="text-slate-500 mx-2">@</span>
                            <span className="text-slate-300">t={entry.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* totalMap */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-purple-400 font-mono text-sm">totalMap</span>
                  <span className="text-slate-500 font-mono text-xs">
                    {totalArray.length} route(s)
                  </span>
                </div>
                <div className="p-4">
                  {totalArray.length === 0 ? (
                    <div className="text-center text-slate-600 font-mono py-2">No route data yet</div>
                  ) : (
                    <div className="space-y-2">
                      {totalArray.map(([route, stats]) => (
                        <div
                          key={route}
                          className={`p-3 rounded-lg transition-all duration-300 ${
                            step.highlightRoute === route
                              ? 'bg-purple-500/20 border border-purple-500/50 glow-purple'
                              : 'bg-slate-800/50 border border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-purple-300">{route}</span>
                            <span className="font-mono text-emerald-400">
                              avg: {(stats.totalTime / stats.count).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm font-mono text-slate-400">
                            <span>Total: {stats.totalTime} mins</span>
                            <span>Trips: {stats.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-slate-200 font-display font-semibold text-lg mb-4">Algorithm Insight</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-cyan-400 font-mono mb-2">checkInMap</h4>
                <p className="text-slate-400">
                  Maps customer ID to their check-in station and time.
                  Allows O(1) lookup when they check out.
                </p>
              </div>
              <div>
                <h4 className="text-purple-400 font-mono mb-2">totalMap</h4>
                <p className="text-slate-400">
                  Maps (start, end) route to cumulative time and trip count.
                  Enables O(1) average calculation.
                </p>
              </div>
              <div>
                <h4 className="text-orange-400 font-mono mb-2">Average Calculation</h4>
                <p className="text-slate-400">
                  Store running totals instead of individual trips.
                  Average = totalTime / count, always O(1).
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(1)</h4>
                <p className="text-slate-400">
                  All three operations are O(1) - just hashmap operations.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(P + S²)</h4>
                <p className="text-slate-400">
                  P = passengers in transit, S² = possible station pairs (routes).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
