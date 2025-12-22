import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const saveVisualization = internalMutation({
  args: {
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
  },
  returns: v.id("visualizations"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("visualizations", {
      title: args.title,
      code: args.code,
      language: args.language,
      testInput: args.testInput,
      codeLines: args.codeLines,
      steps: args.steps,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const listVisualizations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("visualizations"),
      _creationTime: v.number(),
      title: v.string(),
      language: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const visualizations = await ctx.db
      .query("visualizations")
      .withIndex("by_creation")
      .order("desc")
      .collect();

    return visualizations.map((v) => ({
      _id: v._id,
      _creationTime: v._creationTime,
      title: v.title,
      language: v.language,
      createdAt: v.createdAt,
    }));
  },
});

export const getVisualization = query({
  args: {
    id: v.id("visualizations"),
  },
  returns: v.union(
    v.object({
      _id: v.id("visualizations"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const visualization = await ctx.db.get("visualizations", args.id);
    return visualization;
  },
});
