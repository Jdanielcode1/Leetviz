import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

interface Problem {
  _id: Id<"problems">
  _creationTime: number
  number: string
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: Array<string>
  category: string
  isPublished: boolean
  createdAt: number
  updatedAt: number
}

function AdminDashboard() {
  const { data: problems, isLoading } = useQuery(
    convexQuery(api.problems.listAllProblems, {})
  )

  const togglePublished = useMutation({
    mutationFn: useConvexMutation(api.problems.togglePublished),
  })

  const deleteProblem = useMutation({
    mutationFn: useConvexMutation(api.problems.deleteProblem),
  })

  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-slate-500 hover:text-cyan-400 transition-colors font-mono text-sm"
              >
                &larr; Back to Site
              </Link>
              <span className="text-slate-700">/</span>
              <h1 className="text-xl font-display font-bold text-slate-100">
                Admin Dashboard
              </h1>
            </div>
            <Link
              to="/admin/problems/new"
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors font-mono text-sm"
            >
              + New Problem
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Problems"
            value={problems?.length ?? 0}
            color="cyan"
          />
          <StatCard
            label="Published"
            value={problems?.filter((p: Problem) => p.isPublished).length ?? 0}
            color="emerald"
          />
          <StatCard
            label="Drafts"
            value={problems?.filter((p: Problem) => !p.isPublished).length ?? 0}
            color="amber"
          />
          <StatCard
            label="Categories"
            value={new Set(problems?.map((p: Problem) => p.category) ?? []).size}
            color="purple"
          />
        </div>

        {/* Problems table */}
        <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-display font-semibold text-slate-100">
              All Problems
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : problems && problems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wide">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wide">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wide">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-mono text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {problems.map((problem: Problem) => (
                    <tr
                      key={problem._id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-slate-400">
                        {problem.number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-100 font-display">
                            {problem.title}
                          </span>
                          <span className="text-slate-500 text-xs font-mono">
                            /{problem.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${difficultyColors[problem.difficulty]}`}
                        >
                          {problem.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {problem.category}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublished.mutate({ id: problem._id })}
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            problem.isPublished
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {problem.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/admin/problems/$slug"
                            params={{ slug: problem.slug }}
                            className="px-3 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-mono transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this problem?')) {
                                deleteProblem.mutate({ id: problem._id })
                              }
                            }}
                            className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-mono transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 mb-4">No problems yet</p>
              <Link
                to="/admin/problems/new"
                className="inline-block px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors font-mono text-sm"
              >
                Create your first problem
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'cyan' | 'emerald' | 'amber' | 'purple'
}) {
  const colors = {
    cyan: 'border-cyan-500/30 bg-cyan-500/10',
    emerald: 'border-emerald-500/30 bg-emerald-500/10',
    amber: 'border-amber-500/30 bg-amber-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
  }

  const textColors = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
  }

  return (
    <div className={`rounded-xl border ${colors[color]} p-4`}>
      <div className="text-slate-500 text-xs font-mono uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`text-3xl font-display font-bold ${textColors[color]}`}>
        {value}
      </div>
    </div>
  )
}
