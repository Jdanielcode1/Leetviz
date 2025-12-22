import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/browser-history')({
  component: BrowserHistoryVisualization,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `You have a browser of one tab where you start on the homepage and you can visit another url, get back in the history number of steps or move forward in the history number of steps.

Implement the BrowserHistory class:

- BrowserHistory(string homepage) Initializes the object with the homepage of the browser.
- void visit(string url) Visits url from the current page. It clears up all the forward history.
- string back(int steps) Move steps back in history. If you can only return x steps in the history and steps > x, you will return only x steps. Return the current url after moving back in history at most steps.
- string forward(int steps) Move steps forward in history. If you can only forward x steps in the history and steps > x, you will forward only x steps. Return the current url after forwarding in history at most steps.`

const EXAMPLES: Array<Example> = [
  {
    input: 'browserHistory = BrowserHistory("leetcode.com")\nbrowserHistory.visit("google.com")\nbrowserHistory.visit("facebook.com")\nbrowserHistory.visit("youtube.com")\nbrowserHistory.back(1)\nbrowserHistory.back(1)\nbrowserHistory.forward(1)\nbrowserHistory.visit("linkedin.com")\nbrowserHistory.forward(2)\nbrowserHistory.back(2)\nbrowserHistory.back(7)',
    output: 'null\nnull\nnull\nnull\n"facebook.com"\n"google.com"\n"facebook.com"\nnull\n"linkedin.com"\n"google.com"\n"leetcode.com"',
    explanation: 'BrowserHistory browserHistory = new BrowserHistory("leetcode.com");\nbrowserHistory.visit("google.com");       // You are in "leetcode.com". Visit "google.com"\nbrowserHistory.visit("facebook.com");     // You are in "google.com". Visit "facebook.com"\nbrowserHistory.visit("youtube.com");      // You are in "facebook.com". Visit "youtube.com"\nbrowserHistory.back(1);                   // You are in "youtube.com", move back to "facebook.com" return "facebook.com"\nbrowserHistory.back(1);                   // You are in "facebook.com", move back to "google.com" return "google.com"\nbrowserHistory.forward(1);                // You are in "google.com", move forward to "facebook.com" return "facebook.com"\nbrowserHistory.visit("linkedin.com");     // You are in "facebook.com". Visit "linkedin.com"\nbrowserHistory.forward(2);                // You are in "linkedin.com", you cannot move forward any steps.\nbrowserHistory.back(2);                   // You are in "linkedin.com", move back two steps to "facebook.com" then to "google.com". return "google.com"\nbrowserHistory.back(7);                   // You are in "google.com", you can move back only one step to "leetcode.com". return "leetcode.com"',
  },
]

const CONSTRAINTS = [
  '1 <= homepage.length <= 20',
  '1 <= url.length <= 20',
  '1 <= steps <= 100',
  'homepage and url consist of  \'.\'  or lower case English letters.',
  'At most 5000 calls will be made to visit, back, and forward.',
]

interface Operation {
  type: 'init' | 'visit' | 'back' | 'forward'
  arg: string | number
}

interface TestCaseData {
  operations: Array<Operation>
  expected: Array<string | null>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Full Example',
    data: {
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
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  history: Array<string>
  future: Array<string>
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

function generateSteps(operations: Array<Operation>): Array<Step> {
  const steps: Array<Step> = []
  let history: Array<string> = []
  let future: Array<string> = []

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
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.operations), [testCase.data.operations])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // URL display formatting
  const formatUrl = (url: string) => {
    return url.replace('.com', '')
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-red-400 font-mono mb-1">History Stack</h4>
          <p className="text-slate-400">Stores all visited pages. Current page is at the top.</p>
        </div>
        <div>
          <h4 className="text-blue-400 font-mono mb-1">Future Stack</h4>
          <p className="text-slate-400">Stores pages for forward navigation. Cleared on new visit.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(1)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(n)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '1472',
        title: 'Design Browser History',
        difficulty: 'medium',
        tags: ['Array', 'Design', 'Stack'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="browser_history.py"
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
