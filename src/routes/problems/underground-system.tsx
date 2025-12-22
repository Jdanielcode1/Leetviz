import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/underground-system')({
  component: UndergroundSystem,
})

const CODE_LINES: Array<CodeLine> = [
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

Implement the UndergroundSystem class:
- void checkIn(int id, string stationName, int t): A customer with ID id checks in at station stationName at time t
- void checkOut(int id, string stationName, int t): A customer with ID id checks out at station stationName at time t
- double getAverageTime(string startStation, string endStation): Returns the average time to travel from startStation to endStation

You may assume all calls to checkIn and checkOut are consistent. A customer checks in at time t1 at some station, and then checks out at time t2 at another station. The time difference t2 - t1 is the travel time. getAverageTime is only called when there is at least one customer that has traveled from startStation to endStation.`

const EXAMPLES: Array<Example> = [
  {
    input: '["UndergroundSystem","checkIn","checkIn","checkIn","checkOut","checkOut","checkOut","getAverageTime","getAverageTime","checkIn","getAverageTime","checkOut","getAverageTime"]\n[[],[45,"Leyton",3],[32,"Paradise",8],[27,"Leyton",10],[45,"Waterloo",15],[27,"Waterloo",20],[32,"Cambridge",22],["Paradise","Cambridge"],["Leyton","Waterloo"],[10,"Leyton",24],["Leyton","Waterloo"],[10,"Waterloo",38],["Leyton","Waterloo"]]',
    output: '[null,null,null,null,null,null,null,14.00000,11.00000,null,11.00000,null,12.00000]',
    explanation: 'UndergroundSystem undergroundSystem = new UndergroundSystem();\nundergroundSystem.checkIn(45, "Leyton", 3);\nundergroundSystem.checkIn(32, "Paradise", 8);\nundergroundSystem.checkIn(27, "Leyton", 10);\nundergroundSystem.checkOut(45, "Waterloo", 15); // Customer 45 "Leyton" -> "Waterloo" in 12 minutes\nundergroundSystem.checkOut(27, "Waterloo", 20); // Customer 27 "Leyton" -> "Waterloo" in 10 minutes\nundergroundSystem.checkOut(32, "Cambridge", 22); // Customer 32 "Paradise" -> "Cambridge" in 14 minutes\nundergroundSystem.getAverageTime("Paradise", "Cambridge"); // return 14.00000\nundergroundSystem.getAverageTime("Leyton", "Waterloo"); // return 11.00000\nundergroundSystem.checkIn(10, "Leyton", 24);\nundergroundSystem.getAverageTime("Leyton", "Waterloo"); // return 11.00000\nundergroundSystem.checkOut(10, "Waterloo", 38); // Customer 10 "Leyton" -> "Waterloo" in 14 minutes\nundergroundSystem.getAverageTime("Leyton", "Waterloo"); // return 12.00000',
  },
  {
    input: '["UndergroundSystem","checkIn","checkOut","getAverageTime","checkIn","checkOut","getAverageTime","checkIn","checkOut","getAverageTime"]\n[[],[10,"Leyton",3],[10,"Paradise",8],["Leyton","Paradise"],[5,"Leyton",10],[5,"Paradise",16],["Leyton","Paradise"],[2,"Leyton",21],[2,"Paradise",30],["Leyton","Paradise"]]',
    output: '[null,null,null,5.00000,null,null,5.50000,null,null,6.66667]',
    explanation: 'UndergroundSystem undergroundSystem = new UndergroundSystem();\nundergroundSystem.checkIn(10, "Leyton", 3);\nundergroundSystem.checkOut(10, "Paradise", 8); // Customer 10 "Leyton" -> "Paradise" in 5 minutes\nundergroundSystem.getAverageTime("Leyton", "Paradise"); // return 5.00000\nundergroundSystem.checkIn(5, "Leyton", 10);\nundergroundSystem.checkOut(5, "Paradise", 16); // Customer 5 "Leyton" -> "Paradise" in 6 minutes\nundergroundSystem.getAverageTime("Leyton", "Paradise"); // return 5.50000\nundergroundSystem.checkIn(2, "Leyton", 21);\nundergroundSystem.checkOut(2, "Paradise", 30); // Customer 2 "Leyton" -> "Paradise" in 9 minutes\nundergroundSystem.getAverageTime("Leyton", "Paradise"); // return 6.66667',
  },
]

const CONSTRAINTS = [
  '1 <= id, t <= 10^6',
  '1 <= stationName.length, startStation.length, endStation.length <= 10',
  'All strings consist of uppercase and lowercase English letters and digits',
  'There will be at most 2 * 10^4 calls in total to checkIn, checkOut, and getAverageTime',
  'Answers within 10^-5 of the actual value will be accepted',
]

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
  args: Array<string | number>
  comment?: string
}

interface TestCaseOperations {
  operations: Array<Operation>
  expectedOutputs: Array<number | null>
}

const TEST_CASES: Array<TestCase<TestCaseOperations>> = [
  {
    id: 1,
    label: 'Example 1: Multiple routes',
    data: {
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
    },
  },
  {
    id: 2,
    label: 'Example 2: Single route',
    data: {
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
    },
  },
]

function generateSteps(operations: Array<Operation>): Array<Step> {
  const steps: Array<Step> = []
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

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.operations), [testCase.data.operations])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const checkInArray = Array.from(step.checkInMap.entries())
  const totalArray = Array.from(step.totalMap.entries())

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
      `}</style>

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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-cyan-400 font-mono text-sm">checkInMap</span>
          <span className="text-slate-500 font-mono text-xs">
            {checkInArray.length} active passenger(s)
          </span>
        </div>
        <div className="p-4">
          {checkInArray.length === 0 ? (
            <div className="text-center text-slate-600 font-mono text-sm">No active check-ins</div>
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-purple-400 font-mono text-sm">totalMap</span>
          <span className="text-slate-500 font-mono text-xs">
            {totalArray.length} route(s)
          </span>
        </div>
        <div className="p-4">
          {totalArray.length === 0 ? (
            <div className="text-center text-slate-600 font-mono text-sm">No route data yet</div>
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">checkInMap</h4>
          <p className="text-slate-400">
            Maps customer ID to their check-in station and time. Allows O(1) lookup when they check out.
          </p>
        </div>
        <div>
          <h4 className="text-purple-400 font-mono mb-1">totalMap</h4>
          <p className="text-slate-400">
            Maps (start, end) route to cumulative time and trip count. Enables O(1) average calculation.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Average Calculation</h4>
          <p className="text-slate-400">
            Store running totals instead of individual trips. Average = totalTime / count, always O(1).
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(1)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(P + S²)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '1396',
        title: 'Design Underground System',
        difficulty: 'medium',
        tags: ['Hash Table', 'Design', 'String'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="underground_system.py"
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
