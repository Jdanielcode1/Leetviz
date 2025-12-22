"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const anthropic = new Anthropic();

const STEP_GENERATION_PROMPT = `You are an algorithm visualization generator for a LeetCode-style educational platform. Analyze the provided code and test input, then generate a step-by-step visualization that shows how the algorithm executes.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "steps": [
    {
      "lineNumber": 1,
      "description": "What happens in this step",
      "insight": "Why this step matters for understanding the algorithm",
      "variables": { "variableName": "value" },
      "phase": "descriptive-phase-name"
    }
  ]
}

Guidelines:
- Generate detailed execution steps that trace through the algorithm with the given test input
- Each step should reference which line number of code is being executed (1-indexed)
- The "description" should clearly explain what happens in this step
- The "insight" field should explain the intuition and why this step matters - make it educational
- "variables" should show the current state of ALL relevant variables at each step as they would appear in a debugger
- "phase" should be a short identifier like "init", "loop-start", "compare", "swap", "found", "return", etc.
- Include steps for every meaningful state change in the algorithm
- Make the visualization educational - explain the algorithm's logic, not just the mechanics
- For array problems, include array state in variables
- For pointer problems, include pointer positions
- For recursive problems, show call stack depth

The goal is to help users understand the algorithm step by step as if they were debugging it themselves.`;

// Generate steps for a single test case
export const generateStepsForTestCase = action({
  args: {
    code: v.string(),
    language: v.string(),
    testInput: v.string(),
  },
  returns: v.array(
    v.object({
      lineNumber: v.number(),
      description: v.string(),
      insight: v.string(),
      variables: v.any(),
      phase: v.optional(v.string()),
    })
  ),
  handler: async (_, args) => {
    const userPrompt = `Code (${args.language}):
\`\`\`${args.language}
${args.code}
\`\`\`

Test Input:
${args.testInput}

Generate the visualization steps JSON:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20241022",
      max_tokens: 8192,
      system: STEP_GENERATION_PROMPT,
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

    let parsed;
    try {
      parsed = JSON.parse(content.text);
    } catch {
      throw new Error(
        "Failed to parse Claude response as JSON: " + content.text.slice(0, 200)
      );
    }

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid steps structure from Claude");
    }

    return parsed.steps;
  },
});

// Generate steps for all test cases of a problem and update the problem
export const generateAllStepsForProblem = action({
  args: {
    problemId: v.id("problems"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Since we can't query by ID directly in the existing query, let's get all problems
    // and find the one we need (not ideal but works for now)
    const allProblems = await ctx.runQuery(api.problems.listAllProblems, {});
    const targetProblem = allProblems.find((p: { _id: Id<"problems"> }) => p._id === args.problemId);

    if (!targetProblem) {
      throw new Error("Problem not found");
    }

    // Get full problem details by slug
    const fullProblem = await ctx.runQuery(api.problems.getProblemBySlug, {
      slug: targetProblem.slug,
    });

    if (!fullProblem) {
      throw new Error("Problem not found");
    }

    // Generate steps for each test case
    const generatedSteps: Array<{
      testCaseId: number;
      steps: Array<{
        lineNumber: number;
        description: string;
        insight: string;
        variables: unknown;
        phase?: string;
      }>;
    }> = [];

    for (const testCase of fullProblem.testCases) {
      const steps = await ctx.runAction(api.generateProblemSteps.generateStepsForTestCase, {
        code: fullProblem.code,
        language: fullProblem.language,
        testInput: testCase.input,
      });

      generatedSteps.push({
        testCaseId: testCase.id,
        steps,
      });
    }

    // Update the problem with generated steps
    await ctx.runMutation(api.problems.updateProblem, {
      id: args.problemId,
      generatedSteps,
    });

    return null;
  },
});

// Generate steps for a specific test case and update the problem
export const generateStepsForProblemTestCase = action({
  args: {
    problemId: v.id("problems"),
    testCaseId: v.number(),
    testInput: v.string(),
  },
  returns: v.array(
    v.object({
      lineNumber: v.number(),
      description: v.string(),
      insight: v.string(),
      variables: v.any(),
      phase: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args): Promise<Array<{
    lineNumber: number;
    description: string;
    insight: string;
    variables: unknown;
    phase?: string;
  }>> => {
    // Get all problems to find the target
    const allProblems = await ctx.runQuery(api.problems.listAllProblems, {});
    const targetProblem = allProblems.find((p: { _id: Id<"problems"> }) => p._id === args.problemId);

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

    // Generate steps for this test case
    const steps = await ctx.runAction(api.generateProblemSteps.generateStepsForTestCase, {
      code: fullProblem.code,
      language: fullProblem.language,
      testInput: args.testInput,
    });

    // Update the problem's generatedSteps array
    const existingSteps = fullProblem.generatedSteps || [];
    const updatedSteps = existingSteps.filter((s: { testCaseId: number }) => s.testCaseId !== args.testCaseId);
    updatedSteps.push({
      testCaseId: args.testCaseId,
      steps,
    });

    await ctx.runMutation(api.problems.updateProblem, {
      id: args.problemId,
      generatedSteps: updatedSteps,
    });

    return steps;
  },
});
