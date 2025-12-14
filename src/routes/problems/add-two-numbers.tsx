import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/problems/add-two-numbers')({
  component: AddTwoNumbersVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:' },
  { num: 3, code: '        dummy = ListNode()' },
  { num: 4, code: '        res = dummy' },
  { num: 5, code: '' },
  { num: 6, code: '        total = carry = 0' },
  { num: 7, code: '' },
  { num: 8, code: '        while l1 or l2 or carry:' },
  { num: 9, code: '            total = carry' },
  { num: 10, code: '' },
  { num: 11, code: '            if l1:' },
  { num: 12, code: '                total += l1.val' },
  { num: 13, code: '                l1 = l1.next' },
  { num: 14, code: '            if l2:' },
  { num: 15, code: '                total += l2.val' },
  { num: 16, code: '                l2 = l2.next' },
  { num: 17, code: '' },
  { num: 18, code: '            num = total % 10' },
  { num: 19, code: '            carry = total // 10' },
  { num: 20, code: '            dummy.next = ListNode(num)' },
  { num: 21, code: '            dummy = dummy.next' },
  { num: 22, code: '' },
  { num: 23, code: '        return res.next' },
]

interface TestCase {
  id: number
  name: string
  l1: number[]
  l2: number[]
  expected: number[]
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: '342 + 465',
    l1: [2, 4, 3],
    l2: [5, 6, 4],
    expected: [7, 0, 8],
  },
  {
    id: 2,
    name: '0 + 0',
    l1: [0],
    l2: [0],
    expected: [0],
  },
  {
    id: 3,
    name: 'Different Lengths',
    l1: [9, 9, 9, 9, 9, 9, 9],
    l2: [9, 9, 9, 9],
    expected: [8, 9, 9, 9, 0, 0, 0, 1],
  },
  {
    id: 4,
    name: 'Carry at End',
    l1: [2, 4, 3],
    l2: [5, 6, 7],
    expected: [7, 0, 1, 1],
  },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  l1: number[]
  l2: number[]
  l1Pos: number | null
  l2Pos: number | null
  total: number
  carry: number
  num: number | null
  result: number[]
  phase: string
  dummyPos: number // Position in result where dummy points
}

function generateSteps(l1: number[], l2: number[]): Step[] {
  const steps: Step[] = []
  const result: number[] = []
  let carry = 0
  let l1Pos = 0
  let l2Pos = 0

  // Initialize
  steps.push({
    lineNumber: 2,
    description: `addTwoNumbers([${l1.join(',')}], [${l2.join(',')}])`,
    insight: 'Add two numbers represented as reversed linked lists',
    l1,
    l2,
    l1Pos: null,
    l2Pos: null,
    total: 0,
    carry: 0,
    num: null,
    result: [],
    phase: 'init',
    dummyPos: -1,
  })

  // Line 3: dummy = ListNode()
  steps.push({
    lineNumber: 3,
    description: 'Create dummy node',
    insight: 'Dummy node simplifies building the result list - we can always append to dummy.next',
    l1,
    l2,
    l1Pos: null,
    l2Pos: null,
    total: 0,
    carry: 0,
    num: null,
    result: [],
    phase: 'create-dummy',
    dummyPos: -1,
  })

  // Line 4: res = dummy
  steps.push({
    lineNumber: 4,
    description: 'res = dummy (save reference to start)',
    insight: 'We keep "res" pointing to dummy so we can return res.next at the end',
    l1,
    l2,
    l1Pos: null,
    l2Pos: null,
    total: 0,
    carry: 0,
    num: null,
    result: [],
    phase: 'save-res',
    dummyPos: -1,
  })

  // Line 6: total = carry = 0
  steps.push({
    lineNumber: 6,
    description: 'Initialize total = 0, carry = 0',
    insight: 'total accumulates sum at each position, carry stores overflow for next position',
    l1,
    l2,
    l1Pos: 0,
    l2Pos: 0,
    total: 0,
    carry: 0,
    num: null,
    result: [],
    phase: 'init-vars',
    dummyPos: -1,
  })

  // Main loop
  while (l1Pos < l1.length || l2Pos < l2.length || carry > 0) {
    const hasL1 = l1Pos < l1.length
    const hasL2 = l2Pos < l2.length
    const condition = `l1(${hasL1}) or l2(${hasL2}) or carry(${carry})`

    // Line 8: while check
    steps.push({
      lineNumber: 8,
      description: `Check: ${condition} → True`,
      insight: 'Continue while either list has nodes or we have a carry',
      l1,
      l2,
      l1Pos: hasL1 ? l1Pos : null,
      l2Pos: hasL2 ? l2Pos : null,
      total: 0,
      carry,
      num: null,
      result: [...result],
      phase: 'while-check',
      dummyPos: result.length - 1,
    })

    // Line 9: total = carry
    let total = carry
    steps.push({
      lineNumber: 9,
      description: `total = carry = ${carry}`,
      insight: 'Start with carry from previous iteration',
      l1,
      l2,
      l1Pos: hasL1 ? l1Pos : null,
      l2Pos: hasL2 ? l2Pos : null,
      total,
      carry,
      num: null,
      result: [...result],
      phase: 'set-total',
      dummyPos: result.length - 1,
    })

    // Line 11-13: if l1
    if (hasL1) {
      steps.push({
        lineNumber: 11,
        description: `l1 exists at position ${l1Pos}`,
        insight: `l1 still has nodes to process`,
        l1,
        l2,
        l1Pos,
        l2Pos: hasL2 ? l2Pos : null,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'check-l1',
        dummyPos: result.length - 1,
      })

      total += l1[l1Pos]
      steps.push({
        lineNumber: 12,
        description: `total += l1.val = ${total - l1[l1Pos]} + ${l1[l1Pos]} = ${total}`,
        insight: `Adding digit ${l1[l1Pos]} from first list`,
        l1,
        l2,
        l1Pos,
        l2Pos: hasL2 ? l2Pos : null,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'add-l1',
        dummyPos: result.length - 1,
      })

      l1Pos++
      steps.push({
        lineNumber: 13,
        description: `l1 = l1.next (move to position ${l1Pos})`,
        insight: 'Move pointer to next node in first list',
        l1,
        l2,
        l1Pos: l1Pos < l1.length ? l1Pos : null,
        l2Pos: hasL2 ? l2Pos : null,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'next-l1',
        dummyPos: result.length - 1,
      })
    } else {
      steps.push({
        lineNumber: 11,
        description: 'l1 is None (exhausted)',
        insight: 'First list has no more nodes',
        l1,
        l2,
        l1Pos: null,
        l2Pos: hasL2 ? l2Pos : null,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'no-l1',
        dummyPos: result.length - 1,
      })
    }

    // Line 14-16: if l2
    if (hasL2) {
      steps.push({
        lineNumber: 14,
        description: `l2 exists at position ${l2Pos}`,
        insight: `l2 still has nodes to process`,
        l1,
        l2,
        l1Pos: l1Pos < l1.length ? l1Pos : null,
        l2Pos,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'check-l2',
        dummyPos: result.length - 1,
      })

      total += l2[l2Pos]
      steps.push({
        lineNumber: 15,
        description: `total += l2.val = ${total - l2[l2Pos]} + ${l2[l2Pos]} = ${total}`,
        insight: `Adding digit ${l2[l2Pos]} from second list`,
        l1,
        l2,
        l1Pos: l1Pos < l1.length ? l1Pos : null,
        l2Pos,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'add-l2',
        dummyPos: result.length - 1,
      })

      l2Pos++
      steps.push({
        lineNumber: 16,
        description: `l2 = l2.next (move to position ${l2Pos})`,
        insight: 'Move pointer to next node in second list',
        l1,
        l2,
        l1Pos: l1Pos < l1.length ? l1Pos : null,
        l2Pos: l2Pos < l2.length ? l2Pos : null,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'next-l2',
        dummyPos: result.length - 1,
      })
    } else {
      steps.push({
        lineNumber: 14,
        description: 'l2 is None (exhausted)',
        insight: 'Second list has no more nodes',
        l1,
        l2,
        l1Pos: l1Pos < l1.length ? l1Pos : null,
        l2Pos: null,
        total,
        carry,
        num: null,
        result: [...result],
        phase: 'no-l2',
        dummyPos: result.length - 1,
      })
    }

    // Line 18: num = total % 10
    const num = total % 10
    steps.push({
      lineNumber: 18,
      description: `num = ${total} % 10 = ${num}`,
      insight: `Extract single digit using modulo. ${total} mod 10 = ${num}`,
      l1,
      l2,
      l1Pos: l1Pos < l1.length ? l1Pos : null,
      l2Pos: l2Pos < l2.length ? l2Pos : null,
      total,
      carry,
      num,
      result: [...result],
      phase: 'calc-num',
      dummyPos: result.length - 1,
    })

    // Line 19: carry = total // 10
    carry = Math.floor(total / 10)
    steps.push({
      lineNumber: 19,
      description: `carry = ${total} // 10 = ${carry}`,
      insight: carry > 0 ? `Carry ${carry} to next position` : 'No carry for next position',
      l1,
      l2,
      l1Pos: l1Pos < l1.length ? l1Pos : null,
      l2Pos: l2Pos < l2.length ? l2Pos : null,
      total,
      carry,
      num,
      result: [...result],
      phase: 'calc-carry',
      dummyPos: result.length - 1,
    })

    // Line 20: dummy.next = ListNode(num)
    result.push(num)
    steps.push({
      lineNumber: 20,
      description: `Create node with value ${num}, attach to dummy.next`,
      insight: `Adding ${num} to result list`,
      l1,
      l2,
      l1Pos: l1Pos < l1.length ? l1Pos : null,
      l2Pos: l2Pos < l2.length ? l2Pos : null,
      total,
      carry,
      num,
      result: [...result],
      phase: 'create-node',
      dummyPos: result.length - 2,
    })

    // Line 21: dummy = dummy.next
    steps.push({
      lineNumber: 21,
      description: 'dummy = dummy.next (move dummy pointer)',
      insight: 'Move dummy to the new node so we can append next node',
      l1,
      l2,
      l1Pos: l1Pos < l1.length ? l1Pos : null,
      l2Pos: l2Pos < l2.length ? l2Pos : null,
      total,
      carry,
      num,
      result: [...result],
      phase: 'move-dummy',
      dummyPos: result.length - 1,
    })
  }

  // Final while check (exits)
  steps.push({
    lineNumber: 8,
    description: 'l1(False) or l2(False) or carry(0) → False, exit loop',
    insight: 'Both lists exhausted and no carry remaining',
    l1,
    l2,
    l1Pos: null,
    l2Pos: null,
    total: 0,
    carry: 0,
    num: null,
    result: [...result],
    phase: 'while-exit',
    dummyPos: result.length - 1,
  })

  // Line 23: return res.next
  steps.push({
    lineNumber: 23,
    description: `return res.next → [${result.join(' → ')}]`,
    insight: 'Return the list starting after dummy node',
    l1,
    l2,
    l1Pos: null,
    l2Pos: null,
    total: 0,
    carry: 0,
    num: null,
    result: [...result],
    phase: 'return',
    dummyPos: result.length - 1,
  })

  return steps
}

// Linked list node component
function ListNode({
  value,
  isHighlighted,
  label,
  color = 'cyan',
}: {
  value: number
  isHighlighted: boolean
  label?: string
  color?: 'cyan' | 'orange' | 'emerald' | 'purple'
}) {
  const colors = {
    cyan: {
      bg: isHighlighted ? 'bg-cyan-500/30' : 'bg-slate-800',
      border: isHighlighted ? 'border-cyan-400' : 'border-slate-700',
      text: isHighlighted ? 'text-cyan-200' : 'text-slate-300',
      ring: isHighlighted ? 'ring-2 ring-cyan-400' : '',
    },
    orange: {
      bg: isHighlighted ? 'bg-orange-500/30' : 'bg-slate-800',
      border: isHighlighted ? 'border-orange-400' : 'border-slate-700',
      text: isHighlighted ? 'text-orange-200' : 'text-slate-300',
      ring: isHighlighted ? 'ring-2 ring-orange-400' : '',
    },
    emerald: {
      bg: isHighlighted ? 'bg-emerald-500/30' : 'bg-emerald-900/30',
      border: isHighlighted ? 'border-emerald-400' : 'border-emerald-700',
      text: isHighlighted ? 'text-emerald-200' : 'text-emerald-300',
      ring: isHighlighted ? 'ring-2 ring-emerald-400' : '',
    },
    purple: {
      bg: 'bg-purple-500/30',
      border: 'border-purple-400',
      text: 'text-purple-200',
      ring: '',
    },
  }

  const c = colors[color]

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        {label && <span className="text-slate-500 text-xs mb-1">{label}</span>}
        <div
          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-xl transition-all ${c.bg} ${c.border} ${c.text} ${c.ring}`}
        >
          {value}
        </div>
      </div>
      <div className="text-slate-600 mx-1">→</div>
    </div>
  )
}

function AddTwoNumbersVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = useMemo(
    () => generateSteps(selectedTestCase.l1, selectedTestCase.l2),
    [selectedTestCase]
  )
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

  // Convert arrays to actual numbers for display
  const num1 = parseInt(selectedTestCase.l1.slice().reverse().join(''))
  const num2 = parseInt(selectedTestCase.l2.slice().reverse().join(''))
  const sum = num1 + num2

  const getCarryColor = (carry: number) => {
    if (carry === 0) return 'bg-slate-700 text-slate-400'
    return 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
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
                <span className="text-cyan-400 font-mono text-sm">#2</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Medium
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-100">Add Two Numbers</h1>
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
                    <span
                      className={`w-8 text-right mr-4 select-none ${
                        isActive ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    >
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
            {/* Math Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-2">The Math</h3>
              <div className="text-center font-mono text-lg">
                <span className="text-cyan-400">{num1}</span>
                <span className="text-slate-500 mx-2">+</span>
                <span className="text-orange-400">{num2}</span>
                <span className="text-slate-500 mx-2">=</span>
                <span className="text-emerald-400">{sum}</span>
              </div>
            </div>

            {/* Linked Lists Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 blueprint-grid">
              <h3 className="font-display font-semibold text-slate-300 mb-4">Linked Lists</h3>

              {/* L1 */}
              <div className="mb-4">
                <div className="text-cyan-400 text-sm mb-2 font-mono">l1 (reversed {num1}):</div>
                <div className="flex items-center overflow-x-auto pb-2">
                  {step.l1.map((val, idx) => (
                    <ListNode
                      key={idx}
                      value={val}
                      isHighlighted={step.l1Pos === idx}
                      color="cyan"
                    />
                  ))}
                  <span className="text-slate-600 font-mono">None</span>
                </div>
              </div>

              {/* L2 */}
              <div className="mb-4">
                <div className="text-orange-400 text-sm mb-2 font-mono">l2 (reversed {num2}):</div>
                <div className="flex items-center overflow-x-auto pb-2">
                  {step.l2.map((val, idx) => (
                    <ListNode
                      key={idx}
                      value={val}
                      isHighlighted={step.l2Pos === idx}
                      color="orange"
                    />
                  ))}
                  <span className="text-slate-600 font-mono">None</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700 my-4"></div>

              {/* Result */}
              <div>
                <div className="text-emerald-400 text-sm mb-2 font-mono">
                  Result (reversed {parseInt(step.result.slice().reverse().join('')) || 0}):
                </div>
                <div className="flex items-center overflow-x-auto pb-2">
                  <div className="flex items-center">
                    <div className="flex flex-col items-center">
                      <span className="text-purple-400 text-xs mb-1">res↓</span>
                      <div className="w-10 h-10 rounded-lg border-2 border-dashed border-purple-500/50 flex items-center justify-center font-mono text-slate-500">
                        D
                      </div>
                    </div>
                    <div className="text-slate-600 mx-1">→</div>
                  </div>
                  {step.result.map((val, idx) => (
                    <ListNode
                      key={idx}
                      value={val}
                      isHighlighted={step.dummyPos === idx}
                      label={step.dummyPos === idx ? 'dummy↓' : undefined}
                      color="emerald"
                    />
                  ))}
                  <span className="text-slate-600 font-mono">None</span>
                </div>
              </div>
            </div>

            {/* Variables Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Variables</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">total</div>
                  <div className="text-slate-200 font-mono text-2xl">{step.total}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-amber-400 text-xs font-display mb-1">carry</div>
                  <div className={`font-mono text-2xl px-2 py-1 rounded ${getCarryColor(step.carry)}`}>
                    {step.carry}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-emerald-400 text-xs font-display mb-1">num (digit)</div>
                  <div className="text-slate-200 font-mono text-2xl">{step.num ?? '-'}</div>
                </div>
              </div>
              {step.num !== null && step.total >= 10 && (
                <div className="mt-3 text-center text-slate-400 font-mono text-sm">
                  {step.total} = <span className="text-emerald-400">{step.num}</span> (digit) +
                  <span className="text-amber-400"> {Math.floor(step.total / 10)}</span> (carry) × 10
                </div>
              )}
            </div>

            {/* Key Formulas */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Key Formulas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-emerald-400 font-mono text-center">num = total % 10</div>
                  <div className="text-slate-500 text-xs text-center mt-1">Extract single digit</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-amber-400 font-mono text-center">carry = total // 10</div>
                  <div className="text-slate-500 text-xs text-center mt-1">Overflow to next position</div>
                </div>
              </div>
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
                  <div className="text-slate-500 text-xs mt-1">Visit each node once</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Space Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(max(m, n))</div>
                  <div className="text-slate-500 text-xs mt-1">Result list size</div>
                </div>
              </div>
              <div className="text-slate-500 text-xs mt-2 text-center">
                m = len(l1), n = len(l2)
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
