import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/remove-duplicates-ii')({
  component: RemoveDuplicatesVisualization,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def removeDuplicates(self, s: str, k: int) -> str:' },
  { num: 3, code: '        stack = []' },
  { num: 4, code: '' },
  { num: 5, code: '        for char in s:' },
  { num: 6, code: '            if stack and char == stack[-1][0]:' },
  { num: 7, code: '                stack[-1][1] += 1' },
  { num: 8, code: '                if stack[-1][1] >= k:' },
  { num: 9, code: '                    stack.pop()' },
  { num: 10, code: '            else:' },
  { num: 11, code: '                stack.append([char, 1])' },
  { num: 12, code: '' },
  { num: 13, code: '        res = ""' },
  { num: 14, code: '        for char, count in stack:' },
  { num: 15, code: '            res += char * count' },
  { num: 16, code: '' },
  { num: 17, code: '        return res' },
]

const PROBLEM_DESCRIPTION = `You are given a string s and an integer k, a k duplicate removal consists of choosing k adjacent and equal letters from s and removing them, causing the left and the right side of the deleted substring to concatenate together.

We repeatedly make k duplicate removals on s until we no longer can.

Return the final string after all such duplicate removals have been made. It is guaranteed that the answer is unique.`

const EXAMPLES: Array<Example> = [
  {
    input: 's = "abcd", k = 2',
    output: '"abcd"',
    explanation: 'There are no adjacent duplicates to remove.',
  },
  {
    input: 's = "deeedbbcccbdaa", k = 3',
    output: '"aa"',
    explanation: 'First delete "eee" and "ccc", then delete "bb", then remove "aa". Finally we get "aa".',
  },
  {
    input: 's = "pbbcggttciiippooaais", k = 2',
    output: '"ps"',
    explanation: 'Multiple removals lead to "ps".',
  },
]

const CONSTRAINTS = [
  '1 <= s.length <= 10^5',
  '2 <= k <= 10^4',
  's only contains lowercase English letters.',
]

interface StackItem {
  char: string
  count: number
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  inputString: string
  currentIndex: number
  stack: Array<StackItem>
  phase: 'init' | 'iterate' | 'check-match' | 'increment' | 'pop' | 'push' | 'build-result' | 'complete'
  highlightStackTop: boolean
  resultSoFar: string
  justPopped: boolean
  poppedChars?: string
}

interface TestCaseData {
  input: string
  k: number
  output: string
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Example 1 (k=2)',
    data: { input: 'abcd', k: 2, output: 'abcd' },
  },
  {
    id: 2,
    label: 'Example 2 (k=3)',
    data: { input: 'deeedbbcccbdaa', k: 3, output: 'aa' },
  },
  {
    id: 3,
    label: 'Example 3 (k=2)',
    data: { input: 'pbbcggttciiippooaais', k: 2, output: 'ps' },
  },
]

function generateSteps(testCaseData: TestCaseData): Array<Step> {
  const steps: Array<Step> = []
  const { input, k } = testCaseData
  const stack: Array<StackItem> = []

  // Initial state
  steps.push({
    lineNumber: 3,
    description: 'Initialize empty stack',
    insight: `The stack will store [char, count] pairs to track consecutive characters.`,
    inputString: input,
    currentIndex: -1,
    stack: [],
    phase: 'init',
    highlightStackTop: false,
    resultSoFar: '',
    justPopped: false,
  })

  // Iterate through each character
  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    // Show current character
    steps.push({
      lineNumber: 5,
      description: `Processing character '${char}' at index ${i}`,
      insight: `Check if '${char}' matches the top of stack.`,
      inputString: input,
      currentIndex: i,
      stack: stack.map(s => ({ ...s })),
      phase: 'iterate',
      highlightStackTop: false,
      resultSoFar: '',
      justPopped: false,
    })

    if (stack.length > 0 && char === stack[stack.length - 1].char) {
      // Character matches top of stack
      steps.push({
        lineNumber: 6,
        description: `'${char}' matches top of stack!`,
        insight: `The stack top is ['${stack[stack.length - 1].char}', ${stack[stack.length - 1].count}]. Same character found.`,
        inputString: input,
        currentIndex: i,
        stack: stack.map(s => ({ ...s })),
        phase: 'check-match',
        highlightStackTop: true,
        resultSoFar: '',
        justPopped: false,
      })

      // Increment count
      stack[stack.length - 1].count++

      steps.push({
        lineNumber: 7,
        description: `Increment count to ${stack[stack.length - 1].count}`,
        insight: `Now tracking ${stack[stack.length - 1].count} consecutive '${char}' characters.`,
        inputString: input,
        currentIndex: i,
        stack: stack.map(s => ({ ...s })),
        phase: 'increment',
        highlightStackTop: true,
        resultSoFar: '',
        justPopped: false,
      })

      // Check if count >= k
      if (stack[stack.length - 1].count >= k) {
        const poppedChar = stack[stack.length - 1].char
        const poppedCount = stack[stack.length - 1].count

        steps.push({
          lineNumber: 8,
          description: `Count ${poppedCount} >= k (${k})!`,
          insight: `We found ${k} consecutive '${poppedChar}' characters. Time to remove them!`,
          inputString: input,
          currentIndex: i,
          stack: stack.map(s => ({ ...s })),
          phase: 'pop',
          highlightStackTop: true,
          resultSoFar: '',
          justPopped: false,
          poppedChars: poppedChar.repeat(poppedCount),
        })

        stack.pop()

        steps.push({
          lineNumber: 9,
          description: `Pop '${poppedChar}' from stack`,
          insight: `Removed ${k} adjacent '${poppedChar}' characters. ${stack.length === 0 ? 'Stack is now empty.' : `Stack top is now ['${stack[stack.length - 1].char}', ${stack[stack.length - 1].count}].`}`,
          inputString: input,
          currentIndex: i,
          stack: stack.map(s => ({ ...s })),
          phase: 'pop',
          highlightStackTop: stack.length > 0,
          resultSoFar: '',
          justPopped: true,
          poppedChars: poppedChar.repeat(poppedCount),
        })
      }
    } else {
      // Character doesn't match - push new entry
      steps.push({
        lineNumber: stack.length > 0 ? 10 : 11,
        description: stack.length > 0
          ? `'${char}' doesn't match top '${stack[stack.length - 1].char}'`
          : `Stack is empty`,
        insight: `Push new entry ['${char}', 1] onto stack.`,
        inputString: input,
        currentIndex: i,
        stack: stack.map(s => ({ ...s })),
        phase: 'push',
        highlightStackTop: false,
        resultSoFar: '',
        justPopped: false,
      })

      stack.push({ char, count: 1 })

      steps.push({
        lineNumber: 11,
        description: `Pushed ['${char}', 1] onto stack`,
        insight: `Starting to track '${char}' characters. Stack size: ${stack.length}`,
        inputString: input,
        currentIndex: i,
        stack: stack.map(s => ({ ...s })),
        phase: 'push',
        highlightStackTop: true,
        resultSoFar: '',
        justPopped: false,
      })
    }
  }

  // Build result
  steps.push({
    lineNumber: 13,
    description: 'Build result string from stack',
    insight: `Finished processing. Now construct the final string from ${stack.length} stack entries.`,
    inputString: input,
    currentIndex: -1,
    stack: stack.map(s => ({ ...s })),
    phase: 'build-result',
    highlightStackTop: false,
    resultSoFar: '',
    justPopped: false,
  })

  let result = ''
  for (let i = 0; i < stack.length; i++) {
    result += stack[i].char.repeat(stack[i].count)

    steps.push({
      lineNumber: 15,
      description: `Add '${stack[i].char}' x ${stack[i].count} to result`,
      insight: `Result so far: "${result}"`,
      inputString: input,
      currentIndex: -1,
      stack: stack.map((s) => ({ ...s })),
      phase: 'build-result',
      highlightStackTop: false,
      resultSoFar: result,
      justPopped: false,
    })
  }

  // Complete
  steps.push({
    lineNumber: 17,
    description: `Return "${result}"`,
    insight: `All ${k}-adjacent duplicates have been removed!`,
    inputString: input,
    currentIndex: -1,
    stack: stack.map(s => ({ ...s })),
    phase: 'complete',
    highlightStackTop: false,
    resultSoFar: result,
    justPopped: false,
  })

  return steps
}

function RemoveDuplicatesVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(1) // Default to Example 2 (most interesting)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data), [testCase.data])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        :root {
          --cyan: #22d3ee;
          --cyan-dim: #0891b2;
          --orange: #fb923c;
          --orange-dim: #c2410c;
          --navy: #0a1628;
          --navy-light: #1e3a5f;
          --green: #4ade80;
          --red: #f87171;
        }

        .font-display { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.05);
        }
        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.4), inset 0 0 20px rgba(251, 146, 60, 0.05);
        }
        .glow-green {
          box-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
        }
        .glow-red {
          box-shadow: 0 0 20px rgba(248, 113, 113, 0.4);
        }

        @keyframes node-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .active-char {
          animation: node-pulse 1s ease-in-out infinite;
        }

        .stack-enter {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes popOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.5) translateY(-20px); opacity: 0; }
        }

        .pop-out {
          animation: popOut 0.3s ease-out;
        }
      `}</style>

      {/* Input String Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">INPUT STRING</span>
          <span className="text-slate-500 font-mono text-xs">k = {testCase.data.k}</span>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-1">
            {step.inputString.split('').map((char, idx) => (
              <div
                key={idx}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg
                  border-2 transition-all duration-300
                  ${step.currentIndex === idx
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 glow-orange active-char'
                    : idx < step.currentIndex && step.currentIndex >= 0
                      ? 'bg-slate-800/50 border-slate-600/50 text-slate-500'
                      : 'bg-slate-800 border-slate-600 text-slate-300'
                  }
                `}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Result display */}
          {(step.phase === 'build-result' || step.phase === 'complete') && step.resultSoFar && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="text-slate-600 font-mono text-xs mb-2">RESULT</div>
              <div className="flex flex-wrap gap-1">
                {step.resultSoFar.split('').map((char, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg bg-green-500/20 border-2 border-green-500/50 text-green-400"
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stack */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">STACK</span>
          <span className="text-slate-500 font-mono text-xs">
            {step.stack.length} item{step.stack.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-4 min-h-[200px] flex flex-col justify-end">
          {step.stack.length > 0 ? (
            <div className="space-y-2">
              {[...step.stack].reverse().map((item, idx) => {
                const isTop = idx === 0
                return (
                  <div
                    key={`${item.char}-${step.stack.length - 1 - idx}`}
                    className={`
                      stack-enter px-4 py-3 rounded-lg font-mono text-center
                      flex items-center justify-between transition-all
                      ${isTop && step.highlightStackTop
                        ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 glow-cyan'
                        : 'bg-slate-800 border border-slate-600 text-slate-300'
                      }
                      ${step.justPopped && isTop ? 'glow-green' : ''}
                    `}
                  >
                    <span className="text-slate-600 text-xs">[{step.stack.length - 1 - idx}]</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{item.char}</span>
                      <span className="text-slate-500">×</span>
                      <span className={`
                        px-2 py-0.5 rounded text-sm
                        ${item.count >= testCase.data.k - 1 && isTop && step.highlightStackTop
                          ? 'bg-red-500/30 text-red-400'
                          : 'bg-slate-700 text-slate-400'
                        }
                      `}>
                        {item.count}
                      </span>
                    </span>
                    <span className="text-slate-600 text-xs">{isTop ? '← TOP' : ''}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-slate-600 text-center font-mono text-sm italic">
              Stack is empty
            </div>
          )}

          {step.justPopped && step.poppedChars && (
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                Removed: "{step.poppedChars}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Completion */}
      {step.phase === 'complete' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-green-400 font-display font-bold text-lg mb-1">
                DUPLICATES REMOVED
              </div>
              <div className="text-green-300 font-mono text-sm">
                Result: "{step.resultSoFar}"
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
          <h4 className="text-orange-400 font-mono mb-1">Stack Approach</h4>
          <p className="text-slate-400">Use a stack of [char, count] pairs. When count reaches k, pop the entry. This handles cascading deletions automatically.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-cyan-400 font-mono">Time: O(n)</span>
            <p className="text-slate-500 text-xs mt-1">Each character is pushed and popped at most once</p>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-cyan-400 font-mono">Space: O(n)</span>
            <p className="text-slate-500 text-xs mt-1">Stack stores at most n character entries</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '1209',
        title: 'Remove All Adjacent Duplicates in String II',
        difficulty: 'medium',
        tags: ['Stack', 'String'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="remove_duplicates.py"
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
