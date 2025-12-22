import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProblemLayoutProps } from '~/types/problem'

type MobileTab = 'problem' | 'code' | 'visualization'

export function ProblemLayout({
  header,
  description,
  examples,
  constraints,
  testCases,
  selectedTestCase,
  codeLines,
  codeFilename = 'solution.py',
  activeLineNumber,
  visualization,
  currentStep,
  algorithmInsight,
  onTestCaseChange,
  onPrev,
  onNext,
  onReset,
  currentStepIndex,
  totalSteps,
}: ProblemLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('visualization')
  const [isMobile, setIsMobile] = useState(false)
  const [leftWidth, setLeftWidth] = useState(28)
  const [middleWidth, setMiddleWidth] = useState(36)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<'left' | 'right' | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseDown = useCallback((separator: 'left' | 'right') => {
    isDragging.current = separator
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const totalWidth = rect.width
    const percentage = (x / totalWidth) * 100

    if (isDragging.current === 'left') {
      const newLeftWidth = Math.min(Math.max(percentage, 15), 45)
      setLeftWidth(newLeftWidth)
    } else {
      const newMiddleWidth = Math.min(Math.max(percentage - leftWidth, 20), 50)
      setMiddleWidth(newMiddleWidth)
    }
  }, [leftWidth])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const progress = ((currentStepIndex + 1) / totalSteps) * 100
  const rightWidth = 100 - leftWidth - middleWidth

  // Left panel content
  const LeftPanelContent = (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Problem Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-slate-500 font-mono text-sm">#{header.number}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${difficultyColors[header.difficulty]}`}>
            {header.difficulty.toUpperCase()}
          </span>
        </div>
        <h1 className="text-xl font-display font-bold text-slate-100 mb-2">{header.title}</h1>
        <div className="flex flex-wrap gap-1.5">
          {header.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {/* Description */}
        <div>
          <h3 className="text-sm font-mono text-slate-500 mb-2 uppercase tracking-wide">Description</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{description}</p>
        </div>

        {/* Examples */}
        {examples.length > 0 && (
          <div>
            <h3 className="text-sm font-mono text-slate-500 mb-2 uppercase tracking-wide">Examples</h3>
            <div className="space-y-3">
              {examples.map((example, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 text-sm font-mono">
                  <div className="mb-1">
                    <span className="text-slate-500">Input: </span>
                    <span className="text-cyan-400">{example.input}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Output: </span>
                    <span className="text-emerald-400">{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="mt-2 text-slate-400 text-xs">
                      <span className="text-slate-500">Explanation: </span>
                      {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraints */}
        {constraints.length > 0 && (
          <div>
            <h3 className="text-sm font-mono text-slate-500 mb-2 uppercase tracking-wide">Constraints</h3>
            <ul className="space-y-1">
              {constraints.map((constraint, idx) => (
                <li key={idx} className="text-slate-400 text-sm font-mono flex items-start gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Cases */}
        <div>
          <h3 className="text-sm font-mono text-slate-500 mb-2 uppercase tracking-wide">Test Cases</h3>
          <div className="flex flex-wrap gap-2">
            {testCases.map((tc, idx) => (
              <button
                key={tc.id}
                onClick={() => onTestCaseChange(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  selectedTestCase === idx
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {tc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Middle panel content (Code)
  const MiddlePanelContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-slate-500 font-mono text-xs">{codeFilename}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm min-h-0">
        {codeLines.map((line) => (
          <div
            key={line.num}
            className={`flex py-0.5 rounded transition-all duration-200 ${
              activeLineNumber === line.num ? 'code-highlight' : ''
            }`}
          >
            <span className="w-8 text-right pr-4 text-slate-600 select-none flex-shrink-0">
              {line.num}
            </span>
            <code className={`whitespace-pre ${activeLineNumber === line.num ? 'text-cyan-300' : 'text-slate-400'}`}>
              {line.code || ' '}
            </code>
          </div>
        ))}
      </div>
    </div>
  )

  // Right panel content (Visualization)
  const RightPanelContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Custom Visualization */}
        {visualization}

        {/* Current Step */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/70 border-b border-slate-700">
            <span className="text-slate-300 font-mono text-sm">Current Step</span>
          </div>
          <div className="p-4">
            <p className="text-slate-200 font-display mb-2">{currentStep.description}</p>
            <p className="text-slate-400 text-sm">{currentStep.insight}</p>
            {currentStep.variables && Object.keys(currentStep.variables).length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2">
                {Object.entries(currentStep.variables).map(([key, value]) => (
                  <div key={key} className="bg-slate-900/50 rounded px-2 py-1">
                    <span className="text-slate-500 text-xs">{key}: </span>
                    <span className="text-amber-400 text-xs font-mono">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Algorithm Insight (optional) */}
        {algorithmInsight}
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-[#0a1628] text-slate-100 flex flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Outfit', sans-serif; }

        .blueprint-grid {
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .code-highlight {
          background: linear-gradient(90deg, rgba(251, 146, 60, 0.15) 0%, transparent 100%);
          border-left: 2px solid #fb923c;
        }

        .resize-handle {
          width: 4px;
          cursor: col-resize;
          background: rgba(51, 65, 85, 0.5);
          transition: background-color 0.15s ease;
          flex-shrink: 0;
        }
        .resize-handle:hover {
          background: rgba(56, 189, 248, 0.5);
        }
        .resize-handle:active {
          background: rgba(56, 189, 248, 0.7);
        }
      `}</style>

      {/* Header Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 flex-shrink-0 bg-slate-900/50">
        <a
          href="/"
          className="text-slate-500 hover:text-cyan-400 transition-colors font-mono text-sm"
        >
          &larr; Back
        </a>
        <span className="text-slate-700">/</span>
        <span className="text-cyan-400 font-mono text-sm">problems</span>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 font-mono text-sm">{header.title.toLowerCase().replace(/\s+/g, '-')}</span>
      </div>

      {/* Mobile Tab Bar */}
      {isMobile && (
        <div className="flex border-b border-slate-700 bg-slate-900/30 flex-shrink-0">
          {(['problem', 'code', 'visualization'] as Array<MobileTab>).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-sm font-mono capitalize transition-colors ${
                mobileTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 blueprint-grid overflow-hidden flex min-h-0">
        {isMobile ? (
          // Mobile: Show selected tab
          <div className="h-full w-full">
            {mobileTab === 'problem' && (
              <div className="h-full bg-slate-900/70">{LeftPanelContent}</div>
            )}
            {mobileTab === 'code' && (
              <div className="h-full bg-slate-900/70">{MiddlePanelContent}</div>
            )}
            {mobileTab === 'visualization' && (
              <div className="h-full bg-slate-900/70">{RightPanelContent}</div>
            )}
          </div>
        ) : (
          // Desktop: Resizable panels
          <>
            <div
              className="h-full bg-slate-900/70 border-r border-slate-700 overflow-hidden"
              style={{ width: `${leftWidth}%` }}
            >
              {LeftPanelContent}
            </div>

            <div
              className="resize-handle"
              onMouseDown={() => handleMouseDown('left')}
            />

            <div
              className="h-full bg-slate-900/70 border-r border-slate-700 overflow-hidden"
              style={{ width: `${middleWidth}%` }}
            >
              {MiddlePanelContent}
            </div>

            <div
              className="resize-handle"
              onMouseDown={() => handleMouseDown('right')}
            />

            <div
              className="h-full bg-slate-900/70 overflow-hidden"
              style={{ width: `${rightWidth}%` }}
            >
              {RightPanelContent}
            </div>
          </>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/70 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm border border-slate-700"
            >
              Reset
            </button>
            <button
              onClick={onPrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm border border-slate-700"
            >
              &larr; Prev
            </button>
            <button
              onClick={onNext}
              disabled={currentStepIndex === totalSteps - 1}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            >
              Next &rarr;
            </button>
          </div>

          {/* Progress */}
          <div className="flex-1 max-w-md">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step counter */}
          <span className="text-slate-500 font-mono text-sm whitespace-nowrap">
            Step {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>
      </div>
    </div>
  )
}
