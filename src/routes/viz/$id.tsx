import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import type { CodeLine, StepInfo, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'

export const Route = createFileRoute('/viz/$id')({
  component: VisualizationPage,
})

interface Step {
  line: number
  description: string
  why: string
  variables: Record<string, unknown>
  phase: string
  highlight?: number
  [key: string]: unknown
}

interface RawCodeLine {
  num: number
  code: string
  indent: number
}

function VisualizationPage() {
  const { id } = Route.useParams()

  const { data: visualization, isLoading, error } = useQuery(
    convexQuery(api.visualizations.getVisualization, { id: id as Id<'visualizations'> })
  )

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)

  const steps = (visualization?.steps as Array<Step>) || []
  const rawCodeLines = (visualization?.codeLines as Array<RawCodeLine>) || []

  // Convert to ProblemLayout format
  const codeLines: Array<CodeLine> = rawCodeLines.map((line) => ({
    num: line.num,
    code: '  '.repeat(line.indent) + line.code,
  }))

  const testCases: Array<TestCase<string>> = visualization
    ? [{ id: 1, label: 'Input', data: visualization.testInput }]
    : []

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

  const stepInfo: StepInfo = {
    description: step.description || 'Loading...',
    insight: step.why || '',
    variables: step.variables,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
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

  // Variables visualization for right panel
  const VariablesVisualization = (
    <div className="space-y-4">
      {/* Phase Indicator */}
      {step.phase && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Current Phase</div>
          <div className="text-cyan-400 font-mono text-lg">{step.phase}</div>
        </div>
      )}

      {/* Variables Grid */}
      {step.variables && Object.keys(step.variables).length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
            <span className="text-slate-300 font-mono text-sm">Variables</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {Object.entries(step.variables).map(([key, value]) => (
              <div key={key} className="bg-slate-900/50 rounded-lg px-3 py-2">
                <div className="text-slate-500 text-xs uppercase tracking-wide">{key}</div>
                <div className="text-amber-400 font-mono text-sm truncate" title={String(value)}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? 'Pause' : 'Auto-Play'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
              className="w-24 accent-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Algorithm Insight with original code
  const AlgorithmInsight = (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
        <span className="text-slate-300 font-mono text-sm">Original Code</span>
      </div>
      <div className="p-4">
        <pre className="text-slate-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {visualization.code}
        </pre>
      </div>
    </div>
  )

  return (
    <ProblemLayout
      header={{
        number: 'Custom',
        title: visualization.title,
        difficulty: 'medium',
        tags: [visualization.language],
      }}
      description={`A user-created visualization for understanding the algorithm step by step.\n\nTest Input: ${visualization.testInput}`}
      examples={[]}
      constraints={[]}
      testCases={testCases}
      selectedTestCase={0}
      codeLines={codeLines}
      codeFilename={`solution.${visualization.language === 'Python' ? 'py' : visualization.language === 'JavaScript' ? 'js' : visualization.language.toLowerCase()}`}
      activeLineNumber={step.line || 0}
      visualization={VariablesVisualization}
      currentStep={stepInfo}
      algorithmInsight={AlgorithmInsight}
      onTestCaseChange={() => {}}
      onPrev={() => setCurrentStep(Math.max(0, currentStep - 1))}
      onNext={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
      onReset={() => {
        setCurrentStep(0)
        setIsPlaying(false)
      }}
      currentStepIndex={currentStep}
      totalSteps={steps.length}
    />
  )
}
