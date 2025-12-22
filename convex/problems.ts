import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to list all published problems
export const listProblems = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("problems"),
      _creationTime: v.number(),
      number: v.string(),
      slug: v.string(),
      title: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      tags: v.array(v.string()),
      category: v.string(),
      isPublished: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const problems = await ctx.db
      .query("problems")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();

    return problems.map((p) => ({
      _id: p._id,
      _creationTime: p._creationTime,
      number: p.number,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      category: p.category,
      isPublished: p.isPublished,
      createdAt: p.createdAt,
    }));
  },
});

// Query to list all problems (including unpublished) for admin
export const listAllProblems = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("problems"),
      _creationTime: v.number(),
      number: v.string(),
      slug: v.string(),
      title: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      tags: v.array(v.string()),
      category: v.string(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const problems = await ctx.db.query("problems").order("desc").collect();

    return problems.map((p) => ({
      _id: p._id,
      _creationTime: p._creationTime,
      number: p.number,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      category: p.category,
      isPublished: p.isPublished,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },
});

// Query to get a single problem by slug
export const getProblemBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("problems"),
      _creationTime: v.number(),
      number: v.string(),
      slug: v.string(),
      title: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      tags: v.array(v.string()),
      category: v.string(),
      description: v.string(),
      constraints: v.array(v.string()),
      examples: v.array(
        v.object({
          input: v.string(),
          output: v.string(),
          explanation: v.optional(v.string()),
        })
      ),
      code: v.string(),
      language: v.string(),
      codeFilename: v.string(),
      testCases: v.array(
        v.object({
          id: v.number(),
          label: v.string(),
          input: v.string(),
        })
      ),
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
      visualizationType: v.string(),
      timeComplexity: v.optional(v.string()),
      spaceComplexity: v.optional(v.string()),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const problem = await ctx.db
      .query("problems")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return problem;
  },
});

// Mutation to create a new problem
export const createProblem = mutation({
  args: {
    number: v.string(),
    slug: v.string(),
    title: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    tags: v.array(v.string()),
    category: v.string(),
    description: v.string(),
    constraints: v.array(v.string()),
    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),
    code: v.string(),
    language: v.string(),
    codeFilename: v.string(),
    testCases: v.array(
      v.object({
        id: v.number(),
        label: v.string(),
        input: v.string(),
      })
    ),
    visualizationType: v.string(),
    timeComplexity: v.optional(v.string()),
    spaceComplexity: v.optional(v.string()),
  },
  returns: v.id("problems"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const problemId = await ctx.db.insert("problems", {
      ...args,
      generatedSteps: [],
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });

    return problemId;
  },
});

// Mutation to update a problem
export const updateProblem = mutation({
  args: {
    id: v.id("problems"),
    number: v.optional(v.string()),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    constraints: v.optional(v.array(v.string())),
    examples: v.optional(
      v.array(
        v.object({
          input: v.string(),
          output: v.string(),
          explanation: v.optional(v.string()),
        })
      )
    ),
    code: v.optional(v.string()),
    language: v.optional(v.string()),
    codeFilename: v.optional(v.string()),
    testCases: v.optional(
      v.array(
        v.object({
          id: v.number(),
          label: v.string(),
          input: v.string(),
        })
      )
    ),
    generatedSteps: v.optional(
      v.array(
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
      )
    ),
    visualizationType: v.optional(v.string()),
    timeComplexity: v.optional(v.string()),
    spaceComplexity: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch("problems", id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Mutation to delete a problem
export const deleteProblem = mutation({
  args: { id: v.id("problems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete("problems", args.id);
    return null;
  },
});

// Mutation to toggle published status
export const togglePublished = mutation({
  args: { id: v.id("problems") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const problem = await ctx.db.get("problems", args.id);
    if (!problem) {
      throw new Error("Problem not found");
    }

    const newStatus = !problem.isPublished;
    await ctx.db.patch("problems", args.id, {
      isPublished: newStatus,
      updatedAt: Date.now(),
    });

    return newStatus;
  },
});
