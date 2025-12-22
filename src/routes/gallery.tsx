import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
})

const languageColors: Record<string, string> = {
  python: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  javascript: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  typescript: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
}

function GalleryPage() {
  const { data: visualizations, isLoading } = useQuery(
    convexQuery(api.visualizations.listVisualizations, {})
  )

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
      `}</style>

      <div className="grid-pattern min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-display group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>

            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-display font-medium shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Community Gallery
            </h1>
            <p className="text-slate-400 font-display text-lg max-w-2xl mx-auto">
              Explore algorithm visualizations created by the community. 
              Learn from different approaches and coding styles.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-display">Loading visualizations...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!visualizations || visualizations.length === 0) && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-slate-400 mb-2">
                No visualizations yet
              </h2>
              <p className="text-slate-500 mb-6">
                Be the first to create an algorithm visualization!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-display font-medium shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Your First</span>
              </Link>
            </div>
          )}

          {/* Visualizations Grid */}
          {visualizations && visualizations.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visualizations.map((viz) => (
                <Link
                  key={viz._id}
                  to="/viz/$id"
                  params={{ id: viz._id }}
                  className="group card-shine"
                >
                  <div className="h-full bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 transition-all duration-300 group-hover:border-slate-700 group-hover:bg-slate-900 group-hover:shadow-xl group-hover:shadow-cyan-500/5 group-hover:-translate-y-1">
                    {/* Language Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${languageColors[viz.language] || 'text-slate-400 bg-slate-400/10 border-slate-400/30'}`}>
                        {viz.language}
                      </span>
                      <span className="text-slate-500 text-xs font-display">
                        {formatDate(viz.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors mb-4 line-clamp-2">
                      {viz.title}
                    </h3>

                    {/* Hover Indicator */}
                    <div className="flex items-center text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View visualization</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

