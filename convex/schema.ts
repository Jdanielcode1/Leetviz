import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  visualizations: defineTable({
    title: v.string(),
    code: v.string(),
    language: v.string(),
    testInput: v.string(),
    codeLines: v.array(
      v.object({
        num: v.number(),
        code: v.string(),
        indent: v.number(),
      })
    ),
    steps: v.array(v.any()),
    createdAt: v.number(),
  }).index("by_creation", ["createdAt"]),

  // Curated problems table for admin-managed problems
  problems: defineTable({
    // Metadata
    number: v.string(),
    slug: v.string(),
    title: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    tags: v.array(v.string()),
    category: v.string(),

    // Problem Content
    description: v.string(),
    constraints: v.array(v.string()),
    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),

    // Code
    code: v.string(),
    language: v.string(),
    codeFilename: v.string(),

    // Test Cases
    testCases: v.array(
      v.object({
        id: v.number(),
        label: v.string(),
        input: v.string(),
      })
    ),

    // Pre-generated Steps (per test case)
    generatedSteps: v.array(
      v.object({
        testCaseId: v.number(),
        steps: v.array(
          v.object({
            lineNumber: v.number(),
            description: v.string(),
            insight: v.string(),
            variables: v.any(),
            phase: v.optional(v.string()),
          })
        ),
      })
    ),

    // Visualization Type
    visualizationType: v.string(),

    // Complexity Info
    timeComplexity: v.optional(v.string()),
    spaceComplexity: v.optional(v.string()),

    // Status
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"])
    .index("by_published", ["isPublished", "createdAt"]),
});
