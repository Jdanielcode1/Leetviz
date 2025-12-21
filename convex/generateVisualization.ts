"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const CLAUDE_PROMPT = `You are an algorithm visualization generator. Analyze the provided code and test input, then generate a step-by-step visualization that shows how the algorithm executes.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "title": "A short descriptive title for this algorithm",
  "codeLines": [
    { "num": 1, "code": "the actual line of code", "indent": 0 }
  ],
  "steps": [
    {
      "line": 1,
      "description": "What happens in this step",
      "why": "Why this step matters for understanding the algorithm",
      "variables": { "variableName": "value" },
      "phase": "descriptive-phase-name",
      "highlight": null
    }
  ]
}

Guidelines:
- codeLines: Parse the code into numbered lines with proper indentation levels (0, 1, 2, etc.)
- steps: Generate detailed execution steps that trace through the algorithm with the given test input
- Each step should reference which line of code is being executed
- The "why" field should explain the intuition, not just restate what happens
- variables should show the current state of all relevant variables at each step
- phase should be a short identifier like "init", "loop-start", "compare", "swap", etc.
- highlight is optional - use it to indicate which index/element to highlight in visualizations

Make the visualization educational - explain the algorithm's logic, not just the mechanics.`;

export const generateVisualization = action({
  args: {
    code: v.string(),
    language: v.string(),
    testInput: v.string(),
  },
  returns: v.id("visualizations"),
  handler: async (ctx, args): Promise<Id<"visualizations">> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const userPrompt = `Code (${args.language}):
\`\`\`${args.language}
${args.code}
\`\`\`

Test Input:
${args.testInput}

Generate the visualization JSON:`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: CLAUDE_PROMPT,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content[0];

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

    if (!parsed.title || !parsed.codeLines || !parsed.steps) {
      throw new Error("Invalid visualization structure from Claude");
    }

    const visualizationId: Id<"visualizations"> = await ctx.runMutation(
      internal.visualizations.saveVisualization,
      {
        title: parsed.title,
        code: args.code,
        language: args.language,
        testInput: args.testInput,
        codeLines: parsed.codeLines,
        steps: parsed.steps,
      }
    );

    return visualizationId;
  },
});

