import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/decode-string')({
  component: DecodeStringVisualization,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'def decodeString(self, s: str) -> str:' },
  { num: 2, code: '    stack = []' },
  { num: 3, code: '    for i in range(len(s)):' },
  { num: 4, code: '        if s[i] != "]":' },
  { num: 5, code: '            stack.append(s[i])' },
  { num: 6, code: '        else:' },
  { num: 7, code: '            substr = ""' },
  { num: 8, code: '            while stack[-1] != "[":' },
  { num: 9, code: '                substr = stack.pop() + substr' },
  { num: 10, code: '            stack.pop()' },
  { num: 11, code: '            k = ""' },
  { num: 12, code: '            while stack and stack[-1].isdigit():' },
  { num: 13, code: '                k = stack.pop() + k' },
  { num: 14, code: '            stack.append(int(k) * substr)' },
  { num: 15, code: '    return "".join(stack)' },
]

const PROBLEM_DESCRIPTION = `Given an encoded string, return its decoded string.

The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times. Note that k is guaranteed to be a positive integer.

You may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc. Furthermore, you may assume that the original data does not contain any digits and that digits are only for those repeat numbers, k. For example, there will not be input like 3a or 2[4].

The test cases are generated so that the length of the output will never exceed 10^5.`

const EXAMPLES: Array<Example> = [
  {
    input: 's = "3[a]2[bc]"',
    output: '"aaabcbc"',
    explanation: 'Two separate encoded sections: "a" repeated 3 times, then "bc" repeated 2 times.',
  },
  {
    input: 's = "3[a2[c]]"',
    output: '"accaccacc"',
    explanation: 'Nested encoding: "c" repeated 2 times becomes "cc", then "acc" repeated 3 times.',
  },
  {
    input: 's = "2[abc]3[cd]ef"',
    output: '"abcabccdcdcdef"',
    explanation: 'Mixed encoded and plain text sections.',
  },
]

const CONSTRAINTS = [
  '1 <= s.length <= 30',
  's consists of lowercase English letters, digits, and square brackets \'[]\' ',
  's is guaranteed to be a valid input',
  'All the integers in s are in the range [1, 300]',
]

interface Variables {
  s?: string
  i?: number | string
  'current char'?: string
  substr?: string
  k?: string
  result?: string
}

interface Step {
  line: number
  description: string
  why: string
  stack: Array<string>
  variables: Variables
  inputIndex: number
  phase: string
  highlight?: number
  poppedValue?: string
  expanded?: boolean
  finalResult?: string
}

interface TestCaseData {
  input: string
  output: string
  description: string
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: '3[a]2[bc]', data: { input: '3[a]2[bc]', output: 'aaabcbc', description: 'Basic: two separate encoded sections' } },
  { id: 2, label: '3[a2[c]]', data: { input: '3[a2[c]]', output: 'accaccacc', description: 'Nested: brackets inside brackets' } },
  { id: 3, label: '2[abc]3[cd]ef', data: { input: '2[abc]3[cd]ef', output: 'abcabccdcdcdef', description: 'Mixed: encoded + plain text' } },
]

function generateSteps(input: string): Array<Step> {
  const steps: Array<Step> = []
  const stack: Array<string> = []

  steps.push({
    line: 2,
    description: "Initialize an empty stack",
    why: "The stack will store characters and intermediate results. It's the key data structure that handles nested brackets by naturally managing the 'last in, first out' order.",
    stack: [],
    variables: { s: input, i: '-', 'current char': '-', substr: '-', k: '-' },
    inputIndex: -1,
    phase: 'init'
  })

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    steps.push({
      line: 3,
      description: `Loop iteration: i = ${i}`,
      why: `We process the string character by character. Currently looking at index ${i}.`,
      stack: [...stack],
      variables: { s: input, i: i, 'current char': char, substr: '-', k: '-' },
      inputIndex: i,
      phase: 'loop-start'
    })

    steps.push({
      line: 4,
      description: `Check if s[${i}] = "${char}" is not "]"`,
      why: `The closing bracket "]" is special - it triggers the decoding process. All other characters get pushed to the stack.`,
      stack: [...stack],
      variables: { s: input, i: i, 'current char': char, substr: '-', k: '-' },
      inputIndex: i,
      phase: 'check-bracket'
    })

    if (char !== ']') {
      stack.push(char)
      steps.push({
        line: 5,
        description: `Push "${char}" onto stack`,
        why: char.match(/\d/)
          ? `"${char}" is a digit - it will be used as the repeat count later.`
          : char === '['
            ? `"[" marks the start of an encoded section. It acts as a delimiter when we pop later.`
            : `"${char}" is a letter - it's part of the string to be repeated.`,
        stack: [...stack],
        variables: { s: input, i: i, 'current char': char, substr: '-', k: '-' },
        inputIndex: i,
        phase: 'push',
        highlight: stack.length - 1
      })
    } else {
      steps.push({
        line: 6,
        description: `Found "]" - time to decode!`,
        why: `When we hit "]", we need to: 1) Extract the substring inside brackets, 2) Find the repeat count, 3) Expand and push back.`,
        stack: [...stack],
        variables: { s: input, i: i, 'current char': char, substr: '-', k: '-' },
        inputIndex: i,
        phase: 'else'
      })

      let substr = ""
      steps.push({
        line: 7,
        description: `Initialize substr = ""`,
        why: `This will accumulate the characters between "[" and "]" that need to be repeated.`,
        stack: [...stack],
        variables: { s: input, i: i, 'current char': char, substr: '""', k: '-' },
        inputIndex: i,
        phase: 'init-substr'
      })

      while (stack.length > 0 && stack[stack.length - 1] !== '[') {
        steps.push({
          line: 8,
          description: `Check: stack[-1] = "${stack[stack.length - 1]}" != "["`,
          why: `We keep popping until we find "[", which marks where this encoded section started.`,
          stack: [...stack],
          variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: '-' },
          inputIndex: i,
          phase: 'while-substr',
          highlight: stack.length - 1
        })

        const popped = stack.pop()!
        substr = popped + substr
        steps.push({
          line: 9,
          description: `Pop "${popped}" and prepend to substr`,
          why: `We prepend (not append) because we're building the string backwards as we pop from the stack.`,
          stack: [...stack],
          variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: '-' },
          inputIndex: i,
          phase: 'pop-substr',
          poppedValue: popped
        })
      }

      stack.pop()
      steps.push({
        line: 10,
        description: `Pop the "[" delimiter`,
        why: `The "[" was just a marker - we don't need it in our result. Discard it.`,
        stack: [...stack],
        variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: '-' },
        inputIndex: i,
        phase: 'pop-bracket',
        poppedValue: '['
      })

      let k = ""
      steps.push({
        line: 11,
        description: `Initialize k = ""`,
        why: `k will store the repeat count. It might be multiple digits (e.g., "12" for 12 repetitions).`,
        stack: [...stack],
        variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: '""' },
        inputIndex: i,
        phase: 'init-k'
      })

      while (stack.length > 0 && /\d/.test(stack[stack.length - 1])) {
        steps.push({
          line: 12,
          description: `Check: stack[-1] = "${stack[stack.length - 1]}" is a digit`,
          why: `Numbers can be multi-digit, so we collect all consecutive digits before the "[".`,
          stack: [...stack],
          variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: `"${k}"` },
          inputIndex: i,
          phase: 'while-k',
          highlight: stack.length - 1
        })

        const digit = stack.pop()!
        k = digit + k
        steps.push({
          line: 13,
          description: `Pop "${digit}" and prepend to k`,
          why: `Again, prepending because we're reading digits in reverse order from the stack.`,
          stack: [...stack],
          variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: `"${k}"` },
          inputIndex: i,
          phase: 'pop-k',
          poppedValue: digit
        })
      }

      const expanded = substr.repeat(parseInt(k))
      stack.push(expanded)
      steps.push({
        line: 14,
        description: `Push ${k} × "${substr}" = "${expanded}"`,
        why: `This is the magic! We repeat the substring k times and push the result back. If there are nested brackets, this expanded string might get repeated again later!`,
        stack: [...stack],
        variables: { s: input, i: i, 'current char': char, substr: `"${substr}"`, k: k },
        inputIndex: i,
        phase: 'push-expanded',
        highlight: stack.length - 1,
        expanded: true
      })
    }
  }

  const result = stack.join('')
  steps.push({
    line: 15,
    description: `Join stack and return: "${result}"`,
    why: `All encoded sections have been expanded. The stack now contains the final decoded pieces - just concatenate them!`,
    stack: [...stack],
    variables: { s: input, result: result },
    inputIndex: -1,
    phase: 'return',
    finalResult: result
  })

  return steps
}

function DecodeStringVisualization() {
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
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }

        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.6); }
        }

        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .stack-item { animation: slideIn 0.3s ease-out; }
        .highlight-item { animation: pulse-glow 1s ease-in-out infinite; }
        .pop-animation { animation: pop 0.3s ease-out; }
      `}</style>

      {/* Input String Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">INPUT STRING</span>
        </div>
        <div className="p-4">
          <div className="flex gap-2 flex-wrap justify-center">
            {testCase.data.input.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm transition-all duration-300 ${
                  step.inputIndex === idx
                    ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 glow-cyan'
                    : step.inputIndex !== undefined && step.inputIndex > idx
                      ? 'bg-slate-700 text-slate-500'
                      : 'bg-slate-800 border border-slate-600 text-slate-300'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
          {step.inputIndex >= 0 && (
            <div className="text-center mt-3 text-slate-500 text-sm font-mono">
              Current index: {step.inputIndex}
            </div>
          )}
        </div>
      </div>

      {/* Stack Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">STACK</span>
          <span className="text-slate-500 text-sm font-mono">
            {step.stack?.length || 0} item{(step.stack?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-4 min-h-[200px] flex flex-col justify-end">
          {step.stack && step.stack.length > 0 ? (
            <div className="flex flex-col-reverse gap-2">
              {step.stack.map((item, idx) => (
                <div
                  key={idx}
                  className={`stack-item px-4 py-2 rounded-lg font-mono text-center transition-all ${
                    step.highlight === idx
                      ? 'highlight-item bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300'
                      : step.expanded && idx === step.stack.length - 1
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 glow-green'
                        : 'bg-slate-800 border border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 text-xs mr-2">[{idx}]</span>
                  "{item}"
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-600 text-center italic font-mono">Stack is empty</div>
          )}

          {step.poppedValue && (
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm pop-animation font-mono">
                Popped: "{step.poppedValue}"
              </span>
            </div>
          )}
        </div>
        <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/50 text-center text-slate-600 text-xs font-mono">
          Bottom | Top
        </div>
      </div>

      {/* Variables Panel */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">VARIABLES</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {step.variables && Object.entries(step.variables).map(([key, value]) => (
            <div key={key} className="bg-slate-900/50 rounded-lg px-3 py-2">
              <div className="text-slate-500 text-xs uppercase tracking-wide">{key}</div>
              <div className="text-cyan-400 font-mono text-sm truncate" title={String(value)}>
                {typeof value === 'string' && value.length > 20
                  ? value.slice(0, 20) + '...'
                  : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Result */}
      {step.finalResult && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-emerald-400 font-mono text-sm">
                Result: "{step.finalResult}"
              </div>
              <div className="text-slate-500 font-mono text-xs">
                Expected: "{testCase.data.output}"
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
          <h4 className="text-orange-400 font-mono mb-1">Stack Usage</h4>
          <p className="text-slate-400">
            The stack naturally handles nested brackets. Inner brackets get decoded first (LIFO),
            then their result participates in outer bracket decoding.
          </p>
        </div>
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Key Insight</h4>
          <p className="text-slate-400">
            When we hit "]", we pop until "[", expand the substring, and push back.
            This "in-place" expansion lets nested results participate in outer expansions.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n × maxK)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(n × maxK)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '394',
        title: 'Decode String',
        difficulty: 'medium',
        tags: ['String', 'Stack', 'Recursion'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="decode_string.py"
      activeLineNumber={step.line}
      visualization={visualization}
      currentStep={{
        description: step.description,
        insight: step.why,
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
