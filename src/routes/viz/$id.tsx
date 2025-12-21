import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/viz/$id')({
  component: VisualizationPage,
})

interface CodeLine {
  num: number
  code: string
  indent: number
}

interface Step {
  line: number
  description: string
  why: string
  variables: Record<string, unknown>
  phase: string
  highlight?: number
  [key: string]: unknown
}

function VisualizationPage() {
  const { id } = Route.useParams()

  const { data: visualization, isLoading, error } = useQuery(
    convexQuery(api.visualizations.getVisualization, { id: id as Id<'visualizations'> })
  )

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)

  const steps = (visualization?.steps as Step[]) || []
  const codeLines = (visualization?.codeLines as CodeLine[]) || []

  useEffect(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [id])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, steps.length, speed])

  const step = steps[currentStep] || ({} as Step)

  const getLineHighlightStyle = (lineNum: number) => {
    if (step.line === lineNum) {
      return 'bg-amber-400/30 border-l-4 border-amber-400'
    }
    return 'border-l-4 border-transparent'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-display">Loading visualization...</span>
        </div>
      </div>
    )
  }

  if (error || !visualization) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-slate-300 mb-4">
            Visualization Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            This visualization may have been removed or doesn't exist.
          </p>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-display hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-code { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
        }
        
        .stack-item { animation: slideIn 0.3s ease-out; }
        .highlight-item { animation: pulse-glow 1s ease-in-out infinite; }
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(71, 85, 105, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors mb-6 font-display group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Gallery</span>
        </Link>

        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            {visualization.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-display text-sm">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              {visualization.language}
            </span>
          </div>
        </header>

        {/* Test Input Display */}
        <div className="mb-6 text-center">
          <div className="inline-block bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <span className="text-slate-400">Test Input:</span>{' '}
            <span className="text-amber-400 font-code">{visualization.testInput}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setCurrentStep(0)}
            disabled={currentStep === 0}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Reset"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-4 rounded-xl transition-all ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep >= steps.length - 1}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            disabled={currentStep >= steps.length - 1}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="End"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-slate-500 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
              className="w-24 accent-amber-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 px-4">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="text-center text-slate-500 text-sm mt-2">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Code + Variables */}
          <div className="space-y-6">
            {/* Code Panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-slate-400 text-sm ml-2 font-display">
                  {visualization.language}
                </span>
              </div>
              <div className="p-4 font-code text-sm overflow-x-auto max-h-[400px] overflow-y-auto">
                {codeLines.map((line) => (
                  <div
                    key={line.num}
                    className={`flex transition-all duration-200 rounded ${getLineHighlightStyle(line.num)}`}
                  >
                    <span className="w-8 text-right pr-3 text-slate-600 select-none flex-shrink-0">
                      {line.num}
                    </span>
                    <pre className="flex-1">
                      <code className={step.line === line.num ? 'text-amber-200' : 'text-slate-300'}>
                        {line.code}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Variables Panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <span className="text-slate-300 font-display font-semibold">📊 Variables</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {step.variables &&
                  Object.entries(step.variables).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg px-3 py-2">
                      <div className="text-slate-500 text-xs uppercase tracking-wide">{key}</div>
                      <div className="text-amber-400 font-code text-sm truncate" title={String(value)}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column: Explanation */}
          <div className="space-y-6">
            {/* Explanation Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-amber-400 font-display font-semibold">💡 What's Happening</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-slate-200 font-display text-lg">{step.description}</div>
                {step.why && (
                  <div className="text-slate-400 text-sm leading-relaxed border-l-2 border-amber-500/50 pl-3">
                    <span className="text-amber-400 font-semibold">Why: </span>
                    {step.why}
                  </div>
                )}
              </div>
            </div>

            {/* Phase Indicator */}
            {step.phase && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Current Phase</div>
                <div className="text-cyan-400 font-code text-lg">{step.phase}</div>
              </div>
            )}

            {/* Original Code Reference */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
              <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Original Code</div>
              <pre className="text-slate-400 font-code text-xs overflow-x-auto whitespace-pre-wrap">
                {visualization.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

