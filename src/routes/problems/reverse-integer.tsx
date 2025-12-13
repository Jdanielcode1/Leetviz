import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/reverse-integer')({
  component: ReverseInteger,
})

const CODE_LINES = [
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

const INT_MAX = 2147483647
const INT_MIN = -2147483648

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
  digits: { value: number; status: 'pending' | 'current' | 'processed' }[]
  resultDigits: number[]
}

interface TestCase {
  id: number
  x: number
  expected: number
}

const TEST_CASES: TestCase[] = [
  { id: 1, x: 123, expected: 321 },
  { id: 2, x: -123, expected: -321 },
  { id: 3, x: 120, expected: 21 },
  { id: 4, x: 1534236469, expected: 0 }, // Overflow case
]

function getDigits(num: number): number[] {
  const digits: number[] = []
  let n = Math.abs(num)
  if (n === 0) return [0]
  while (n > 0) {
    digits.unshift(n % 10)
    n = Math.floor(n / 10)
  }
  return digits
}

function generateSteps(inputX: number): Step[] {
  const steps: Step[] = []
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
  const steps = useMemo(() => generateSteps(testCase.x), [testCase.x])
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
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
        }

        .glow-orange {
          box-shadow: 0 0 15px rgba(251, 146, 60, 0.4);
        }

        .glow-red {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
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
                  <span className="text-slate-500 font-mono">#7</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Reverse Integer
                </h1>
                <div className="flex gap-2">
                  {['Math', 'Overflow'].map((tag) => (
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
                    {tc.x} → {tc.expected}
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
                <span className="text-slate-500 font-mono text-xs">reverse_integer.py</span>
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
              {/* Digit Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">DIGIT EXTRACTION</span>
                </div>
                <div className="p-6">
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
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">STATE</span>
                </div>
                <div className="p-6">
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

              {/* Overflow Warning */}
              {step.phase === 'overflow' && (
                <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-red-400 font-mono text-lg">
                        Overflow! Returning 0
                      </div>
                      <div className="text-slate-500 font-mono text-sm">
                        Result would exceed 32-bit signed integer range
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                        Result: {step.sign * step.res}
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
                <h4 className="text-cyan-400 font-mono mb-2">Pop & Push</h4>
                <p className="text-slate-400">
                  Extract last digit with % 10, append to result with res * 10 + digit.
                  This naturally reverses the digit order.
                </p>
              </div>
              <div>
                <h4 className="text-orange-400 font-mono mb-2">Overflow Check</h4>
                <p className="text-slate-400">
                  Before multiplying, check if res {'>'} (INT_MAX - digit) / 10.
                  This prevents overflow without using 64-bit integers.
                </p>
              </div>
              <div>
                <h4 className="text-purple-400 font-mono mb-2">Sign Handling</h4>
                <p className="text-slate-400">
                  Store sign at start, work with absolute value,
                  apply sign at the end for cleaner logic.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(log₁₀|x|)</h4>
                <p className="text-slate-400">
                  Process each digit once. At most 10 iterations for 32-bit integers.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(1)</h4>
                <p className="text-slate-400">
                  Only use a constant amount of extra space for variables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
