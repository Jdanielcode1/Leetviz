import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/reverse-integer')({
  component: ReverseInteger,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def reverse(self, x: int) -> int:' },
  { num: 3, code: '        INT_MAX, INT_MIN = 2**31 - 1, -2**31' },
  { num: 4, code: '        sign = -1 if x < 0 else 1' },
  { num: 5, code: '        x = abs(x)' },
  { num: 6, code: '        res = 0' },
  { num: 7, code: '        while x != 0:' },
  { num: 8, code: '            digit = x % 10' },
  { num: 9, code: '            x //= 10' },
  { num: 10, code: '' },
  { num: 11, code: '            if res > (INT_MAX - digit) // 10:' },
  { num: 12, code: '                return 0' },
  { num: 13, code: '            res = res * 10 + digit' },
  { num: 14, code: '' },
  { num: 15, code: '        return sign * res' },
]

const PROBLEM_DESCRIPTION = `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`

const EXAMPLES: Array<Example> = [
  {
    input: 'x = 123',
    output: '321',
  },
  {
    input: 'x = -123',
    output: '-321',
  },
  {
    input: 'x = 120',
    output: '21',
  },
]

const CONSTRAINTS = [
  '-2³¹ <= x <= 2³¹ - 1',
]

const INT_MAX = 2147483647
// INT_MIN = -2147483648 (for reference, overflow check uses INT_MAX)

interface Step {
  lineNumber: number
  description: string
  insight: string
  originalX: number
  x: number
  res: number
  digit: number | null
  sign: number
  phase: 'init' | 'loop' | 'extract' | 'check' | 'update' | 'overflow' | 'complete'
  digits: Array<{ value: number; status: 'pending' | 'current' | 'processed' }>
  resultDigits: Array<number>
}

interface TestCaseData {
  x: number
  expected: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: '123 → 321', data: { x: 123, expected: 321 } },
  { id: 2, label: '-123 → -321', data: { x: -123, expected: -321 } },
  { id: 3, label: '120 → 21', data: { x: 120, expected: 21 } },
  { id: 4, label: '1534236469 → 0 (overflow)', data: { x: 1534236469, expected: 0 } },
]

function getDigits(num: number): Array<number> {
  const digits: Array<number> = []
  let n = Math.abs(num)
  if (n === 0) return [0]
  while (n > 0) {
    digits.unshift(n % 10)
    n = Math.floor(n / 10)
  }
  return digits
}

function generateSteps(inputX: number): Array<Step> {
  const steps: Array<Step> = []
  const originalDigits = getDigits(inputX)
  const sign = inputX < 0 ? -1 : 1

  // Initial state
  steps.push({
    lineNumber: 3,
    description: 'Define INT_MAX and INT_MIN bounds',
    insight: `INT_MAX = 2,147,483,647 and INT_MIN = -2,147,483,648. These are the 32-bit signed integer limits.`,
    originalX: inputX,
    x: Math.abs(inputX),
    res: 0,
    digit: null,
    sign,
    phase: 'init',
    digits: originalDigits.map(d => ({ value: d, status: 'pending' as const })),
    resultDigits: [],
  })

  // Record sign
  steps.push({
    lineNumber: 4,
    description: `sign = ${sign} (${inputX < 0 ? 'negative' : 'positive'})`,
    insight: 'Store the sign to apply at the end. We work with the absolute value.',
    originalX: inputX,
    x: Math.abs(inputX),
    res: 0,
    digit: null,
    sign,
    phase: 'init',
    digits: originalDigits.map(d => ({ value: d, status: 'pending' as const })),
    resultDigits: [],
  })

  let x = Math.abs(inputX)
  const absDigits = getDigits(x)

  // Take absolute value
  steps.push({
    lineNumber: 5,
    description: `x = abs(${inputX}) = ${x}`,
    insight: 'Work with the absolute value to simplify digit extraction.',
    originalX: inputX,
    x,
    res: 0,
    digit: null,
    sign,
    phase: 'init',
    digits: absDigits.map(d => ({ value: d, status: 'pending' as const })),
    resultDigits: [],
  })

  // Initialize res
  steps.push({
    lineNumber: 6,
    description: 'res = 0',
    insight: 'Initialize the result accumulator.',
    originalX: inputX,
    x,
    res: 0,
    digit: null,
    sign,
    phase: 'init',
    digits: absDigits.map(d => ({ value: d, status: 'pending' as const })),
    resultDigits: [],
  })

  let res = 0
  let iteration = 0

  while (x !== 0) {
    // Loop start
    steps.push({
      lineNumber: 7,
      description: `Iteration ${iteration + 1}: x = ${x}, x != 0, continue loop`,
      insight: 'There are still digits to process.',
      originalX: inputX,
      x,
      res,
      digit: null,
      sign,
      phase: 'loop',
      digits: absDigits.map((d, i) => ({
        value: d,
        status: i < iteration ? 'processed' as const : i === absDigits.length - 1 - iteration ? 'current' as const : 'pending' as const,
      })),
      resultDigits: getDigits(res === 0 ? 0 : res),
    })

    // Extract digit
    const digit = x % 10
    steps.push({
      lineNumber: 8,
      description: `digit = ${x} % 10 = ${digit}`,
      insight: `Extract the last digit (${digit}) using modulo operation.`,
      originalX: inputX,
      x,
      res,
      digit,
      sign,
      phase: 'extract',
      digits: absDigits.map((d, i) => ({
        value: d,
        status: i < iteration ? 'processed' as const : i === absDigits.length - 1 - iteration ? 'current' as const : 'pending' as const,
      })),
      resultDigits: getDigits(res === 0 ? 0 : res),
    })

    // Remove digit from x
    x = Math.floor(x / 10)
    steps.push({
      lineNumber: 9,
      description: `x = ${x + digit * 1} // 10 = ${x}`,
      insight: 'Remove the extracted digit using integer division.',
      originalX: inputX,
      x,
      res,
      digit,
      sign,
      phase: 'extract',
      digits: absDigits.map((d, i) => ({
        value: d,
        status: i <= iteration ? 'processed' as const : 'pending' as const,
      })),
      resultDigits: getDigits(res === 0 ? 0 : res),
    })

    // Overflow check
    const overflowThreshold = Math.floor((INT_MAX - digit) / 10)
    const willOverflow = res > overflowThreshold

    steps.push({
      lineNumber: 11,
      description: `Check: res (${res}) > (INT_MAX - ${digit}) // 10 = ${overflowThreshold}? ${willOverflow ? 'YES!' : 'No'}`,
      insight: willOverflow
        ? `Overflow detected! ${res} * 10 + ${digit} would exceed INT_MAX.`
        : `Safe to continue. ${res} * 10 + ${digit} = ${res * 10 + digit} is within bounds.`,
      originalX: inputX,
      x,
      res,
      digit,
      sign,
      phase: 'check',
      digits: absDigits.map((d, i) => ({
        value: d,
        status: i <= iteration ? 'processed' as const : 'pending' as const,
      })),
      resultDigits: getDigits(res === 0 ? 0 : res),
    })

    if (willOverflow) {
      steps.push({
        lineNumber: 12,
        description: 'return 0 (overflow detected)',
        insight: 'The reversed number would overflow 32-bit signed integer range.',
        originalX: inputX,
        x,
        res: 0,
        digit,
        sign,
        phase: 'overflow',
        digits: absDigits.map((d, i) => ({
          value: d,
          status: i <= iteration ? 'processed' as const : 'pending' as const,
        })),
        resultDigits: [0],
      })
      return steps
    }

    // Update res
    const oldRes = res
    res = res * 10 + digit
    steps.push({
      lineNumber: 13,
      description: `res = ${oldRes} * 10 + ${digit} = ${res}`,
      insight: `Append digit to result: shift existing digits left and add new digit.`,
      originalX: inputX,
      x,
      res,
      digit,
      sign,
      phase: 'update',
      digits: absDigits.map((d, i) => ({
        value: d,
        status: i <= iteration ? 'processed' as const : 'pending' as const,
      })),
      resultDigits: getDigits(res),
    })

    iteration++
  }

  // Return result
  const finalResult = sign * res
  steps.push({
    lineNumber: 15,
    description: `return sign * res = ${sign} * ${res} = ${finalResult}`,
    insight: 'Apply the original sign and return the reversed integer.',
    originalX: inputX,
    x: 0,
    res,
    digit: null,
    sign,
    phase: 'complete',
    digits: absDigits.map(d => ({ value: d, status: 'processed' as const })),
    resultDigits: getDigits(res),
  })

  return steps
}

function ReverseInteger() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.x), [testCase.data.x])
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
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
      `}</style>

      {/* Digit Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Digit Extraction</span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center gap-8">
            {/* Original digits */}
            <div>
              <div className="text-slate-500 text-xs font-mono mb-2 text-center">Input (x)</div>
              <div className="flex gap-1">
                {step.sign === -1 && (
                  <div className="w-10 h-12 flex items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-lg">
                    -
                  </div>
                )}
                {step.digits.map((d, i) => (
                  <div
                    key={i}
                    className={`w-10 h-12 flex items-center justify-center rounded-lg font-mono text-lg transition-all duration-300 ${
                      d.status === 'current'
                        ? 'bg-orange-500/30 border-2 border-orange-400 text-orange-300 glow-orange'
                        : d.status === 'processed'
                        ? 'bg-slate-800/30 border border-slate-700 text-slate-600'
                        : 'bg-slate-800 border border-slate-600 text-slate-300'
                    }`}
                  >
                    {d.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="text-cyan-400 text-2xl">→</div>

            {/* Result digits */}
            <div>
              <div className="text-slate-500 text-xs font-mono mb-2 text-center">Result (res)</div>
              <div className="flex gap-1">
                {step.sign === -1 && step.phase !== 'init' && (
                  <div className="w-10 h-12 flex items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-lg">
                    -
                  </div>
                )}
                {step.resultDigits.length === 0 || (step.resultDigits.length === 1 && step.resultDigits[0] === 0 && step.phase === 'init') ? (
                  <div className="w-10 h-12 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700 text-slate-600 font-mono text-lg">
                    0
                  </div>
                ) : (
                  step.resultDigits.map((d, i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 flex items-center justify-center rounded-lg font-mono text-lg transition-all duration-300 ${
                        i === step.resultDigits.length - 1 && step.phase === 'update'
                          ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 glow-cyan'
                          : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                      }`}
                    >
                      {d}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {step.digit !== null && (
            <div className="mt-4 text-center">
              <span className="px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/50 text-orange-300 font-mono">
                Current digit: {step.digit}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* State Variables */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">State</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-500 text-xs font-mono mb-2">x (remaining)</div>
              <div className="text-2xl font-mono text-orange-400">{step.x}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-500 text-xs font-mono mb-2">res (result)</div>
              <div className="text-2xl font-mono text-cyan-400">{step.res}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-500 text-xs font-mono mb-2">sign</div>
              <div className="text-2xl font-mono text-purple-400">{step.sign === -1 ? '-1' : '+1'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overflow Warning */}
      {step.phase === 'overflow' && (
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-red-400 font-mono">Overflow! Returning 0</div>
              <div className="text-slate-500 font-mono text-xs">
                Result would exceed 32-bit signed integer range
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="text-emerald-400 font-mono">Result: {step.sign * step.res}</div>
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
          <h4 className="text-cyan-400 font-mono mb-1">Pop & Push</h4>
          <p className="text-slate-400">
            Extract last digit with % 10, append to result with res * 10 + digit.
            This naturally reverses the digit order.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Overflow Check</h4>
          <p className="text-slate-400">
            Before multiplying, check if res {'>'} (INT_MAX - digit) / 10.
            This prevents overflow without using 64-bit integers.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(log₁₀|x|)</span>
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
        number: '7',
        title: 'Reverse Integer',
        difficulty: 'medium',
        tags: ['Math'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="reverse_integer.py"
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
