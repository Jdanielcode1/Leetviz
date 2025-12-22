import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/validate-bst')({
  component: ValidateBSTVisualization,
})

interface TreeNode {
  val: number
  left: number | null
  right: number | null
}

interface NodePosition {
  x: number
  y: number
}

type NodeStatus = 'unchecked' | 'checking' | 'valid' | 'invalid'

interface CallStackItem {
  nodeIndex: number | null
  nodeVal: number | string
  min: string
  max: string
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  currentNodeIndex: number | null
  nodeStatuses: Record<number, NodeStatus>
  currentRange: { min: string; max: string }
  callStack: Array<CallStackItem>
  phase: string
  returnValue: boolean | null
}

interface TestCaseData {
  nodes: Array<TreeNode>
  expected: boolean
}

const PROBLEM_DESCRIPTION = `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
• The left subtree of a node contains only nodes with keys strictly less than the node's key.
• The right subtree of a node contains only nodes with keys strictly greater than the node's key.
• Both the left and right subtrees must also be binary search trees.`

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Solution:' },
  { num: 2, code: '    def isValidBST(self, root: Optional[TreeNode]) -> bool:' },
  { num: 3, code: '        def valid(node, minimum, maximum):' },
  { num: 4, code: '            if not node:' },
  { num: 5, code: '                return True' },
  { num: 6, code: '' },
  { num: 7, code: '            if not (node.val > minimum and node.val < maximum):' },
  { num: 8, code: '                return False' },
  { num: 9, code: '' },
  { num: 10, code: '            return (valid(node.left, minimum, node.val) and' },
  { num: 11, code: '                    valid(node.right, node.val, maximum))' },
  { num: 12, code: '' },
  { num: 13, code: '        return valid(root, float("-inf"), float("inf"))' },
]

const EXAMPLES: Array<Example> = [
  {
    input: 'root = [2,1,3]',
    output: 'true',
    explanation: 'The tree is a valid BST where all left values are less than root, and all right values are greater.',
  },
  {
    input: 'root = [5,1,4,null,null,3,6]',
    output: 'false',
    explanation: 'The root node\'s value is 5 but its right child\'s value is 4, which violates the BST property.',
  },
]

const CONSTRAINTS = [
  'The number of nodes in the tree is in the range [1, 10^4]',
  '-2^31 <= Node.val <= 2^31 - 1',
]

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Valid BST',
    data: {
      nodes: [
        { val: 2, left: 1, right: 2 },
        { val: 1, left: null, right: null },
        { val: 3, left: null, right: null },
      ],
      expected: true,
    },
  },
  {
    id: 2,
    label: 'Invalid - 4 < 5',
    data: {
      nodes: [
        { val: 5, left: 1, right: 2 },
        { val: 1, left: null, right: null },
        { val: 4, left: 3, right: 4 },
        { val: 3, left: null, right: null },
        { val: 6, left: null, right: null },
      ],
      expected: false,
    },
  },
  {
    id: 3,
    label: 'Larger valid BST',
    data: {
      nodes: [
        { val: 10, left: 1, right: 2 },
        { val: 5, left: 3, right: 4 },
        { val: 15, left: 5, right: 6 },
        { val: 3, left: null, right: null },
        { val: 7, left: null, right: null },
        { val: 12, left: null, right: null },
        { val: 20, left: null, right: null },
      ],
      expected: true,
    },
  },
]

function calculateTreeLayout(nodes: Array<TreeNode>): Array<NodePosition> {
  if (nodes.length === 0) return []

  const positions: Array<NodePosition> = new Array(nodes.length)
  const width = 400
  const levelHeight = 70

  function getDepth(index: number): number {
    if (index === 0) return 0
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].left === index || nodes[i].right === index) {
        return getDepth(i) + 1
      }
    }
    return 0
  }

  function getHorizontalPosition(index: number, depth: number): number {
    if (index === 0) return width / 2

    for (let i = 0; i < nodes.length; i++) {
      const parentPos = positions[i]
      if (!parentPos) continue

      const spread = width / Math.pow(2, depth + 1)
      if (nodes[i].left === index) {
        return parentPos.x - spread
      }
      if (nodes[i].right === index) {
        return parentPos.x + spread
      }
    }
    return width / 2
  }

  // Calculate positions level by level
  const queue: Array<number> = [0]
  while (queue.length > 0) {
    const index = queue.shift()!
    const depth = getDepth(index)
    const x = index === 0 ? width / 2 : getHorizontalPosition(index, depth)
    const y = 40 + depth * levelHeight

    positions[index] = { x, y }

    const node = nodes[index]
    if (node.left !== null) queue.push(node.left)
    if (node.right !== null) queue.push(node.right)
  }

  return positions
}

function formatRange(val: number | string): string {
  if (val === Number.NEGATIVE_INFINITY || val === '-inf') return '-∞'
  if (val === Number.POSITIVE_INFINITY || val === 'inf') return '∞'
  return String(val)
}

function generateSteps(testCaseData: TestCaseData): Array<Step> {
  const steps: Array<Step> = []
  const { nodes } = testCaseData
  const nodeStatuses: Record<number, NodeStatus> = {}

  // Initialize all nodes as unchecked
  nodes.forEach((_, i) => {
    nodeStatuses[i] = 'unchecked'
  })

  // Initial step
  steps.push({
    lineNumber: 13,
    description: 'Start validation with root node',
    insight: 'Begin checking the tree with range (-∞, +∞). Any value is valid for root.',
    currentNodeIndex: null,
    nodeStatuses: { ...nodeStatuses },
    currentRange: { min: '-∞', max: '∞' },
    callStack: [],
    phase: 'init',
    returnValue: null,
  })

  // Recursive validation simulation
  function validate(
    nodeIndex: number | null,
    min: number,
    max: number,
    callStack: Array<CallStackItem>
  ): boolean {
    const minStr = formatRange(min)
    const maxStr = formatRange(max)

    // Base case: null node
    if (nodeIndex === null) {
      steps.push({
        lineNumber: 4,
        description: 'Reached null node',
        insight: 'Null nodes are valid by definition. Return True.',
        currentNodeIndex: null,
        nodeStatuses: { ...nodeStatuses },
        currentRange: { min: minStr, max: maxStr },
        callStack: [...callStack],
        phase: 'check-null',
        returnValue: true,
      })

      steps.push({
        lineNumber: 5,
        description: 'Return True for null node',
        insight: 'This branch of the tree is valid.',
        currentNodeIndex: null,
        nodeStatuses: { ...nodeStatuses },
        currentRange: { min: minStr, max: maxStr },
        callStack: [...callStack],
        phase: 'return',
        returnValue: true,
      })

      return true
    }

    const node = nodes[nodeIndex]
    nodeStatuses[nodeIndex] = 'checking'

    const newCallStack: Array<CallStackItem> = [
      ...callStack,
      { nodeIndex, nodeVal: node.val, min: minStr, max: maxStr },
    ]

    // Show we're checking this node
    steps.push({
      lineNumber: 7,
      description: `Check if ${node.val} is in range (${minStr}, ${maxStr})`,
      insight: `Node value must be > ${minStr} AND < ${maxStr} to be valid.`,
      currentNodeIndex: nodeIndex,
      nodeStatuses: { ...nodeStatuses },
      currentRange: { min: minStr, max: maxStr },
      callStack: newCallStack,
      phase: 'check-range',
      returnValue: null,
    })

    // Check if value is in valid range
    if (!(node.val > min && node.val < max)) {
      nodeStatuses[nodeIndex] = 'invalid'

      steps.push({
        lineNumber: 8,
        description: `${node.val} is NOT in range (${minStr}, ${maxStr})!`,
        insight: `BST property violated! ${node.val} ${node.val <= min ? `≤ ${minStr}` : `≥ ${maxStr}`}. Return False.`,
        currentNodeIndex: nodeIndex,
        nodeStatuses: { ...nodeStatuses },
        currentRange: { min: minStr, max: maxStr },
        callStack: newCallStack,
        phase: 'invalid',
        returnValue: false,
      })

      return false
    }

    steps.push({
      lineNumber: 10,
      description: `${node.val} is valid! Check left subtree`,
      insight: `Now check left child with range (${minStr}, ${node.val}). Left must be < ${node.val}.`,
      currentNodeIndex: nodeIndex,
      nodeStatuses: { ...nodeStatuses },
      currentRange: { min: minStr, max: String(node.val) },
      callStack: newCallStack,
      phase: 'recurse-left',
      returnValue: null,
    })

    // Recurse left
    const leftValid = validate(node.left, min, node.val, newCallStack)

    if (!leftValid) {
      nodeStatuses[nodeIndex] = 'invalid'
      return false
    }

    steps.push({
      lineNumber: 11,
      description: `Left subtree valid! Check right subtree`,
      insight: `Now check right child with range (${node.val}, ${maxStr}). Right must be > ${node.val}.`,
      currentNodeIndex: nodeIndex,
      nodeStatuses: { ...nodeStatuses },
      currentRange: { min: String(node.val), max: maxStr },
      callStack: newCallStack,
      phase: 'recurse-right',
      returnValue: null,
    })

    // Recurse right
    const rightValid = validate(node.right, node.val, max, newCallStack)

    if (!rightValid) {
      nodeStatuses[nodeIndex] = 'invalid'
      return false
    }

    // Both subtrees valid
    nodeStatuses[nodeIndex] = 'valid'

    steps.push({
      lineNumber: 10,
      description: `Node ${node.val} and both subtrees are valid!`,
      insight: 'Both left and right subtrees satisfy BST property. Return True.',
      currentNodeIndex: nodeIndex,
      nodeStatuses: { ...nodeStatuses },
      currentRange: { min: minStr, max: maxStr },
      callStack: newCallStack,
      phase: 'return',
      returnValue: true,
    })

    return true
  }

  const result = validate(0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, [])

  // Final step
  steps.push({
    lineNumber: 13,
    description: result ? 'Tree is a valid BST!' : 'Tree is NOT a valid BST!',
    insight: result
      ? 'All nodes satisfy the BST property.'
      : 'At least one node violates the BST property.',
    currentNodeIndex: null,
    nodeStatuses: { ...nodeStatuses },
    currentRange: { min: '-∞', max: '∞' },
    callStack: [],
    phase: 'complete',
    returnValue: result,
  })

  return steps
}

function ValidateBSTVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data), [testCase.data])
  const step = steps[currentStep]

  const positions = calculateTreeLayout(testCase.data.nodes)

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const getNodeColor = (index: number) => {
    const status = step.nodeStatuses[index] || 'unchecked'
    if (step.currentNodeIndex === index) {
      return {
        fill: 'rgba(251, 146, 60, 0.3)',
        stroke: '#fb923c',
        text: '#fb923c',
        glow: '0 0 20px rgba(251, 146, 60, 0.5)',
      }
    }
    switch (status) {
      case 'valid':
        return {
          fill: 'rgba(74, 222, 128, 0.2)',
          stroke: '#4ade80',
          text: '#4ade80',
          glow: '0 0 15px rgba(74, 222, 128, 0.3)',
        }
      case 'invalid':
        return {
          fill: 'rgba(248, 113, 113, 0.2)',
          stroke: '#f87171',
          text: '#f87171',
          glow: '0 0 15px rgba(248, 113, 113, 0.3)',
        }
      case 'checking':
        return {
          fill: 'rgba(34, 211, 238, 0.2)',
          stroke: '#22d3ee',
          text: '#22d3ee',
          glow: '0 0 15px rgba(34, 211, 238, 0.3)',
        }
      default:
        return {
          fill: 'rgba(51, 65, 85, 0.5)',
          stroke: '#475569',
          text: '#94a3b8',
          glow: 'none',
        }
    }
  }

  const visualization = (
    <>
      <style>{`
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .active-node { animation: pulse-node 1s ease-in-out infinite; }
        .stack-enter { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Tree Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">BINARY TREE</span>
          <span className="text-slate-500 font-mono text-xs">
            Range: ({step.currentRange.min}, {step.currentRange.max})
          </span>
        </div>
        <div className="p-6">
          <svg width="100%" height="300" viewBox="0 0 400 300" className="mx-auto">
            {/* Draw edges */}
            {testCase.data.nodes.map((node, i) => {
              const pos = positions[i]
              if (!pos) return null

              return (
                <g key={`edges-${i}`}>
                  {node.left !== null && positions[node.left] && (
                    <line
                      x1={pos.x}
                      y1={pos.y}
                      x2={positions[node.left].x}
                      y2={positions[node.left].y}
                      stroke="#334155"
                      strokeWidth="2"
                    />
                  )}
                  {node.right !== null && positions[node.right] && (
                    <line
                      x1={pos.x}
                      y1={pos.y}
                      x2={positions[node.right].x}
                      y2={positions[node.right].y}
                      stroke="#334155"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )
            })}

            {/* Draw nodes */}
            {testCase.data.nodes.map((node, i) => {
              const pos = positions[i]
              if (!pos) return null
              const colors = getNodeColor(i)
              const isActive = step.currentNodeIndex === i

              return (
                <g key={`node-${i}`} className={isActive ? 'active-node' : ''}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="25"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="3"
                    style={{ filter: colors.glow !== 'none' ? `drop-shadow(${colors.glow})` : undefined }}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="16"
                    fontWeight="bold"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    {node.val}
                  </text>

                  {/* Status indicator */}
                  {step.nodeStatuses[i] === 'valid' && (
                    <text x={pos.x + 30} y={pos.y - 15} fill="#4ade80" fontSize="16">✓</text>
                  )}
                  {step.nodeStatuses[i] === 'invalid' && (
                    <text x={pos.x + 30} y={pos.y - 15} fill="#f87171" fontSize="16">✗</text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Call Stack */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-300 font-mono text-sm">CALL STACK</span>
          <span className="text-slate-500 font-mono text-xs">
            {step.callStack.length} frame{step.callStack.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-4 min-h-[180px] flex flex-col justify-end">
          {step.callStack.length > 0 ? (
            <div className="space-y-2">
              {[...step.callStack].reverse().map((frame, idx) => (
                <div
                  key={idx}
                  className={`stack-enter px-3 py-2 rounded-lg font-mono text-sm border transition-all ${
                    idx === 0
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>valid({frame.nodeVal}, {frame.min}, {frame.max})</span>
                    {idx === 0 && <span className="text-xs text-slate-500">← current</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-600 text-center font-mono text-sm italic">
              Call stack empty
            </div>
          )}
        </div>
      </div>

      {/* Completion Status */}
      {step.phase === 'complete' && (
        <div className={`rounded-xl border p-4 text-center ${
          step.returnValue
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className={`font-display font-bold text-lg ${
            step.returnValue ? 'text-green-400' : 'text-red-400'
          }`}>
            {step.returnValue ? 'VALID BST' : 'INVALID BST'}
          </div>
        </div>
      )}
    </>
  )

  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Overview</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Approach</h4>
          <p className="text-slate-400">Track valid range (min, max) for each node. Left children update max, right children update min.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n)</span>
            <p className="text-slate-500 text-xs mt-1">Visit each node once</p>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(h)</span>
            <p className="text-slate-500 text-xs mt-1">Recursion depth = tree height</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '98',
        title: 'Validate Binary Search Tree',
        difficulty: 'medium',
        tags: ['Tree', 'DFS', 'BST'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="validate_bst.py"
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
