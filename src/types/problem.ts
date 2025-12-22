import type { ReactNode } from 'react'

export interface CodeLine {
  num: number
  code: string
}

export interface Example {
  input: string
  output: string
  explanation?: string
}

export interface ProblemHeader {
  number: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: Array<string>
}

export interface StepInfo {
  description: string
  insight: string
  variables?: Record<string, unknown>
}

export interface TestCase<T = unknown> {
  id: number
  label: string
  data: T
}

export interface ProblemLayoutProps {
  header: ProblemHeader
  description: string
  examples: Array<Example>
  constraints: Array<string>
  testCases: Array<TestCase>
  selectedTestCase: number
  codeLines: Array<CodeLine>
  codeFilename?: string
  activeLineNumber: number
  visualization: ReactNode
  currentStep: StepInfo
  algorithmInsight?: ReactNode
  onTestCaseChange: (index: number) => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  currentStepIndex: number
  totalSteps: number
}
