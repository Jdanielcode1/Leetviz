import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

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
  callStack: CallStackItem[]
  phase: string
  returnValue: boolean | null
}

interface TestCase {
  name: string
  description: string
  nodes: TreeNode[]
  expected: boolean
}

const PROBLEM_DESCRIPTION = `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
• The left subtree of a node contains only nodes with keys strictly less than the node's key.
• The right subtree of a node contains only nodes with keys strictly greater than the node's key.
• Both the left and right subtrees must also be binary search trees.`

const CODE_LINES = [
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

const TEST_CASES: TestCase[] = [
  {
    name: 'Example 1',
    description: 'Valid BST',
    nodes: [
      { val: 2, left: 1, right: 2 },
      { val: 1, left: null, right: null },
      { val: 3, left: null, right: null },
    ],
    expected: true,
  },
  {
    name: 'Example 2',
    description: 'Invalid - 4 < 5 in right subtree',
    nodes: [
      { val: 5, left: 1, right: 2 },
      { val: 1, left: null, right: null },
      { val: 4, left: 3, right: 4 },
      { val: 3, left: null, right: null },
      { val: 6, left: null, right: null },
    ],
    expected: false,
  },
  {
    name: 'Example 3',
    description: 'Larger valid BST',
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
]

function calculateTreeLayout(nodes: TreeNode[]): NodePosition[] {
  if (nodes.length === 0) return []

  const positions: NodePosition[] = new Array(nodes.length)
  const width = 400
  const height = 300
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
  const queue: number[] = [0]
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

function generateSteps(testCase: TestCase): Step[] {
  const steps: Step[] = []
  const { nodes } = testCase
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
    callStack: CallStackItem[]
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

    const newCallStack: CallStackItem[] = [
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
  const [selectedCase, setSelectedCase] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [showProblem, setShowProblem] = useState(false)

  useEffect(() => {
    const newSteps = generateSteps(TEST_CASES[selectedCase])
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
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

  const step = steps[currentStep] || {
    lineNumber: 0,
    description: '',
    insight: '',
    currentNodeIndex: null,
    nodeStatuses: {},
    currentRange: { min: '-∞', max: '∞' },
    callStack: [],
    phase: 'init',
    returnValue: null,
  } as Step

  const testCase = TEST_CASES[selectedCase]
  const positions = calculateTreeLayout(testCase.nodes)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else if (e.key === ' ') {
      e.preventDefault()
      setIsPlaying(prev => !prev)
    }
  }, [currentStep, steps.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        .font-display { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
        .glow-orange { box-shadow: 0 0 20px rgba(251, 146, 60, 0.4); }

        @keyframes pulse-node {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .active-node { animation: pulse-node 1s ease-in-out infinite; }

        .code-highlight {
          background: linear-gradient(90deg, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%);
          border-left: 3px solid #22d3ee;
        }

        .stack-enter { animation: slideUp 0.3s ease-out; }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-8 py-6 blueprint-grid min-h-screen">
        {/* Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-colors mb-8 font-display text-sm tracking-wide group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO PROBLEMS
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-cyan-400/60 font-mono text-sm mb-1">LEETCODE #98</div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Validate Binary Search Tree
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
                  MEDIUM
                </span>
                <span className="text-slate-500 text-sm font-mono">Tree • BST • Recursion</span>
              </div>
            </div>
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-mono transition-all"
            >
              {showProblem ? 'HIDE PROBLEM' : 'SHOW PROBLEM'}
            </button>
          </div>
        </header>

        {/* Problem Description */}
        {showProblem && (
          <div className="mb-8 p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl">
            <h2 className="font-display text-lg font-semibold text-cyan-400 mb-4">Problem Description</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line font-mono text-sm mb-6">
              {PROBLEM_DESCRIPTION}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-orange-400 font-mono text-xs mb-2">INPUT</div>
                <code className="text-slate-300 text-sm">root = [{testCase.nodes.map(n => n.val).join(', ')}]</code>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-cyan-400 font-mono text-xs mb-2">OUTPUT</div>
                <code className="text-slate-300 text-sm">{testCase.expected ? 'true' : 'false'}</code>
              </div>
            </div>
          </div>
        )}

        {/* Test Case Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TEST_CASES.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCase(idx)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                selectedCase === idx
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 glow-cyan'
                  : 'bg-slate-800/30 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              {tc.name}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setCurrentStep(0)}
              disabled={currentStep === 0}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-3 rounded-lg transition-all ${
                isPlaying ? 'bg-orange-500/20 text-orange-400 glow-orange' : 'bg-cyan-500/20 text-cyan-400 glow-cyan'
              }`}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep >= steps.length - 1}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentStep(steps.length - 1)}
              disabled={currentStep >= steps.length - 1}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-mono">SPEED</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - parseInt(e.target.value))}
              className="w-24 accent-cyan-500"
            />
          </div>

          <div className="ml-auto text-slate-500 font-mono text-sm">
            STEP {currentStep + 1} / {steps.length}
          </div>
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
              <span className="text-slate-500 font-mono text-xs">validate_bst.py</span>
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
            {/* Tree Visualization */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                <span className="text-slate-300 font-mono text-sm">BINARY TREE</span>
                <span className="text-slate-500 font-mono text-xs">
                  Range: ({step.currentRange.min}, {step.currentRange.max})
                </span>
              </div>
              <div className="p-6">
                <svg width="100%" height="300" viewBox="0 0 400 300" className="mx-auto">
                  {/* Draw edges */}
                  {testCase.nodes.map((node, i) => {
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
                  {testCase.nodes.map((node, i) => {
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

            {/* Call Stack & Explanation Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Call Stack */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
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

              {/* Explanation */}
              <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 rounded-xl border border-cyan-500/20 overflow-hidden">
                <div className="px-4 py-3 bg-cyan-500/5 border-b border-cyan-500/20">
                  <span className="text-cyan-400 font-mono text-sm">CURRENT OPERATION</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-white font-display text-lg">
                    {step.description}
                  </div>
                  <div className="text-slate-400 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-3">
                    {step.insight}
                  </div>

                  {step.phase === 'complete' && (
                    <div className={`mt-4 p-4 rounded-lg text-center border ${
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-700 p-6">
          <h2 className="font-display text-lg font-semibold text-cyan-400 mb-4">ALGORITHM OVERVIEW</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">APPROACH</div>
              <p className="text-slate-400 text-sm">
                Track valid range (min, max) for each node. Left children update max, right children update min.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">TIME COMPLEXITY</div>
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-mono">O(n)</span> - Visit each node exactly once.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">SPACE COMPLEXITY</div>
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-mono">O(h)</span> - Recursion depth equals tree height.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="mt-6 text-center text-slate-600 font-mono text-xs">
          KEYBOARD: ← Previous | → Next | Space Play/Pause
        </div>
      </div>
    </div>
  )
}
