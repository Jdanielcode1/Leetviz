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
});
