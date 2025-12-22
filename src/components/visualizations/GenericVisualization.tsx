import { ArrayVisualization } from './ArrayVisualization'

interface GenericVisualizationProps {
  type: string
  variables: Record<string, unknown>
  phase?: string
}

export function GenericVisualization({ type, variables, phase }: GenericVisualizationProps) {
  // Route to appropriate visualization based on type
  switch (type) {
    case 'array':
    case 'array-pointers':
    case 'array-two-pointers':
      return <ArrayVisualization variables={variables} phase={phase} />

    case 'linked-list':
      return <LinkedListVisualization variables={variables} phase={phase} />

    case 'matrix':
      return <MatrixVisualization variables={variables} phase={phase} />

    case 'stack':
      return <StackVisualization variables={variables} phase={phase} />

    case 'hash-map':
      return <HashMapVisualization variables={variables} phase={phase} />

    case 'generic':
    default:
      return <FallbackVisualization variables={variables} phase={phase} />
  }
}

// Fallback visualization - just shows variables
function FallbackVisualization({ variables, phase }: { variables: Record<string, unknown>, phase?: string }) {
  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      {phase && (
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono border border-cyan-500/30">
          {phase}
        </div>
      )}

      {/* Variables grid */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Variables</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(variables).map(([key, value]) => (
            <div key={key} className="bg-slate-900/50 rounded-lg px-3 py-2">
              <span className="text-slate-500 text-xs">{key}: </span>
              <span className="text-amber-400 font-mono text-sm">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Placeholder visualizations for future implementation
function LinkedListVisualization({ variables, phase }: { variables: Record<string, unknown>, phase?: string }) {
  // Extract linked list nodes if available
  const nodes = findLinkedListNodes(variables)

  return (
    <div className="space-y-4">
      {phase && (
        <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-mono border border-purple-500/30">
          {phase}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Linked List</div>
        {nodes.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            {nodes.map((node, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-sm">
                  {formatValue(node)}
                </div>
                {index < nodes.length - 1 && (
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        ) : (
          <FallbackVisualization variables={variables} phase={undefined} />
        )}
      </div>
    </div>
  )
}

function MatrixVisualization({ variables, phase }: { variables: Record<string, unknown>, phase?: string }) {
  const matrix = findMatrixVariable(variables)
  const pointers = findMatrixPointers(variables)

  return (
    <div className="space-y-4">
      {phase && (
        <div className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-mono border border-teal-500/30">
          {phase}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Matrix</div>
        {matrix ? (
          <div className="space-y-1">
            {matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {Array.isArray(row) && row.map((cell, colIndex) => {
                  const isPointed = isMatrixCellPointed(rowIndex, colIndex, pointers)
                  return (
                    <div
                      key={colIndex}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded font-mono text-xs
                        ${isPointed
                          ? 'bg-teal-500/30 text-teal-300 border-2 border-teal-400'
                          : 'bg-slate-900/50 text-slate-300 border border-slate-600'
                        }
                      `}
                    >
                      {formatValue(cell)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ) : (
          <FallbackVisualization variables={variables} phase={undefined} />
        )}
      </div>
    </div>
  )
}

function StackVisualization({ variables, phase }: { variables: Record<string, unknown>, phase?: string }) {
  const stack = findStackVariable(variables)

  return (
    <div className="space-y-4">
      {phase && (
        <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono border border-orange-500/30">
          {phase}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Stack</div>
        {stack && stack.length > 0 ? (
          <div className="flex flex-col-reverse gap-1 items-center">
            {stack.map((item, index) => (
              <div
                key={index}
                className={`
                  w-24 py-2 text-center rounded font-mono text-sm
                  ${index === stack.length - 1
                    ? 'bg-orange-500/30 text-orange-300 border-2 border-orange-400'
                    : 'bg-slate-900/50 text-slate-300 border border-slate-600'
                  }
                `}
              >
                {formatValue(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm italic text-center py-4">
            Stack is empty
          </div>
        )}
      </div>
    </div>
  )
}

function HashMapVisualization({ variables, phase }: { variables: Record<string, unknown>, phase?: string }) {
  const hashMap = findHashMapVariable(variables)

  return (
    <div className="space-y-4">
      {phase && (
        <div className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-mono border border-pink-500/30">
          {phase}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-3">Hash Map</div>
        {hashMap && Object.keys(hashMap).length > 0 ? (
          <div className="space-y-1">
            {Object.entries(hashMap).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 bg-slate-900/50 rounded px-3 py-2"
              >
                <span className="text-pink-400 font-mono text-sm">{key}</span>
                <span className="text-slate-600">:</span>
                <span className="text-amber-400 font-mono text-sm">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm italic text-center py-4">
            Map is empty
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undef'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function findLinkedListNodes(variables: Record<string, unknown>): Array<unknown> {
  // Look for common linked list representations
  for (const [key, value] of Object.entries(variables)) {
    if (key.toLowerCase().includes('list') || key.toLowerCase().includes('node')) {
      if (Array.isArray(value)) return value
    }
  }
  return []
}

function findMatrixVariable(variables: Record<string, unknown>): Array<Array<unknown>> | null {
  const matrixKeys = ['matrix', 'grid', 'board', 'table', 'dp']

  for (const key of matrixKeys) {
    const value = variables[key]
    if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
      return value as Array<Array<unknown>>
    }
  }

  // Look for any 2D array
  for (const value of Object.values(variables)) {
    if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
      return value as Array<Array<unknown>>
    }
  }

  return null
}

function findMatrixPointers(variables: Record<string, unknown>): { row?: number, col?: number } {
  return {
    row: typeof variables.row === 'number' ? variables.row :
         typeof variables.i === 'number' ? variables.i : undefined,
    col: typeof variables.col === 'number' ? variables.col :
         typeof variables.j === 'number' ? variables.j : undefined,
  }
}

function isMatrixCellPointed(row: number, col: number, pointers: { row?: number, col?: number }): boolean {
  return pointers.row === row && pointers.col === col
}

function findStackVariable(variables: Record<string, unknown>): Array<unknown> | null {
  const stackKeys = ['stack', 'stk', 's']

  for (const key of stackKeys) {
    if (Array.isArray(variables[key])) {
      return variables[key] as Array<unknown>
    }
  }

  return null
}

function findHashMapVariable(variables: Record<string, unknown>): Record<string, unknown> | null {
  const mapKeys = ['map', 'hashMap', 'hash', 'dict', 'seen', 'visited', 'count', 'freq']

  for (const key of mapKeys) {
    const value = variables[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
  }

  return null
}

export { ArrayVisualization }
