import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/browser-history')({
  component: BrowserHistoryVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class BrowserHistory:' },
  { num: 2, code: '' },
  { num: 3, code: '    def __init__(self, homepage: str):' },
  { num: 4, code: '        self.history = []' },
  { num: 5, code: '        self.future = []' },
  { num: 6, code: '        self.history.append(homepage)' },
  { num: 7, code: '' },
  { num: 8, code: '    def visit(self, url: str) -> None:' },
  { num: 9, code: '        self.history.append(url)' },
  { num: 10, code: '        self.future = []' },
  { num: 11, code: '' },
  { num: 12, code: '    def back(self, steps: int) -> str:' },
  { num: 13, code: '        while steps > 0 and len(self.history) > 1:' },
  { num: 14, code: '            self.future.append(self.history[-1])' },
  { num: 15, code: '            self.history.pop()' },
  { num: 16, code: '            steps -= 1' },
  { num: 17, code: '        return self.history[-1]' },
  { num: 18, code: '' },
  { num: 19, code: '    def forward(self, steps: int) -> str:' },
  { num: 20, code: '        while steps > 0 and self.future:' },
  { num: 21, code: '            self.history.append(self.future[-1])' },
  { num: 22, code: '            self.future.pop()' },
  { num: 23, code: '            steps -= 1' },
  { num: 24, code: '        return self.history[-1]' },
]

interface Operation {
  type: 'init' | 'visit' | 'back' | 'forward'
  arg: string | number
}

interface TestCase {
  id: number
  name: string
  operations: Operation[]
  expected: (string | null)[]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Full Example',
    operations: [
      { type: 'init', arg: 'leetcode.com' },
      { type: 'visit', arg: 'google.com' },
      { type: 'visit', arg: 'facebook.com' },
      { type: 'visit', arg: 'youtube.com' },
      { type: 'back', arg: 1 },
      { type: 'back', arg: 1 },
      { type: 'forward', arg: 1 },
      { type: 'visit', arg: 'linkedin.com' },
      { type: 'forward', arg: 2 },
      { type: 'back', arg: 2 },
      { type: 'back', arg: 7 },
    ],
    expected: [null, null, null, null, 'facebook.com', 'google.com', 'facebook.com', null, 'linkedin.com', 'google.com', 'leetcode.com'],
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  history: string[]
  future: string[]
  currentUrl: string
  phase: 'init' | 'visit' | 'visit-clear' | 'back-check' | 'back-loop' | 'back-return' | 'forward-check' | 'forward-loop' | 'forward-return'
  operation: string
  operationArg: string | number
  stepsRemaining: number | null
  highlightHistoryIndex: number | null
  highlightFutureIndex: number | null
  movingUrl: string | null
  returnValue: string | null
  futureCleared: boolean
}

function generateSteps(operations: Operation[]): Step[] {
  const steps: Step[] = []
  let history: string[] = []
  let future: string[] = []

  for (const op of operations) {
    if (op.type === 'init') {
      const homepage = op.arg as string

      // Line 3: def __init__
      steps.push({
        lineNumber: 3,
        description: `BrowserHistory("${homepage}")`,
        insight: 'Initialize browser with homepage',
        history: [],
        future: [],
        currentUrl: '',
        phase: 'init',
        operation: '__init__',
        operationArg: homepage,
        stepsRemaining: null,
        highlightHistoryIndex: null,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: false,
      })

      // Line 4: self.history = []
      steps.push({
        lineNumber: 4,
        description: 'Initialize empty history stack',
        insight: 'History will store all visited URLs',
        history: [],
        future: [],
        currentUrl: '',
        phase: 'init',
        operation: '__init__',
        operationArg: homepage,
        stepsRemaining: null,
        highlightHistoryIndex: null,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: false,
      })

      // Line 5: self.future = []
      steps.push({
        lineNumber: 5,
        description: 'Initialize empty future stack',
        insight: 'Future stores URLs for forward navigation',
        history: [],
        future: [],
        currentUrl: '',
        phase: 'init',
        operation: '__init__',
        operationArg: homepage,
        stepsRemaining: null,
        highlightHistoryIndex: null,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: false,
      })

      // Line 6: self.history.append(homepage)
      history = [homepage]
      steps.push({
        lineNumber: 6,
        description: `Add "${homepage}" to history`,
        insight: 'Homepage is our first entry - the current page',
        history: [...history],
        future: [],
        currentUrl: homepage,
        phase: 'init',
        operation: '__init__',
        operationArg: homepage,
        stepsRemaining: null,
        highlightHistoryIndex: 0,
        highlightFutureIndex: null,
        movingUrl: homepage,
        returnValue: null,
        futureCleared: false,
      })
    } else if (op.type === 'visit') {
      const url = op.arg as string

      // Line 8: def visit
      steps.push({
        lineNumber: 8,
        description: `visit("${url}")`,
        insight: 'Visiting a new URL from current page',
        history: [...history],
        future: [...future],
        currentUrl: history[history.length - 1],
        phase: 'visit',
        operation: 'visit',
        operationArg: url,
        stepsRemaining: null,
        highlightHistoryIndex: null,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: false,
      })

      // Line 9: self.history.append(url)
      history.push(url)
      steps.push({
        lineNumber: 9,
        description: `Push "${url}" to history`,
        insight: 'New URL becomes current page (top of history)',
        history: [...history],
        future: [...future],
        currentUrl: url,
        phase: 'visit',
        operation: 'visit',
        operationArg: url,
        stepsRemaining: null,
        highlightHistoryIndex: history.length - 1,
        highlightFutureIndex: null,
        movingUrl: url,
        returnValue: null,
        futureCleared: false,
      })

      // Line 10: self.future = []
      const hadFuture = future.length > 0
      future = []
      steps.push({
        lineNumber: 10,
        description: hadFuture ? 'Clear forward history' : 'Future already empty',
        insight: 'Visiting new page destroys forward history - you branched off!',
        history: [...history],
        future: [],
        currentUrl: url,
        phase: 'visit-clear',
        operation: 'visit',
        operationArg: url,
        stepsRemaining: null,
        highlightHistoryIndex: history.length - 1,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: hadFuture,
      })
    } else if (op.type === 'back') {
      let stepsToGo = op.arg as number
      const originalSteps = stepsToGo

      // Line 12: def back
      steps.push({
        lineNumber: 12,
        description: `back(${stepsToGo})`,
        insight: `Attempting to go back ${stepsToGo} step${stepsToGo > 1 ? 's' : ''}`,
        history: [...history],
        future: [...future],
        currentUrl: history[history.length - 1],
        phase: 'back-check',
        operation: 'back',
        operationArg: originalSteps,
        stepsRemaining: stepsToGo,
        highlightHistoryIndex: null,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: false,
      })

      // Loop: while steps > 0 and len(self.history) > 1
      while (stepsToGo > 0 && history.length > 1) {
        // Line 13: while condition check
        steps.push({
          lineNumber: 13,
          description: `Check: steps=${stepsToGo} > 0 AND history.length=${history.length} > 1`,
          insight: 'Must keep at least one page in history (current page)',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'back-loop',
          operation: 'back',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: null,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })

        const movingUrl = history[history.length - 1]

        // Line 14: self.future.append(self.history[-1])
        future.push(movingUrl)
        steps.push({
          lineNumber: 14,
          description: `Push "${movingUrl}" to future`,
          insight: 'Save current page to future for potential forward navigation',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'back-loop',
          operation: 'back',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: future.length - 1,
          movingUrl: movingUrl,
          returnValue: null,
          futureCleared: false,
        })

        // Line 15: self.history.pop()
        history.pop()
        steps.push({
          lineNumber: 15,
          description: `Pop "${movingUrl}" from history`,
          insight: 'Remove from history - we\'re going back',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'back-loop',
          operation: 'back',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: future.length - 1,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })

        // Line 16: steps -= 1
        stepsToGo--
        steps.push({
          lineNumber: 16,
          description: `Decrement steps: ${stepsToGo + 1} → ${stepsToGo}`,
          insight: stepsToGo > 0 ? `${stepsToGo} more step${stepsToGo > 1 ? 's' : ''} to go` : 'Done stepping back',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'back-loop',
          operation: 'back',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: null,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })
      }

      // If loop exited early due to history.length == 1
      if (stepsToGo > 0) {
        steps.push({
          lineNumber: 13,
          description: `Check: steps=${stepsToGo} > 0 BUT history.length=${history.length} = 1`,
          insight: 'Cannot go back further - at the oldest page!',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'back-loop',
          operation: 'back',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: 0,
          highlightFutureIndex: null,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })
      }

      // Line 17: return self.history[-1]
      const returnVal = history[history.length - 1]
      steps.push({
        lineNumber: 17,
        description: `Return "${returnVal}"`,
        insight: `Went back ${originalSteps - stepsToGo} step${originalSteps - stepsToGo !== 1 ? 's' : ''}, now at "${returnVal}"`,
        history: [...history],
        future: [...future],
        currentUrl: returnVal,
        phase: 'back-return',
        operation: 'back',
        operationArg: originalSteps,
        stepsRemaining: 0,
        highlightHistoryIndex: history.length - 1,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: returnVal,
        futureCleared: false,
      })
    } else if (op.type === 'forward') {
      let stepsToGo = op.arg as number
      const originalSteps = stepsToGo

      // Line 19: def forward
      steps.push({
        lineNumber: 19,
        description: `forward(${stepsToGo})`,
        insight: `Attempting to go forward ${stepsToGo} step${stepsToGo > 1 ? 's' : ''}`,
        history: [...history],
        future: [...future],
        currentUrl: history[history.length - 1],
        phase: 'forward-check',
        operation: 'forward',
        operationArg: originalSteps,
        stepsRemaining: stepsToGo,
        highlightHistoryIndex: null,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: null,
        futureCleared: false,
      })

      // Loop: while steps > 0 and self.future
      while (stepsToGo > 0 && future.length > 0) {
        // Line 20: while condition check
        steps.push({
          lineNumber: 20,
          description: `Check: steps=${stepsToGo} > 0 AND future.length=${future.length} > 0`,
          insight: 'Can only go forward if there are pages in future',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'forward-loop',
          operation: 'forward',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: null,
          highlightFutureIndex: future.length - 1,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })

        const movingUrl = future[future.length - 1]

        // Line 21: self.history.append(self.future[-1])
        history.push(movingUrl)
        steps.push({
          lineNumber: 21,
          description: `Push "${movingUrl}" to history`,
          insight: 'Move page from future back to history',
          history: [...history],
          future: [...future],
          currentUrl: movingUrl,
          phase: 'forward-loop',
          operation: 'forward',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: future.length - 1,
          movingUrl: movingUrl,
          returnValue: null,
          futureCleared: false,
        })

        // Line 22: self.future.pop()
        future.pop()
        steps.push({
          lineNumber: 22,
          description: `Pop "${movingUrl}" from future`,
          insight: 'Remove from future - we\'ve moved forward',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'forward-loop',
          operation: 'forward',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: future.length > 0 ? future.length - 1 : null,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })

        // Line 23: steps -= 1
        stepsToGo--
        steps.push({
          lineNumber: 23,
          description: `Decrement steps: ${stepsToGo + 1} → ${stepsToGo}`,
          insight: stepsToGo > 0 ? `${stepsToGo} more step${stepsToGo > 1 ? 's' : ''} to go` : 'Done stepping forward',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'forward-loop',
          operation: 'forward',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: null,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })
      }

      // If loop exited early due to empty future
      if (stepsToGo > 0) {
        steps.push({
          lineNumber: 20,
          description: `Check: steps=${stepsToGo} > 0 BUT future is empty`,
          insight: 'Cannot go forward - no pages in forward history!',
          history: [...history],
          future: [...future],
          currentUrl: history[history.length - 1],
          phase: 'forward-loop',
          operation: 'forward',
          operationArg: originalSteps,
          stepsRemaining: stepsToGo,
          highlightHistoryIndex: history.length - 1,
          highlightFutureIndex: null,
          movingUrl: null,
          returnValue: null,
          futureCleared: false,
        })
      }

      // Line 24: return self.history[-1]
      const returnVal = history[history.length - 1]
      steps.push({
        lineNumber: 24,
        description: `Return "${returnVal}"`,
        insight: `Went forward ${originalSteps - stepsToGo} step${originalSteps - stepsToGo !== 1 ? 's' : ''}, now at "${returnVal}"`,
        history: [...history],
        future: [...future],
        currentUrl: returnVal,
        phase: 'forward-return',
        operation: 'forward',
        operationArg: originalSteps,
        stepsRemaining: 0,
        highlightHistoryIndex: history.length - 1,
        highlightFutureIndex: null,
        movingUrl: null,
        returnValue: returnVal,
        futureCleared: false,
      })
    }
  }

  return steps
}

function BrowserHistoryVisualization() {
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

  // URL display formatting
  const formatUrl = (url: string) => {
    return url.replace('.com', '')
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
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-cyan-400 font-mono text-sm">#1472</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Medium
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">
                Design Browser History
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
            <div className="flex gap-2">
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
                    <span className={`w-8 text-right mr-4 select-none ${
                      isActive ? 'text-cyan-400' : 'text-slate-600'
                    }`}>
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
            {/* Operation Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-slate-300">Current Operation</h3>
                {step.stepsRemaining !== null && step.stepsRemaining > 0 && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-mono">
                    {step.stepsRemaining} steps remaining
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-2 rounded-lg font-mono text-lg ${
                  step.operation === 'visit' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  step.operation === 'back' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  step.operation === 'forward' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                }`}>
                  {step.operation}({typeof step.operationArg === 'string' ? `"${step.operationArg}"` : step.operationArg})
                </span>
                {step.returnValue && (
                  <span className="text-slate-400">
                    → returns <span className="text-cyan-400 font-mono">"{step.returnValue}"</span>
                  </span>
                )}
              </div>
            </div>

            {/* Current Website Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Current Website</h3>
              <div className={`px-6 py-4 rounded-lg border-2 transition-all duration-300 ${
                step.currentUrl
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}>
                <span className={`font-mono text-xl ${step.currentUrl ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.currentUrl || '(none)'}
                </span>
              </div>
            </div>

            {/* Stacks Visualization */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 blueprint-grid">
              <div className="grid grid-cols-2 gap-6">
                {/* History Stack */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-red-400">History</h3>
                    <span className="text-slate-500 text-sm font-mono">[{step.history.length}]</span>
                  </div>
                  <div className="border-2 border-red-500/30 rounded-lg p-3 min-h-[280px] flex flex-col-reverse gap-2 bg-red-500/5">
                    {step.history.length === 0 ? (
                      <div className="text-slate-600 text-sm italic text-center py-8">(empty)</div>
                    ) : (
                      step.history.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className={`px-4 py-3 rounded-lg font-mono text-sm transition-all duration-300 ${
                            idx === step.highlightHistoryIndex
                              ? 'bg-red-400/30 border-2 border-red-400 text-red-200 shadow-lg shadow-red-500/20'
                              : 'bg-red-500/10 border border-red-500/20 text-red-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{formatUrl(url)}</span>
                            <span className="text-red-500/50 text-xs">[{idx}]</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-center text-slate-600 text-xs mt-2">← Back</div>
                </div>

                {/* Future Stack */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-blue-400">Future</h3>
                    <span className="text-slate-500 text-sm font-mono">[{step.future.length}]</span>
                  </div>
                  <div className={`border-2 rounded-lg p-3 min-h-[280px] flex flex-col-reverse gap-2 transition-all duration-300 ${
                    step.futureCleared
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-blue-500/30 bg-blue-500/5'
                  }`}>
                    {step.future.length === 0 ? (
                      <div className={`text-sm italic text-center py-8 ${
                        step.futureCleared ? 'text-red-400' : 'text-slate-600'
                      }`}>
                        {step.futureCleared ? 'Cleared!' : '(empty)'}
                      </div>
                    ) : (
                      step.future.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className={`px-4 py-3 rounded-lg font-mono text-sm transition-all duration-300 ${
                            idx === step.highlightFutureIndex
                              ? 'bg-blue-400/30 border-2 border-blue-400 text-blue-200 shadow-lg shadow-blue-500/20'
                              : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{formatUrl(url)}</span>
                            <span className="text-blue-500/50 text-xs">[{idx}]</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-center text-slate-600 text-xs mt-2">Forward →</div>
                </div>
              </div>
            </div>

            {/* Insight Panel */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-4">
              <h3 className="font-display font-semibold text-purple-300 mb-2">Insight</h3>
              <p className="text-slate-300">{step.insight}</p>
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
