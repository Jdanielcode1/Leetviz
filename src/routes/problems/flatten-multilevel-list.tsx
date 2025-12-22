import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

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
  nodes: Array<NodeState>
  currentNodeId: number | null
  stack: Array<number>
  phase: 'init' | 'traverse' | 'check-child' | 'push-stack' | 'redirect' | 'check-end' | 'pop-stack' | 'advance' | 'complete'
  highlightNodes: Array<number>
  newConnection?: { from: number; to: number; type: 'next' | 'prev' | 'child-clear' }
  flattenedSoFar: Array<number>
}

interface TestCaseData {
  nodes: Array<ListNode>
  levels: Array<Array<number>>
  input: string
  output: string
}

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `You are given a doubly linked list, which contains nodes that have a next pointer, a previous pointer, and an additional child pointer. This child pointer may or may not point to a separate doubly linked list, also containing these special nodes. These child lists may have one or more children of their own, and so on, to produce a multilevel data structure.

Given the head of the first level of the list, flatten the list so that all the nodes appear in a single-level, doubly linked list. Let curr be a node with a child list. The nodes in the child list should appear after curr and before curr.next in the flattened list.

Return the head of the flattened list. The nodes in the list must have all of their child pointers set to null.`

const EXAMPLES: Array<Example> = [
  {
    input: '[1,2,3,4,5,6,null,null,null,7,8,9,10,null,null,11,12]',
    output: '[1,2,3,7,8,11,12,9,10,4,5,6]',
    explanation: 'The multilevel linked list is flattened to a single-level list where child lists are inserted inline.',
  },
  {
    input: '[1,2,3,null,null,4,5]',
    output: '[1,2,4,5,3]',
    explanation: 'Simple two-level list where the child list is inserted inline.',
  },
  {
    input: '[1,null,null,2]',
    output: '[1,2]',
    explanation: 'Single node with one child.',
  },
]

const CONSTRAINTS = [
  'The number of Nodes will not exceed 1000',
  '1 <= Node.val <= 10^5',
]

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Example 1',
    data: {
      nodes: [
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
      ],
      levels: [
        [0, 1, 2, 3, 4, 5],
        [6, 7, 8, 9],
        [10, 11],
      ],
      input: '[1,2,3,4,5,6,null,null,null,7,8,9,10,null,null,11,12]',
      output: '[1,2,3,7,8,11,12,9,10,4,5,6]',
    },
  },
  {
    id: 2,
    label: 'Example 2',
    data: {
      nodes: [
        { val: 1, prev: null, next: 1, child: null },
        { val: 2, prev: 0, next: 2, child: 3 },
        { val: 3, prev: 1, next: null, child: null },
        { val: 4, prev: null, next: 4, child: null },
        { val: 5, prev: 3, next: null, child: null },
      ],
      levels: [
        [0, 1, 2],
        [3, 4],
      ],
      input: '[1,2,3,null,null,4,5]',
      output: '[1,2,4,5,3]',
    },
  },
  {
    id: 3,
    label: 'Example 3',
    data: {
      nodes: [
        { val: 1, prev: null, next: null, child: 1 },
        { val: 2, prev: null, next: null, child: null },
      ],
      levels: [[0], [1]],
      input: '[1,null,null,2]',
      output: '[1,2]',
    },
  },
]

function generateSteps(testCaseData: TestCaseData): Array<Step> {
  const steps: Array<Step> = []

  // Deep clone nodes for mutation during algorithm
  const nodes: Array<NodeState> = testCaseData.nodes.map((n, idx) => {
    let level = 0
    let position = 0
    testCaseData.levels.forEach((levelNodes, lvl) => {
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

  const stack: Array<number> = []
  let currId: number | null = 0
  const flattenedSoFar: Array<number> = []

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
    const nextCurrId: number | null = nodes[currId].next

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
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(() => generateSteps(testCase.data), [testCase.data])
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  // Build flattened order from current step's node states
  const getFlattenedList = () => {
    if (step.phase === 'complete' || step.flattenedSoFar.length > 0) {
      return step.flattenedSoFar.map(id => step.nodes.find(n => n.id === id)?.val ?? 0)
    }
    return []
  }

  const visualization = (
    <>
      <style>{`
        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.05);
        }
        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.4), inset 0 0 20px rgba(251, 146, 60, 0.05);
        }

        @keyframes node-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .active-node {
          animation: node-pulse 1.5s ease-in-out infinite;
        }

        .stack-enter {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Linked List */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">MULTILEVEL LIST STRUCTURE</span>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="space-y-6 min-w-[500px]">
            {testCase.data.levels.map((levelNodes, levelIndex) => (
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
                    const hasChild = testCase.data.nodes[nodeId].child !== null
                    const isChildCleared = node.child === null && testCase.data.nodes[nodeId].child !== null

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

      {/* Stack */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700 flex justify-between items-center">
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

      {/* Completion */}
      {step.phase === 'complete' && (
        <div className="bg-cyan-500/10 rounded-xl border border-cyan-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-cyan-400 font-display font-bold text-lg">FLATTENING COMPLETE</div>
              <div className="text-cyan-300 font-mono text-sm">
                [{testCase.data.output.replace(/[\[\]]/g, '')}]
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Stack-Based Approach</h4>
          <p className="text-slate-400">Use a stack to save nodes we skip when diving into child lists. When we reach a dead end, pop from stack to continue.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-cyan-400 font-mono">Time: O(n)</span>
            <p className="text-slate-500 text-xs mt-1">Each node visited once</p>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(n)</span>
            <p className="text-slate-500 text-xs mt-1">Stack can hold n nodes</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '430',
        title: 'Flatten a Multilevel Doubly Linked List',
        difficulty: 'medium',
        tags: ['Linked List', 'DFS', 'Stack'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="flatten.py"
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
