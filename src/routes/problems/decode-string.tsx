import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

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
  const [speed, setSpeed] = useState(1000)

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
      return 'bg-amber-400/30 border-l-4 border-amber-400'
    }
    return 'border-l-4 border-transparent'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-code { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
        }
        
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .stack-item { animation: slideIn 0.3s ease-out; }
        .highlight-item { animation: pulse-glow 1s ease-in-out infinite; }
        .pop-animation { animation: pop 0.3s ease-out; }
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(71, 85, 105, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors mb-6 font-display group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Problems</span>
        </Link>

        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            394. Decode String
          </h1>
          <p className="text-slate-400 font-display">
            Stack-based string decoding visualization
          </p>
        </header>

        {/* Test Case Selector */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {testCases.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCase(idx)}
              className={`px-4 py-2 rounded-lg font-code text-sm transition-all duration-200 ${
                selectedCase === idx
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              "{tc.input}"
            </button>
          ))}
        </div>

        {/* Selected Test Case Info */}
        <div className="mb-6 text-center">
          <div className="inline-block bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <span className="text-slate-400">Input:</span>{' '}
            <span className="text-amber-400 font-semibold">"{testCases[selectedCase].input}"</span>
            <span className="mx-4 text-slate-600">→</span>
            <span className="text-slate-400">Output:</span>{' '}
            <span className="text-emerald-400 font-semibold">"{testCases[selectedCase].output}"</span>
            <div className="text-slate-500 text-sm mt-1">{testCases[selectedCase].description}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setCurrentStep(0)}
            disabled={currentStep === 0}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Reset"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-4 rounded-xl transition-all ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep >= steps.length - 1}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            disabled={currentStep >= steps.length - 1}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="End"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-slate-500 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
              className="w-24 accent-amber-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 px-4">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="text-center text-slate-500 text-sm mt-2">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Code + Variables */}
          <div className="space-y-6">
            {/* Code Panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-slate-400 text-sm ml-2 font-display">decode_string.py</span>
              </div>
              <div className="p-4 font-code text-sm overflow-x-auto">
                {CODE_LINES.map((line) => (
                  <div
                    key={line.num}
                    className={`flex transition-all duration-200 rounded ${getLineHighlightStyle(line.num)}`}
                  >
                    <span className="w-8 text-right pr-3 text-slate-600 select-none flex-shrink-0">
                      {line.num}
                    </span>
                    <pre className="flex-1">
                      <code className={step.line === line.num ? 'text-amber-200' : 'text-slate-300'}>
                        {line.code}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Variables Panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <span className="text-slate-300 font-display font-semibold">📊 Variables</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {step.variables && Object.entries(step.variables).map(([key, value]) => (
                  <div key={key} className="bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="text-slate-500 text-xs uppercase tracking-wide">{key}</div>
                    <div className="text-amber-400 font-code text-sm truncate" title={String(value)}>
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
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <span className="text-slate-300 font-display font-semibold">🔤 Input String</span>
              </div>
              <div className="p-4">
                <div className="flex gap-1 flex-wrap justify-center">
                  {testCases[selectedCase].input.split('').map((char, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-code font-bold transition-all duration-200 ${
                        step.inputIndex === idx
                          ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/50'
                          : step.inputIndex !== undefined && step.inputIndex > idx
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                {step.inputIndex >= 0 && (
                  <div className="text-center mt-3 text-slate-500 text-sm">
                    ↑ Current position: index {step.inputIndex}
                  </div>
                )}
              </div>
            </div>

            {/* Stack Visualization */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden grid-bg">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                <span className="text-slate-300 font-display font-semibold">📚 Stack</span>
                <span className="text-slate-500 text-sm">
                  {step.stack?.length || 0} item{(step.stack?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-4 min-h-[200px] flex flex-col justify-end">
                {step.stack && step.stack.length > 0 ? (
                  <div className="flex flex-col-reverse gap-2">
                    {step.stack.map((item, idx) => (
                      <div
                        key={idx}
                        className={`stack-item px-4 py-2 rounded-lg font-code text-center transition-all ${
                          step.highlight === idx
                            ? 'highlight-item bg-amber-500/20 border-2 border-amber-500 text-amber-300'
                            : step.expanded && idx === step.stack.length - 1
                              ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300'
                              : 'bg-slate-800 border border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-slate-600 text-xs mr-2">[{idx}]</span>
                        "{item}"
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-600 text-center italic">Stack is empty</div>
                )}
                
                {step.poppedValue && (
                  <div className="mt-4 text-center">
                    <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm pop-animation">
                      Popped: "{step.poppedValue}"
                    </span>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/50 text-center text-slate-600 text-xs">
                ← Bottom | Top →
              </div>
            </div>

            {/* Explanation Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-amber-400 font-display font-semibold">💡 What's Happening</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-slate-200 font-display text-lg">
                  {step.description}
                </div>
                <div className="text-slate-400 text-sm leading-relaxed border-l-2 border-amber-500/50 pl-3">
                  <span className="text-amber-400 font-semibold">Why: </span>
                  {step.why}
                </div>
                
                {step.finalResult && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                    <div className="text-emerald-400 font-display font-bold text-xl">
                      ✅ Final Result
                    </div>
                    <div className="text-emerald-300 font-code text-2xl mt-2">
                      "{step.finalResult}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-8 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          <h2 className="font-display text-xl font-bold text-amber-400 mb-4">🧠 Algorithm Insight</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-amber-400 font-semibold mb-2">Stack Usage</div>
              <p className="text-slate-400">
                The stack naturally handles nested brackets. Inner brackets get decoded first (LIFO),
                then their result participates in outer bracket decoding.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-amber-400 font-semibold mb-2">Key Insight</div>
              <p className="text-slate-400">
                When we hit "]", we pop until "[", expand the substring, and push back.
                This "in-place" expansion lets nested results participate in outer expansions.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-purple-400 font-semibold mb-2">Time Complexity: O(n × maxK)</div>
              <p className="text-slate-400">
                Where n is input length and maxK is the maximum repeat factor.
                Each character is pushed/popped at most once per nesting level.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-pink-400 font-semibold mb-2">Space Complexity: O(n × maxK)</div>
              <p className="text-slate-400">
                Stack stores the decoded string which can be up to n × maxK characters
                in the worst case of deeply nested patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

