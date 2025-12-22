import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/add-two-numbers')({
  component: AddTwoNumbers,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`

const EXAMPLES: Array<Example> = [
  {
    input: 'l1 = [2,4,3], l2 = [5,6,4]',
    output: '[7,0,8]',
    explanation: '342 + 465 = 807',
  },
  {
    input: 'l1 = [0], l2 = [0]',
    output: '[0]',
  },
  {
    input: 'l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]',
    output: '[8,9,9,9,0,0,0,1]',
    explanation: '9999999 + 9999 = 10009998',
  },
]

const CONSTRAINTS = [
  'The number of nodes in each linked list is in the range [1, 100].',
  '0 <= Node.val <= 9',
  'It is guaranteed that the list represents a number that does not have leading zeros.',
]

interface TestCaseData {
  l1: Array<number>
  l2: Array<number>
  expected: Array<number>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  { id: 1, label: '342 + 465', data: { l1: [2, 4, 3], l2: [5, 6, 4], expected: [7, 0, 8] } },
  { id: 2, label: '0 + 0', data: { l1: [0], l2: [0], expected: [0] } },
  { id: 3, label: 'Different Lengths', data: { l1: [9, 9, 9, 9, 9, 9, 9], l2: [9, 9, 9, 9], expected: [8, 9, 9, 9, 0, 0, 0, 1] } },
  { id: 4, label: 'Carry at End', data: { l1: [2, 4, 3], l2: [5, 6, 7], expected: [7, 0, 1, 1] } },
]

interface Step {
  lineNumber: number
  description: string
  insight: string
  l1: Array<number>
  l2: Array<number>
  l1Pos: number | null
  l2Pos: number | null
  total: number
  carry: number
  num: number | null
  result: Array<number>
  phase: string
  dummyPos: number
}

function generateSteps(l1: Array<number>, l2: Array<number>): Array<Step> {
  const steps: Array<Step> = []
  const result: Array<number> = []
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

function AddTwoNumbers() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data.l1, testCase.data.l2), [testCase.data.l1, testCase.data.l2])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const getCarryColor = (carry: number) => {
    if (carry === 0) return 'bg-slate-700 text-slate-400'
    return 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
  }

  // Convert arrays to actual numbers for display
  const num1 = parseInt(testCase.data.l1.slice().reverse().join(''))
  const num2 = parseInt(testCase.data.l2.slice().reverse().join(''))
  const sum = num1 + num2

  // Visualization component specific to this problem
  const visualization = (
    <>
      {/* Math Display */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-2">The Math</h3>
        <div className="text-center font-mono text-lg">
          <span className="text-cyan-400">{num1}</span>
          <span className="text-slate-500 mx-2">+</span>
          <span className="text-orange-400">{num2}</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-emerald-400">{sum}</span>
        </div>
      </div>

      {/* Linked Lists Display */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-4">Linked Lists</h3>

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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-3">Variables</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">total</div>
            <div className="text-slate-200 font-mono text-2xl">{step.total}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-amber-400 text-xs mb-1">carry</div>
            <div className={`font-mono text-2xl px-2 py-1 rounded ${getCarryColor(step.carry)}`}>
              {step.carry}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-emerald-400 text-xs mb-1">num (digit)</div>
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-3">Key Formulas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-emerald-400 font-mono text-center">num = total % 10</div>
            <div className="text-slate-500 text-xs text-center mt-1">Extract single digit</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-amber-400 font-mono text-center">carry = total // 10</div>
            <div className="text-slate-500 text-xs text-center mt-1">Overflow to next position</div>
          </div>
        </div>
      </div>
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">Dummy Node Pattern</h4>
          <p className="text-slate-400">Use a dummy node to simplify list building - always append to dummy.next</p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Carry Management</h4>
          <p className="text-slate-400">Track carry between positions using integer division and modulo</p>
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
        number: '2',
        title: 'Add Two Numbers',
        difficulty: 'medium',
        tags: ['Linked List', 'Math', 'Recursion'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="add_two_numbers.py"
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
