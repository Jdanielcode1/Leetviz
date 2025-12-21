import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useConvexAction } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/create')({
  component: CreateVisualizationPage,
})

function CreateVisualizationPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [testInput, setTestInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generateMutation = useMutation({
    mutationFn: useConvexAction(api.generateVisualization.generateVisualization),
    onSuccess: (id) => {
      navigate({ to: '/viz/$id', params: { id } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to generate visualization')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!code.trim()) {
      setError('Please enter some code')
      return
    }
    if (!testInput.trim()) {
      setError('Please enter test input')
      return
    }

    generateMutation.mutate({ code, language, testInput })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');
        
        .font-display { font-family: 'Outfit', sans-serif; }
        .font-code { font-family: 'Fira Code', monospace; }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="grid-pattern min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Navigation */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors mb-8 font-display group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-4">
              Create Visualization
            </h1>
            <p className="text-slate-400 font-display text-lg max-w-2xl mx-auto">
              Paste your algorithm code and test input. Our AI will generate an interactive 
              step-by-step visualization to help you understand how it works.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selector */}
            <div>
              <label className="block text-slate-300 font-display font-medium mb-2">
                Language
              </label>
              <div className="flex gap-3">
                {['python', 'javascript', 'typescript'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`px-4 py-2 rounded-lg font-display text-sm transition-all ${
                      language === lang
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Input */}
            <div>
              <label className="block text-slate-300 font-display font-medium mb-2">
                Algorithm Code
              </label>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-slate-500 text-sm font-code ml-2">
                    algorithm.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}
                  </span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`}
                  className="w-full h-64 p-4 bg-transparent font-code text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Test Input */}
            <div>
              <label className="block text-slate-300 font-display font-medium mb-2">
                Test Input
              </label>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="nums = [2, 7, 11, 15], target = 9"
                  className="w-full h-24 p-4 bg-transparent font-code text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
              <p className="text-slate-500 text-sm mt-2 font-display">
                Describe the input values your algorithm will process
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-display">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-display font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {generateMutation.isPending ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating Visualization...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Visualization</span>
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="font-display text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips for Best Results
            </h2>
            <ul className="space-y-2 text-slate-400 font-display text-sm">
              <li className="flex items-start gap-2">
                <span className="text-violet-400">•</span>
                Use clear variable names that describe their purpose
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400">•</span>
                Keep the code focused on a single algorithm or function
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400">•</span>
                Provide realistic test input that demonstrates the algorithm's behavior
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400">•</span>
                Algorithms with loops, conditionals, and data structures work best
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

