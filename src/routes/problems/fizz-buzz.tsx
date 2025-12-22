import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/fizz-buzz')({
  component: FizzBuzz,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def fizzBuzz(self, n: int) -> List[str]:' },
  { num: 3, code: '        result = []' },
  { num: 4, code: '' },
  { num: 5, code: '        for i in range(1, n + 1):' },
  { num: 6, code: '            if i % 3 == 0 and i % 5 == 0:' },
  { num: 7, code: '                result.append("FizzBuzz")' },
  { num: 8, code: '            elif i % 3 == 0:' },
  { num: 9, code: '                result.append("Fizz")' },
  { num: 10, code: '            elif i % 5 == 0:' },
  { num: 11, code: '                result.append("Buzz")' },
  { num: 12, code: '            else:' },
  { num: 13, code: '                result.append(str(i))' },
  { num: 14, code: '' },
  { num: 15, code: '        return result' },
]

const PROBLEM_DESCRIPTION = `Given an integer n, return a string array answer (1-indexed) where:

• answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
• answer[i] == "Fizz" if i is divisible by 3.
• answer[i] == "Buzz" if i is divisible by 5.
• answer[i] == i (as a string) if none of the above conditions are true.`

const EXAMPLES: Array<Example> = [
  {
    input: 'n = 3',
    output: '["1","2","Fizz"]',
  },
  {
    input: 'n = 5',
    output: '["1","2","Fizz","4","Buzz"]',
  },
  {
    input: 'n = 15',
    output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
  },
]

const CONSTRAINTS = [
  '1 <= n <= 10^4',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  currentNum: number | null
  divisibleBy3: boolean | null
  divisibleBy5: boolean | null
  result: Array<string>
  phase: 'init' | 'loop' | 'check-fizzbuzz' | 'check-fizz' | 'check-buzz' | 'check-num' | 'append' | 'complete'
  justAdded: string | null
}

interface TestCaseData {
  n: number
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: 'n = 3', data: { n: 3 } },
  { id: 2, label: 'n = 5', data: { n: 5 } },
  { id: 3, label: 'n = 15', data: { n: 15 } },
]

function generateSteps(n: number): Array<Step> {
  const steps: Array<Step> = []
  const result: Array<string> = []

  // Init
  steps.push({
    lineNumber: 3,
    description: 'Initialize empty result array',
    insight: 'We will build the answer array one element at a time.',
    currentNum: null,
    divisibleBy3: null,
    divisibleBy5: null,
    result: [],
    phase: 'init',
    justAdded: null,
  })

  for (let i = 1; i <= n; i++) {
    const div3 = i % 3 === 0
    const div5 = i % 5 === 0

    // Loop iteration
    steps.push({
      lineNumber: 5,
      description: `Loop iteration: i = ${i}`,
      insight: `Now checking number ${i} to determine what to add to result.`,
      currentNum: i,
      divisibleBy3: null,
      divisibleBy5: null,
      result: [...result],
      phase: 'loop',
      justAdded: null,
    })

    if (div3 && div5) {
      // Check FizzBuzz
      steps.push({
        lineNumber: 6,
        description: `Check: ${i} % 3 == 0 AND ${i} % 5 == 0 → TRUE`,
        insight: `${i} is divisible by both 3 and 5! This is a FizzBuzz number.`,
        currentNum: i,
        divisibleBy3: true,
        divisibleBy5: true,
        result: [...result],
        phase: 'check-fizzbuzz',
        justAdded: null,
      })

      result.push('FizzBuzz')
      steps.push({
        lineNumber: 7,
        description: 'Append "FizzBuzz" to result',
        insight: `Added "FizzBuzz" for number ${i}. These are special numbers divisible by 15!`,
        currentNum: i,
        divisibleBy3: true,
        divisibleBy5: true,
        result: [...result],
        phase: 'append',
        justAdded: 'FizzBuzz',
      })
    } else if (div3) {
      // Check Fizz
      steps.push({
        lineNumber: 8,
        description: `Check: ${i} % 3 == 0 → TRUE`,
        insight: `${i} is divisible by 3 (${i} = 3 × ${i / 3}).`,
        currentNum: i,
        divisibleBy3: true,
        divisibleBy5: false,
        result: [...result],
        phase: 'check-fizz',
        justAdded: null,
      })

      result.push('Fizz')
      steps.push({
        lineNumber: 9,
        description: 'Append "Fizz" to result',
        insight: `Added "Fizz" for number ${i}. Fizz = divisible by 3!`,
        currentNum: i,
        divisibleBy3: true,
        divisibleBy5: false,
        result: [...result],
        phase: 'append',
        justAdded: 'Fizz',
      })
    } else if (div5) {
      // Check Buzz
      steps.push({
        lineNumber: 10,
        description: `Check: ${i} % 5 == 0 → TRUE`,
        insight: `${i} is divisible by 5 (${i} = 5 × ${i / 5}).`,
        currentNum: i,
        divisibleBy3: false,
        divisibleBy5: true,
        result: [...result],
        phase: 'check-buzz',
        justAdded: null,
      })

      result.push('Buzz')
      steps.push({
        lineNumber: 11,
        description: 'Append "Buzz" to result',
        insight: `Added "Buzz" for number ${i}. Buzz = divisible by 5!`,
        currentNum: i,
        divisibleBy3: false,
        divisibleBy5: true,
        result: [...result],
        phase: 'append',
        justAdded: 'Buzz',
      })
    } else {
      // Just the number
      steps.push({
        lineNumber: 12,
        description: `Check: ${i} % 3 ≠ 0 AND ${i} % 5 ≠ 0`,
        insight: `${i} is not divisible by 3 or 5. Just use the number itself.`,
        currentNum: i,
        divisibleBy3: false,
        divisibleBy5: false,
        result: [...result],
        phase: 'check-num',
        justAdded: null,
      })

      result.push(String(i))
      steps.push({
        lineNumber: 13,
        description: `Append "${i}" to result`,
        insight: `Added "${i}" as a string since it's not divisible by 3 or 5.`,
        currentNum: i,
        divisibleBy3: false,
        divisibleBy5: false,
        result: [...result],
        phase: 'append',
        justAdded: String(i),
      })
    }
  }

  // Complete
  steps.push({
    lineNumber: 15,
    description: `Return result array with ${result.length} elements`,
    insight: `Done! Built array from 1 to ${n} with Fizz, Buzz, and FizzBuzz substitutions.`,
    currentNum: null,
    divisibleBy3: null,
    divisibleBy5: null,
    result: [...result],
    phase: 'complete',
    justAdded: null,
  })

  return steps
}

function getItemStyle(item: string, isNew: boolean) {
  const base = 'transition-all duration-300'

  if (item === 'FizzBuzz') {
    return `${base} bg-purple-500/30 border-purple-400 text-purple-300 ${isNew ? 'glow-purple scale-110' : ''}`
  } else if (item === 'Fizz') {
    return `${base} bg-cyan-500/30 border-cyan-400 text-cyan-300 ${isNew ? 'glow-cyan scale-110' : ''}`
  } else if (item === 'Buzz') {
    return `${base} bg-amber-500/30 border-amber-400 text-amber-300 ${isNew ? 'glow-amber scale-110' : ''}`
  } else {
    return `${base} bg-slate-700/50 border-slate-600 text-slate-300 ${isNew ? 'scale-105' : ''}`
  }
}

function FizzBuzz() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.n), [testCase.data.n])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-purple { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
        .glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
        .glow-amber { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 1s ease-in-out infinite;
        }

        .divisibility-badge {
          transition: all 0.2s ease;
        }

        .divisibility-badge.active {
          transform: scale(1.1);
        }
      `}</style>

      {/* Current Number Check */}
      {step.currentNum !== null && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <span className="text-slate-300 font-mono text-sm">CHECKING NUMBER</span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center gap-8">
              {/* Current Number */}
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold font-mono text-white animate-pulse-glow">
                  {step.currentNum}
                </div>
                <div className="text-slate-500 text-sm mt-2 font-mono">i = {step.currentNum}</div>
              </div>

              {/* Divisibility Checks */}
              <div className="flex flex-col gap-3">
                <div
                  className={`divisibility-badge px-4 py-2 rounded-lg border font-mono text-sm flex items-center gap-2 ${
                    step.divisibleBy3 === true
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 active'
                      : step.divisibleBy3 === false
                      ? 'bg-slate-800/50 border-slate-600 text-slate-500'
                      : 'bg-slate-800/30 border-slate-700 text-slate-600'
                  }`}
                >
                  <span className="text-lg">÷3</span>
                  {step.divisibleBy3 === true && <span className="text-emerald-400">✓</span>}
                  {step.divisibleBy3 === false && <span className="text-red-400">✗</span>}
                </div>
                <div
                  className={`divisibility-badge px-4 py-2 rounded-lg border font-mono text-sm flex items-center gap-2 ${
                    step.divisibleBy5 === true
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 active'
                      : step.divisibleBy5 === false
                      ? 'bg-slate-800/50 border-slate-600 text-slate-500'
                      : 'bg-slate-800/30 border-slate-700 text-slate-600'
                  }`}
                >
                  <span className="text-lg">÷5</span>
                  {step.divisibleBy5 === true && <span className="text-emerald-400">✓</span>}
                  {step.divisibleBy5 === false && <span className="text-red-400">✗</span>}
                </div>
              </div>

              {/* Result for this number */}
              {step.justAdded && (
                <div className="flex flex-col items-center">
                  <div className="text-slate-500 text-xs mb-2 font-mono">OUTPUT</div>
                  <div
                    className={`px-4 py-2 rounded-lg border-2 font-mono text-lg animate-pop-in ${getItemStyle(step.justAdded, true)}`}
                  >
                    {step.justAdded}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Array */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">RESULT ARRAY</span>
          <span className="text-slate-500 font-mono text-xs">
            {step.result.length} / {testCase.data.n} items
          </span>
        </div>
        <div className="p-6">
          {step.result.length === 0 ? (
            <div className="text-center text-slate-600 font-mono py-4">
              [ ] — Empty array
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {step.result.map((item, idx) => {
                const isNew = step.justAdded === item && idx === step.result.length - 1
                return (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg border font-mono text-sm ${getItemStyle(item, isNew)}`}
                    style={{
                      animationDelay: isNew ? '0ms' : `${idx * 30}ms`,
                    }}
                  >
                    "{item}"
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex flex-wrap gap-4 justify-center text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500/30 border border-purple-400" />
            <span className="text-slate-400">FizzBuzz (÷3 & ÷5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-500/30 border border-cyan-400" />
            <span className="text-slate-400">Fizz (÷3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-400" />
            <span className="text-slate-400">Buzz (÷5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600" />
            <span className="text-slate-400">Number</span>
          </div>
        </div>
      </div>

      {/* Completion */}
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
                Complete! Generated {step.result.length} items
              </div>
              <div className="text-slate-500 font-mono text-sm">
                {step.result.filter(x => x === 'FizzBuzz').length} FizzBuzz,{' '}
                {step.result.filter(x => x === 'Fizz').length} Fizz,{' '}
                {step.result.filter(x => x === 'Buzz').length} Buzz
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
          <h4 className="text-purple-400 font-mono mb-1">Order Matters!</h4>
          <p className="text-slate-400">
            Check divisibility by 15 (both 3 and 5) first! If you check 3 or 5
            separately first, you'll miss the FizzBuzz case.
          </p>
        </div>
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Modulo Operator</h4>
          <p className="text-slate-400">
            The % operator gives the remainder. If i % 3 == 0, then i is
            perfectly divisible by 3 with no remainder.
          </p>
        </div>
        <div>
          <h4 className="text-amber-400 font-mono mb-1">Classic Interview Problem</h4>
          <p className="text-slate-400">
            FizzBuzz tests basic programming concepts: loops, conditionals,
            and modular arithmetic. Simple but reveals coding style!
          </p>
        </div>
        <div className="flex gap-3">
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
        number: '412',
        title: 'Fizz Buzz',
        difficulty: 'easy',
        tags: ['Math', 'String', 'Simulation'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="fizz_buzz.py"
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
