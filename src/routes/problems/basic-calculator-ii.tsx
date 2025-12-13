import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/basic-calculator-ii')({
  component: BasicCalculatorII,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def calculate(self, s: str) -> int:' },
  { num: 3, code: "        stack, cur, op = [], 0, '+'" },
  { num: 4, code: "        for c in s + '+':" },
  { num: 5, code: '            if c == " ":' },
  { num: 6, code: '                continue' },
  { num: 7, code: '            elif c.isdigit():' },
  { num: 8, code: '                cur = (cur * 10) + int(c)' },
  { num: 9, code: '            else:' },
  { num: 10, code: "                if op == '-':" },
  { num: 11, code: '                    stack.append(-cur)' },
  { num: 12, code: "                elif op == '+':" },
  { num: 13, code: '                    stack.append(cur)' },
  { num: 14, code: "                elif op == '*':" },
  { num: 15, code: '                    stack.append(stack.pop() * cur)' },
  { num: 16, code: "                elif op == '/':" },
  { num: 17, code: '                    stack.append(int(stack.pop() / cur))' },
  { num: 18, code: '                cur, op = 0, c' },
  { num: 19, code: '        return sum(stack)' },
]

const PROBLEM_DESCRIPTION = `Given a string s which represents an expression, evaluate this expression and return its value.

The integer division should truncate toward zero.

You may assume that the given expression is always valid.`

interface Step {
  lineNumber: number
  description: string
  insight: string
  charIndex: number
  currentChar: string
  stack: number[]
  cur: number
  op: string
  phase: 'init' | 'loop' | 'skip-space' | 'build-digit' | 'process-op' | 'complete'
  highlightStack: number | null
  expression: string
}

interface TestCase {
  id: number
  expression: string
  expected: number
}

const TEST_CASES: TestCase[] = [
  { id: 1, expression: '3+2*2', expected: 7 },
  { id: 2, expression: ' 3/2 ', expected: 1 },
  { id: 3, expression: ' 3+5 / 2 ', expected: 5 },
]

function generateSteps(expression: string): Step[] {
  const steps: Step[] = []
  const s = expression + '+'

  // Initial state
  steps.push({
    lineNumber: 3,
    description: 'Initialize stack, cur, and op',
    insight: "We start with an empty stack, cur=0 to build numbers, and op='+' as the pending operator.",
    charIndex: -1,
    currentChar: '',
    stack: [],
    cur: 0,
    op: '+',
    phase: 'init',
    highlightStack: null,
    expression,
  })

  let stack: number[] = []
  let cur = 0
  let op = '+'

  for (let i = 0; i < s.length; i++) {
    const c = s[i]

    // Show loop iteration
    steps.push({
      lineNumber: 4,
      description: `Processing character '${c === ' ' ? '(space)' : c}' at index ${i}`,
      insight: i === s.length - 1
        ? "We appended '+' to trigger final processing of the last number."
        : `Iterating through the expression character by character.`,
      charIndex: i,
      currentChar: c,
      stack: [...stack],
      cur,
      op,
      phase: 'loop',
      highlightStack: null,
      expression,
    })

    if (c === ' ') {
      steps.push({
        lineNumber: 6,
        description: 'Skip whitespace',
        insight: 'Spaces are ignored in the expression.',
        charIndex: i,
        currentChar: c,
        stack: [...stack],
        cur,
        op,
        phase: 'skip-space',
        highlightStack: null,
        expression,
      })
      continue
    } else if (c >= '0' && c <= '9') {
      const oldCur = cur
      cur = (cur * 10) + parseInt(c)
      steps.push({
        lineNumber: 8,
        description: `Build number: ${oldCur} * 10 + ${c} = ${cur}`,
        insight: 'Multi-digit numbers are built by shifting left (multiply by 10) and adding the new digit.',
        charIndex: i,
        currentChar: c,
        stack: [...stack],
        cur,
        op,
        phase: 'build-digit',
        highlightStack: null,
        expression,
      })
    } else {
      // It's an operator or the final '+'
      steps.push({
        lineNumber: 9,
        description: `Found operator '${c}' - process pending operation`,
        insight: `When we see a new operator, we apply the previous operator '${op}' to cur=${cur}.`,
        charIndex: i,
        currentChar: c,
        stack: [...stack],
        cur,
        op,
        phase: 'process-op',
        highlightStack: null,
        expression,
      })

      if (op === '-') {
        stack.push(-cur)
        steps.push({
          lineNumber: 11,
          description: `Push -${cur} = ${-cur} to stack`,
          insight: "For subtraction, we push the negative value. This converts 'a - b' into 'a + (-b)'.",
          charIndex: i,
          currentChar: c,
          stack: [...stack],
          cur,
          op,
          phase: 'process-op',
          highlightStack: stack.length - 1,
          expression,
        })
      } else if (op === '+') {
        stack.push(cur)
        steps.push({
          lineNumber: 13,
          description: `Push ${cur} to stack`,
          insight: 'For addition, we simply push the value onto the stack.',
          charIndex: i,
          currentChar: c,
          stack: [...stack],
          cur,
          op,
          phase: 'process-op',
          highlightStack: stack.length - 1,
          expression,
        })
      } else if (op === '*') {
        const popped = stack.pop()!
        const result = popped * cur
        stack.push(result)
        steps.push({
          lineNumber: 15,
          description: `Pop ${popped}, multiply by ${cur}, push ${result}`,
          insight: 'Multiplication has higher precedence, so we immediately compute it with the top of stack.',
          charIndex: i,
          currentChar: c,
          stack: [...stack],
          cur,
          op,
          phase: 'process-op',
          highlightStack: stack.length - 1,
          expression,
        })
      } else if (op === '/') {
        const popped = stack.pop()!
        const result = Math.trunc(popped / cur)
        stack.push(result)
        steps.push({
          lineNumber: 17,
          description: `Pop ${popped}, divide by ${cur}, push ${result}`,
          insight: 'Division has higher precedence. We use truncation toward zero for integer division.',
          charIndex: i,
          currentChar: c,
          stack: [...stack],
          cur,
          op,
          phase: 'process-op',
          highlightStack: stack.length - 1,
          expression,
        })
      }

      cur = 0
      op = c
      steps.push({
        lineNumber: 18,
        description: `Reset cur=0, set op='${c}'`,
        insight: `Ready to build the next number with '${c}' as the pending operator.`,
        charIndex: i,
        currentChar: c,
        stack: [...stack],
        cur,
        op,
        phase: 'process-op',
        highlightStack: null,
        expression,
      })
    }
  }

  // Final sum
  const result = stack.reduce((a, b) => a + b, 0)
  steps.push({
    lineNumber: 19,
    description: `Return sum(stack) = ${result}`,
    insight: `Sum all values in stack: [${stack.join(', ')}] = ${result}`,
    charIndex: -1,
    currentChar: '',
    stack: [...stack],
    cur: 0,
    op: '+',
    phase: 'complete',
    highlightStack: null,
    expression,
  })

  return steps
}

function BasicCalculatorII() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.expression), [testCase.expression])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

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
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
        }

        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
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
                  <span className="text-slate-500 font-mono">#227</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Basic Calculator II
                </h1>
                <div className="flex gap-2">
                  {['String', 'Stack', 'Math'].map((tag) => (
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
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-mono text-sm">TEST CASE:</span>
              <div className="flex gap-2">
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
                    "{tc.expression}" → {tc.expected}
                  </button>
                ))}
              </div>
            </div>
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
                <span className="text-slate-500 font-mono text-xs">calculator.py</span>
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
              {/* Expression Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">EXPRESSION</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {(step.expression + '+').split('').map((char, idx) => (
                      <div
                        key={idx}
                        className={`w-10 h-12 flex items-center justify-center rounded-lg font-mono text-lg transition-all duration-300 ${
                          idx === step.charIndex
                            ? 'bg-orange-500/30 border-2 border-orange-400 text-orange-300 glow-orange'
                            : idx < step.charIndex
                            ? 'bg-slate-800/50 border border-slate-700 text-slate-500'
                            : 'bg-slate-800 border border-slate-600 text-slate-300'
                        }`}
                      >
                        {char === ' ' ? '␣' : idx === step.expression.length ? '+*' : char}
                      </div>
                    ))}
                  </div>
                  {step.charIndex === step.expression.length && (
                    <p className="text-center text-slate-500 text-xs font-mono">
                      * Appended '+' to trigger final processing
                    </p>
                  )}
                </div>
              </div>

              {/* State Variables */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">STATE</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-slate-500 text-xs font-mono mb-2">cur (current number)</div>
                      <div className="text-3xl font-mono text-cyan-400">{step.cur}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-slate-500 text-xs font-mono mb-2">op (pending operator)</div>
                      <div className="text-3xl font-mono text-orange-400">'{step.op}'</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stack Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-slate-300 font-mono text-sm">STACK</span>
                  <span className="text-slate-500 font-mono text-xs">
                    sum = {step.stack.reduce((a, b) => a + b, 0)}
                  </span>
                </div>
                <div className="p-6">
                  {step.stack.length === 0 ? (
                    <div className="text-center text-slate-600 font-mono py-4">[ empty ]</div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {step.stack.map((val, idx) => (
                        <div
                          key={idx}
                          className={`px-4 py-3 rounded-lg font-mono text-lg transition-all duration-300 ${
                            idx === step.highlightStack
                              ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 glow-cyan'
                              : 'bg-slate-800 border border-slate-600 text-slate-300'
                          }`}
                        >
                          {val}
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

              {/* Result */}
              {step.phase === 'complete' && (
                <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-emerald-400 font-mono text-lg">
                        Result: {step.stack.reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-slate-500 font-mono text-sm">
                        Expected: {testCase.expected}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-slate-200 font-display font-semibold text-lg mb-4">Algorithm Insight</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-cyan-400 font-mono mb-2">Why a Stack?</h4>
                <p className="text-slate-400">
                  The stack allows us to defer addition/subtraction until we've handled all higher-precedence
                  operations (* and /).
                </p>
              </div>
              <div>
                <h4 className="text-orange-400 font-mono mb-2">Operator Precedence</h4>
                <p className="text-slate-400">
                  For + and -, we push to stack. For * and /, we immediately compute with the top of stack,
                  respecting precedence.
                </p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-mono mb-2">Final Sum</h4>
                <p className="text-slate-400">
                  After processing, the stack contains only values to add together. Subtractions are
                  already converted to negative additions.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(n)</h4>
                <p className="text-slate-400">
                  Single pass through the string. Each character is processed once.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(n)</h4>
                <p className="text-slate-400">
                  Stack stores at most n/2 numbers (worst case: all additions like "1+2+3+...").
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
