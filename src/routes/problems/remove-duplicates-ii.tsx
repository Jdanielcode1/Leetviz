import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/problems/remove-duplicates-ii')({
  component: RemoveDuplicatesVisualization,
})

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
  stack: StackItem[]
  phase: 'init' | 'iterate' | 'check-match' | 'increment' | 'pop' | 'push' | 'build-result' | 'complete'
  highlightStackTop: boolean
  resultSoFar: string
  justPopped: boolean
  poppedChars?: string
}

interface TestCase {
  name: string
  description: string
  input: string
  k: number
  output: string
}

const PROBLEM_DESCRIPTION = `You are given a string s and an integer k, a k duplicate removal consists of choosing k adjacent and equal letters from s and removing them, causing the left and the right side of the deleted substring to concatenate together.

We repeatedly make k duplicate removals on s until we no longer can.

Return the final string after all such duplicate removals have been made. It is guaranteed that the answer is unique.`

const CODE_LINES = [
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

const TEST_CASES: TestCase[] = [
  {
    name: 'Example 1',
    description: 'No duplicates to remove',
    input: 'abcd',
    k: 2,
    output: 'abcd',
  },
  {
    name: 'Example 2',
    description: 'Multiple removal rounds',
    input: 'deeedbbcccbdaa',
    k: 3,
    output: 'aa',
  },
  {
    name: 'Example 3',
    description: 'Pairs removal',
    input: 'pbbcggttciiippooaais',
    k: 2,
    output: 'ps',
  },
]

function generateSteps(testCase: TestCase): Step[] {
  const steps: Step[] = []
  const { input, k } = testCase
  const stack: StackItem[] = []

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
  const [selectedCase, setSelectedCase] = useState(1) // Default to Example 2 (most interesting)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [showProblem, setShowProblem] = useState(false)

  useEffect(() => {
    const newSteps = generateSteps(TEST_CASES[selectedCase])
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [selectedCase])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep(prev => prev + 1), speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, steps.length, speed])

  const step = steps[currentStep] || {
    lineNumber: 0,
    description: '',
    insight: '',
    inputString: '',
    currentIndex: -1,
    stack: [],
    phase: 'init',
    highlightStackTop: false,
    resultSoFar: '',
    justPopped: false,
  } as Step

  const testCase = TEST_CASES[selectedCase]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else if (e.key === ' ') {
      e.preventDefault()
      setIsPlaying(prev => !prev)
    }
  }, [currentStep, steps.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

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

        .code-highlight {
          background: linear-gradient(90deg, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%);
          border-left: 3px solid var(--cyan);
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-8 py-6 blueprint-grid min-h-screen">
        {/* Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-colors mb-8 font-display text-sm tracking-wide group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO PROBLEMS
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-cyan-400/60 font-mono text-sm mb-1">LEETCODE #1209</div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Remove All Adjacent Duplicates in String II
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
                  MEDIUM
                </span>
                <span className="text-slate-500 text-sm font-mono">Stack + String</span>
              </div>
            </div>
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-mono transition-all"
            >
              {showProblem ? 'HIDE PROBLEM' : 'SHOW PROBLEM'}
            </button>
          </div>
        </header>

        {/* Problem Description */}
        {showProblem && (
          <div className="mb-8 p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl">
            <h2 className="font-display text-lg font-semibold text-cyan-400 mb-4">Problem Description</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line font-mono text-sm mb-6">
              {PROBLEM_DESCRIPTION}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-orange-400 font-mono text-xs mb-2">INPUT</div>
                <code className="text-slate-300 text-sm">s = "{testCase.input}", k = {testCase.k}</code>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-cyan-400 font-mono text-xs mb-2">OUTPUT</div>
                <code className="text-slate-300 text-sm">"{testCase.output}"</code>
              </div>
            </div>
          </div>
        )}

        {/* Test Case Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TEST_CASES.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCase(idx)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                selectedCase === idx
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 glow-cyan'
                  : 'bg-slate-800/30 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              {tc.name} (k={tc.k})
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setCurrentStep(0)}
              disabled={currentStep === 0}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
              title="Reset"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-3 rounded-lg transition-all ${
                isPlaying
                  ? 'bg-orange-500/20 text-orange-400 glow-orange'
                  : 'bg-cyan-500/20 text-cyan-400 glow-cyan'
              }`}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep >= steps.length - 1}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
              title="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentStep(steps.length - 1)}
              disabled={currentStep >= steps.length - 1}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
              title="End"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-mono">SPEED</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - parseInt(e.target.value))}
              className="w-24 accent-cyan-500"
            />
          </div>

          <div className="ml-auto text-slate-500 font-mono text-sm">
            STEP {currentStep + 1} / {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Code Panel */}
          <div className="xl:col-span-2 bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-slate-500 font-mono text-xs">remove_duplicates.py</span>
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
          <div className="xl:col-span-3 space-y-6">
            {/* Input String Visualization */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                <span className="text-slate-300 font-mono text-sm">INPUT STRING</span>
                <span className="text-slate-500 font-mono text-xs">k = {testCase.k}</span>
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

            {/* Stack & Explanation Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Stack */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
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
                                ${item.count >= testCase.k - 1 && isTop && step.highlightStackTop
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

              {/* Explanation */}
              <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 rounded-xl border border-cyan-500/20 overflow-hidden">
                <div className="px-4 py-3 bg-cyan-500/5 border-b border-cyan-500/20">
                  <span className="text-cyan-400 font-mono text-sm">CURRENT OPERATION</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-white font-display text-lg">
                    {step.description}
                  </div>
                  <div className="text-slate-400 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-3">
                    {step.insight}
                  </div>

                  {step.phase === 'complete' && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                      <div className="text-green-400 font-display font-bold text-lg mb-1">
                        DUPLICATES REMOVED
                      </div>
                      <div className="text-green-300 font-mono text-sm">
                        Result: "{step.resultSoFar}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
          <h2 className="font-display text-lg font-semibold text-cyan-400 mb-4">ALGORITHM OVERVIEW</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">APPROACH</div>
              <p className="text-slate-400 text-sm">
                Use a stack of [char, count] pairs. When count reaches k, pop the entry.
                This handles cascading deletions automatically.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">TIME COMPLEXITY</div>
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-mono">O(n)</span> - Each character is pushed
                and popped at most once.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">SPACE COMPLEXITY</div>
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-mono">O(n)</span> - Stack stores at most n
                character entries.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 text-center text-slate-600 font-mono text-xs">
          KEYBOARD: ← Previous | → Next | Space Play/Pause
        </div>
      </div>
    </div>
  )
}
