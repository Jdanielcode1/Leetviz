import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/longest-common-prefix')({
  component: LongestCommonPrefix,
})

const CODE_LINES: Array<CodeLine> = [
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

const EXAMPLES: Array<Example> = [
  {
    input: 'strs = ["flower","flow","flight"]',
    output: '"fl"',
    explanation: 'The longest common prefix is "fl".',
  },
  {
    input: 'strs = ["dog","racecar","car"]',
    output: '""',
    explanation: 'There is no common prefix among the input strings.',
  },
]

const CONSTRAINTS = [
  '1 <= strs.length <= 200',
  '0 <= strs[i].length <= 200',
  'strs[i] consists of only lowercase English letters.',
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  strings: Array<string>
  prefix: string
  prefixLen: number
  currentStringIndex: number | null
  highlightPrefix: boolean
  highlightCompare: string | null
  result: string | null
  comparing: boolean
}

interface TestCaseData {
  input: Array<string>
  expected: string
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Common prefix exists',
    data: {
      input: ['flower', 'flow', 'flight'],
      expected: 'fl',
    },
  },
  {
    id: 2,
    label: 'No common prefix',
    data: {
      input: ['dog', 'racecar', 'car'],
      expected: '',
    },
  },
]

function generateSteps(input: Array<string>): Array<Step> {
  const steps: Array<Step> = []
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

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.input), [testCase.data.input])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
      `}</style>

      {/* String Array Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
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
          : 'bg-slate-800/50 border-slate-700'
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Initial Prefix</h4>
          <p className="text-slate-400">
            Start with the first string as the candidate prefix.
            It will be trimmed down as we check each string.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Shrinking Strategy</h4>
          <p className="text-slate-400">
            If prefix doesn't match, shrink by 1 character.
            The common prefix can only get shorter, never longer.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">Early Exit</h4>
          <p className="text-slate-400">
            If prefix becomes empty, return immediately.
            No need to check remaining strings.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n * m)</span>
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
        number: '14',
        title: 'Longest Common Prefix',
        difficulty: 'easy',
        tags: ['String', 'Trie'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="longest_common_prefix.py"
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
