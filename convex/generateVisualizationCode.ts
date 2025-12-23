"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const anthropic = new Anthropic();

const VISUALIZATION_GENERATION_PROMPT = `You are a React visualization code generator for an algorithm learning platform. Given algorithm code and test input, generate a COMPLETE, WORKING React component that visualizes the algorithm execution step-by-step.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSX code - NO markdown, NO code blocks, NO explanations
2. The code must be a complete, self-contained React component
3. Use Tailwind CSS classes for all styling
4. The component must work with a stepIndex prop passed from parent

STRUCTURE (follow this exactly):
\`\`\`
// Step data - trace through the algorithm execution
const steps = [
  {
    lineNumber: 1,
    description: "What happens in this step",
    insight: "Why this matters for understanding",
    variables: { /* all variable states */ },
    phase: "init" // short phase identifier
  },
  // ... more steps
];

const CURRENT_STEP_INDEX = 0; // This will be dynamically updated

export default function Visualization() {
  const stepIndex = CURRENT_STEP_INDEX;
  const step = steps[stepIndex] || steps[0];

  return (
    <div className="p-4 bg-[#0a1628] min-h-screen text-slate-200">
      {/* Your visualization here */}
    </div>
  );
}
\`\`\`

STYLING GUIDELINES:
- Background: bg-[#0a1628] (dark blue)
- Primary accent: cyan-400/cyan-500
- Secondary accent: amber-400/amber-500
- Text: slate-200/slate-300/slate-400
- Borders: slate-700/slate-600
- Cards: bg-slate-800/50 with border border-slate-700 rounded-xl
- Use CSS animations for state changes (fadeIn, pulse, bounce)
- Add transition-all for smooth updates

VISUALIZATION TIPS:
- For arrays: horizontal flex with numbered boxes, highlight active indices
- For pointers: arrows or labels above/below elements
- For maps/sets: key-value grid display
- For trees: nested indentation or simple tree structure
- For stacks: vertical stack with push/pop animation
- Show current step description prominently
- Color-code different phases (init, compare, swap, etc.)
- Make active/current elements stand out (scale, glow, different color)

EXAMPLE OUTPUT for Two Sum:
const steps = [
  { lineNumber: 1, description: "Initialize empty hash map", insight: "We'll use a map to store values we've seen", variables: { nums: [2,7,11,15], target: 9, map: {} }, phase: "init" },
  { lineNumber: 2, description: "Check index 0: value 2", insight: "Looking for complement: 9-2=7", variables: { nums: [2,7,11,15], target: 9, map: {}, i: 0, complement: 7 }, phase: "check" },
  // ... more steps
];

const CURRENT_STEP_INDEX = 0;

export default function Visualization() {
  const stepIndex = CURRENT_STEP_INDEX;
  const step = steps[stepIndex] || steps[0];
  const { nums, map, i, complement } = step.variables;

  return (
    <div className="p-4 bg-[#0a1628] min-h-screen">
      {/* Phase indicator */}
      <div className="mb-4 inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
        <span className="text-cyan-400 font-mono text-sm">{step.phase}</span>
      </div>

      {/* Array visualization */}
      <div className="flex gap-2 mb-6">
        {nums.map((n, idx) => (
          <div
            key={idx}
            className={\`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all \${
              idx === i
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 scale-110'
                : 'bg-slate-800 border-slate-600 text-slate-300'
            }\`}
          >
            {n}
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <p className="text-slate-200">{step.description}</p>
        <p className="text-slate-400 text-sm mt-1">{step.insight}</p>
      </div>
    </div>
  );
}

Now generate a complete visualization for the provided algorithm.`;

const FIX_VISUALIZATION_PROMPT = `You are a React code fixer. The following visualization code has an error. Fix it and return ONLY the corrected code - no explanations, no markdown.

ORIGINAL CODE:
{code}

ERROR:
{error}

Return the fixed code only. Keep the same structure with the steps array, CURRENT_STEP_INDEX, and the Visualization component. Use Tailwind CSS classes.`;

// Generate visualization code for a problem
export const generateVisualizationCode = action({
  args: {
    code: v.string(),
    language: v.string(),
    testInput: v.string(),
    problemDescription: v.optional(v.string()),
  },
  returns: v.object({
    componentCode: v.string(),
    steps: v.array(
      v.object({
        lineNumber: v.number(),
        description: v.string(),
        insight: v.string(),
        variables: v.any(),
        phase: v.optional(v.string()),
      })
    ),
  }),
  handler: async (_, args) => {
    const userPrompt = `Generate a React visualization for this algorithm:

Algorithm Code (${args.language}):
\`\`\`${args.language}
${args.code}
\`\`\`

Test Input: ${args.testInput}

${args.problemDescription ? `Problem Description:\n${args.problemDescription}` : ''}

Remember:
1. Return ONLY valid JSX code
2. Include a steps array with detailed execution trace
3. Use const CURRENT_STEP_INDEX = 0; which will be updated dynamically
4. Make the visualization educational and visually appealing
5. Use Tailwind CSS with the dark theme (bg-[#0a1628], cyan accents)`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      system: VISUALIZATION_GENERATION_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];

    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract the code - remove any markdown if present
    let code = content.text.trim();
    if (code.startsWith("```")) {
      code = code.replace(/^```(?:jsx|javascript|js)?\n?/, "").replace(/\n?```$/, "");
    }

    // Extract steps from the code
    const stepsMatch = code.match(/const steps = (\[[\s\S]*?\]);/);
    let steps: Array<{
      lineNumber: number;
      description: string;
      insight: string;
      variables: unknown;
      phase?: string;
    }> = [];

    if (stepsMatch) {
      try {
        // Use Function constructor to safely evaluate the steps array
        const stepsEval = new Function(`return ${stepsMatch[1]}`)();
        steps = stepsEval;
      } catch (e) {
        console.error("Failed to extract steps from generated code:", e);
        // Fallback: return empty steps, the code might still work
      }
    }

    return {
      componentCode: code,
      steps,
    };
  },
});

// Fix visualization code that has errors
export const fixVisualizationCode = action({
  args: {
    componentCode: v.string(),
    error: v.string(),
    problemContext: v.optional(v.string()),
  },
  returns: v.object({
    componentCode: v.string(),
    steps: v.array(
      v.object({
        lineNumber: v.number(),
        description: v.string(),
        insight: v.string(),
        variables: v.any(),
        phase: v.optional(v.string()),
      })
    ),
  }),
  handler: async (_, args) => {
    const prompt = FIX_VISUALIZATION_PROMPT
      .replace("{code}", args.componentCode)
      .replace("{error}", args.error);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [
        {
          role: "user",
          content: prompt + (args.problemContext ? `\n\nProblem context: ${args.problemContext}` : ""),
        },
      ],
    });

    const content = message.content[0];

    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract the code - remove any markdown if present
    let code = content.text.trim();
    if (code.startsWith("```")) {
      code = code.replace(/^```(?:jsx|javascript|js)?\n?/, "").replace(/\n?```$/, "");
    }

    // Extract steps from the fixed code
    const stepsMatch = code.match(/const steps = (\[[\s\S]*?\]);/);
    let steps: Array<{
      lineNumber: number;
      description: string;
      insight: string;
      variables: unknown;
      phase?: string;
    }> = [];

    if (stepsMatch) {
      try {
        const stepsEval = new Function(`return ${stepsMatch[1]}`)();
        steps = stepsEval;
      } catch (e) {
        console.error("Failed to extract steps from fixed code:", e);
      }
    }

    return {
      componentCode: code,
      steps,
    };
  },
});

// Generate and save visualization for a problem
export const generateAndSaveVisualization = action({
  args: {
    problemId: v.id("problems"),
    testCaseId: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Get all problems to find the target
    const allProblems = await ctx.runQuery(api.problems.listAllProblems, {});
    const targetProblem = allProblems.find(
      (p: { _id: Id<"problems"> }) => p._id === args.problemId
    );

    if (!targetProblem) {
      throw new Error("Problem not found");
    }

    // Get full problem details
    const fullProblem = await ctx.runQuery(api.problems.getProblemBySlug, {
      slug: targetProblem.slug,
    });

    if (!fullProblem) {
      throw new Error("Problem not found");
    }

    // Find the test case
    const testCase = fullProblem.testCases.find(
      (tc: { id: number }) => tc.id === args.testCaseId
    );

    if (!testCase) {
      throw new Error("Test case not found");
    }

    // Generate the visualization
    const visualization = await ctx.runAction(
      api.generateVisualizationCode.generateVisualizationCode,
      {
        code: fullProblem.code,
        language: fullProblem.language,
        testInput: testCase.input,
        problemDescription: fullProblem.description,
      }
    );

    // Save to the problem
    await ctx.runMutation(api.problems.updateProblem, {
      id: args.problemId,
      generatedVisualization: {
        componentCode: visualization.componentCode,
        steps: visualization.steps,
        testCaseId: args.testCaseId,
        lastUpdated: Date.now(),
      },
    });

    return null;
  },
});

// Fix visualization for a problem
export const fixAndSaveVisualization = action({
  args: {
    problemId: v.id("problems"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Get all problems to find the target
    const allProblems = await ctx.runQuery(api.problems.listAllProblems, {});
    const targetProblem = allProblems.find(
      (p: { _id: Id<"problems"> }) => p._id === args.problemId
    );

    if (!targetProblem) {
      throw new Error("Problem not found");
    }

    // Get full problem details
    const fullProblem = await ctx.runQuery(api.problems.getProblemBySlug, {
      slug: targetProblem.slug,
    });

    if (!fullProblem || !fullProblem.generatedVisualization) {
      throw new Error("Problem or visualization not found");
    }

    // Fix the visualization
    const fixedViz = await ctx.runAction(
      api.generateVisualizationCode.fixVisualizationCode,
      {
        componentCode: fullProblem.generatedVisualization.componentCode,
        error: args.error,
        problemContext: `${fullProblem.title}: ${fullProblem.description}`,
      }
    );

    // Save the fixed visualization
    await ctx.runMutation(api.problems.updateProblem, {
      id: args.problemId,
      generatedVisualization: {
        componentCode: fixedViz.componentCode,
        steps: fixedViz.steps,
        testCaseId: fullProblem.generatedVisualization.testCaseId,
        lastUpdated: Date.now(),
      },
    });

    return null;
  },
});
