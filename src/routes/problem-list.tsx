import { useState, useMemo } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/problem-list')({
  component: ProblemsListPage,
})

interface Problem {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  tags: string[]
  path: string
  description: string
  acceptance?: number
  solved?: boolean
  starred?: boolean
}

const problems: Problem[] = [
  {
    id: 2,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    category: 'Linked List',
    tags: ['Linked List', 'Math', 'Recursion'],
    path: '/problems/add-two-numbers',
    description: 'Add two numbers represented as reversed linked lists.',
    acceptance: 42.3,
    solved: true,
  },
  {
    id: 412,
    title: 'Fizz Buzz',
    difficulty: 'Easy',
    category: 'Math',
    tags: ['Math', 'String', 'Simulation'],
    path: '/problems/fizz-buzz',
    description: 'Return FizzBuzz array for numbers 1 to n.',
    acceptance: 72.4,
    solved: false,
  },
  {
    id: 7,
    title: 'Reverse Integer',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['Math', 'Overflow'],
    path: '/problems/reverse-integer',
    description: 'Reverse digits of a 32-bit integer with overflow detection.',
    acceptance: 28.1,
    solved: true,
  },
  {
    id: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    path: '/problems/container-water',
    description: 'Find two lines that form a container holding the most water.',
    acceptance: 54.7,
    solved: true,
  },
  {
    id: 14,
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    category: 'String',
    tags: ['String', 'Trie'],
    path: '/problems/longest-common-prefix',
    description: 'Find the longest common prefix string amongst an array of strings.',
    acceptance: 62.4,
    solved: false,
  },
  {
    id: 15,
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Array',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    path: '/problems/three-sum',
    description: 'Find all unique triplets that sum to zero.',
    acceptance: 34.2,
    solved: true,
  },
  {
    id: 48,
    title: 'Rotate Image',
    difficulty: 'Medium',
    category: 'Matrix',
    tags: ['Array', 'Matrix', 'Math'],
    path: '/problems/rotate-image',
    description: 'Rotate an n×n matrix 90° clockwise in-place.',
    acceptance: 72.1,
    solved: false,
  },
  {
    id: 67,
    title: 'Add Binary',
    difficulty: 'Easy',
    category: 'Math',
    tags: ['Math', 'String', 'Bit Manipulation'],
    path: '/problems/add-binary',
    description: 'Add two binary strings and return their sum as a binary string.',
    acceptance: 52.8,
    solved: true,
  },
  {
    id: 88,
    title: 'Merge Sorted Array',
    difficulty: 'Easy',
    category: 'Array',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    path: '/problems/merge-sorted-array',
    description: 'Merge two sorted arrays in-place.',
    acceptance: 48.9,
    solved: false,
  },
  {
    id: 98,
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    category: 'Tree',
    tags: ['Tree', 'BST', 'Recursion'],
    path: '/problems/validate-bst',
    description: 'Determine if a binary tree is a valid BST.',
    acceptance: 32.4,
    solved: true,
  },
  {
    id: 146,
    title: 'LRU Cache',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Hash Table', 'Linked List', 'Design'],
    path: '/problems/lru-cache',
    description: 'Design a data structure for Least Recently Used cache.',
    acceptance: 41.8,
    solved: false,
  },
  {
    id: 227,
    title: 'Basic Calculator II',
    difficulty: 'Medium',
    category: 'Stack',
    tags: ['String', 'Stack', 'Math'],
    path: '/problems/basic-calculator-ii',
    description: 'Evaluate a mathematical expression with +, -, *, /.',
    acceptance: 43.2,
    solved: true,
  },
  {
    id: 380,
    title: 'Insert Delete GetRandom O(1)',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Array', 'Hash Table', 'Design'],
    path: '/problems/randomized-set',
    description: 'Design a data structure with O(1) insert, remove, and getRandom.',
    acceptance: 53.6,
    solved: false,
  },
  {
    id: 394,
    title: 'Decode String',
    difficulty: 'Medium',
    category: 'Stack',
    tags: ['String', 'Stack', 'Recursion'],
    path: '/problems/decode-string',
    description: 'Given an encoded string, return its decoded string.',
    acceptance: 58.7,
    solved: true,
  },
  {
    id: 430,
    title: 'Flatten a Multilevel Doubly Linked List',
    difficulty: 'Medium',
    category: 'Linked List',
    tags: ['Linked List', 'Stack', 'DFS'],
    path: '/problems/flatten-multilevel-list',
    description: 'Flatten a multilevel doubly linked list.',
    acceptance: 60.3,
    solved: false,
  },
  {
    id: 540,
    title: 'Single Element in a Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    tags: ['Array', 'Binary Search'],
    path: '/problems/single-element-sorted',
    description: 'Find the single non-duplicate element in a sorted array.',
    acceptance: 59.4,
    solved: true,
  },
  {
    id: 560,
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    category: 'Array',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    path: '/problems/subarray-sum-k',
    description: 'Count subarrays that sum to k using prefix sum.',
    acceptance: 44.1,
    solved: false,
  },
  {
    id: 676,
    title: 'Implement Magic Dictionary',
    difficulty: 'Medium',
    category: 'Trie',
    tags: ['Trie', 'DFS', 'String'],
    path: '/problems/magic-dictionary',
    description: 'Build a dictionary with fuzzy search.',
    acceptance: 57.2,
    solved: true,
  },
  {
    id: 692,
    title: 'Top K Frequent Words',
    difficulty: 'Medium',
    category: 'Hash Table',
    tags: ['Hash Table', 'Sorting', 'Heap'],
    path: '/problems/top-k-frequent-words',
    description: 'Return the k most frequent strings.',
    acceptance: 56.8,
    solved: false,
  },
  {
    id: 904,
    title: 'Fruit Into Baskets',
    difficulty: 'Medium',
    category: 'Sliding Window',
    tags: ['Array', 'Hash Table', 'Sliding Window'],
    path: '/problems/fruit-into-baskets',
    description: 'Find the longest subarray with at most 2 distinct elements.',
    acceptance: 45.3,
    solved: true,
  },
  {
    id: 994,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    category: 'BFS',
    tags: ['Array', 'BFS', 'Matrix'],
    path: '/problems/rotting-oranges',
    description: 'Multi-source BFS to find minimum time for all oranges to rot.',
    acceptance: 53.9,
    solved: false,
  },
  {
    id: 1091,
    title: 'Shortest Path in Binary Matrix',
    difficulty: 'Medium',
    category: 'BFS',
    tags: ['Array', 'BFS', 'Matrix'],
    path: '/problems/shortest-path-binary-matrix',
    description: 'Find shortest clear path using 8-directional BFS.',
    acceptance: 47.6,
    solved: true,
  },
  {
    id: 1209,
    title: 'Remove All Adjacent Duplicates in String II',
    difficulty: 'Medium',
    category: 'Stack',
    tags: ['String', 'Stack'],
    path: '/problems/remove-duplicates-ii',
    description: 'Remove k adjacent duplicate characters from a string.',
    acceptance: 61.2,
    solved: false,
  },
  {
    id: 1396,
    title: 'Design Underground System',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Hash Table', 'Design', 'String'],
    path: '/problems/underground-system',
    description: 'Track customer travel times and calculate route averages.',
    acceptance: 75.4,
    solved: true,
  },
  {
    id: 1472,
    title: 'Design Browser History',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Stack', 'Design', 'Doubly-Linked List'],
    path: '/problems/browser-history',
    description: 'Implement browser back/forward navigation.',
    acceptance: 78.1,
    solved: false,
  },
  {
    id: 1656,
    title: 'Design an Ordered Stream',
    difficulty: 'Easy',
    category: 'Design',
    tags: ['Array', 'Hash Table', 'Design'],
    path: '/problems/ordered-stream',
    description: 'Stream values in order using a pointer.',
    acceptance: 86.2,
    solved: true,
  },
]

// Extract unique tags with counts
const getTagsWithCounts = (problems: Problem[]) => {
  const tagCounts: Record<string, number> = {}
  problems.forEach((p) => {
    p.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
}

// Extract unique categories
const getCategories = (problems: Problem[]) => {
  const categories = new Set(problems.map((p) => p.category))
  return ['All Topics', ...Array.from(categories)]
}

const categoryIcons: Record<string, string> = {
  'All Topics': '📚',
  Array: '📊',
  String: '📝',
  'Linked List': '🔗',
  Tree: '🌳',
  Stack: '📚',
  Design: '🏗️',
  'Hash Table': '🗂️',
  'Binary Search': '🔍',
  'Two Pointers': '👆',
  'Sliding Window': '🪟',
  Matrix: '⬜',
  Math: '🔢',
  BFS: '🌊',
  Trie: '🌲',
}

function ProblemsListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Topics')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'difficulty' | 'acceptance'>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [starredProblems, setStarredProblems] = useState<Set<number>>(new Set([98, 227]))
  const [showTagsExpanded, setShowTagsExpanded] = useState(false)

  const tagsWithCounts = useMemo(() => getTagsWithCounts(problems), [])
  const categories = useMemo(() => getCategories(problems), [])

  const filteredProblems = useMemo(() => {
    let result = [...problems]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.id.toString().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'All Topics') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      result = result.filter((p) => p.difficulty === selectedDifficulty)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'difficulty':
          const order = { Easy: 1, Medium: 2, Hard: 3 }
          comparison = order[a.difficulty] - order[b.difficulty]
          break
        case 'acceptance':
          comparison = (a.acceptance || 0) - (b.acceptance || 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy, sortOrder])

  const toggleStar = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStarredProblems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const solvedCount = problems.filter((p) => p.solved).length

  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: '#0a1628' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .problem-row {
          transition: all 0.15s ease;
        }

        .problem-row:hover {
          background: rgba(56, 189, 248, 0.05);
        }

        .difficulty-bars {
          display: flex;
          gap: 1px;
          height: 12px;
          align-items: flex-end;
        }

        .difficulty-bar {
          width: 3px;
          background: currentColor;
          border-radius: 1px;
          opacity: 0.6;
        }

        .tag-pill {
          transition: all 0.2s ease;
        }

        .tag-pill:hover {
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease forwards;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
      `}</style>

      <div className="blueprint-grid min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Link
                to="/"
                className="text-slate-500 hover:text-cyan-400 transition-colors font-mono text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">Problem Collection</h1>
                <p className="text-slate-500 font-display">
                  Select a problem to explore its step-by-step visualization
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-slate-500 font-mono">Progress</div>
                  <div className="text-lg font-display font-semibold text-cyan-400">
                    {solvedCount}/{problems.length} Solved
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin pb-2">
              {(showTagsExpanded ? tagsWithCounts : tagsWithCounts.slice(0, 8)).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="tag-pill flex items-center gap-2 text-slate-400 hover:text-cyan-300 whitespace-nowrap font-mono text-sm"
                >
                  <span>{tag}</span>
                  <span className="text-slate-600 text-xs">{count}</span>
                </button>
              ))}
              {tagsWithCounts.length > 8 && (
                <button
                  onClick={() => setShowTagsExpanded(!showTagsExpanded)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-mono whitespace-nowrap"
                >
                  {showTagsExpanded ? 'Show less' : `+${tagsWithCounts.length - 8} more`}
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-display text-sm transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  <span>{categoryIcons[category] || '📁'}</span>
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px]">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>

            {/* Sort Button */}
            <button
              onClick={() => handleSort(sortBy)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="font-mono text-sm">Sort</span>
            </button>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? diff === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : diff === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="text-slate-500 font-mono text-sm">{filteredProblems.length} problems</div>
          </div>

          {/* Problems Table */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_100px_100px_80px_40px] gap-4 px-4 py-3 bg-slate-800/30 border-b border-slate-800 text-slate-500 font-mono text-xs uppercase tracking-wider">
              <div></div>
              <button
                onClick={() => handleSort('title')}
                className="text-left hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                Title
                {sortBy === 'title' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </button>
              <button
                onClick={() => handleSort('acceptance')}
                className="text-left hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                Acceptance
                {sortBy === 'acceptance' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </button>
              <button
                onClick={() => handleSort('difficulty')}
                className="text-left hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                Difficulty
                {sortBy === 'difficulty' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </button>
              <div></div>
              <div></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-800/50">
              {filteredProblems.map((problem, index) => (
                <div
                  key={problem.id}
                  onClick={() => navigate({ to: problem.path })}
                  className="problem-row grid grid-cols-[40px_1fr_100px_100px_80px_40px] gap-4 px-4 py-4 items-center animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  {/* Status */}
                  <div className="flex justify-center">
                    {problem.solved ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-sm">{problem.id}.</span>
                      <span className="text-slate-200 font-display hover:text-cyan-300 transition-colors">
                        {problem.title}
                      </span>
                    </div>
                  </div>

                  {/* Acceptance */}
                  <div className="text-slate-400 font-mono text-sm">{problem.acceptance?.toFixed(1)}%</div>

                  {/* Difficulty */}
                  <div>
                    <span
                      className={`text-sm font-medium ${
                        problem.difficulty === 'Easy'
                          ? 'text-emerald-400'
                          : problem.difficulty === 'Medium'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Difficulty Bars */}
                  <div
                    className={`difficulty-bars ${
                      problem.difficulty === 'Easy'
                        ? 'text-emerald-400'
                        : problem.difficulty === 'Medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="difficulty-bar"
                        style={{
                          height: `${4 + i * 1.2}px`,
                          opacity:
                            problem.difficulty === 'Easy'
                              ? i < 3
                                ? 1
                                : 0.2
                              : problem.difficulty === 'Medium'
                                ? i < 5
                                  ? 1
                                  : 0.2
                                : 1,
                        }}
                      />
                    ))}
                  </div>

                  {/* Star */}
                  <button
                    onClick={(e) => toggleStar(problem.id, e)}
                    className={`flex justify-center transition-colors ${
                      starredProblems.has(problem.id)
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={starredProblems.has(problem.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProblems.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-400 font-display text-lg mb-2">No problems found</h3>
                <p className="text-slate-600 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">{problems.filter((p) => p.difficulty === 'Easy').length}</span>
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-mono uppercase">Easy</div>
                  <div className="text-emerald-400 font-display font-semibold">
                    {problems.filter((p) => p.difficulty === 'Easy' && p.solved).length} solved
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <span className="text-amber-400 font-bold">{problems.filter((p) => p.difficulty === 'Medium').length}</span>
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-mono uppercase">Medium</div>
                  <div className="text-amber-400 font-display font-semibold">
                    {problems.filter((p) => p.difficulty === 'Medium' && p.solved).length} solved
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <span className="text-rose-400 font-bold">{problems.filter((p) => p.difficulty === 'Hard').length}</span>
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-mono uppercase">Hard</div>
                  <div className="text-rose-400 font-display font-semibold">
                    {problems.filter((p) => p.difficulty === 'Hard' && p.solved).length} solved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
