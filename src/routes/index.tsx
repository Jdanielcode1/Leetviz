import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

interface Problem {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  tags: string[]
  path: string
  description: string
}

const problems: Problem[] = [
  {
    id: 394,
    title: 'Decode String',
    difficulty: 'Medium',
    category: 'Stack',
    tags: ['String', 'Stack', 'Recursion'],
    path: '/problems/decode-string',
    description: 'Given an encoded string, return its decoded string using stack-based approach.',
  },
  {
    id: 430,
    title: 'Flatten a Multilevel Doubly Linked List',
    difficulty: 'Medium',
    category: 'Linked List',
    tags: ['Linked List', 'Stack', 'DFS'],
    path: '/problems/flatten-multilevel-list',
    description: 'Flatten a multilevel doubly linked list where nodes have child pointers to nested lists.',
  },
  {
    id: 1209,
    title: 'Remove All Adjacent Duplicates in String II',
    difficulty: 'Medium',
    category: 'Stack',
    tags: ['String', 'Stack'],
    path: '/problems/remove-duplicates-ii',
    description: 'Remove k adjacent duplicate characters from a string using a stack-based approach.',
  },
  {
    id: 98,
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    category: 'Tree',
    tags: ['Tree', 'BST', 'Recursion'],
    path: '/problems/validate-bst',
    description: 'Determine if a binary tree is a valid BST using recursive range checking.',
  },
  {
    id: 227,
    title: 'Basic Calculator II',
    difficulty: 'Medium',
    category: 'Stack',
    tags: ['String', 'Stack', 'Math'],
    path: '/problems/basic-calculator-ii',
    description: 'Evaluate a mathematical expression with +, -, *, / using a stack-based approach.',
  },
  {
    id: 560,
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    category: 'Array',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    path: '/problems/subarray-sum-k',
    description: 'Count subarrays that sum to k using prefix sum and hashmap technique.',
  },
  {
    id: 48,
    title: 'Rotate Image',
    difficulty: 'Medium',
    category: 'Matrix',
    tags: ['Array', 'Matrix', 'Math'],
    path: '/problems/rotate-image',
    description: 'Rotate an n×n matrix 90° clockwise in-place using transpose and reverse.',
  },
  {
    id: 7,
    title: 'Reverse Integer',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['Math', 'Overflow'],
    path: '/problems/reverse-integer',
    description: 'Reverse digits of a 32-bit integer with overflow detection.',
  },
  {
    id: 15,
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Array',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    path: '/problems/three-sum',
    description: 'Find all unique triplets that sum to zero using two-pointer technique.',
  },
  {
    id: 1396,
    title: 'Design Underground System',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Hash Table', 'Design', 'String'],
    path: '/problems/underground-system',
    description: 'Track customer travel times and calculate route averages using hashmaps.',
  },
  {
    id: 14,
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    category: 'String',
    tags: ['String', 'Trie'],
    path: '/problems/longest-common-prefix',
    description: 'Find the longest common prefix string amongst an array of strings.',
  },
  {
    id: 146,
    title: 'LRU Cache',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Hash Table', 'Linked List', 'Design'],
    path: '/problems/lru-cache',
    description: 'Design a data structure for Least Recently Used cache with O(1) operations.',
  },
  {
    id: 692,
    title: 'Top K Frequent Words',
    difficulty: 'Medium',
    category: 'Hash Table',
    tags: ['Hash Table', 'Sorting', 'Heap'],
    path: '/problems/top-k-frequent-words',
    description: 'Return the k most frequent strings sorted by frequency and lexicographically.',
  },
  {
    id: 88,
    title: 'Merge Sorted Array',
    difficulty: 'Easy',
    category: 'Array',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    path: '/problems/merge-sorted-array',
    description: 'Merge two sorted arrays in-place using the three-pointer technique from the end.',
  },
  {
    id: 904,
    title: 'Fruit Into Baskets',
    difficulty: 'Medium',
    category: 'Sliding Window',
    tags: ['Array', 'Hash Table', 'Sliding Window'],
    path: '/problems/fruit-into-baskets',
    description: 'Find the longest subarray with at most 2 distinct elements using sliding window.',
  },
  {
    id: 1656,
    title: 'Design an Ordered Stream',
    difficulty: 'Easy',
    category: 'Design',
    tags: ['Array', 'Hash Table', 'Design'],
    path: '/problems/ordered-stream',
    description: 'Stream values in order using a pointer that advances through consecutive filled positions.',
  },
  {
    id: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    path: '/problems/container-water',
    description: 'Find two lines that form a container holding the most water using two-pointer technique.',
  },
  {
    id: 540,
    title: 'Single Element in a Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    tags: ['Array', 'Binary Search'],
    path: '/problems/single-element-sorted',
    description: 'Find the single non-duplicate element in a sorted array using binary search with parity pattern.',
  },
  {
    id: 1472,
    title: 'Design Browser History',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Stack', 'Design', 'Doubly-Linked List'],
    path: '/problems/browser-history',
    description: 'Implement browser back/forward navigation using two stacks for history and future.',
  },
  {
    id: 994,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    category: 'BFS',
    tags: ['Array', 'BFS', 'Matrix'],
    path: '/problems/rotting-oranges',
    description: 'Multi-source BFS to find minimum time for all oranges to rot, or -1 if impossible.',
  },
  {
    id: 1091,
    title: 'Shortest Path in Binary Matrix',
    difficulty: 'Medium',
    category: 'BFS',
    tags: ['Array', 'BFS', 'Matrix'],
    path: '/problems/shortest-path-binary-matrix',
    description: 'Find shortest clear path from top-left to bottom-right using 8-directional BFS.',
  },
  {
    id: 67,
    title: 'Add Binary',
    difficulty: 'Easy',
    category: 'Math',
    tags: ['Math', 'String', 'Bit Manipulation'],
    path: '/problems/add-binary',
    description: 'Add two binary strings and return their sum as a binary string.',
  },
  {
    id: 676,
    title: 'Implement Magic Dictionary',
    difficulty: 'Medium',
    category: 'Trie',
    tags: ['Trie', 'DFS', 'String'],
    path: '/problems/magic-dictionary',
    description: 'Build a dictionary with search that matches words differing by exactly one character.',
  },
  {
    id: 2,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    category: 'Linked List',
    tags: ['Linked List', 'Math', 'Recursion'],
    path: '/problems/add-two-numbers',
    description: 'Add two numbers represented as reversed linked lists using dummy node pattern.',
  },
  {
    id: 380,
    title: 'Insert Delete GetRandom O(1)',
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Array', 'Hash Table', 'Design'],
    path: '/problems/randomized-set',
    description: 'Design a data structure with O(1) insert, remove, and getRandom using array + hashmap combo.',
  },
]

const difficultyColors = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Hard: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
}

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        .font-code { font-family: 'Fira Code', monospace; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite; 
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        
        .hero-gradient {
          background: 
            radial-gradient(ellipse at 20% 20%, rgba(251, 146, 60, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%);
        }
        
        .card-shine {
          position: relative;
          overflow: hidden;
        }
        
        .card-shine::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.03),
            transparent
          );
          transition: left 0.5s ease;
        }
        
        .card-shine:hover::before {
          left: 100%;
        }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative hero-gradient">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-40 right-[25%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
          {/* Logo / Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-float">
                <span className="text-2xl font-bold text-slate-950 font-code">&lt;/&gt;</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
                <svg className="w-3 h-3 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-center">
            <span className="block text-6xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent animate-gradient">
                LeetViz
              </span>
            </span>
            <span className="block text-2xl md:text-3xl font-medium text-slate-400 mt-4">
              Algorithm Visualizations for LeetCode Problems
            </span>
      </h1>

          {/* Subtitle */}
          <p className="text-center text-slate-500 max-w-2xl mx-auto mt-6 text-lg font-display">
            Watch algorithms come to life with step-by-step visualizations. 
            Understand the <span className="text-amber-400">why</span> behind each operation, 
            not just the <span className="text-emerald-400">how</span>.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold font-display bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {problems.length}
              </div>
              <div className="text-slate-500 text-sm font-display mt-1">Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-display bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                ∞
              </div>
              <div className="text-slate-500 text-sm font-display mt-1">Insights</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-slate-500 text-sm font-display mt-1">Interactive</div>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Problems Section */}
      <div className="relative grid-pattern">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-100">
                Problem Collection
              </h2>
              <p className="text-slate-500 mt-1 font-display">
                Select a problem to explore its visualization
              </p>
            </div>
            
            {/* Filter pills - decorative for now */}
            <div className="hidden md:flex gap-2">
              <span className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 text-sm font-display">
                All Topics
              </span>
            </div>
          </div>

          {/* Problems Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
          <Link
                key={problem.id}
                to={problem.path}
                className="group card-shine"
              >
                <div className="h-full bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 transition-all duration-300 group-hover:border-slate-700 group-hover:bg-slate-900 group-hover:shadow-xl group-hover:shadow-amber-500/5 group-hover:-translate-y-1">
                  {/* Problem number & difficulty */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-code text-slate-500 text-sm">
                      #{problem.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl font-semibold text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
                    {problem.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {problem.description}
                  </p>

                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium font-display">
                      {problem.category}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded bg-slate-800/50 text-slate-500 text-xs font-code"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Hover indicator */}
                  <div className="mt-6 flex items-center text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore visualization</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming Soon Card */}
            <div className="h-full bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
              <h3 className="font-display text-lg font-semibold text-slate-600 mb-1">
                More Coming Soon
              </h3>
              <p className="text-slate-700 text-sm">
                New visualizations are being added regularly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-950 font-code">&lt;/&gt;</span>
              </div>
              <span className="font-display font-semibold text-slate-400">LeetViz</span>
            </div>
            <p className="text-slate-600 text-sm font-display">
              Built for visual learners who want to truly understand algorithms
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
