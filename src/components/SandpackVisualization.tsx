import { useState, useEffect, useCallback } from 'react'
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
  SandpackLayout,
} from '@codesandbox/sandpack-react'

interface Step {
  lineNumber: number
  description: string
  insight: string
  variables: Record<string, unknown>
  phase?: string
}

interface SandpackVisualizationProps {
  componentCode: string
  steps: Step[]
  stepIndex: number
  onError?: (error: string) => void
  onStepsExtracted?: (steps: Step[]) => void
  className?: string
}

// Inner component that uses the Sandpack context
function SandpackContent({
  componentCode,
  stepIndex,
  onError,
}: {
  componentCode: string
  stepIndex: number
  onError?: (error: string) => void
}) {
  const { sandpack, listen } = useSandpack()
  const [hasError, setHasError] = useState(false)

  // Update the App.jsx file when stepIndex changes
  useEffect(() => {
    const updatedCode = componentCode.replace(
      /const CURRENT_STEP_INDEX = \d+;/,
      `const CURRENT_STEP_INDEX = ${stepIndex};`
    )
    sandpack.updateFile('/App.jsx', updatedCode)
  }, [stepIndex, componentCode, sandpack])

  // Listen for errors
  useEffect(() => {
    const stopListening = listen((msg) => {
      if (msg.type === 'action' && msg.action === 'show-error') {
        setHasError(true)
        onError?.(msg.message || 'Unknown error')
      }
      if (msg.type === 'status' && msg.status === 'idle') {
        setHasError(false)
      }
    })
    return () => stopListening()
  }, [listen, onError])

  return (
    <div className={`h-full ${hasError ? 'border-2 border-red-500 rounded-xl' : ''}`}>
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        style={{ height: '100%' }}
      />
    </div>
  )
}

export function SandpackVisualization({
  componentCode,
  steps,
  stepIndex,
  onError,
  className = '',
}: SandpackVisualizationProps) {
  // Inject the current step index into the code
  const codeWithStep = componentCode.includes('CURRENT_STEP_INDEX')
    ? componentCode.replace(
        /const CURRENT_STEP_INDEX = \d+;/,
        `const CURRENT_STEP_INDEX = ${stepIndex};`
      )
    : `const CURRENT_STEP_INDEX = ${stepIndex};\n${componentCode}`

  const files = {
    '/App.jsx': codeWithStep,
    '/index.js': `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
    `.trim(),
    '/index.html': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a1628;
      min-height: 100vh;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-pulse-subtle { animation: pulse 1.5s ease-in-out infinite; }
    .animate-bounce-subtle { animation: bounce 0.5s ease-in-out; }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>
    `.trim(),
  }

  return (
    <div className={`h-full ${className}`}>
      <SandpackProvider
        template="react"
        files={files}
        theme="dark"
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          recompileMode: 'delayed',
          recompileDelay: 300,
        }}
      >
        <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: '12px' }}>
          <SandpackContent
            componentCode={codeWithStep}
            stepIndex={stepIndex}
            onError={onError}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

// Error display component
export function VisualizationError({
  error,
  onFix,
  isFixing,
}: {
  error: string
  onFix: () => void
  isFixing: boolean
}) {
  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <h3 className="text-red-400 font-medium text-sm">Visualization Error</h3>
          <pre className="text-red-300/70 text-xs mt-1 whitespace-pre-wrap break-words overflow-x-auto max-h-24">
            {error}
          </pre>
        </div>
      </div>
      <button
        onClick={onFix}
        disabled={isFixing}
        className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isFixing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            Fixing with AI...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Fix with AI
          </>
        )}
      </button>
    </div>
  )
}

// Loading component for when visualization is being generated
export function VisualizationLoading() {
  return (
    <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-slate-300 font-medium">Generating Visualization</p>
          <p className="text-slate-500 text-sm">Claude is creating your custom animation...</p>
        </div>
      </div>
    </div>
  )
}
