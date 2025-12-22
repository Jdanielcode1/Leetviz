import type { ReactNode } from 'react'

interface ArrayVisualizationProps {
  variables: Record<string, unknown>
  phase?: string
}

export function ArrayVisualization({ variables, phase }: ArrayVisualizationProps): ReactNode {
  // Extract common array-related variables
  const arr = findArrayVariable(variables)
  const pointers = findPointerVariables(variables)
  const result = findResultVariable(variables)

  if (!arr) {
    return (
      <div className="text-slate-400 text-sm italic">
        No array data to visualize
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      {phase && (
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono border border-cyan-500/30">
          {phase}
        </div>
      )}

      {/* Main array visualization */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Array</div>
        <div className="flex flex-wrap gap-2">
          {arr.map((value, index) => {
            const isPointed = isIndexPointed(index, pointers)
            const pointerLabels = getPointerLabels(index, pointers)

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                {/* Pointer labels above */}
                {pointerLabels.length > 0 && (
                  <div className="flex gap-1">
                    {pointerLabels.map((label) => (
                      <span
                        key={label}
                        className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Array cell */}
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm
                    transition-all duration-200
                    ${isPointed
                      ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/50 text-slate-300 border border-slate-600'
                    }
                  `}
                >
                  {formatValue(value)}
                </div>

                {/* Index below */}
                <span className="text-slate-600 text-xs font-mono">{index}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Result array if present */}
      {result && result.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Result</div>
          <div className="flex flex-wrap gap-2">
            {result.map((value, index) => (
              <div
                key={index}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-sm"
              >
                {formatValue(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other variables */}
      <VariablesGrid variables={variables} excludeKeys={getExcludedKeys(variables)} />
    </div>
  )
}

type ArrayElement = string | number | boolean | null

// Helper function to find the main array variable
function findArrayVariable(variables: Record<string, unknown>): Array<ArrayElement> | null {
  const arrayKeys = ['arr', 'array', 'nums', 'numbers', 'list', 'items', 'data', 'input']

  for (const key of arrayKeys) {
    if (variables[key] && Array.isArray(variables[key])) {
      return variables[key] as Array<ArrayElement>
    }
  }

  // Look for any array that's not a result
  for (const [key, value] of Object.entries(variables)) {
    if (Array.isArray(value) && !key.toLowerCase().includes('result') && !key.toLowerCase().includes('output')) {
      return value as Array<ArrayElement>
    }
  }

  return null
}

// Helper to find pointer variables
function findPointerVariables(variables: Record<string, unknown>): Record<string, number> {
  const pointers: Record<string, number> = {}
  const pointerPatterns = ['i', 'j', 'k', 'l', 'r', 'left', 'right', 'start', 'end', 'low', 'high', 'mid', 'ptr', 'index', 'curr', 'prev', 'next', 'slow', 'fast']

  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'number' && pointerPatterns.includes(key.toLowerCase())) {
      pointers[key] = value
    }
  }

  return pointers
}

// Helper to find result variable
function findResultVariable(variables: Record<string, unknown>): Array<ArrayElement> | null {
  const resultKeys = ['result', 'output', 'answer', 'res', 'ret']

  for (const key of resultKeys) {
    if (variables[key] !== undefined && Array.isArray(variables[key])) {
      return variables[key] as Array<ArrayElement>
    }
  }

  return null
}

// Check if an index is pointed by any pointer
function isIndexPointed(index: number, pointers: Record<string, number>): boolean {
  return Object.values(pointers).includes(index)
}

// Get pointer labels for an index
function getPointerLabels(index: number, pointers: Record<string, number>): Array<string> {
  return Object.entries(pointers)
    .filter(([, value]) => value === index)
    .map(([key]) => key)
}

// Format a value for display
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undef'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// Get keys to exclude from the variables grid
function getExcludedKeys(variables: Record<string, unknown>): Array<string> {
  const excluded: Array<string> = []
  const arrayKeys = ['arr', 'array', 'nums', 'numbers', 'list', 'items', 'data', 'input']
  const resultKeys = ['result', 'output', 'answer', 'res', 'ret']
  const pointerPatterns = ['i', 'j', 'k', 'l', 'r', 'left', 'right', 'start', 'end', 'low', 'high', 'mid', 'ptr', 'index', 'curr', 'prev', 'next', 'slow', 'fast']

  for (const key of Object.keys(variables)) {
    if (arrayKeys.includes(key.toLowerCase()) ||
        resultKeys.includes(key.toLowerCase()) ||
        pointerPatterns.includes(key.toLowerCase())) {
      excluded.push(key)
    }
  }

  return excluded
}

// Grid for displaying remaining variables
function VariablesGrid({ variables, excludeKeys }: { variables: Record<string, unknown>, excludeKeys: Array<string> }): ReactNode {
  const filteredVars = Object.entries(variables).filter(
    ([key]) => !excludeKeys.includes(key)
  )

  if (filteredVars.length === 0) return null

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Variables</div>
      <div className="grid grid-cols-2 gap-2">
        {filteredVars.map(([key, value]) => (
          <div key={key} className="bg-slate-900/50 rounded-lg px-3 py-2">
            <span className="text-slate-500 text-xs">{key}: </span>
            <span className="text-amber-400 font-mono text-sm">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
