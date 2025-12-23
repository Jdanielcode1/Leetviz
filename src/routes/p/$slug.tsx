import { useMemo, useState, useCallback } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexAction } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import type { CodeLine, StepInfo, TestCase } from '~/types/problem'
import { ProblemLayout } from '~/components/ProblemLayout'
import { GenericVisualization } from '~/components/visualizations/GenericVisualization'
import {
  SandpackVisualization,
  VisualizationError,
  VisualizationLoading,
} from '~/components/SandpackVisualization'

export const Route = createFileRoute('/p/$slug')({
  component: DynamicProblemPage,
})

interface GeneratedStep {
  lineNumber: number
  description: string
  insight: string
  variables: Record<string, unknown>
  phase?: string
}

function DynamicProblemPage() {
  const { slug } = Route.useParams()

  const { data: problem, isLoading, error } = useQuery(
    convexQuery(api.problems.getProblemBySlug, { slug })
  )

  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [visualizationError, setVisualizationError] = useState<string | null>(null)

  // Fix visualization mutation
  const fixVisualization = useMutation({
    mutationFn: useConvexAction(api.generateVisualizationCode.fixAndSaveVisualization),
    onSuccess: () => {
      setVisualizationError(null)
    },
  })

  // Check if we should use the new Sandpack visualization
  const useSandpack = problem?.generatedVisualization?.componentCode

  // Get steps based on which system is being used
  const currentSteps = useMemo(() => {
    if (!problem) return []

    // New Sandpack system
    if (useSandpack && problem.generatedVisualization) {
      return problem.generatedVisualization.steps as Array<GeneratedStep>
    }

    // Legacy system - get steps for selected test case
    if (!problem.generatedSteps) return []

    const testCase = problem.testCases[selectedTestCase]
    if (!testCase) return []

    const stepsData = problem.generatedSteps.find(
      (gs: { testCaseId: number; steps: Array<unknown> }) => gs.testCaseId === testCase.id
    )

    return (stepsData?.steps || []) as Array<GeneratedStep>
  }, [problem, selectedTestCase, useSandpack])

  // Convert code to CodeLine format
  const codeLines: Array<CodeLine> = useMemo(() => {
    if (!problem) return []

    return problem.code.split('\n').map((line: string, index: number) => ({
      num: index + 1,
      code: line,
    }))
  }, [problem])

  // Convert test cases to the format expected by ProblemLayout
  const testCases: Array<TestCase<string>> = useMemo(() => {
    if (!problem) return []

    return problem.testCases.map((tc: { id: number; label: string; input: string }) => ({
      id: tc.id,
      label: tc.label,
      data: tc.input,
    }))
  }, [problem])

  // Handle test case change
  const handleTestCaseChange = (index: number) => {
    setSelectedTestCase(index)
    setCurrentStepIndex(0)
    setVisualizationError(null)
  }

  // Handle visualization error
  const handleVisualizationError = useCallback((error: string) => {
    setVisualizationError(error)
  }, [])

  // Handle fix visualization
  const handleFixVisualization = useCallback(() => {
    if (!problem || !visualizationError) return

    fixVisualization.mutate({
      problemId: problem._id,
      error: visualizationError,
    })
  }, [problem, visualizationError, fixVisualization])

  // Get current step info
  const currentStep = currentSteps[currentStepIndex]
  const stepInfo: StepInfo = currentStep
    ? {
        description: currentStep.description,
        insight: currentStep.insight,
        variables: currentStep.variables,
      }
    : {
        description: 'No steps generated yet',
        insight: 'Generate steps in the admin panel',
        variables: {},
      }

  const activeLineNumber = currentStep?.lineNumber || 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-display">Loading problem...</span>
        </div>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-slate-300 mb-4">
            Problem Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            This problem may not exist or hasn't been published yet.
          </p>
          <Link
            to="/problem-list"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-display hover:bg-slate-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Problems
          </Link>
        </div>
      </div>
    )
  }

  // Check if steps have been generated (for either system)
  if (currentSteps.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-display font-bold text-slate-300 mb-4">
            {problem.title}
          </h1>
          <p className="text-slate-500 mb-6">
            Visualization steps haven't been generated for this problem yet.
            Please visit the admin panel to generate steps.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/problem-list"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-display hover:bg-slate-700 transition-colors"
            >
              Back to Problems
            </Link>
            <Link
              to="/admin/problems/$slug"
              params={{ slug: problem.slug }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-display hover:bg-cyan-500 transition-colors"
            >
              Go to Admin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Choose visualization component based on whether we're using Sandpack
  let visualization

  if (useSandpack && problem.generatedVisualization) {
    visualization = (
      <div className="h-full space-y-3">
        {visualizationError ? (
          <VisualizationError
            error={visualizationError}
            onFix={handleFixVisualization}
            isFixing={fixVisualization.isPending}
          />
        ) : null}

        <SandpackVisualization
          componentCode={problem.generatedVisualization.componentCode}
          steps={problem.generatedVisualization.steps as Array<GeneratedStep>}
          stepIndex={currentStepIndex}
          onError={handleVisualizationError}
          className={visualizationError ? 'opacity-50' : ''}
        />
      </div>
    )
  } else {
    visualization = (
      <GenericVisualization
        type={problem.visualizationType}
        variables={currentStep?.variables || {}}
        phase={currentStep?.phase}
      />
    )
  }

  // Algorithm insight component (complexity info)
  const algorithmInsight =
    problem.timeComplexity || problem.spaceComplexity ? (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
          <span className="text-slate-300 font-mono text-sm">Complexity</span>
        </div>
        <div className="p-4 space-y-2">
          {problem.timeComplexity && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Time:</span>
              <span className="text-cyan-400 font-mono text-sm">
                {problem.timeComplexity}
              </span>
            </div>
          )}
          {problem.spaceComplexity && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Space:</span>
              <span className="text-emerald-400 font-mono text-sm">
                {problem.spaceComplexity}
              </span>
            </div>
          )}
        </div>
      </div>
    ) : undefined

  return (
    <ProblemLayout
      header={{
        number: problem.number,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags,
      }}
      description={problem.description}
      examples={problem.examples}
      constraints={problem.constraints}
      testCases={testCases}
      selectedTestCase={selectedTestCase}
      codeLines={codeLines}
      codeFilename={problem.codeFilename}
      activeLineNumber={activeLineNumber}
      visualization={visualization}
      currentStep={stepInfo}
      algorithmInsight={algorithmInsight}
      onTestCaseChange={handleTestCaseChange}
      onPrev={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
      onNext={() =>
        setCurrentStepIndex(Math.min(currentSteps.length - 1, currentStepIndex + 1))
      }
      onReset={() => setCurrentStepIndex(0)}
      currentStepIndex={currentStepIndex}
      totalSteps={currentSteps.length}
    />
  )
}
