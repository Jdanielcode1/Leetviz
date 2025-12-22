import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/lru-cache')({
  component: LRUCacheViz,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'class Node:' },
  { num: 2, code: '    def __init__(self, key, val):' },
  { num: 3, code: '        self.key, self.val = key, val' },
  { num: 4, code: '        self.prev = self.next = None' },
  { num: 5, code: '' },
  { num: 6, code: 'class LRUCache:' },
  { num: 7, code: '    def __init__(self, capacity: int):' },
  { num: 8, code: '        self.cap = capacity' },
  { num: 9, code: '        self.cache = {}  # map key to node' },
  { num: 10, code: '        self.left, self.right = Node(0, 0), Node(0, 0)' },
  { num: 11, code: '        self.left.next, self.right.prev = self.right, self.left' },
  { num: 12, code: '' },
  { num: 13, code: '    def remove(self, node):' },
  { num: 14, code: '        prev, nxt = node.prev, node.next' },
  { num: 15, code: '        prev.next, nxt.prev = nxt, prev' },
  { num: 16, code: '' },
  { num: 17, code: '    def insert(self, node):' },
  { num: 18, code: '        prev, nxt = self.right.prev, self.right' },
  { num: 19, code: '        prev.next = nxt.prev = node' },
  { num: 20, code: '        node.next, node.prev = nxt, prev' },
  { num: 21, code: '' },
  { num: 22, code: '    def get(self, key: int) -> int:' },
  { num: 23, code: '        if key in self.cache:' },
  { num: 24, code: '            self.remove(self.cache[key])' },
  { num: 25, code: '            self.insert(self.cache[key])' },
  { num: 26, code: '            return self.cache[key].val' },
  { num: 27, code: '        return -1' },
  { num: 28, code: '' },
  { num: 29, code: '    def put(self, key: int, value: int) -> None:' },
  { num: 30, code: '        if key in self.cache:' },
  { num: 31, code: '            self.remove(self.cache[key])' },
  { num: 32, code: '        self.cache[key] = Node(key, value)' },
  { num: 33, code: '        self.insert(self.cache[key])' },
  { num: 34, code: '        if len(self.cache) > self.cap:' },
  { num: 35, code: '            lru = self.left.next' },
  { num: 36, code: '            self.remove(lru)' },
  { num: 37, code: '            del self.cache[lru.key]' },
]

const PROBLEM_DESCRIPTION = `Implement the Least Recently Used (LRU) cache class LRUCache.

- LRUCache(int capacity) Initialize the LRU cache of size capacity.
- int get(int key) Return the value if key exists, otherwise return -1.
- void put(int key, int value) Update or add the key-value pair. If cache exceeds capacity, remove the least recently used key.

Ensure that get and put each run in O(1) average time complexity.`

const EXAMPLES: Array<Example> = [
  {
    input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
    output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
    explanation: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {3=3, 4=4}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4',
  },
]

const CONSTRAINTS = [
  '1 <= capacity <= 3000',
  '0 <= key <= 10^4',
  '0 <= value <= 10^5',
  'At most 2 * 10^5 calls will be made to get and put.',
]

interface CacheNode {
  key: number
  val: number
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  operation: 'init' | 'get' | 'put' | 'remove' | 'insert' | 'evict'
  capacity: number
  cache: Map<number, CacheNode>
  linkedList: Array<CacheNode> // ordered from LRU (left) to MRU (right)
  highlightKey: number | null
  highlightNode: number | null
  evictingKey: number | null
  result: number | null
  movingNode: number | null
}

interface Operation {
  type: 'init' | 'get' | 'put'
  args: Array<number>
}

interface TestCaseData {
  capacity: number
  operations: Array<Operation>
  expectedOutputs: Array<number | null>
  explanation: Array<string>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Example 1: Basic LRU',
    data: {
      capacity: 2,
      operations: [
        { type: 'put', args: [1, 10] },
        { type: 'get', args: [1] },
        { type: 'put', args: [2, 20] },
        { type: 'put', args: [3, 30] },
        { type: 'get', args: [2] },
        { type: 'get', args: [1] },
      ],
      expectedOutputs: [null, 10, null, null, 20, -1],
      explanation: [
        'LRUCache lRUCache = new LRUCache(2);',
        'lRUCache.put(1, 10);  // cache: {1=10}',
        'lRUCache.get(1);      // return 10',
        'lRUCache.put(2, 20);  // cache: {1=10, 2=20}',
        'lRUCache.put(3, 30);  // cache: {2=20, 3=30}, key=1 was evicted',
        'lRUCache.get(2);      // returns 20',
        'lRUCache.get(1);      // return -1 (not found)',
      ],
    },
  },
  {
    id: 2,
    label: 'Example 2: Update existing',
    data: {
      capacity: 2,
      operations: [
        { type: 'put', args: [1, 1] },
        { type: 'put', args: [2, 2] },
        { type: 'get', args: [1] },
        { type: 'put', args: [3, 3] },
        { type: 'get', args: [2] },
        { type: 'put', args: [4, 4] },
        { type: 'get', args: [1] },
        { type: 'get', args: [3] },
        { type: 'get', args: [4] },
      ],
      expectedOutputs: [null, null, 1, null, -1, null, -1, 3, 4],
      explanation: [
        'LRUCache lRUCache = new LRUCache(2);',
        'lRUCache.put(1, 1);  // cache: {1=1}',
        'lRUCache.put(2, 2);  // cache: {1=1, 2=2}',
        'lRUCache.get(1);     // return 1, cache: {2=2, 1=1}',
        'lRUCache.put(3, 3);  // evicts key 2, cache: {1=1, 3=3}',
        'lRUCache.get(2);     // return -1 (not found)',
        'lRUCache.put(4, 4);  // evicts key 1, cache: {3=3, 4=4}',
        'lRUCache.get(1);     // return -1 (not found)',
        'lRUCache.get(3);     // return 3',
        'lRUCache.get(4);     // return 4',
      ],
    },
  },
]

function generateSteps(capacity: number, operations: Array<Operation>): Array<Step> {
  const steps: Array<Step> = []
  const cache = new Map<number, CacheNode>()
  let linkedList: Array<CacheNode> = []

  // Helper to clone state
  const cloneCache = () => new Map(cache)
  const cloneList = () => [...linkedList]

  // Init step
  steps.push({
    lineNumber: 7,
    description: `Initialize LRUCache(${capacity})`,
    insight: 'Create an empty cache with given capacity. Use hashmap for O(1) lookup and doubly linked list for O(1) removal/insertion.',
    operation: 'init',
    capacity,
    cache: cloneCache(),
    linkedList: cloneList(),
    highlightKey: null,
    highlightNode: null,
    evictingKey: null,
    result: null,
    movingNode: null,
  })

  steps.push({
    lineNumber: 10,
    description: 'Create dummy left and right nodes',
    insight: 'Dummy nodes simplify edge cases. Left.next points to LRU node, right.prev points to MRU node.',
    operation: 'init',
    capacity,
    cache: cloneCache(),
    linkedList: cloneList(),
    highlightKey: null,
    highlightNode: null,
    evictingKey: null,
    result: null,
    movingNode: null,
  })

  for (const op of operations) {
    if (op.type === 'get') {
      const [key] = op.args

      steps.push({
        lineNumber: 22,
        description: `get(${key})`,
        insight: `Retrieve value for key ${key} and mark it as most recently used.`,
        operation: 'get',
        capacity,
        cache: cloneCache(),
        linkedList: cloneList(),
        highlightKey: key,
        highlightNode: null,
        evictingKey: null,
        result: null,
        movingNode: null,
      })

      if (cache.has(key)) {
        const node = cache.get(key)!

        steps.push({
          lineNumber: 23,
          description: `Key ${key} found in cache`,
          insight: `Key exists! Value is ${node.val}. Now move it to MRU position.`,
          operation: 'get',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: key,
          evictingKey: null,
          result: null,
          movingNode: null,
        })

        // Remove from current position
        steps.push({
          lineNumber: 24,
          description: `Remove node from current position`,
          insight: 'Unlink the node from its current position in the list.',
          operation: 'remove',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: key,
          evictingKey: null,
          result: null,
          movingNode: key,
        })

        linkedList = linkedList.filter(n => n.key !== key)

        // Insert at MRU position
        linkedList.push(node)

        steps.push({
          lineNumber: 25,
          description: `Insert node at MRU position (right)`,
          insight: 'Insert the node just before the right dummy (most recently used).',
          operation: 'insert',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: key,
          evictingKey: null,
          result: null,
          movingNode: key,
        })

        steps.push({
          lineNumber: 26,
          description: `Return ${node.val}`,
          insight: `Return the cached value: ${node.val}`,
          operation: 'get',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: key,
          evictingKey: null,
          result: node.val,
          movingNode: null,
        })
      } else {
        steps.push({
          lineNumber: 27,
          description: `Key ${key} not found, return -1`,
          insight: 'Key does not exist in cache. Return -1.',
          operation: 'get',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: null,
          evictingKey: null,
          result: -1,
          movingNode: null,
        })
      }
    } else if (op.type === 'put') {
      const [key, value] = op.args

      steps.push({
        lineNumber: 29,
        description: `put(${key}, ${value})`,
        insight: `Add or update key ${key} with value ${value}.`,
        operation: 'put',
        capacity,
        cache: cloneCache(),
        linkedList: cloneList(),
        highlightKey: key,
        highlightNode: null,
        evictingKey: null,
        result: null,
        movingNode: null,
      })

      if (cache.has(key)) {
        steps.push({
          lineNumber: 30,
          description: `Key ${key} already exists`,
          insight: 'Key exists, so we need to remove the old node first.',
          operation: 'put',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: key,
          evictingKey: null,
          result: null,
          movingNode: null,
        })

        steps.push({
          lineNumber: 31,
          description: `Remove old node for key ${key}`,
          insight: 'Remove the existing node from the linked list.',
          operation: 'remove',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: key,
          highlightNode: key,
          evictingKey: null,
          result: null,
          movingNode: key,
        })

        linkedList = linkedList.filter(n => n.key !== key)
      }

      const newNode: CacheNode = { key, val: value }
      cache.set(key, newNode)

      steps.push({
        lineNumber: 32,
        description: `Create new node: {key: ${key}, val: ${value}}`,
        insight: 'Create a new node and add it to the hashmap.',
        operation: 'put',
        capacity,
        cache: cloneCache(),
        linkedList: cloneList(),
        highlightKey: key,
        highlightNode: null,
        evictingKey: null,
        result: null,
        movingNode: null,
      })

      linkedList.push(newNode)

      steps.push({
        lineNumber: 33,
        description: `Insert node at MRU position`,
        insight: 'Insert the new node at the right (most recently used).',
        operation: 'insert',
        capacity,
        cache: cloneCache(),
        linkedList: cloneList(),
        highlightKey: key,
        highlightNode: key,
        evictingKey: null,
        result: null,
        movingNode: key,
      })

      if (cache.size > capacity) {
        steps.push({
          lineNumber: 34,
          description: `Cache size (${cache.size}) > capacity (${capacity})`,
          insight: 'Cache exceeded capacity! Must evict the LRU node.',
          operation: 'evict',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: null,
          highlightNode: null,
          evictingKey: null,
          result: null,
          movingNode: null,
        })

        const lru = linkedList[0]

        steps.push({
          lineNumber: 35,
          description: `LRU node is key ${lru.key}`,
          insight: `The leftmost node (key ${lru.key}) is the least recently used.`,
          operation: 'evict',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: null,
          highlightNode: null,
          evictingKey: lru.key,
          result: null,
          movingNode: null,
        })

        linkedList = linkedList.slice(1)

        steps.push({
          lineNumber: 36,
          description: `Remove LRU node from list`,
          insight: `Unlink the LRU node (key ${lru.key}) from the doubly linked list.`,
          operation: 'evict',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: null,
          highlightNode: null,
          evictingKey: lru.key,
          result: null,
          movingNode: null,
        })

        cache.delete(lru.key)

        steps.push({
          lineNumber: 37,
          description: `Delete key ${lru.key} from cache`,
          insight: `Remove key ${lru.key} from the hashmap. Eviction complete.`,
          operation: 'evict',
          capacity,
          cache: cloneCache(),
          linkedList: cloneList(),
          highlightKey: null,
          highlightNode: null,
          evictingKey: null,
          result: null,
          movingNode: null,
        })
      }
    }
  }

  return steps
}

function LRUCacheViz() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(
    () => generateSteps(testCase.data.capacity, testCase.data.operations),
    [testCase.data.capacity, testCase.data.operations]
  )
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const cacheArray = Array.from(step.cache.entries())

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(251, 146, 60, 0.5); }
          50% { border-color: rgba(251, 146, 60, 1); }
        }

        .animate-pulse-border {
          animation: pulse-border 1s ease-in-out infinite;
        }
      `}</style>

      {/* Current Operation */}
      <div className={`rounded-xl border p-4 transition-all duration-300 ${
        step.operation === 'get'
          ? 'bg-cyan-500/10 border-cyan-500/30'
          : step.operation === 'put'
          ? 'bg-orange-500/10 border-orange-500/30'
          : step.operation === 'evict'
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-slate-800/50 border-slate-700'
      }`}>
        <div className="text-sm font-mono mb-2 text-slate-400">OPERATION</div>
        <div className="font-mono text-lg">
          {step.operation === 'get' && <span className="text-cyan-400">get()</span>}
          {step.operation === 'put' && <span className="text-orange-400">put()</span>}
          {step.operation === 'remove' && <span className="text-yellow-400">remove()</span>}
          {step.operation === 'insert' && <span className="text-emerald-400">insert()</span>}
          {step.operation === 'evict' && <span className="text-red-400">evict LRU</span>}
          {step.operation === 'init' && <span className="text-slate-400">initialize</span>}
        </div>
        {step.result !== null && (
          <div className={`mt-2 font-mono text-xl ${step.result === -1 ? 'text-red-400' : 'text-emerald-400 glow-green'}`}>
            Return: {step.result}
          </div>
        )}
        <div className="mt-2 text-slate-500 font-mono text-sm">
          Capacity: {step.capacity} | Size: {step.cache.size}
        </div>
      </div>

      {/* Doubly Linked List Visualization */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-purple-400 font-mono text-sm">Doubly Linked List</span>
          <span className="text-slate-500 font-mono text-xs">
            LRU ← → MRU
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {/* Left dummy */}
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-500 font-mono text-sm">
              L
            </div>
            <span className="text-slate-600">↔</span>

            {step.linkedList.length === 0 ? (
              <span className="text-slate-600 font-mono text-sm px-4">empty</span>
            ) : (
              step.linkedList.map((node, idx) => (
                <div key={`${node.key}-${idx}`} className="flex items-center gap-2">
                  <div
                    className={`flex-shrink-0 px-4 py-3 rounded-lg font-mono transition-all duration-300 ${
                      step.evictingKey === node.key
                        ? 'bg-red-500/30 border-2 border-red-500 glow-red animate-pulse-border'
                        : step.movingNode === node.key
                        ? 'bg-yellow-500/20 border-2 border-yellow-500 glow-orange'
                        : step.highlightNode === node.key
                        ? 'bg-cyan-500/20 border-2 border-cyan-500 glow-cyan'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    <div className="text-xs text-slate-500 mb-1">
                      {idx === 0 ? 'LRU' : idx === step.linkedList.length - 1 ? 'MRU' : ''}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-sm ${step.highlightNode === node.key ? 'text-cyan-300' : 'text-slate-300'}`}>
                        k:{node.key}
                      </span>
                      <span className={`text-lg font-semibold ${step.highlightNode === node.key ? 'text-cyan-400' : 'text-slate-200'}`}>
                        v:{node.val}
                      </span>
                    </div>
                  </div>
                  {idx < step.linkedList.length - 1 && (
                    <span className="text-slate-600">↔</span>
                  )}
                </div>
              ))
            )}

            <span className="text-slate-600">↔</span>
            {/* Right dummy */}
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-500 font-mono text-sm">
              R
            </div>
          </div>
        </div>
      </div>

      {/* HashMap Visualization */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-cyan-400 font-mono text-sm">HashMap (cache)</span>
          <span className="text-slate-500 font-mono text-xs">
            key → node
          </span>
        </div>
        <div className="p-4">
          {cacheArray.length === 0 ? (
            <div className="text-center text-slate-600 font-mono py-2">Empty cache</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {cacheArray.map(([key, node]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    step.highlightKey === key
                      ? 'bg-cyan-500/20 border border-cyan-500/50 glow-cyan'
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}
                >
                  <span className="font-mono text-cyan-300">{key}</span>
                  <span className="text-slate-500 font-mono">→</span>
                  <span className="font-mono text-slate-300">
                    ({node.key}, {node.val})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid md:grid-cols-3 gap-3 text-xs mb-3">
        <div>
          <h4 className="text-cyan-400 font-mono mb-1">HashMap</h4>
          <p className="text-slate-400">
            Maps key → node for O(1) lookup.
            Without this, finding a key would be O(n).
          </p>
        </div>
        <div>
          <h4 className="text-purple-400 font-mono mb-1">Doubly Linked List</h4>
          <p className="text-slate-400">
            Maintains usage order. Left = LRU, Right = MRU.
            Enables O(1) removal and insertion.
          </p>
        </div>
        <div>
          <h4 className="text-orange-400 font-mono mb-1">Dummy Nodes</h4>
          <p className="text-slate-400">
            Left and right dummy nodes simplify edge cases.
            No special handling for empty list or single node.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/50 rounded-lg p-2">
          <span className="text-purple-400 font-mono">Time: O(1)</span>
          <p className="text-slate-400 text-xs mt-1">
            Both get() and put() are O(1). HashMap provides O(1) lookup,
            doubly linked list provides O(1) removal/insertion.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2">
          <span className="text-pink-400 font-mono">Space: O(n)</span>
          <p className="text-slate-400 text-xs mt-1">
            n = capacity. Store at most n nodes in both the
            hashmap and the doubly linked list.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '146',
        title: 'LRU Cache',
        difficulty: 'medium',
        tags: ['Hash Table', 'Linked List', 'Design'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="lru_cache.py"
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
