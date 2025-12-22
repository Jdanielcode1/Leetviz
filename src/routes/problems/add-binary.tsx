import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/add-binary')({
  component: AddBinaryVisualization,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `Given two binary strings a and b, return their sum as a binary string.`

const EXAMPLES: Array<Example> = [
  {
    input: 'a = "11", b = "1"',
    output: '"100"',
    explanation: 'In binary: 11 (3 in decimal) + 1 (1 in decimal) = 100 (4 in decimal)',
  },
  {
    input: 'a = "1010", b = "1011"',
    output: '"10101"',
    explanation: 'In binary: 1010 (10 in decimal) + 1011 (11 in decimal) = 10101 (21 in decimal)',
  },
]

const CONSTRAINTS = [
  '1 <= a.length, b.length <= 10^4',
  'a and b consist only of \'0\' or \'1\' characters',
  'Each string does not contain leading zeros except for the zero itself',
]

interface TestCaseData {
  a: string
  b: string
  expected: string
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Simple',
    data: {
      a: '11',
      b: '1',
      expected: '100',
    },
  },
  {
    id: 2,
    label: 'Same Length',
    data: {
      a: '1010',
      b: '1011',
      expected: '10101',
    },
  },
  {
    id: 3,
    label: 'Carry Chain',
    data: {
      a: '1111',
      b: '1111',
      expected: '11110',
    },
  },
  {
    id: 4,
    label: 'Different Lengths',
    data: {
      a: '100',
      b: '110010',
      expected: '110110',
    },
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
  res: Array<string>
  phase: string
  sumBeforeMod: number | null
  newDigit: string | null
  highlightIdxA: boolean
  highlightIdxB: boolean
}

function generateSteps(a: string, b: string): Array<Step> {
  const steps: Array<Step> = []
  let carry = 0
  const res: Array<string> = []
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
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.a, testCase.data.b), [testCase.data.a, testCase.data.b])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Pad strings for right-alignment
  const maxLen = Math.max(step.a.length, step.b.length, step.res.length)

  const getCarryColor = (carry: number) => {
    if (carry === 0) return 'bg-slate-700 text-slate-400'
    if (carry === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    if (carry === 2) return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    return 'bg-red-500/20 text-red-400 border-red-500/50'
  }

  const visualization = (
    <>
      {/* Binary Addition Display */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-slate-300 font-mono text-sm mb-4">Binary Addition</h3>

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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-300 font-mono text-sm">Carry</h3>
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-3">Pointers</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-cyan-400 text-xs font-mono mb-1">idxA</div>
            <div className="text-slate-200 font-mono text-2xl">{step.idxA}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-orange-400 text-xs font-mono mb-1">idxB</div>
            <div className="text-slate-200 font-mono text-2xl">{step.idxB}</div>
          </div>
        </div>
      </div>

      {/* Result Array */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-300 font-mono text-sm">Result Array (building reversed)</h3>
          <span className="text-slate-500 font-mono text-sm">[{step.res.join(', ')}]</span>
        </div>
        {step.phase === 'return' && (
          <div className="text-emerald-400 font-mono">
            Final: "{step.res.slice().reverse().join('')}" = {testCase.data.expected}
          </div>
        )}
      </div>
    </>
  )

  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Right-to-Left Addition</h4>
          <p className="text-slate-400">Process bits from least significant to most significant, just like manual addition.</p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Carry Propagation</h4>
          <p className="text-slate-400">Track carry bit and propagate it to the next position (carry // 2).</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(max(m, n))</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(max(m, n))</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '67',
        title: 'Add Binary',
        difficulty: 'easy',
        tags: ['Math', 'String', 'Bit Manipulation'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="add_binary.py"
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
