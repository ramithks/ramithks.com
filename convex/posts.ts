import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all posts, ordered newest first (by creation time)
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .collect();
  },
});

// Create a new post
export const create = mutation({
  args: {
    title: v.string(),
    tag: v.string(),
    thumbnail: v.string(),
    description: v.string(),
    url: v.string(),
    openInApp: v.boolean(),
    date: v.string(),
    type: v.union(
      v.literal("blog"),
      v.literal("youtube"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("linkedin")
    ),
    likes: v.optional(v.number()),
    views: v.optional(v.number()),
    comments: v.optional(v.number()),
    reposts: v.optional(v.number()),
    duration: v.optional(v.string()),
    author: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      ...args,
      clicks: 0,
    });
  },
});

// Update an existing post
export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.string(),
    tag: v.string(),
    thumbnail: v.string(),
    description: v.string(),
    url: v.string(),
    openInApp: v.boolean(),
    date: v.string(),
    type: v.union(
      v.literal("blog"),
      v.literal("youtube"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("linkedin")
    ),
    likes: v.optional(v.number()),
    views: v.optional(v.number()),
    comments: v.optional(v.number()),
    reposts: v.optional(v.number()),
    duration: v.optional(v.string()),
    author: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

// Delete a post
export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Increment post click count
export const incrementClicks = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (post) {
      await ctx.db.patch(args.id, { clicks: (post.clicks || 0) + 1 });
    }
  },
});
