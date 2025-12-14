import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/add-binary')({
  component: AddBinaryVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def addBinary(self, a: str, b: str) -> str:' },
  { num: 3, code: '        carry = 0' },
  { num: 4, code: '        res = []' },
  { num: 5, code: '' },
  { num: 6, code: '        idxA, idxB = len(a) - 1, len(b) - 1' },
  { num: 7, code: '' },
  { num: 8, code: '        while idxA >= 0 or idxB >= 0 or carry == 1:' },
  { num: 9, code: '            if idxA >= 0:' },
  { num: 10, code: '                carry += int(a[idxA])' },
  { num: 11, code: '                idxA -= 1' },
  { num: 12, code: '            if idxB >= 0:' },
  { num: 13, code: '                carry += int(b[idxB])' },
  { num: 14, code: '                idxB -= 1' },
  { num: 15, code: '' },
  { num: 16, code: '            res.append(str(carry % 2))' },
  { num: 17, code: '            carry = carry // 2' },
  { num: 18, code: '' },
  { num: 19, code: '        return "".join(res[::-1])' },
]

interface TestCase {
  id: number
  name: string
  a: string
  b: string
  expected: string
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'Simple',
    a: '11',
    b: '1',
    expected: '100',
  },
  {
    id: 2,
    name: 'Same Length',
    a: '1010',
    b: '1011',
    expected: '10101',
  },
  {
    id: 3,
    name: 'Carry Chain',
    a: '1111',
    b: '1111',
    expected: '11110',
  },
  {
    id: 4,
    name: 'Different Lengths',
    a: '100',
    b: '110010',
    expected: '110110',
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  a: string
  b: string
  idxA: number
  idxB: number
  carry: number
  res: string[]
  phase: string
  sumBeforeMod: number | null
  newDigit: string | null
  highlightIdxA: boolean
  highlightIdxB: boolean
}

function generateSteps(a: string, b: string): Step[] {
  const steps: Step[] = []
  let carry = 0
  const res: string[] = []
  let idxA = a.length - 1
  let idxB = b.length - 1

  // Line 2: Start function
  steps.push({
    lineNumber: 2,
    description: `addBinary("${a}", "${b}")`,
    insight: 'Add two binary strings from right to left, just like manual addition',
    a,
    b,
    idxA: a.length - 1,
    idxB: b.length - 1,
    carry: 0,
    res: [],
    phase: 'init',
    sumBeforeMod: null,
    newDigit: null,
    highlightIdxA: false,
    highlightIdxB: false,
  })

  // Line 3: carry = 0
  steps.push({
    lineNumber: 3,
    description: 'Initialize carry = 0',
    insight: 'Carry stores the overflow from adding bits (like carrying 1 in decimal)',
    a,
    b,
    idxA: a.length - 1,
    idxB: b.length - 1,
    carry: 0,
    res: [],
    phase: 'init',
    sumBeforeMod: null,
    newDigit: null,
    highlightIdxA: false,
    highlightIdxB: false,
  })

  // Line 4: res = []
  steps.push({
    lineNumber: 4,
    description: 'Initialize empty result array',
    insight: 'We build the result in reverse order (LSB first)',
    a,
    b,
    idxA: a.length - 1,
    idxB: b.length - 1,
    carry: 0,
    res: [],
    phase: 'init',
    sumBeforeMod: null,
    newDigit: null,
    highlightIdxA: false,
    highlightIdxB: false,
  })

  // Line 6: Initialize indices
  steps.push({
    lineNumber: 6,
    description: `idxA = ${a.length - 1}, idxB = ${b.length - 1}`,
    insight: 'Start from the rightmost (least significant) bits',
    a,
    b,
    idxA: a.length - 1,
    idxB: b.length - 1,
    carry: 0,
    res: [],
    phase: 'init',
    sumBeforeMod: null,
    newDigit: null,
    highlightIdxA: true,
    highlightIdxB: true,
  })

  // Main loop
  while (idxA >= 0 || idxB >= 0 || carry === 1) {
    // Line 8: While check
    const condition = `idxA(${idxA}) >= 0 OR idxB(${idxB}) >= 0 OR carry(${carry}) == 1`
    steps.push({
      lineNumber: 8,
      description: `Check: ${condition}`,
      insight: 'Continue while there are bits to process or carry remains',
      a,
      b,
      idxA,
      idxB,
      carry,
      res: [...res],
      phase: 'while-check',
      sumBeforeMod: null,
      newDigit: null,
      highlightIdxA: idxA >= 0,
      highlightIdxB: idxB >= 0,
    })

    let sumBefore = carry

    // Process a[idxA]
    if (idxA >= 0) {
      const digitA = parseInt(a[idxA])
      steps.push({
        lineNumber: 9,
        description: `Check: idxA(${idxA}) >= 0? Yes`,
        insight: 'Still have bits in string a to process',
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'check-a',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: true,
        highlightIdxB: false,
      })

      carry += digitA
      sumBefore = carry
      steps.push({
        lineNumber: 10,
        description: `carry += a[${idxA}] = carry += ${digitA} → carry = ${carry}`,
        insight: `Adding bit from a: ${digitA}`,
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'add-a',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: true,
        highlightIdxB: false,
      })

      idxA--
      steps.push({
        lineNumber: 11,
        description: `idxA -= 1 → idxA = ${idxA}`,
        insight: 'Move pointer left in string a',
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'move-a',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: idxA >= 0,
        highlightIdxB: false,
      })
    } else {
      steps.push({
        lineNumber: 9,
        description: `Check: idxA(${idxA}) >= 0? No, skip`,
        insight: 'No more bits in string a',
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'skip-a',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: false,
        highlightIdxB: false,
      })
    }

    // Process b[idxB]
    if (idxB >= 0) {
      const digitB = parseInt(b[idxB])
      steps.push({
        lineNumber: 12,
        description: `Check: idxB(${idxB}) >= 0? Yes`,
        insight: 'Still have bits in string b to process',
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'check-b',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: false,
        highlightIdxB: true,
      })

      carry += digitB
      sumBefore = carry
      steps.push({
        lineNumber: 13,
        description: `carry += b[${idxB}] = carry += ${digitB} → carry = ${carry}`,
        insight: `Adding bit from b: ${digitB}`,
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'add-b',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: false,
        highlightIdxB: true,
      })

      idxB--
      steps.push({
        lineNumber: 14,
        description: `idxB -= 1 → idxB = ${idxB}`,
        insight: 'Move pointer left in string b',
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'move-b',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: false,
        highlightIdxB: idxB >= 0,
      })
    } else {
      steps.push({
        lineNumber: 12,
        description: `Check: idxB(${idxB}) >= 0? No, skip`,
        insight: 'No more bits in string b',
        a,
        b,
        idxA,
        idxB,
        carry,
        res: [...res],
        phase: 'skip-b',
        sumBeforeMod: null,
        newDigit: null,
        highlightIdxA: false,
        highlightIdxB: false,
      })
    }

    // Compute result digit
    const newDigit = String(carry % 2)
    res.push(newDigit)
    steps.push({
      lineNumber: 16,
      description: `res.append(${carry} % 2) = res.append(${newDigit})`,
      insight: `Result bit = sum mod 2. Sum ${carry} in binary: LSB is ${newDigit}`,
      a,
      b,
      idxA,
      idxB,
      carry,
      res: [...res],
      phase: 'append-result',
      sumBeforeMod: carry,
      newDigit,
      highlightIdxA: false,
      highlightIdxB: false,
    })

    // Update carry
    const oldCarry = carry
    carry = Math.floor(carry / 2)
    steps.push({
      lineNumber: 17,
      description: `carry = ${oldCarry} // 2 = ${carry}`,
      insight: carry > 0 ? `Carry ${carry} to next position` : 'No carry for next position',
      a,
      b,
      idxA,
      idxB,
      carry,
      res: [...res],
      phase: 'update-carry',
      sumBeforeMod: null,
      newDigit: null,
      highlightIdxA: false,
      highlightIdxB: false,
    })
  }

  // Final while check (exits)
  steps.push({
    lineNumber: 8,
    description: `Check: idxA(${idxA}) >= 0 OR idxB(${idxB}) >= 0 OR carry(${carry}) == 1? No, exit loop`,
    insight: 'All bits processed and no carry remaining',
    a,
    b,
    idxA,
    idxB,
    carry,
    res: [...res],
    phase: 'while-exit',
    sumBeforeMod: null,
    newDigit: null,
    highlightIdxA: false,
    highlightIdxB: false,
  })

  // Return result
  const finalResult = res.slice().reverse().join('')
  steps.push({
    lineNumber: 19,
    description: `Return "${res.join('')}" reversed = "${finalResult}"`,
    insight: 'Reverse the result since we built it LSB-first',
    a,
    b,
    idxA,
    idxB,
    carry,
    res: [...res],
    phase: 'return',
    sumBeforeMod: null,
    newDigit: null,
    highlightIdxA: false,
    highlightIdxB: false,
  })

  return steps
}

function AddBinaryVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = useMemo(() => generateSteps(selectedTestCase.a, selectedTestCase.b), [selectedTestCase])
  const step = steps[currentStepIndex]

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))
  }

  const handleTestCaseChange = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setCurrentStepIndex(0)
  }

  // Pad strings for right-alignment
  const maxLen = Math.max(step.a.length, step.b.length, step.res.length)

  const getCarryColor = (carry: number) => {
    if (carry === 0) return 'bg-slate-700 text-slate-400'
    if (carry === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    if (carry === 2) return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    return 'bg-red-500/20 text-red-400 border-red-500/50'
  }

  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: '#0a1628' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }
        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-cyan-400 font-mono text-sm">#67</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                  Easy
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">
                Add Binary
              </h1>
            </div>
            <a
              href="/"
              className="text-slate-400 hover:text-slate-200 transition-colors font-display"
            >
              Back to Problems
            </a>
          </div>
        </div>
      </div>

      {/* Test Case Selector */}
      <div className="border-b border-slate-700/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-display">Test Case:</span>
            <div className="flex gap-2 flex-wrap">
              {TEST_CASES.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => handleTestCaseChange(tc)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedTestCase.id === tc.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Code Panel */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
              <h2 className="font-display font-semibold text-slate-200">Algorithm</h2>
            </div>
            <div className="p-4 font-mono text-sm overflow-auto max-h-[600px]">
              {CODE_LINES.map((line) => {
                const isActive = line.num === step.lineNumber
                return (
                  <div
                    key={line.num}
                    className={`flex transition-all duration-200 ${
                      isActive ? 'bg-cyan-500/10 -mx-4 px-4 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <span className={`w-8 text-right mr-4 select-none ${
                      isActive ? 'text-cyan-400' : 'text-slate-600'
                    }`}>
                      {line.num}
                    </span>
                    <pre className={`flex-1 ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {line.code || ' '}
                    </pre>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="space-y-4">
            {/* Binary Addition Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-6 blueprint-grid">
              <h3 className="font-display font-semibold text-slate-300 mb-4">Binary Addition</h3>

              {/* String A */}
              <div className="mb-2">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-cyan-400 font-mono text-sm mr-2">a:</span>
                  {step.a.padStart(maxLen, ' ').split('').map((char, idx) => {
                    const realIdx = idx - (maxLen - step.a.length)
                    const isHighlighted = step.highlightIdxA && realIdx === step.idxA
                    return (
                      <div
                        key={idx}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-lg transition-all ${
                          char === ' '
                            ? 'border-transparent'
                            : isHighlighted
                              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {char !== ' ' ? char : ''}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* String B */}
              <div className="mb-2">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-orange-400 font-mono text-sm mr-2">b:</span>
                  {step.b.padStart(maxLen, ' ').split('').map((char, idx) => {
                    const realIdx = idx - (maxLen - step.b.length)
                    const isHighlighted = step.highlightIdxB && realIdx === step.idxB
                    return (
                      <div
                        key={idx}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-lg transition-all ${
                          char === ' '
                            ? 'border-transparent'
                            : isHighlighted
                              ? 'bg-orange-500/30 border-orange-400 text-orange-200 ring-2 ring-orange-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {char !== ' ' ? char : ''}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Divider line */}
              <div className="flex justify-end mb-2">
                <div className="w-10 mr-2"></div>
                <div className="border-t-2 border-slate-600" style={{ width: `${maxLen * 44}px` }}></div>
              </div>

              {/* Result (reversed display) */}
              <div>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-emerald-400 font-mono text-sm mr-2">res:</span>
                  {(step.phase === 'return' ? step.res.slice().reverse() : step.res.slice().reverse())
                    .join('')
                    .padStart(maxLen, ' ')
                    .split('')
                    .map((char, idx) => {
                      const isNew = step.newDigit && idx === maxLen - step.res.length
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-lg transition-all ${
                            char === ' '
                              ? 'border-transparent'
                              : isNew
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse'
                                : 'bg-emerald-900/30 border-emerald-700 text-emerald-300'
                          }`}
                        >
                          {char !== ' ' ? char : ''}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Carry Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-slate-300">Carry</h3>
                <div className={`px-6 py-3 rounded-lg border-2 font-mono text-3xl font-bold transition-all ${getCarryColor(step.carry)}`}>
                  {step.carry}
                </div>
              </div>
              {step.sumBeforeMod !== null && (
                <div className="mt-3 text-center text-slate-400 font-mono text-sm">
                  Sum = {step.sumBeforeMod} → Result bit: {step.sumBeforeMod % 2}, New carry: {Math.floor(step.sumBeforeMod / 2)}
                </div>
              )}
            </div>

            {/* Variables Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Pointers</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-cyan-400 text-xs font-display mb-1">idxA</div>
                  <div className="text-slate-200 font-mono text-2xl">{step.idxA}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-orange-400 text-xs font-display mb-1">idxB</div>
                  <div className="text-slate-200 font-mono text-2xl">{step.idxB}</div>
                </div>
              </div>
            </div>

            {/* Result Array */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-slate-300">Result Array (building reversed)</h3>
                <span className="text-slate-500 font-mono text-sm">[{step.res.join(', ')}]</span>
              </div>
              {step.phase === 'return' && (
                <div className="text-emerald-400 font-mono">
                  Final: "{step.res.slice().reverse().join('')}" = {selectedTestCase.expected}
                </div>
              )}
            </div>

            {/* Insight Panel */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-4">
              <h3 className="font-display font-semibold text-purple-300 mb-2">Insight</h3>
              <p className="text-slate-300">{step.insight}</p>
            </div>

            {/* Complexity Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Complexity Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Time Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(max(m, n))</div>
                  <div className="text-slate-500 text-xs mt-1">Process each bit once</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Space Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(max(m, n))</div>
                  <div className="text-slate-500 text-xs mt-1">Result array size</div>
                </div>
              </div>
              <div className="text-slate-500 text-xs mt-2 text-center">
                where m = len(a), n = len(b)
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-300 font-display">{step.description}</p>
        </div>
      </div>
    </div>
  )
}
