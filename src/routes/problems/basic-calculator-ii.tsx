import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/basic-calculator-ii')({
  component: BasicCalculatorII,
})

const CODE_LINES: Array<CodeLine> = [
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

const EXAMPLES: Array<Example> = [
  {
    input: 's = "3+2*2"',
    output: '7',
    explanation: 'The expression evaluates to 7.',
  },
  {
    input: 's = " 3/2 "',
    output: '1',
    explanation: 'Integer division truncates toward zero.',
  },
  {
    input: 's = " 3+5 / 2 "',
    output: '5',
    explanation: 'The expression evaluates to 5.',
  },
]

const CONSTRAINTS = [
  '1 <= s.length <= 3 * 10^5',
  's consists of integers and operators (+, -, *, /) separated by some number of spaces',
  's represents a valid expression',
  'All the integers in the expression are non-negative integers in the range [0, 2^31 - 1]',
  'The answer is guaranteed to fit in a 32-bit integer',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  charIndex: number
  currentChar: string
  stack: Array<number>
  cur: number
  op: string
  phase: 'init' | 'loop' | 'skip-space' | 'build-digit' | 'process-op' | 'complete'
  highlightStack: number | null
  expression: string
}

interface TestCaseData {
  expression: string
  expected: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: '"3+2*2" → 7', data: { expression: '3+2*2', expected: 7 } },
  { id: 2, label: '" 3/2 " → 1', data: { expression: ' 3/2 ', expected: 1 } },
  { id: 3, label: '" 3+5 / 2 " → 5', data: { expression: ' 3+5 / 2 ', expected: 5 } },
]

function generateSteps(expression: string): Array<Step> {
  const steps: Array<Step> = []
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

  const stack: Array<number> = []
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
  const steps = useMemo(() => generateSteps(testCase.data.expression), [testCase.data.expression])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
        }

        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
        }
      `}</style>

      {/* Expression Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">EXPRESSION</span>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1 justify-center mb-2">
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">STATE</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="text-slate-500 text-xs font-mono mb-1">cur (current number)</div>
              <div className="text-2xl font-mono text-cyan-400">{step.cur}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="text-slate-500 text-xs font-mono mb-1">op (pending operator)</div>
              <div className="text-2xl font-mono text-orange-400">'{step.op}'</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stack Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">STACK</span>
          <span className="text-slate-500 font-mono text-xs">
            sum = {step.stack.reduce((a, b) => a + b, 0)}
          </span>
        </div>
        <div className="p-4">
          {step.stack.length === 0 ? (
            <div className="text-center text-slate-600 font-mono py-4 text-sm">[ empty ]</div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {step.stack.map((val, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg font-mono transition-all duration-300 ${
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

      {/* Result */}
      {step.phase === 'complete' && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-emerald-400 font-mono">
                Result: {step.stack.reduce((a, b) => a + b, 0)}
              </div>
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
          <h4 className="text-cyan-400 font-mono mb-1">Why a Stack?</h4>
          <p className="text-slate-400">
            The stack allows us to defer addition/subtraction until we've handled all higher-precedence
            operations (* and /).
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Operator Precedence</h4>
          <p className="text-slate-400">
            For + and -, we push to stack. For * and /, we immediately compute with the top of stack,
            respecting precedence.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Final Sum</h4>
          <p className="text-slate-400">
            After processing, the stack contains only values to add together. Subtractions are
            already converted to negative additions.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n)</span>
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
        number: '227',
        title: 'Basic Calculator II',
        difficulty: 'medium',
        tags: ['Math', 'String', 'Stack'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="calculator.py"
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
