import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/longest-common-prefix')({
  component: LongestCommonPrefix,
})

const CODE_LINES = [
  { num: 1, code: 'def longestCommonPrefix(strs: List[str]) -> str:' },
  { num: 2, code: '    pref = strs[0]' },
  { num: 3, code: '    pref_len = len(pref)' },
  { num: 4, code: '' },
  { num: 5, code: '    for s in strs[1:]:' },
  { num: 6, code: '        while pref != s[0:pref_len]:' },
  { num: 7, code: '            pref_len -= 1' },
  { num: 8, code: '            if pref_len == 0:' },
  { num: 9, code: '                return ""' },
  { num: 10, code: '            pref = pref[0:pref_len]' },
  { num: 11, code: '' },
  { num: 12, code: '    return pref' },
]

const PROBLEM_DESCRIPTION = `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".`

interface Step {
  lineNumber: number
  description: string
  insight: string
  strings: string[]
  prefix: string
  prefixLen: number
  currentStringIndex: number | null
  highlightPrefix: boolean
  highlightCompare: string | null
  result: string | null
  comparing: boolean
}

interface TestCase {
  id: number
  name: string
  input: string[]
  expected: string
  explanation: string[]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Example 1: Common prefix exists',
    input: ['flower', 'flow', 'flight'],
    expected: 'fl',
    explanation: [
      'strs = ["flower", "flow", "flight"]',
      'Start with pref = "flower", pref_len = 6',
      'Compare with "flow": "flower" != "flow" -> shrink',
      '  "flowe" != "flow" -> shrink',
      '  "flow" == "flow" -> match!',
      'Compare with "flight": "flow" != "flig" -> shrink',
      '  "flo" != "fli" -> shrink',
      '  "fl" == "fl" -> match!',
      'Return "fl"',
    ],
  },
  {
    id: 2,
    name: 'Example 2: No common prefix',
    input: ['dog', 'racecar', 'car'],
    expected: '',
    explanation: [
      'strs = ["dog", "racecar", "car"]',
      'Start with pref = "dog", pref_len = 3',
      'Compare with "racecar": "dog" != "rac" -> shrink',
      '  "do" != "ra" -> shrink',
      '  "d" != "r" -> shrink',
      '  pref_len = 0 -> return ""',
      'No common prefix exists',
    ],
  },
]

function generateSteps(input: string[]): Step[] {
  const steps: Step[] = []
  const strings = [...input]

  // Initial state
  steps.push({
    lineNumber: 1,
    description: 'Start longestCommonPrefix',
    insight: `Input: [${strings.map(s => `"${s}"`).join(', ')}]`,
    strings,
    prefix: '',
    prefixLen: 0,
    currentStringIndex: null,
    highlightPrefix: false,
    highlightCompare: null,
    result: null,
    comparing: false,
  })

  // Initialize prefix
  let prefix = strings[0]
  let prefixLen = prefix.length

  steps.push({
    lineNumber: 2,
    description: `Initialize prefix = "${prefix}"`,
    insight: 'Start with the first string as our initial prefix candidate.',
    strings,
    prefix,
    prefixLen,
    currentStringIndex: 0,
    highlightPrefix: true,
    highlightCompare: null,
    result: null,
    comparing: false,
  })

  steps.push({
    lineNumber: 3,
    description: `pref_len = ${prefixLen}`,
    insight: `Track prefix length (${prefixLen}) to efficiently shrink when needed.`,
    strings,
    prefix,
    prefixLen,
    currentStringIndex: 0,
    highlightPrefix: true,
    highlightCompare: null,
    result: null,
    comparing: false,
  })

  // Iterate through remaining strings
  for (let i = 1; i < strings.length; i++) {
    const s = strings[i]

    steps.push({
      lineNumber: 5,
      description: `Check string "${s}"`,
      insight: `Compare current prefix with the next string in the array.`,
      strings,
      prefix,
      prefixLen,
      currentStringIndex: i,
      highlightPrefix: true,
      highlightCompare: null,
      result: null,
      comparing: false,
    })

    // While prefix doesn't match
    let compareStr = s.slice(0, prefixLen)
    while (prefix !== compareStr) {
      steps.push({
        lineNumber: 6,
        description: `"${prefix}" != "${compareStr}"`,
        insight: `Prefix doesn't match the beginning of "${s}". Need to shrink.`,
        strings,
        prefix,
        prefixLen,
        currentStringIndex: i,
        highlightPrefix: true,
        highlightCompare: compareStr,
        result: null,
        comparing: true,
      })

      prefixLen -= 1

      steps.push({
        lineNumber: 7,
        description: `pref_len -= 1 -> ${prefixLen}`,
        insight: 'Reduce prefix length by 1.',
        strings,
        prefix,
        prefixLen,
        currentStringIndex: i,
        highlightPrefix: true,
        highlightCompare: compareStr,
        result: null,
        comparing: false,
      })

      if (prefixLen === 0) {
        steps.push({
          lineNumber: 8,
          description: 'pref_len == 0',
          insight: 'No common prefix exists - prefix reduced to empty string.',
          strings,
          prefix: '',
          prefixLen: 0,
          currentStringIndex: i,
          highlightPrefix: false,
          highlightCompare: null,
          result: null,
          comparing: false,
        })

        steps.push({
          lineNumber: 9,
          description: 'return ""',
          insight: 'Return empty string - no common prefix among all strings.',
          strings,
          prefix: '',
          prefixLen: 0,
          currentStringIndex: i,
          highlightPrefix: false,
          highlightCompare: null,
          result: '',
          comparing: false,
        })

        return steps
      }

      prefix = prefix.slice(0, prefixLen)

      steps.push({
        lineNumber: 10,
        description: `pref = "${prefix}"`,
        insight: `Shrink prefix to "${prefix}" (length ${prefixLen}).`,
        strings,
        prefix,
        prefixLen,
        currentStringIndex: i,
        highlightPrefix: true,
        highlightCompare: null,
        result: null,
        comparing: false,
      })

      compareStr = s.slice(0, prefixLen)
    }

    // Match found for this string
    steps.push({
      lineNumber: 6,
      description: `"${prefix}" == "${compareStr}"`,
      insight: `Prefix matches! "${prefix}" is common prefix for strings checked so far.`,
      strings,
      prefix,
      prefixLen,
      currentStringIndex: i,
      highlightPrefix: true,
      highlightCompare: compareStr,
      result: null,
      comparing: true,
    })
  }

  // Return final prefix
  steps.push({
    lineNumber: 12,
    description: `return "${prefix}"`,
    insight: `All strings share the common prefix "${prefix}".`,
    strings,
    prefix,
    prefixLen,
    currentStringIndex: null,
    highlightPrefix: true,
    highlightCompare: null,
    result: prefix,
    comparing: false,
  })

  return steps
}

function LongestCommonPrefix() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showTestCase, setShowTestCase] = useState(false)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.input), [testCase.input])
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
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
        }

        .glow-orange {
          box-shadow: 0 0 15px rgba(251, 146, 60, 0.4);
        }

        .glow-green {
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
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
                  <span className="text-slate-500 font-mono">#14</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    EASY
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Longest Common Prefix
                </h1>
                <div className="flex gap-2">
                  {['String', 'Trie'].map((tag) => (
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
                    {tc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Show Test Case Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowTestCase(!showTestCase)}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showTestCase ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showTestCase ? 'Hide' : 'Show'} Test Case Details
            </button>

            {showTestCase && (
              <div className="mt-4 bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 space-y-4">
                  {/* Input */}
                  <div>
                    <div className="text-cyan-400 font-mono text-sm mb-2">Input</div>
                    <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-slate-300 font-mono text-xs">strs = {JSON.stringify(testCase.input)}</pre>
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <div className="text-emerald-400 font-mono text-sm mb-2">Output</div>
                    <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-slate-300 font-mono text-xs">"{testCase.expected}"</pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <div className="text-orange-400 font-mono text-sm mb-2">Explanation</div>
                    <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                      {testCase.explanation.map((line, idx) => (
                        <pre key={idx} className="text-slate-400 font-mono text-xs">{line}</pre>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              Prev
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            >
              Next
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
                <span className="text-slate-500 font-mono text-xs">longest_common_prefix.py</span>
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
              {/* String Array Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-cyan-400 font-mono text-sm">Input Strings</span>
                </div>
                <div className="p-4 space-y-3">
                  {step.strings.map((str, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        step.currentStringIndex === idx
                          ? 'bg-orange-500/20 border border-orange-500/50 glow-orange'
                          : idx === 0 && step.currentStringIndex === null && step.highlightPrefix
                          ? 'bg-cyan-500/10 border border-cyan-500/30'
                          : 'bg-slate-800/50 border border-slate-700'
                      }`}
                    >
                      <span className="text-slate-500 font-mono text-sm w-8">
                        [{idx}]
                      </span>
                      <div className="flex font-mono text-lg">
                        {str.split('').map((char, charIdx) => {
                          const isInPrefix = charIdx < step.prefixLen
                          const isMatching = step.comparing && step.currentStringIndex === idx && isInPrefix
                          return (
                            <span
                              key={charIdx}
                              className={`px-1 py-0.5 rounded transition-all ${
                                isMatching
                                  ? step.highlightCompare === step.prefix
                                    ? 'bg-emerald-500/30 text-emerald-300'
                                    : 'bg-red-500/30 text-red-300'
                                  : isInPrefix && step.currentStringIndex === idx
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'text-slate-300'
                              }`}
                            >
                              {char}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Prefix */}
              <div className={`rounded-xl border p-4 transition-all duration-300 ${
                step.result !== null
                  ? step.result === ''
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30 glow-green'
                  : 'bg-slate-900/70 border-slate-700'
              }`}>
                <div className="text-sm font-mono mb-3 text-slate-400">CURRENT PREFIX</div>
                <div className="flex items-center gap-4">
                  <div className={`font-mono text-2xl px-4 py-2 rounded-lg ${
                    step.prefix
                      ? step.highlightPrefix
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-300'
                      : 'bg-slate-800 text-slate-600'
                  }`}>
                    {step.prefix ? `"${step.prefix}"` : '""'}
                  </div>
                  <div className="font-mono text-slate-500">
                    length: <span className="text-cyan-400">{step.prefixLen}</span>
                  </div>
                </div>
                {step.result !== null && (
                  <div className={`mt-4 font-mono text-lg ${step.result === '' ? 'text-red-400' : 'text-emerald-400'}`}>
                    Result: "{step.result}"
                  </div>
                )}
              </div>

              {/* Comparison Display */}
              {step.comparing && step.highlightCompare !== null && (
                <div className={`rounded-xl border p-4 ${
                  step.highlightCompare === step.prefix
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="text-sm font-mono mb-3 text-slate-400">COMPARING</div>
                  <div className="flex items-center gap-4 font-mono text-xl">
                    <span className="text-cyan-300">"{step.prefix}"</span>
                    <span className={step.highlightCompare === step.prefix ? 'text-emerald-400' : 'text-red-400'}>
                      {step.highlightCompare === step.prefix ? '==' : '!='}
                    </span>
                    <span className="text-orange-300">"{step.highlightCompare}"</span>
                  </div>
                </div>
              )}

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
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-slate-200 font-display font-semibold text-lg mb-4">Algorithm Insight</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-cyan-400 font-mono mb-2">Initial Prefix</h4>
                <p className="text-slate-400">
                  Start with the first string as the candidate prefix.
                  It will be trimmed down as we check each string.
                </p>
              </div>
              <div>
                <h4 className="text-orange-400 font-mono mb-2">Shrinking Strategy</h4>
                <p className="text-slate-400">
                  If prefix doesn't match, shrink by 1 character.
                  The common prefix can only get shorter, never longer.
                </p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-mono mb-2">Early Exit</h4>
                <p className="text-slate-400">
                  If prefix becomes empty, return immediately.
                  No need to check remaining strings.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm mt-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-mono mb-2">Time Complexity: O(n * m)</h4>
                <p className="text-slate-400">
                  n = number of strings, m = length of longest common prefix.
                  Compare each character until mismatch found.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-pink-400 font-mono mb-2">Space Complexity: O(len(strs[0]))</h4>
                <p className="text-slate-400">
                  Only store the prefix string, which starts as the first string
                  and shrinks as we find shorter common prefixes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
