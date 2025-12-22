import { createFileRoute } from '@tanstack/react-router'
import {  useMemo, useState } from 'react'
import type {ReactNode} from 'react';
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/magic-dictionary')({
  component: MagicDictionaryVisualization,
})

const CODE_LINES: Array<CodeLine> = [
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

const PROBLEM_DESCRIPTION = `Design a data structure that is initialized with a list of different words. Provided a string, you should determine if you can change exactly one character in this string to match any word in the data structure.

Implement the MagicDictionary class:
- MagicDictionary() initializes the object.
- void buildDict(String[] dictionary) sets the data structure with an array of distinct strings dictionary.
- bool search(String searchWord) returns true if you can change exactly one character in searchWord to match any string in the data structure, otherwise returns false.`

const EXAMPLES: Array<Example> = [
  {
    input: 'dictionary = ["hello", "leetcode"], searchWord = "hhllo"',
    output: 'true',
    explanation: 'We can change the second \'h\' to \'e\' to match "hello".',
  },
  {
    input: 'dictionary = ["hello", "leetcode"], searchWord = "hello"',
    output: 'false',
    explanation: '"hello" is already in the dictionary, but we need exactly one change.',
  },
  {
    input: 'dictionary = ["hello", "leetcode"], searchWord = "hell"',
    output: 'false',
    explanation: 'Different length words cannot match with exactly one character change.',
  },
]

const CONSTRAINTS = [
  '1 <= dictionary.length <= 100',
  '1 <= dictionary[i].length <= 100',
  'dictionary[i] consists of only lower-case English letters',
  'All the strings in dictionary are distinct',
  '1 <= searchWord.length <= 100',
  'searchWord consists of only lower-case English letters',
]

interface TestCaseData {
  dictionary: Array<string>
  searchWord: string
  expected: boolean
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: '"hhllo" → True',
    data: {
      dictionary: ['hello', 'leetcode'],
      searchWord: 'hhllo',
      expected: true,
    },
  },
  {
    id: 2,
    label: '"hello" → False',
    data: {
      dictionary: ['hello', 'leetcode'],
      searchWord: 'hello',
      expected: false,
    },
  },
  {
    id: 3,
    label: '"hell" → False',
    data: {
      dictionary: ['hello', 'leetcode'],
      searchWord: 'hell',
      expected: false,
    },
  },
]

// Trie node for visualization
interface TrieNode {
  char: string
  children: Map<string, TrieNode>
  isEnd: boolean
  id: string
}

function buildTrie(words: Array<string>): TrieNode {
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
  dictionary: Array<string>
  searchWord: string
  triePath: Array<string> // Node IDs in current path
  searchPos: number | null
  diff: number
  phase: string
  charIndex: number | null // j = ord(c) - ord('a')
  currentChar: string | null
  tryingChar: string | null
  result: boolean | null
}

function generateSteps(dictionary: Array<string>, searchWord: string): Array<Step> {
  const steps: Array<Step> = []

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
  steps: Array<Step>,
  node: TrieNode,
  word: string,
  i: number,
  pathId: string,
  diff: number,
  dictionary: Array<string>
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
  dictionary: Array<string>
  highlightPath: Array<string>
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
  const edges: Array<ReactNode> = []
  const nodes: Array<ReactNode> = []

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
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(
    () => generateSteps(testCase.data.dictionary, testCase.data.searchWord),
    [testCase.data.dictionary, testCase.data.searchWord]
  )
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const getDiffColor = (diff: number) => {
    if (diff === 0) return 'bg-slate-700 text-slate-300'
    return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
  }

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* Trie Visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-2">Trie Structure</h3>
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-3">Search Word</h3>
        <div className="flex justify-center gap-1">
          {step.searchWord.split('').map((char, idx) => {
            const isCurrentPos = step.searchPos === idx
            const isProcessed = step.searchPos !== null && idx < step.searchPos
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-lg transition-all ${
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
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-300 font-mono text-sm mb-3">DFS State</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-2">
            <div className="text-purple-400 text-xs font-mono mb-1">Position (i)</div>
            <div className="text-slate-200 font-mono text-xl">
              {step.searchPos ?? '-'}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2">
            <div className="text-amber-400 text-xs font-mono mb-1">Diff Count</div>
            <div
              className={`font-mono text-xl px-2 py-1 rounded ${getDiffColor(step.diff)}`}
            >
              {step.diff}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2">
            <div className="text-cyan-400 text-xs font-mono mb-1">Char Index (j)</div>
            <div className="text-slate-200 font-mono text-xl">
              {step.charIndex ?? '-'}
            </div>
          </div>
        </div>
        <div className="mt-3 bg-slate-900/50 rounded-lg p-2">
          <div className="text-slate-400 text-xs font-mono mb-1">Phase</div>
          <div className="text-slate-200 font-mono text-sm">{step.phase}</div>
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
            className={`font-mono text-2xl font-bold ${
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
    </>
  )

  // Algorithm insight component
  const algorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-slate-300 font-mono text-sm mb-3">Algorithm Insight</h3>
      <div className="grid gap-3 text-xs">
        <div>
          <h4 className="text-amber-400 font-mono mb-1">Trie Data Structure</h4>
          <p className="text-slate-400">Store dictionary words in a prefix tree for efficient character-by-character matching.</p>
        </div>
        <div>
          <h4 className="text-purple-400 font-mono mb-1">DFS with Diff Counter</h4>
          <p className="text-slate-400">Track exact matches (diff=0) and allow one substitution (diff=1).</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-emerald-400 font-mono">Time: O(n*26^L)</span>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-cyan-400 font-mono">Space: O(S)</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '676',
        title: 'Implement Magic Dictionary',
        difficulty: 'medium',
        tags: ['Hash Table', 'String', 'Trie'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="magic_dictionary.py"
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
