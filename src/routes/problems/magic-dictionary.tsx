import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, type ReactNode } from 'react'

export const Route = createFileRoute('/problems/magic-dictionary')({
  component: MagicDictionaryVisualization,
})

const CODE_LINES = [
  { num: 1, code: 'class Trie:' },
  { num: 2, code: '    def __init__(self):' },
  { num: 3, code: '        self.children = [None] * 26' },
  { num: 4, code: '        self.is_end = False' },
  { num: 5, code: '' },
  { num: 6, code: '    def insert(self, w: str) -> None:' },
  { num: 7, code: '        node = self' },
  { num: 8, code: '        for c in w:' },
  { num: 9, code: '            idx = ord(c) - ord("a")' },
  { num: 10, code: '            if node.children[idx] is None:' },
  { num: 11, code: '                node.children[idx] = Trie()' },
  { num: 12, code: '            node = node.children[idx]' },
  { num: 13, code: '        node.is_end = True' },
  { num: 14, code: '' },
  { num: 15, code: '    def search(self, w: str) -> bool:' },
  { num: 16, code: '        def dfs(i: int, node: Trie, diff: int) -> bool:' },
  { num: 17, code: '            if i == len(w):' },
  { num: 18, code: '                return diff == 1 and node.is_end' },
  { num: 19, code: '            j = ord(w[i]) - ord("a")' },
  { num: 20, code: '            if node.children[j] and dfs(i+1, node.children[j], diff):' },
  { num: 21, code: '                return True' },
  { num: 22, code: '            return diff == 0 and any(' },
  { num: 23, code: '                node.children[k] and dfs(i+1, node.children[k], 1)' },
  { num: 24, code: '                for k in range(26) if k != j' },
  { num: 25, code: '            )' },
  { num: 26, code: '        return dfs(0, self, 0)' },
]

interface TestCase {
  id: number
  name: string
  dictionary: string[]
  searchWord: string
  expected: boolean
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: '"hhllo" → True',
    dictionary: ['hello', 'leetcode'],
    searchWord: 'hhllo',
    expected: true,
  },
  {
    id: 2,
    name: '"hello" → False',
    dictionary: ['hello', 'leetcode'],
    searchWord: 'hello',
    expected: false,
  },
  {
    id: 3,
    name: '"hell" → False',
    dictionary: ['hello', 'leetcode'],
    searchWord: 'hell',
    expected: false,
  },
]

// Trie node for visualization
interface TrieNode {
  char: string
  children: Map<string, TrieNode>
  isEnd: boolean
  id: string
}

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = { char: 'root', children: new Map(), isEnd: false, id: 'root' }
  for (const word of words) {
    let node = root
    for (let i = 0; i < word.length; i++) {
      const c = word[i]
      if (!node.children.has(c)) {
        node.children.set(c, { char: c, children: new Map(), isEnd: false, id: `${node.id}-${c}` })
      }
      node = node.children.get(c)!
    }
    node.isEnd = true
  }
  return root
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  dictionary: string[]
  searchWord: string
  triePath: string[] // Node IDs in current path
  searchPos: number | null
  diff: number
  phase: string
  charIndex: number | null // j = ord(c) - ord('a')
  currentChar: string | null
  tryingChar: string | null
  result: boolean | null
}

function generateSteps(dictionary: string[], searchWord: string): Step[] {
  const steps: Step[] = []

  // Phase 1: Build Trie
  steps.push({
    lineNumber: 1,
    description: 'Initialize MagicDictionary with Trie structure',
    insight: 'A Trie (prefix tree) efficiently stores words and enables character-by-character search',
    dictionary,
    searchWord,
    triePath: ['root'],
    searchPos: null,
    diff: 0,
    phase: 'init',
    charIndex: null,
    currentChar: null,
    tryingChar: null,
    result: null,
  })

  // Insert words
  for (const word of dictionary) {
    steps.push({
      lineNumber: 6,
      description: `Insert "${word}" into Trie`,
      insight: `Adding word "${word}" - each character creates a path in the Trie`,
      dictionary,
      searchWord,
      triePath: ['root'],
      searchPos: null,
      diff: 0,
      phase: 'insert',
      charIndex: null,
      currentChar: null,
      tryingChar: null,
      result: null,
    })

    const path = ['root']
    for (let i = 0; i < word.length; i++) {
      path.push(path[path.length - 1] + '-' + word[i])
      steps.push({
        lineNumber: 12,
        description: `Insert '${word[i]}' at position ${i}`,
        insight: `Creating/traversing node for '${word[i]}' (index ${word[i].charCodeAt(0) - 97})`,
        dictionary,
        searchWord,
        triePath: [...path],
        searchPos: null,
        diff: 0,
        phase: 'insert',
        charIndex: word[i].charCodeAt(0) - 97,
        currentChar: word[i],
        tryingChar: null,
        result: null,
      })
    }

    steps.push({
      lineNumber: 13,
      description: `Mark end of word "${word}"`,
      insight: `node.is_end = True marks this node as a valid word ending`,
      dictionary,
      searchWord,
      triePath: [...path],
      searchPos: null,
      diff: 0,
      phase: 'insert-end',
      charIndex: null,
      currentChar: null,
      tryingChar: null,
      result: null,
    })
  }

  // Phase 2: Search
  steps.push({
    lineNumber: 15,
    description: `Search for "${searchWord}" with exactly 1 change`,
    insight: 'DFS explores paths where exactly ONE character differs from the search word',
    dictionary,
    searchWord,
    triePath: ['root'],
    searchPos: 0,
    diff: 0,
    phase: 'search-start',
    charIndex: null,
    currentChar: null,
    tryingChar: null,
    result: null,
  })

  steps.push({
    lineNumber: 26,
    description: 'Call dfs(0, root, 0)',
    insight: 'Start DFS from root with position 0 and diff = 0 (no changes made yet)',
    dictionary,
    searchWord,
    triePath: ['root'],
    searchPos: 0,
    diff: 0,
    phase: 'dfs-start',
    charIndex: null,
    currentChar: null,
    tryingChar: null,
    result: null,
  })

  // Simulate DFS search
  const trie = buildTrie(dictionary)
  const finalResult = simulateDFS(steps, trie, searchWord, 0, 'root', 0, dictionary)

  // Final result
  steps.push({
    lineNumber: 26,
    description: `Return ${finalResult}`,
    insight: finalResult
      ? 'Found a dictionary word that differs by exactly 1 character!'
      : 'No dictionary word differs by exactly 1 character',
    dictionary,
    searchWord,
    triePath: ['root'],
    searchPos: null,
    diff: 0,
    phase: 'result',
    charIndex: null,
    currentChar: null,
    tryingChar: null,
    result: finalResult,
  })

  return steps
}

function simulateDFS(
  steps: Step[],
  node: TrieNode,
  word: string,
  i: number,
  pathId: string,
  diff: number,
  dictionary: string[]
): boolean {
  // Base case: end of word
  if (i === word.length) {
    const isMatch = diff === 1 && node.isEnd
    steps.push({
      lineNumber: 17,
      description: `i == len(w): ${i} == ${word.length}`,
      insight: `Reached end of word. diff=${diff}, is_end=${node.isEnd} → ${isMatch ? 'MATCH!' : 'no match'}`,
      dictionary,
      searchWord: word,
      triePath: [pathId],
      searchPos: i,
      diff,
      phase: 'base-case',
      charIndex: null,
      currentChar: null,
      tryingChar: null,
      result: isMatch,
    })
    return isMatch
  }

  const c = word[i]
  const j = c.charCodeAt(0) - 97

  steps.push({
    lineNumber: 19,
    description: `j = ord('${c}') - ord('a') = ${j}`,
    insight: `Looking for exact match with '${c}' at position ${i}`,
    dictionary,
    searchWord: word,
    triePath: [pathId],
    searchPos: i,
    diff,
    phase: 'calc-index',
    charIndex: j,
    currentChar: c,
    tryingChar: null,
    result: null,
  })

  // Try exact match first
  if (node.children.has(c)) {
    const childId = pathId + '-' + c
    steps.push({
      lineNumber: 20,
      description: `Try exact match: node.children['${c}'] exists, recurse`,
      insight: `Character '${c}' found in Trie, continue with same diff=${diff}`,
      dictionary,
      searchWord: word,
      triePath: [pathId, childId],
      searchPos: i,
      diff,
      phase: 'exact-match',
      charIndex: j,
      currentChar: c,
      tryingChar: c,
      result: null,
    })

    if (simulateDFS(steps, node.children.get(c)!, word, i + 1, childId, diff, dictionary)) {
      steps.push({
        lineNumber: 21,
        description: 'Exact match path returned True',
        insight: 'Found a valid path with exactly 1 change!',
        dictionary,
        searchWord: word,
        triePath: [pathId, childId],
        searchPos: i,
        diff,
        phase: 'return-true',
        charIndex: j,
        currentChar: c,
        tryingChar: c,
        result: true,
      })
      return true
    }
  } else {
    steps.push({
      lineNumber: 20,
      description: `node.children['${c}'] is None - no exact match`,
      insight: `Character '${c}' not in Trie at this position`,
      dictionary,
      searchWord: word,
      triePath: [pathId],
      searchPos: i,
      diff,
      phase: 'no-exact-match',
      charIndex: j,
      currentChar: c,
      tryingChar: null,
      result: null,
    })
  }

  // Try substitution (only if diff == 0)
  if (diff === 0) {
    steps.push({
      lineNumber: 22,
      description: `diff == 0, try substituting '${c}' with other characters`,
      insight: 'Since we haven\'t made a change yet, try all possible substitutions',
      dictionary,
      searchWord: word,
      triePath: [pathId],
      searchPos: i,
      diff,
      phase: 'try-substitution',
      charIndex: j,
      currentChar: c,
      tryingChar: null,
      result: null,
    })

    // Try each possible character that exists in children
    for (const [childChar, childNode] of node.children) {
      if (childChar !== c) {
        const k = childChar.charCodeAt(0) - 97
        const childId = pathId + '-' + childChar
        steps.push({
          lineNumber: 23,
          description: `Try substitution: '${c}' → '${childChar}' (k=${k})`,
          insight: `Trying to change position ${i} from '${c}' to '${childChar}', setting diff=1`,
          dictionary,
          searchWord: word,
          triePath: [pathId, childId],
          searchPos: i,
          diff: 1,
          phase: 'substitution',
          charIndex: k,
          currentChar: c,
          tryingChar: childChar,
          result: null,
        })

        if (simulateDFS(steps, childNode, word, i + 1, childId, 1, dictionary)) {
          steps.push({
            lineNumber: 25,
            description: `Substitution '${c}' → '${childChar}' succeeded!`,
            insight: `Found valid path by changing '${c}' to '${childChar}' at position ${i}`,
            dictionary,
            searchWord: word,
            triePath: [pathId, childId],
            searchPos: i,
            diff: 1,
            phase: 'substitution-success',
            charIndex: k,
            currentChar: c,
            tryingChar: childChar,
            result: true,
          })
          return true
        }
      }
    }
  } else {
    steps.push({
      lineNumber: 22,
      description: 'diff != 0, cannot make another substitution',
      insight: 'Already made 1 change, cannot make another',
      dictionary,
      searchWord: word,
      triePath: [pathId],
      searchPos: i,
      diff,
      phase: 'no-more-substitutions',
      charIndex: j,
      currentChar: c,
      tryingChar: null,
      result: null,
    })
  }

  return false
}

// SVG Trie visualization component
function TrieVisualization({
  dictionary,
  highlightPath,
}: {
  dictionary: string[]
  highlightPath: string[]
}) {
  const trie = useMemo(() => buildTrie(dictionary), [dictionary])

  // Calculate positions for nodes
  interface NodePosition {
    x: number
    y: number
    node: TrieNode
  }

  const positions = useMemo(() => {
    const pos: Map<string, NodePosition> = new Map()
    const levelWidth = 300
    const levelHeight = 60

    function layoutNode(node: TrieNode, x: number, y: number, width: number) {
      pos.set(node.id, { x, y, node })
      const children = Array.from(node.children.values())
      if (children.length === 0) return

      const childWidth = width / children.length
      children.forEach((child, i) => {
        const childX = x - width / 2 + childWidth * i + childWidth / 2
        layoutNode(child, childX, y + levelHeight, childWidth)
      })
    }

    layoutNode(trie, 150, 30, levelWidth)
    return pos
  }, [trie])

  const highlightSet = new Set(highlightPath)

  // Render edges first, then nodes
  const edges: ReactNode[] = []
  const nodes: ReactNode[] = []

  positions.forEach((pos, id) => {
    const isHighlighted = highlightSet.has(id)
    const isRoot = id === 'root'

    // Draw edges to children
    pos.node.children.forEach((child) => {
      const childPos = positions.get(child.id)
      if (childPos) {
        const isEdgeHighlighted = highlightSet.has(id) && highlightSet.has(child.id)
        edges.push(
          <line
            key={`edge-${id}-${child.id}`}
            x1={pos.x}
            y1={pos.y + 15}
            x2={childPos.x}
            y2={childPos.y - 15}
            stroke={isEdgeHighlighted ? '#fbbf24' : '#475569'}
            strokeWidth={isEdgeHighlighted ? 2 : 1}
          />
        )
      }
    })

    // Draw node
    nodes.push(
      <g key={id}>
        <circle
          cx={pos.x}
          cy={pos.y}
          r={isRoot ? 20 : 18}
          fill={isHighlighted ? 'rgba(251, 191, 36, 0.3)' : 'rgba(51, 65, 85, 0.8)'}
          stroke={isHighlighted ? '#fbbf24' : pos.node.isEnd ? '#10b981' : '#64748b'}
          strokeWidth={isHighlighted ? 2 : pos.node.isEnd ? 2 : 1}
        />
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fill={isHighlighted ? '#fbbf24' : '#e2e8f0'}
          fontSize={isRoot ? 10 : 14}
          fontFamily="IBM Plex Mono"
        >
          {isRoot ? 'root' : pos.node.char}
        </text>
        {pos.node.isEnd && (
          <text
            x={pos.x + 15}
            y={pos.y - 10}
            fill="#10b981"
            fontSize={12}
            fontWeight="bold"
          >
            *
          </text>
        )}
      </g>
    )
  })

  return (
    <svg width="300" height="280" className="mx-auto">
      {edges}
      {nodes}
    </svg>
  )
}

function MagicDictionaryVisualization() {
  const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = useMemo(
    () => generateSteps(selectedTestCase.dictionary, selectedTestCase.searchWord),
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

  const getDiffColor = (diff: number) => {
    if (diff === 0) return 'bg-slate-700 text-slate-300'
    return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
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

      <div className="blueprint-grid min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <a
                href="/"
                className="text-slate-500 hover:text-cyan-400 transition-colors font-mono text-sm"
              >
                &larr; Back
              </a>
              <span className="text-slate-700">/</span>
              <span className="text-cyan-400 font-mono text-sm">problems</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-slate-500 font-mono">#676</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MEDIUM
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
                  Implement Magic Dictionary
                </h1>
                <div className="flex gap-2">
                  {['Hash Table', 'String', 'Design', 'Trie'].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Case Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-slate-500 font-mono text-sm">TEST CASE:</span>
              <div className="flex gap-2 flex-wrap">
                {TEST_CASES.map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => handleTestCaseChange(tc)}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      selectedTestCase.id === tc.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {tc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
            {/* Trie Visualization */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 blueprint-grid">
              <h3 className="font-display font-semibold text-slate-300 mb-2">Trie Structure</h3>
              <div className="text-slate-500 text-xs mb-2">
                Dictionary: [{step.dictionary.map((w) => `"${w}"`).join(', ')}]
              </div>
              <TrieVisualization dictionary={step.dictionary} highlightPath={step.triePath} />
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500"></span>
                  <span className="text-slate-400">Current Path</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">*</span>
                  <span className="text-slate-400">Word End</span>
                </span>
              </div>
            </div>

            {/* Search Word Display */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">Search Word</h3>
              <div className="flex justify-center gap-1">
                {step.searchWord.split('').map((char, idx) => {
                  const isCurrentPos = step.searchPos === idx
                  const isProcessed = step.searchPos !== null && idx < step.searchPos
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-xl transition-all ${
                          isCurrentPos
                            ? 'bg-purple-500/30 border-purple-400 text-purple-200 ring-2 ring-purple-400'
                            : isProcessed
                              ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {char}
                      </div>
                      <span className="text-slate-500 text-xs mt-1">{idx}</span>
                    </div>
                  )
                })}
              </div>
              {step.tryingChar && step.currentChar && step.tryingChar !== step.currentChar && (
                <div className="text-center mt-3 text-amber-400 font-mono text-sm">
                  Trying: '{step.currentChar}' → '{step.tryingChar}'
                </div>
              )}
            </div>

            {/* DFS State Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">DFS State</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-purple-400 text-xs font-display mb-1">Position (i)</div>
                  <div className="text-slate-200 font-mono text-2xl">
                    {step.searchPos ?? '-'}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-amber-400 text-xs font-display mb-1">Diff Count</div>
                  <div
                    className={`font-mono text-2xl px-2 py-1 rounded ${getDiffColor(step.diff)}`}
                  >
                    {step.diff}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-cyan-400 text-xs font-display mb-1">Char Index (j)</div>
                  <div className="text-slate-200 font-mono text-2xl">
                    {step.charIndex ?? '-'}
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs font-display mb-1">Phase</div>
                <div className="text-slate-200 font-mono">{step.phase}</div>
              </div>
            </div>

            {/* Result Display */}
            {step.result !== null && (
              <div
                className={`rounded-xl border-2 p-4 text-center ${
                  step.result
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-rose-500/10 border-rose-500/50'
                }`}
              >
                <div
                  className={`font-mono text-3xl font-bold ${
                    step.result ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {step.result ? 'True' : 'False'}
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {step.result
                    ? 'Found word with exactly 1 character difference!'
                    : step.phase === 'base-case'
                      ? step.diff === 0
                        ? 'Exact match (0 changes) - not valid'
                        : 'Not a word ending in dictionary'
                      : 'No valid path found'}
                </div>
              </div>
            )}

            {/* Insight Panel */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-4">
              <h3 className="font-display font-semibold text-purple-300 mb-2">Insight</h3>
              <p className="text-slate-300">{step.insight}</p>
            </div>

            {/* Complexity Panel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-display font-semibold text-slate-300 mb-3">
                Complexity Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Time Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(n * 26^L)</div>
                  <div className="text-slate-500 text-xs mt-1">Worst case for search</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs font-display mb-1">Space Complexity</div>
                  <div className="text-emerald-400 font-mono text-lg">O(S)</div>
                  <div className="text-slate-500 text-xs mt-1">Total chars in dictionary</div>
                </div>
              </div>
              <div className="text-slate-500 text-xs mt-2 text-center">
                n = words, L = max word length, S = sum of all word lengths
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
  </div>
  )
}
