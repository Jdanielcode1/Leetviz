import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexAction, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/admin/problems/$slug')({
  component: EditProblemPage,
})

interface Example {
  input: string
  output: string
  explanation?: string
}

interface TestCase {
  id: number
  label: string
  input: string
}

interface GeneratedSteps {
  testCaseId: number
  steps: Array<{
    lineNumber: number
    description: string
    insight: string
    variables: unknown
    phase?: string
  }>
}

function EditProblemPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()

  const { data: problem, isLoading } = useQuery(
    convexQuery(api.problems.getProblemBySlug, { slug })
  )

  // Form state
  const [number, setNumber] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [constraints, setConstraints] = useState('')
  const [examples, setExamples] = useState<Array<Example>>([])
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [codeFilename, setCodeFilename] = useState('solution.py')
  const [testCases, setTestCases] = useState<Array<TestCase>>([])
  const [visualizationType, setVisualizationType] = useState('array')
  const [timeComplexity, setTimeComplexity] = useState('')
  const [spaceComplexity, setSpaceComplexity] = useState('')

  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false)
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')

  // Populate form when problem loads
  useEffect(() => {
    if (problem) {
      setNumber(problem.number)
      setFormSlug(problem.slug)
      setTitle(problem.title)
      setDifficulty(problem.difficulty)
      setTags(problem.tags.join(', '))
      setCategory(problem.category)
      setDescription(problem.description)
      setConstraints(problem.constraints.join('\n'))
      setExamples(problem.examples.map((ex: Example) => ({
        input: ex.input,
        output: ex.output,
        explanation: ex.explanation || ''
      })))
      setCode(problem.code)
      setLanguage(problem.language)
      setCodeFilename(problem.codeFilename)
      setTestCases(problem.testCases)
      setVisualizationType(problem.visualizationType)
      setTimeComplexity(problem.timeComplexity || '')
      setSpaceComplexity(problem.spaceComplexity || '')
    }
  }, [problem])

  const updateProblem = useMutation({
    mutationFn: useConvexMutation(api.problems.updateProblem),
  })

  const generateSteps = useMutation({
    mutationFn: useConvexAction(api.generateProblemSteps.generateStepsForProblemTestCase),
  })

  const generateAnimation = useMutation({
    mutationFn: useConvexAction(api.generateVisualizationCode.generateAndSaveVisualization),
  })

  const togglePublished = useMutation({
    mutationFn: useConvexMutation(api.problems.togglePublished),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem) return

    try {
      await updateProblem.mutateAsync({
        id: problem._id,
        number,
        slug: formSlug,
        title,
        difficulty,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        category,
        description,
        constraints: constraints.split('\n').filter(Boolean),
        examples: examples.filter((ex) => ex.input || ex.output),
        code,
        language,
        codeFilename,
        testCases,
        visualizationType,
        timeComplexity: timeComplexity || undefined,
        spaceComplexity: spaceComplexity || undefined,
      })

      navigate({ to: '/admin' })
    } catch (error) {
      console.error('Failed to update problem:', error)
    }
  }

  const handleRegenerateSteps = async () => {
    if (!problem) return

    setIsGeneratingSteps(true)
    try {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i]
        setGenerationStatus(`Regenerating steps for test case ${i + 1}/${testCases.length}...`)
        await generateSteps.mutateAsync({
          problemId: problem._id,
          testCaseId: tc.id,
          testInput: tc.input,
        })
      }
      setGenerationStatus('Steps regenerated successfully!')
      setTimeout(() => setGenerationStatus(''), 3000)
    } catch (error) {
      console.error('Failed to regenerate steps:', error)
      setGenerationStatus('Failed to regenerate steps')
    } finally {
      setIsGeneratingSteps(false)
    }
  }

  const handleGenerateAnimation = async () => {
    if (!problem || testCases.length === 0) return

    setIsGeneratingAnimation(true)
    try {
      // Generate animation for the first test case
      setGenerationStatus('Generating AI animation...')
      await generateAnimation.mutateAsync({
        problemId: problem._id,
        testCaseId: testCases[0].id,
      })
      setGenerationStatus('Animation generated successfully!')
      setTimeout(() => setGenerationStatus(''), 3000)
    } catch (error) {
      console.error('Failed to generate animation:', error)
      setGenerationStatus('Failed to generate animation')
    } finally {
      setIsGeneratingAnimation(false)
    }
  }

  const addExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }])
  }

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  const updateExample = (index: number, field: keyof Example, value: string) => {
    const updated = [...examples]
    updated[index] = { ...updated[index], [field]: value }
    setExamples(updated)
  }

  const addTestCase = () => {
    const newId = Math.max(...testCases.map((tc) => tc.id), 0) + 1
    setTestCases([...testCases, { id: newId, label: `Test ${newId}`, input: '' }])
  }

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index))
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string | number) => {
    const updated = [...testCases]
    updated[index] = { ...updated[index], [field]: value }
    setTestCases(updated)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-4">Problem not found</div>
          <Link to="/admin" className="text-cyan-400 hover:text-cyan-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="text-slate-500 hover:text-cyan-400 transition-colors font-mono text-sm"
              >
                &larr; Back to Dashboard
              </Link>
              <span className="text-slate-700">/</span>
              <h1 className="text-xl font-display font-bold text-slate-100">
                Edit: {problem.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/p/$slug"
                params={{ slug }}
                target="_blank"
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors font-mono text-sm"
              >
                Preview
              </Link>
              <button
                type="button"
                onClick={() => togglePublished.mutate({ id: problem._id })}
                disabled={togglePublished.isPending}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                  problem.isPublished
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {problem.isPublished ? 'Published' : 'Draft'}
              </button>
              <button
                type="button"
                onClick={handleGenerateAnimation}
                disabled={isGeneratingAnimation}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm"
              >
                {isGeneratingAnimation ? 'Generating...' : 'Generate Animation'}
              </button>
              <button
                type="button"
                onClick={handleRegenerateSteps}
                disabled={isGeneratingSteps}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm"
              >
                {isGeneratingSteps ? 'Regenerating...' : 'Regenerate Steps'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Problem Number"
                value={number}
                onChange={setNumber}
                placeholder="e.g., 1, 42, 121"
              />
              <Input
                label="Slug"
                value={formSlug}
                onChange={setFormSlug}
                placeholder="e.g., two-sum"
              />
            </div>
            <Input
              label="Title"
              value={title}
              onChange={setTitle}
              placeholder="e.g., Two Sum"
            />
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
              />
              <Input
                label="Category"
                value={category}
                onChange={setCategory}
                placeholder="e.g., Array"
              />
              <Input
                label="Tags (comma-separated)"
                value={tags}
                onChange={setTags}
                placeholder="e.g., Array, Hash Table"
              />
            </div>
          </Section>

          {/* Problem Content */}
          <Section title="Problem Content">
            <TextArea
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Write the problem description..."
              rows={6}
            />
            <TextArea
              label="Constraints (one per line)"
              value={constraints}
              onChange={setConstraints}
              placeholder="1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
              rows={4}
            />
          </Section>

          {/* Examples */}
          <Section title="Examples">
            {examples.map((example, index) => (
              <div key={index} className="bg-slate-800/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-slate-400">
                    Example {index + 1}
                  </span>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  label="Input"
                  value={example.input}
                  onChange={(v) => updateExample(index, 'input', v)}
                  placeholder="nums = [2,7,11,15], target = 9"
                />
                <Input
                  label="Output"
                  value={example.output}
                  onChange={(v) => updateExample(index, 'output', v)}
                  placeholder="[0,1]"
                />
                <Input
                  label="Explanation (optional)"
                  value={example.explanation || ''}
                  onChange={(v) => updateExample(index, 'explanation', v)}
                  placeholder="Because nums[0] + nums[1] == 9..."
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addExample}
              className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm"
            >
              + Add Example
            </button>
          </Section>

          {/* Code */}
          <Section title="Solution Code">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Language"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'python', label: 'Python' },
                  { value: 'javascript', label: 'JavaScript' },
                  { value: 'typescript', label: 'TypeScript' },
                  { value: 'java', label: 'Java' },
                  { value: 'cpp', label: 'C++' },
                ]}
              />
              <Input
                label="Filename"
                value={codeFilename}
                onChange={setCodeFilename}
                placeholder="solution.py"
              />
            </div>
            <TextArea
              label="Code"
              value={code}
              onChange={setCode}
              placeholder="def twoSum(nums, target):&#10;    ..."
              rows={12}
              className="font-mono text-sm"
            />
          </Section>

          {/* Test Cases */}
          <Section title="Test Cases">
            {testCases.map((tc, index) => (
              <div key={tc.id} className="bg-slate-800/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-slate-400">
                    Test Case {index + 1}
                  </span>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  label="Label"
                  value={tc.label}
                  onChange={(v) => updateTestCase(index, 'label', v)}
                  placeholder="Test 1"
                />
                <TextArea
                  label="Input (for Claude to trace)"
                  value={tc.input}
                  onChange={(v) => updateTestCase(index, 'input', v)}
                  placeholder="nums = [2,7,11,15], target = 9"
                  rows={2}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addTestCase}
              className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm"
            >
              + Add Test Case
            </button>
          </Section>

          {/* Visualization */}
          <Section title="Visualization Settings">
            <Select
              label="Visualization Type"
              value={visualizationType}
              onChange={setVisualizationType}
              options={[
                { value: 'array', label: 'Array (with pointers)' },
                { value: 'array-two-pointers', label: 'Array (two pointers)' },
                { value: 'linked-list', label: 'Linked List' },
                { value: 'matrix', label: 'Matrix / Grid' },
                { value: 'stack', label: 'Stack' },
                { value: 'hash-map', label: 'Hash Map' },
                { value: 'generic', label: 'Generic (variables only)' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Time Complexity (optional)"
                value={timeComplexity}
                onChange={setTimeComplexity}
                placeholder="O(n)"
              />
              <Input
                label="Space Complexity (optional)"
                value={spaceComplexity}
                onChange={setSpaceComplexity}
                placeholder="O(1)"
              />
            </div>
          </Section>

          {/* AI Animation Status */}
          <Section title="AI Animation (Sandpack)">
            <div className="bg-slate-800/30 rounded-lg p-4 space-y-3">
              {problem.generatedVisualization ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 font-mono text-sm">Animation Generated</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {problem.generatedVisualization.steps.length} steps |
                    Test Case: {problem.testCases.find((t: TestCase) => t.id === problem.generatedVisualization?.testCaseId)?.label || 'Unknown'} |
                    Last updated: {new Date(problem.generatedVisualization.lastUpdated).toLocaleString()}
                  </p>
                  {problem.generatedVisualization.lastError && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-400 text-xs font-mono">
                        Last error: {problem.generatedVisualization.lastError}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span className="text-slate-400 font-mono text-sm">No Animation Generated</span>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Click "Generate Animation" to create an AI-powered React visualization using Sandpack.
                  </p>
                </>
              )}
            </div>
          </Section>

          {/* Legacy Generated Steps Info */}
          {problem.generatedSteps.length > 0 && (
            <Section title="Legacy Steps (GenericVisualization)">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">
                  Steps generated for {problem.generatedSteps.length} test case(s):
                </p>
                <ul className="space-y-1">
                  {problem.generatedSteps.map((gs: GeneratedSteps) => {
                    const tc = problem.testCases.find((t: TestCase) => t.id === gs.testCaseId)
                    return (
                      <li key={gs.testCaseId} className="text-sm text-slate-300">
                        <span className="text-cyan-400">{tc?.label || `Test ${gs.testCaseId}`}</span>
                        : {gs.steps.length} steps
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Section>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
            {generationStatus && (
              <span className="text-cyan-400 text-sm font-mono">
                {generationStatus}
              </span>
            )}
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors font-mono text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateProblem.isPending}
              className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm"
            >
              {updateProblem.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// Reusable form components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-slate-100 border-b border-slate-700 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${className}`}
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none ${className}`}
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
