import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/problems/decode-string')({
  component: DecodeStringVisualization,
})

interface CodeLine {
  num: number
  code: string
  indent: number
}

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
  stack: string[]
  variables: Variables
  inputIndex: number
  phase: string
  highlight?: number
  poppedValue?: string
  expanded?: boolean
  finalResult?: string
}

interface TestCase {
  input: string
  output: string
  description: string
}

const CODE_LINES: CodeLine[] = [
  { num: 1, code: 'def decodeString(self, s: str) -> str:', indent: 0 },
  { num: 2, code: '    stack = []', indent: 1 },
  { num: 3, code: '    for i in range(len(s)):', indent: 1 },
  { num: 4, code: '        if s[i] != "]":', indent: 2 },
  { num: 5, code: '            stack.append(s[i])', indent: 3 },
  { num: 6, code: '        else:', indent: 2 },
  { num: 7, code: '            substr = ""', indent: 3 },
  { num: 8, code: '            while stack[-1] != "[":', indent: 3 },
  { num: 9, code: '                substr = stack.pop() + substr', indent: 4 },
  { num: 10, code: '            stack.pop()', indent: 3 },
  { num: 11, code: '            k = ""', indent: 3 },
  { num: 12, code: '            while stack and stack[-1].isdigit():', indent: 3 },
  { num: 13, code: '                k = stack.pop() + k', indent: 4 },
  { num: 14, code: '            stack.append(int(k) * substr)', indent: 3 },
  { num: 15, code: '    return "".join(stack)', indent: 1 },
]

function generateSteps(input: string): Step[] {
  const steps: Step[] = []
  const stack: string[] = []
  
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
  const testCases: TestCase[] = [
    { input: '3[a]2[bc]', output: 'aaabcbc', description: 'Basic: two separate encoded sections' },
    { input: '3[a2[c]]', output: 'accaccacc', description: 'Nested: brackets inside brackets' },
    { input: '2[abc]3[cd]ef', output: 'abcabccdcdcdef', description: 'Mixed: encoded + plain text' },
  ]

  const [selectedCase, setSelectedCase] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed] = useState(1000)

  useEffect(() => {
    const newSteps = generateSteps(testCases[selectedCase].input)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const step = steps[currentStep] || {} as Step

  const getLineHighlightStyle = (lineNum: number) => {
    if (step.line === lineNum) {
      return 'code-highlight'
    }
    return ''
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
                  <span className="text-slate-500 font-mono">#394</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Decode String
                </h1>
                <div className="flex gap-2">
                  {['String', 'Stack', 'Recursion'].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Case Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-slate-500 font-mono text-sm">TEST CASE:</span>
              <div className="flex gap-2 flex-wrap">
                {testCases.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCase(idx)}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      selectedCase === idx
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    "{tc.input}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Test Case Info */}
          <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 font-mono text-sm">
              <span className="text-cyan-400">Input:</span> "{testCases[selectedCase].input}"
              <span className="mx-4 text-slate-600">→</span>
              <span className="text-emerald-400">Output:</span> "{testCases[selectedCase].output}"
            </p>
            <p className="text-slate-500 text-sm mt-1">{testCases[selectedCase].description}</p>
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column: Code + Variables */}
            <div className="space-y-6">
              {/* Code Panel */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-slate-500 font-mono text-xs">decode_string.py</span>
                </div>
                <div className="p-4 font-mono text-sm overflow-x-auto">
                  {CODE_LINES.map((line) => (
                    <div
                      key={line.num}
                      className={`flex py-0.5 rounded transition-all duration-200 ${getLineHighlightStyle(line.num)}`}
                    >
                      <span className="w-8 text-right pr-4 text-slate-600 select-none flex-shrink-0">
                        {line.num}
                      </span>
                      <code className={`whitespace-pre ${step.line === line.num ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {line.code || ' '}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variables Panel */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">VARIABLES</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {step.variables && Object.entries(step.variables).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg px-3 py-2">
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
            </div>

            {/* Right Column: Stack + Input + Explanation */}
            <div className="space-y-6">
              {/* Input String Visualization */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">INPUT STRING</span>
                </div>
                <div className="p-6">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {testCases[selectedCase].input.split('').map((char, idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono text-lg transition-all duration-300 ${
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
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
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
                  ← Bottom | Top →
                </div>
              </div>

              {/* Insight Panel */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                  <span className="text-slate-300 font-mono text-sm">CURRENT STEP</span>
                </div>
                <div className="p-6">
                  <p className="text-slate-200 font-display text-lg mb-3">{step.description}</p>
                  <p className="text-slate-400 font-display">{step.why}</p>

                  {step.finalResult && (
                    <div className="mt-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-emerald-400 font-mono text-lg">
                            Result: "{step.finalResult}"
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-slate-200 font-display font-semibold text-lg mb-4">Algorithm Insight</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-orange-400 font-mono mb-2">Stack Usage</h4>
                <p className="text-slate-400">
                  The stack naturally handles nested brackets. Inner brackets get decoded first (LIFO),
                  then their result participates in outer bracket decoding.
                </p>
              </div>
              <div>
                <h4 className="text-cyan-400 font-mono mb-2">Key Insight</h4>
                <p className="text-slate-400">
                  When we hit "]", we pop until "[", expand the substring, and push back.
                  This "in-place" expansion lets nested results participate in outer expansions.
                </p>
              </div>
              <div>
                <h4 className="text-purple-400 font-mono mb-2">Complexity</h4>
                <p className="text-slate-400">
                  Time: O(n × maxK) where n is input length and maxK is max repeat factor.
                  Space: O(n × maxK) for the stack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

