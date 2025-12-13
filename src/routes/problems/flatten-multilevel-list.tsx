import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/problems/flatten-multilevel-list')({
  component: FlattenMultilevelListVisualization,
})

interface ListNode {
  val: number
  prev: number | null
  next: number | null
  child: number | null
}

interface NodeState {
  id: number
  val: number
  originalLevel: number
  originalPosition: number
  next: number | null
  prev: number | null
  child: number | null
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  nodes: NodeState[]
  currentNodeId: number | null
  stack: number[]
  phase: 'init' | 'traverse' | 'check-child' | 'push-stack' | 'redirect' | 'check-end' | 'pop-stack' | 'advance' | 'complete'
  highlightNodes: number[]
  newConnection?: { from: number; to: number; type: 'next' | 'prev' | 'child-clear' }
  flattenedSoFar: number[]
}

interface TestCase {
  name: string
  description: string
  input: string
  output: string
  nodes: ListNode[]
  levels: number[][]
}

const PROBLEM_DESCRIPTION = `You are given a doubly linked list, which contains nodes that have a next pointer, a previous pointer, and an additional child pointer. This child pointer may or may not point to a separate doubly linked list, also containing these special nodes. These child lists may have one or more children of their own, and so on, to produce a multilevel data structure.

Given the head of the first level of the list, flatten the list so that all the nodes appear in a single-level, doubly linked list. Let curr be a node with a child list. The nodes in the child list should appear after curr and before curr.next in the flattened list.

Return the head of the flattened list. The nodes in the list must have all of their child pointers set to null.`

const CODE_LINES = [
  { num: 1, code: '# Definition for a Node.' },
  { num: 2, code: 'class Node:' },
  { num: 3, code: '    def __init__(self, val, prev, next, child):' },
  { num: 4, code: '        self.val = val' },
  { num: 5, code: '        self.prev = prev' },
  { num: 6, code: '        self.next = next' },
  { num: 7, code: '        self.child = child' },
  { num: 8, code: '' },
  { num: 9, code: 'class Solution:' },
  { num: 10, code: "    def flatten(self, head: 'Optional[Node]') -> 'Optional[Node]':" },
  { num: 11, code: '        if not head: return None' },
  { num: 12, code: '        stack = []' },
  { num: 13, code: '        curr = head' },
  { num: 14, code: '' },
  { num: 15, code: '        while curr:' },
  { num: 16, code: '            if curr.child:' },
  { num: 17, code: '                if curr.next:' },
  { num: 18, code: '                    stack.append(curr.next)' },
  { num: 19, code: '                curr.next = curr.child' },
  { num: 20, code: '                curr.next.prev = curr' },
  { num: 21, code: '                curr.child = None' },
  { num: 22, code: '' },
  { num: 23, code: '            if not curr.next and stack:' },
  { num: 24, code: '                curr.next = stack.pop()' },
  { num: 25, code: '                curr.next.prev = curr' },
  { num: 26, code: '' },
  { num: 27, code: '            curr = curr.next' },
  { num: 28, code: '' },
  { num: 29, code: '        return head' },
]

function buildTestCase1(): TestCase {
  // [1,2,3,4,5,6,null,null,null,7,8,9,10,null,null,11,12]
  // Level 1: 1 - 2 - 3 - 4 - 5 - 6
  //              |
  // Level 2:     7 - 8 - 9 - 10
  //                  |
  // Level 3:        11 - 12

  const nodes: ListNode[] = [
    { val: 1, prev: null, next: 1, child: null },      // 0
    { val: 2, prev: 0, next: 2, child: null },         // 1
    { val: 3, prev: 1, next: 3, child: 6 },            // 2: has child -> 7
    { val: 4, prev: 2, next: 4, child: null },         // 3
    { val: 5, prev: 3, next: 5, child: null },         // 4
    { val: 6, prev: 4, next: null, child: null },      // 5
    { val: 7, prev: null, next: 7, child: null },      // 6
    { val: 8, prev: 6, next: 8, child: 10 },           // 7: has child -> 11
    { val: 9, prev: 7, next: 9, child: null },         // 8
    { val: 10, prev: 8, next: null, child: null },     // 9
    { val: 11, prev: null, next: 11, child: null },    // 10
    { val: 12, prev: 10, next: null, child: null },    // 11
  ]

  return {
    name: 'Example 1',
    description: 'Three-level nested structure',
    input: '[1,2,3,4,5,6,null,null,null,7,8,9,10,null,null,11,12]',
    output: '[1,2,3,7,8,11,12,9,10,4,5,6]',
    nodes,
    levels: [
      [0, 1, 2, 3, 4, 5],
      [6, 7, 8, 9],
      [10, 11],
    ],
  }
}

function buildTestCase2(): TestCase {
  const nodes: ListNode[] = [
    { val: 1, prev: null, next: 1, child: null },
    { val: 2, prev: 0, next: 2, child: 3 },
    { val: 3, prev: 1, next: null, child: null },
    { val: 4, prev: null, next: 4, child: null },
    { val: 5, prev: 3, next: null, child: null },
  ]

  return {
    name: 'Example 2',
    description: 'Simple two-level list',
    input: '[1,2,3,null,null,4,5]',
    output: '[1,2,4,5,3]',
    nodes,
    levels: [
      [0, 1, 2],
      [3, 4],
    ],
  }
}

function buildTestCase3(): TestCase {
  const nodes: ListNode[] = [
    { val: 1, prev: null, next: null, child: 1 },
    { val: 2, prev: null, next: null, child: null },
  ]

  return {
    name: 'Example 3',
    description: 'Single with child',
    input: '[1,null,null,2]',
    output: '[1,2]',
    nodes,
    levels: [[0], [1]],
  }
}

function generateSteps(testCase: TestCase): Step[] {
  const steps: Step[] = []

  // Deep clone nodes for mutation during algorithm
  const nodes: NodeState[] = testCase.nodes.map((n, idx) => {
    let level = 0
    let position = 0
    testCase.levels.forEach((levelNodes, lvl) => {
      const pos = levelNodes.indexOf(idx)
      if (pos !== -1) {
        level = lvl
        position = pos
      }
    })
    return {
      id: idx,
      val: n.val,
      originalLevel: level,
      originalPosition: position,
      next: n.next,
      prev: n.prev,
      child: n.child,
    }
  })

  const stack: number[] = []
  let currId: number | null = 0
  const flattenedSoFar: number[] = []

  // Initial state
  steps.push({
    lineNumber: 12,
    description: 'Initialize empty stack',
    insight: 'The stack will store nodes we need to return to after processing child lists.',
    nodes: nodes.map(n => ({ ...n })),
    currentNodeId: null,
    stack: [],
    phase: 'init',
    highlightNodes: [],
    flattenedSoFar: [],
  })

  steps.push({
    lineNumber: 13,
    description: 'Set curr = head (node 1)',
    insight: 'We start at the head and will traverse the entire structure.',
    nodes: nodes.map(n => ({ ...n })),
    currentNodeId: 0,
    stack: [],
    phase: 'init',
    highlightNodes: [0],
    flattenedSoFar: [],
  })

  while (currId !== null) {
    const curr = nodes[currId]
    flattenedSoFar.push(currId)

    // While loop entry
    steps.push({
      lineNumber: 15,
      description: `Processing node ${curr.val}`,
      insight: `We're at node ${curr.val}. Check if it has a child list to flatten.`,
      nodes: nodes.map(n => ({ ...n })),
      currentNodeId: currId,
      stack: [...stack],
      phase: 'traverse',
      highlightNodes: [currId],
      flattenedSoFar: [...flattenedSoFar],
    })

    // Check child
    if (curr.child !== null) {
      const childId = curr.child
      const childNode = nodes[childId]

      steps.push({
        lineNumber: 16,
        description: `Node ${curr.val} has a child (node ${childNode.val})!`,
        insight: 'We need to insert the child list between curr and curr.next.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'check-child',
        highlightNodes: [currId, childId],
        flattenedSoFar: [...flattenedSoFar],
      })

      // Check if has next to push
      if (curr.next !== null) {
        const nextId = curr.next
        const nextNode = nodes[nextId]
        stack.push(nextId)

        steps.push({
          lineNumber: 18,
          description: `Push node ${nextNode.val} onto stack`,
          insight: `Save node ${nextNode.val} - we'll reconnect to it after processing the child list.`,
          nodes: nodes.map(n => ({ ...n })),
          currentNodeId: currId,
          stack: [...stack],
          phase: 'push-stack',
          highlightNodes: [currId, nextId],
          flattenedSoFar: [...flattenedSoFar],
        })
      }

      // Redirect next to child
      const oldNext = curr.next
      nodes[currId].next = childId

      steps.push({
        lineNumber: 19,
        description: `Set ${curr.val}.next = ${childNode.val}`,
        insight: 'Redirect the next pointer to the child, inserting the child list inline.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'redirect',
        highlightNodes: [currId, childId],
        newConnection: { from: currId, to: childId, type: 'next' },
        flattenedSoFar: [...flattenedSoFar],
      })

      // Set child's prev
      nodes[childId].prev = currId

      steps.push({
        lineNumber: 20,
        description: `Set ${childNode.val}.prev = ${curr.val}`,
        insight: 'Update the prev pointer to maintain the doubly-linked property.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'redirect',
        highlightNodes: [currId, childId],
        newConnection: { from: childId, to: currId, type: 'prev' },
        flattenedSoFar: [...flattenedSoFar],
      })

      // Clear child pointer
      nodes[currId].child = null

      steps.push({
        lineNumber: 21,
        description: `Clear ${curr.val}.child = None`,
        insight: 'The child pointer is no longer needed - the child is now part of the main list.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'redirect',
        highlightNodes: [currId],
        newConnection: { from: currId, to: -1, type: 'child-clear' },
        flattenedSoFar: [...flattenedSoFar],
      })
    }

    // Check if at end and stack not empty
    const updatedCurr = nodes[currId]
    if (updatedCurr.next === null && stack.length > 0) {
      steps.push({
        lineNumber: 23,
        description: `End of branch reached, stack has ${stack.length} node(s)`,
        insight: 'We reached a dead end but have saved nodes to return to.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'check-end',
        highlightNodes: [currId],
        flattenedSoFar: [...flattenedSoFar],
      })

      const poppedId = stack.pop()!
      const poppedNode = nodes[poppedId]

      steps.push({
        lineNumber: 24,
        description: `Pop node ${poppedNode.val} and set as ${updatedCurr.val}.next`,
        insight: `Reconnect to node ${poppedNode.val} that we saved earlier.`,
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'pop-stack',
        highlightNodes: [currId, poppedId],
        flattenedSoFar: [...flattenedSoFar],
      })

      nodes[currId].next = poppedId

      steps.push({
        lineNumber: 24,
        description: `${updatedCurr.val}.next = ${poppedNode.val}`,
        insight: 'The flattened list continues with the previously saved node.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'redirect',
        highlightNodes: [currId, poppedId],
        newConnection: { from: currId, to: poppedId, type: 'next' },
        flattenedSoFar: [...flattenedSoFar],
      })

      nodes[poppedId].prev = currId

      steps.push({
        lineNumber: 25,
        description: `${poppedNode.val}.prev = ${updatedCurr.val}`,
        insight: 'Update prev pointer to maintain doubly-linked structure.',
        nodes: nodes.map(n => ({ ...n })),
        currentNodeId: currId,
        stack: [...stack],
        phase: 'redirect',
        highlightNodes: [currId, poppedId],
        newConnection: { from: poppedId, to: currId, type: 'prev' },
        flattenedSoFar: [...flattenedSoFar],
      })
    }

    // Advance
    const nextCurrId = nodes[currId].next

    steps.push({
      lineNumber: 27,
      description: nextCurrId !== null
        ? `Move to next node (${nodes[nextCurrId].val})`
        : 'Move to next (None - done!)',
      insight: nextCurrId !== null
        ? `Continue traversing the now-flattening list.`
        : 'We have visited all nodes. The list is flattened!',
      nodes: nodes.map(n => ({ ...n })),
      currentNodeId: nextCurrId,
      stack: [...stack],
      phase: 'advance',
      highlightNodes: nextCurrId !== null ? [nextCurrId] : [],
      flattenedSoFar: [...flattenedSoFar],
    })

    currId = nextCurrId
  }

  // Complete
  steps.push({
    lineNumber: 29,
    description: 'Return the flattened list head',
    insight: 'All nodes are now in a single-level doubly linked list!',
    nodes: nodes.map(n => ({ ...n })),
    currentNodeId: 0,
    stack: [],
    phase: 'complete',
    highlightNodes: [],
    flattenedSoFar: [...flattenedSoFar],
  })

  return steps
}

function FlattenMultilevelListVisualization() {
  const testCases = [buildTestCase1(), buildTestCase2(), buildTestCase3()]
  const [selectedCase, setSelectedCase] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [showProblem, setShowProblem] = useState(false)

  useEffect(() => {
    const newSteps = generateSteps(testCases[selectedCase])
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
    nodes: [],
    currentNodeId: null,
    stack: [],
    phase: 'init',
    highlightNodes: [],
    flattenedSoFar: [],
  } as Step

  const testCase = testCases[selectedCase]

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

  // Build flattened order from current step's node states
  const getFlattenedList = () => {
    if (step.phase === 'complete' || step.flattenedSoFar.length > 0) {
      return step.flattenedSoFar.map(id => step.nodes.find(n => n.id === id)?.val ?? 0)
    }
    return []
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        :root {
          --cyan: #22d3ee;
          --cyan-dim: #0891b2;
          --orange: #fb923c;
          --orange-dim: #c2410c;
          --navy: #0a1628;
          --navy-light: #1e3a5f;
        }

        .font-display { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.05);
        }
        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.4), inset 0 0 20px rgba(251, 146, 60, 0.05);
        }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(34, 211, 238, 0.5); }
          50% { border-color: rgba(34, 211, 238, 1); }
        }

        @keyframes node-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes connection-draw {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }

        .active-node {
          animation: node-pulse 1.5s ease-in-out infinite;
        }

        .new-connection {
          stroke-dasharray: 100;
          animation: connection-draw 0.5s ease-out forwards;
        }

        .stack-enter {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .code-highlight {
          background: linear-gradient(90deg, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%);
          border-left: 3px solid var(--cyan);
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
              <div className="text-cyan-400/60 font-mono text-sm mb-1">LEETCODE #430</div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Flatten a Multilevel Doubly Linked List
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
                  MEDIUM
                </span>
                <span className="text-slate-500 text-sm font-mono">Stack • Linked List • DFS</span>
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
                <code className="text-slate-300 text-sm">{testCase.input}</code>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-cyan-400 font-mono text-xs mb-2">OUTPUT</div>
                <code className="text-slate-300 text-sm">{testCase.output}</code>
              </div>
            </div>
          </div>
        )}

        {/* Test Case Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {testCases.map((tc, idx) => (
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
              title="Reset (Home)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
              title="Previous (←)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-3 rounded-lg transition-all ${
                isPlaying
                  ? 'bg-orange-500/20 text-orange-400 glow-orange'
                  : 'bg-cyan-500/20 text-cyan-400 glow-cyan'
              }`}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
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
              title="Next (→)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentStep(steps.length - 1)}
              disabled={currentStep >= steps.length - 1}
              className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-400"
              title="End"
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
              max="2000"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Code Panel */}
          <div className="xl:col-span-2 bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-slate-500 font-mono text-xs">flatten.py</span>
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
          <div className="xl:col-span-3 space-y-6">
            {/* Linked List */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <span className="text-slate-300 font-mono text-sm">MULTILEVEL LIST STRUCTURE</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <div className="space-y-6 min-w-[500px]">
                  {testCase.levels.map((levelNodes, levelIndex) => (
                    <div key={levelIndex} className="relative">
                      <div className="text-slate-600 font-mono text-xs mb-3 flex items-center gap-2">
                        <span className="w-16">LEVEL {levelIndex + 1}</span>
                        <div className="flex-1 h-px bg-slate-700" />
                      </div>
                      <div className="flex items-center gap-1 ml-16">
                        {levelNodes.map((nodeId, nodeIndex) => {
                          const node = step.nodes.find(n => n.id === nodeId)
                          if (!node) return null

                          const isCurrentNode = step.currentNodeId === nodeId
                          const isHighlighted = step.highlightNodes.includes(nodeId)
                          const isInFlattenedOrder = step.flattenedSoFar.includes(nodeId)
                          const hasChild = testCase.nodes[nodeId].child !== null
                          const isChildCleared = node.child === null && testCase.nodes[nodeId].child !== null

                          return (
                            <div key={nodeId} className="flex items-center">
                              <div className="relative">
                                {/* Node */}
                                <div
                                  className={`
                                    w-14 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-lg
                                    border-2 transition-all duration-300
                                    ${isCurrentNode
                                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 glow-orange active-node'
                                      : isHighlighted
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 glow-cyan'
                                        : isInFlattenedOrder
                                          ? 'bg-slate-800 border-cyan-500/50 text-cyan-400'
                                          : 'bg-slate-800 border-slate-600 text-slate-300'
                                    }
                                  `}
                                >
                                  {node.val}
                                </div>

                                {/* Child arrow indicator */}
                                {hasChild && !isChildCleared && (
                                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
                                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Arrow to next */}
                              {nodeIndex < levelNodes.length - 1 && (
                                <div className="flex items-center px-1">
                                  <svg className="w-8 h-4 text-slate-500" viewBox="0 0 32 16">
                                    <line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="2" />
                                    <path d="M20 4 L28 8 L20 12" fill="none" stroke="currentColor" strokeWidth="2" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flattened result */}
                {step.flattenedSoFar.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="text-slate-600 font-mono text-xs mb-3">FLATTENED ORDER</div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {getFlattenedList().map((val, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded font-mono text-sm">
                            {val}
                          </span>
                          {idx < getFlattenedList().length - 1 && (
                            <svg className="w-4 h-4 text-cyan-500/50 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stack & Explanation Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Stack */}
              <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-slate-300 font-mono text-sm">STACK</span>
                  <span className="text-slate-500 font-mono text-xs">
                    {step.stack.length} item{step.stack.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-4 min-h-[140px] flex flex-col justify-end">
                  {step.stack.length > 0 ? (
                    <div className="space-y-2">
                      {[...step.stack].reverse().map((nodeId, idx) => {
                        const node = step.nodes.find(n => n.id === nodeId)
                        return (
                          <div
                            key={`${nodeId}-${idx}`}
                            className="stack-enter px-4 py-2 bg-slate-800 border border-orange-500/30 rounded-lg font-mono text-center text-orange-400 flex items-center justify-between"
                          >
                            <span className="text-slate-600 text-xs">[{step.stack.length - 1 - idx}]</span>
                            <span>Node {node?.val}</span>
                            <span className="text-slate-600 text-xs">{idx === 0 ? '← TOP' : ''}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-slate-600 text-center font-mono text-sm italic">
                      Stack is empty
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
                    <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
                      <div className="text-cyan-400 font-display font-bold text-lg mb-1">
                        FLATTENING COMPLETE
                      </div>
                      <div className="text-cyan-300 font-mono text-sm">
                        [{testCase.output.replace(/[\[\]]/g, '')}]
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
                Use a stack to save nodes we skip when diving into child lists.
                When we reach a dead end, pop from stack to continue.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">TIME COMPLEXITY</div>
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-mono">O(n)</span> - Each node is visited exactly once.
                Stack operations are O(1).
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-orange-400 font-mono text-xs mb-2">SPACE COMPLEXITY</div>
              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-mono">O(n)</span> - Stack can hold at most n nodes
                in the worst case (deep nesting).
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 text-center text-slate-600 font-mono text-xs">
          KEYBOARD: ← Previous • → Next • Space Play/Pause
        </div>
      </div>
    </div>
  )
}
