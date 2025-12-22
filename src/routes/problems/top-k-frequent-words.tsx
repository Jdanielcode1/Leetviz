import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { CodeLine, Example, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/problems/top-k-frequent-words')({
  component: TopKFrequentWords,
})

const CODE_LINES: Array<CodeLine> = [
  { num: 1, code: 'def topKFrequent(words: List[str], k: int) -> List[str]:' },
  { num: 2, code: '    # Step 1: Count frequency of each word' },
  { num: 3, code: '    freq = {}' },
  { num: 4, code: '    for word in words:' },
  { num: 5, code: '        if word in freq:' },
  { num: 6, code: '            freq[word] += 1' },
  { num: 7, code: '        else:' },
  { num: 8, code: '            freq[word] = 1' },
  { num: 9, code: '' },
  { num: 10, code: '    # Step 2: Convert to list of (word, count) pairs' },
  { num: 11, code: '    word_counts = []' },
  { num: 12, code: '    for word, count in freq.items():' },
  { num: 13, code: '        word_counts.append((word, count))' },
  { num: 14, code: '' },
  { num: 15, code: '    # Step 3: Sort by count (desc), then word (asc)' },
  { num: 16, code: '    def compare_key(item):' },
  { num: 17, code: '        word, count = item' },
  { num: 18, code: '        return (-count, word)  # negative for descending' },
  { num: 19, code: '' },
  { num: 20, code: '    word_counts.sort(key=compare_key)' },
  { num: 21, code: '' },
  { num: 22, code: '    # Step 4: Extract top k words' },
  { num: 23, code: '    result = []' },
  { num: 24, code: '    for i in range(k):' },
  { num: 25, code: '        result.append(word_counts[i][0])' },
  { num: 26, code: '' },
  { num: 27, code: '    return result' },
]

const PROBLEM_DESCRIPTION = `Given an array of strings words and an integer k, return the k most frequent strings.

Return the answer sorted by the frequency from highest to lowest. Sort the words with the same frequency by their lexicographical order.`

const EXAMPLES: Array<Example> = [
  {
    input: 'words = ["i", "love", "leetcode", "i", "love", "coding"], k = 2',
    output: '["i", "love"]',
    explanation: '"i" and "love" are the two most frequent words. Note that "i" comes before "love" due to lexicographical order.',
  },
  {
    input: 'words = ["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"], k = 4',
    output: '["the", "is", "sunny", "day"]',
    explanation: '"the", "is", "sunny" and "day" are the four most frequent words, with frequencies 4, 3, 2 and 1 respectively.',
  },
]

const CONSTRAINTS = [
  '1 <= words.length <= 500',
  '1 <= words[i].length <= 10',
  'words[i] consists of lowercase English letters.',
  'k is in the range [1, The number of unique words[i]]',
]

interface WordCount {
  word: string
  count: number
}

interface Step {
  lineNumber: number
  description: string
  insight: string
  phase: 'count' | 'convert' | 'sort' | 'extract' | 'done'
  freq: Map<string, number>
  wordCounts: Array<WordCount>
  sortedCounts: Array<WordCount>
  result: Array<string>
  highlightWord: string | null
  highlightIndex: number | null
  currentK: number
}

interface TestCaseData {
  words: Array<string>
  k: number
  expected: Array<string>
  explanation: Array<string>
}

const TEST_CASES: Array<TestCase<TestCaseData>> = [
  {
    id: 1,
    label: 'Example 1: Two most frequent',
    data: {
      words: ['i', 'love', 'leetcode', 'i', 'love', 'coding'],
      k: 2,
      expected: ['i', 'love'],
      explanation: [
        'words = ["i", "love", "leetcode", "i", "love", "coding"], k = 2',
        'Count frequencies: i=2, love=2, leetcode=1, coding=1',
        'Sort by (-count, word): (-2, "i"), (-2, "love"), (-1, "coding"), (-1, "leetcode")',
        '"i" and "love" both have count 2, but "i" < "love" alphabetically',
        'Return top 2: ["i", "love"]',
      ],
    },
  },
  {
    id: 2,
    label: 'Example 2: Four most frequent',
    data: {
      words: ['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'],
      k: 4,
      expected: ['the', 'is', 'sunny', 'day'],
      explanation: [
        'words = ["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"], k = 4',
        'Count frequencies: the=4, is=3, sunny=2, day=1',
        'Sort by (-count, word): (-4, "the"), (-3, "is"), (-2, "sunny"), (-1, "day")',
        'Return top 4: ["the", "is", "sunny", "day"]',
      ],
    },
  },
]

function generateSteps(words: Array<string>, k: number): Array<Step> {
  const steps: Array<Step> = []
  const freq = new Map<string, number>()
  const wordCounts: Array<WordCount> = []
  let sortedCounts: Array<WordCount> = []
  const result: Array<string> = []

  // Clone helpers
  const cloneFreq = () => new Map(freq)
  const cloneWordCounts = () => [...wordCounts]
  const cloneSortedCounts = () => [...sortedCounts]
  const cloneResult = () => [...result]

  // Initial step
  steps.push({
    lineNumber: 1,
    description: `topKFrequent(words, k=${k})`,
    insight: `Find the ${k} most frequent words from an array of ${words.length} words.`,
    phase: 'count',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  steps.push({
    lineNumber: 3,
    description: 'Initialize empty frequency map',
    insight: 'We\'ll use a hashmap to count occurrences of each word in O(1) per lookup.',
    phase: 'count',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  // Count phase - show a few iterations
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const prevCount = freq.get(word) || 0

    steps.push({
      lineNumber: 4,
      description: `Process word "${word}"`,
      insight: `Iteration ${i + 1}/${words.length}: Check if "${word}" is already in the map.`,
      phase: 'count',
      freq: cloneFreq(),
      wordCounts: cloneWordCounts(),
      sortedCounts: cloneSortedCounts(),
      result: cloneResult(),
      highlightWord: word,
      highlightIndex: null,
      currentK: k,
    })

    if (prevCount > 0) {
      steps.push({
        lineNumber: 6,
        description: `freq["${word}"] = ${prevCount} + 1 = ${prevCount + 1}`,
        insight: `"${word}" exists in map. Increment its count.`,
        phase: 'count',
        freq: cloneFreq(),
        wordCounts: cloneWordCounts(),
        sortedCounts: cloneSortedCounts(),
        result: cloneResult(),
        highlightWord: word,
        highlightIndex: null,
        currentK: k,
      })
    } else {
      steps.push({
        lineNumber: 8,
        description: `freq["${word}"] = 1`,
        insight: `"${word}" is new. Add it to map with count 1.`,
        phase: 'count',
        freq: cloneFreq(),
        wordCounts: cloneWordCounts(),
        sortedCounts: cloneSortedCounts(),
        result: cloneResult(),
        highlightWord: word,
        highlightIndex: null,
        currentK: k,
      })
    }

    freq.set(word, prevCount + 1)
  }

  // Show final frequency map
  steps.push({
    lineNumber: 10,
    description: 'Frequency counting complete',
    insight: `Counted ${freq.size} unique words from ${words.length} total words.`,
    phase: 'count',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  // Convert to list
  steps.push({
    lineNumber: 11,
    description: 'Convert map to list of (word, count) pairs',
    insight: 'We need a list to sort. Maps are not directly sortable.',
    phase: 'convert',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  for (const [word, count] of freq) {
    wordCounts.push({ word, count })
  }

  steps.push({
    lineNumber: 13,
    description: `Created ${wordCounts.length} (word, count) pairs`,
    insight: `List: [${wordCounts.map(wc => `("${wc.word}", ${wc.count})`).join(', ')}]`,
    phase: 'convert',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  // Sort phase
  steps.push({
    lineNumber: 16,
    description: 'Define sort key function',
    insight: 'Sort key returns (-count, word). Negative count for descending order; word for alphabetical tiebreaker.',
    phase: 'sort',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  steps.push({
    lineNumber: 18,
    description: 'Key: (-count, word)',
    insight: 'Example: ("love", 2) → (-2, "love"). Python sorts tuples element by element.',
    phase: 'sort',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  // Perform sort
  sortedCounts = [...wordCounts].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.word.localeCompare(b.word)
  })

  steps.push({
    lineNumber: 20,
    description: 'Sort by key function',
    insight: `Sorted: [${sortedCounts.map(wc => `("${wc.word}", ${wc.count})`).join(', ')}]`,
    phase: 'sort',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  // Extract top k
  steps.push({
    lineNumber: 23,
    description: 'Initialize empty result list',
    insight: `Extract the first ${k} words from sorted list.`,
    phase: 'extract',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  for (let i = 0; i < k; i++) {
    const wc = sortedCounts[i]

    steps.push({
      lineNumber: 24,
      description: `i = ${i}, extract "${wc.word}"`,
      insight: `Position ${i}: "${wc.word}" with count ${wc.count}`,
      phase: 'extract',
      freq: cloneFreq(),
      wordCounts: cloneWordCounts(),
      sortedCounts: cloneSortedCounts(),
      result: cloneResult(),
      highlightWord: wc.word,
      highlightIndex: i,
      currentK: k,
    })

    result.push(wc.word)

    steps.push({
      lineNumber: 25,
      description: `result.append("${wc.word}")`,
      insight: `Result so far: [${result.map(w => `"${w}"`).join(', ')}]`,
      phase: 'extract',
      freq: cloneFreq(),
      wordCounts: cloneWordCounts(),
      sortedCounts: cloneSortedCounts(),
      result: cloneResult(),
      highlightWord: wc.word,
      highlightIndex: i,
      currentK: k,
    })
  }

  // Return result
  steps.push({
    lineNumber: 27,
    description: `Return [${result.map(w => `"${w}"`).join(', ')}]`,
    insight: `Found the top ${k} most frequent words!`,
    phase: 'done',
    freq: cloneFreq(),
    wordCounts: cloneWordCounts(),
    sortedCounts: cloneSortedCounts(),
    result: cloneResult(),
    highlightWord: null,
    highlightIndex: null,
    currentK: k,
  })

  return steps
}

function TopKFrequentWords() {
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const testCase = TEST_CASES[selectedTestCase]
  const steps = useMemo(
    () => generateSteps(testCase.data.words, testCase.data.k),
    [testCase.data.words, testCase.data.k]
  )
  const step = steps[currentStep]

  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStep(0)
  }

  const freqArray = Array.from(step.freq.entries())

  // Visualization component specific to this problem
  const visualization = (
    <>
      <style>{`
        .glow-cyan { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .glow-orange { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
        .glow-green { box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .glow-purple { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
      `}</style>

      {/* Phase indicator */}
      <div className={`rounded-xl border p-4 transition-all duration-300 ${
        step.phase === 'count'
          ? 'bg-cyan-500/10 border-cyan-500/30'
          : step.phase === 'convert'
          ? 'bg-orange-500/10 border-orange-500/30'
          : step.phase === 'sort'
          ? 'bg-purple-500/10 border-purple-500/30'
          : step.phase === 'extract'
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-slate-800/50 border-slate-700'
      }`}>
        <div className="text-sm font-mono mb-2 text-slate-400">PHASE</div>
        <div className="font-mono text-lg">
          {step.phase === 'count' && <span className="text-cyan-400">1. Count Frequencies</span>}
          {step.phase === 'convert' && <span className="text-orange-400">2. Convert to List</span>}
          {step.phase === 'sort' && <span className="text-purple-400">3. Sort by (-count, word)</span>}
          {step.phase === 'extract' && <span className="text-emerald-400">4. Extract Top K</span>}
          {step.phase === 'done' && <span className="text-emerald-400">Complete!</span>}
        </div>
        {step.highlightWord && (
          <div className="mt-2 text-slate-300 font-mono">
            Current word: <span className="text-cyan-300">"{step.highlightWord}"</span>
          </div>
        )}
      </div>

      {/* Frequency Map */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="text-cyan-400 font-mono text-sm">Frequency Map (freq)</span>
          <span className="text-slate-500 font-mono text-xs">{freqArray.length} unique words</span>
        </div>
        <div className="p-4">
          {freqArray.length === 0 ? (
            <div className="text-center text-slate-600 font-mono py-2">Empty</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {freqArray.map(([word, count]) => (
                <div
                  key={word}
                  className={`px-3 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
                    step.highlightWord === word
                      ? 'bg-cyan-500/20 border border-cyan-500/50 glow-cyan'
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}
                >
                  <span className="text-slate-400">"{word}"</span>
                  <span className="text-slate-600 mx-1">:</span>
                  <span className={step.highlightWord === word ? 'text-cyan-300' : 'text-emerald-400'}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sorted List */}
      {step.sortedCounts.length > 0 && (
        <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
            <span className="text-purple-400 font-mono text-sm">Sorted by (-count, word)</span>
            <span className="text-slate-500 font-mono text-xs">k = {step.currentK}</span>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {step.sortedCounts.map((wc, idx) => (
                <div
                  key={wc.word}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    step.highlightIndex === idx
                      ? 'bg-emerald-500/20 border border-emerald-500/50 glow-green'
                      : idx < step.currentK
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'bg-slate-800/30 border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm ${
                      idx < step.currentK ? 'text-purple-400' : 'text-slate-500'
                    }`}>
                      [{idx}]
                    </span>
                    <span className={`font-mono ${
                      step.highlightIndex === idx ? 'text-emerald-300' : 'text-slate-200'
                    }`}>
                      "{wc.word}"
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm">count:</span>
                    <span className={`font-mono font-semibold ${
                      step.highlightIndex === idx ? 'text-emerald-400' : 'text-cyan-400'
                    }`}>
                      {wc.count}
                    </span>
                    <span className="text-slate-600 font-mono text-xs">
                      key: ({-wc.count}, "{wc.word}")
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {step.result.length > 0 && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <div className="text-sm font-mono mb-2 text-slate-400">RESULT</div>
          <div className="flex gap-2 flex-wrap">
            {step.result.map((word, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 font-mono text-emerald-300 glow-green"
              >
                "{word}"
              </div>
            ))}
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
          <h4 className="text-cyan-400 font-mono mb-1">1. Count Frequencies</h4>
          <p className="text-slate-400">
            Use a hashmap to count each word's occurrences.
            O(n) time to iterate through all words.
          </p>
        </div>
        <div>
          <h4 className="text-purple-400 font-mono mb-1">2. Sort with Custom Key</h4>
          <p className="text-slate-400">
            Sort by (-count, word). Negative count gives descending order.
            String comparison handles alphabetical tiebreaker.
          </p>
        </div>
        <div>
          <h4 className="text-emerald-400 font-mono mb-1">3. Extract Top K</h4>
          <p className="text-slate-400">
            Take first k elements from sorted list.
            This gives us the k most frequent words.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-purple-400 font-mono">Time: O(n log n)</span>
            <p className="text-slate-500 text-[10px] mt-1">
              Counting is O(n), sorting is O(m log m) where m = unique words
            </p>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-lg p-2">
            <span className="text-pink-400 font-mono">Space: O(n)</span>
            <p className="text-slate-500 text-[10px] mt-1">
              Hashmap + sorted list store up to n items
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: '692',
        title: 'Top K Frequent Words',
        difficulty: 'medium',
        tags: ['Hash Table', 'String', 'Heap'],
      }}
      description={PROBLEM_DESCRIPTION}
      examples={EXAMPLES}
      constraints={CONSTRAINTS}
      testCases={TEST_CASES}
      selectedTestCase={selectedTestCase}
      codeLines={CODE_LINES}
      codeFilename="top_k_frequent.py"
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
