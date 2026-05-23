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
    passcode: v.string(),
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
    shortLinkSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    const { passcode, ...postData } = args;
    
    // Check duplicate slug if provided
    if (args.shortLinkSlug && args.shortLinkSlug.trim() !== "") {
      const slugClean = args.shortLinkSlug.trim().toLowerCase();
      const duplicate = await ctx.db
        .query("shortLinks")
        .filter((q) => q.eq(q.field("slug"), slugClean))
        .first();
      if (duplicate) {
        throw new Error(`The slug "${slugClean}" is already in use by another redirect link.`);
      }
    }

    const newId = await ctx.db.insert("posts", {
      ...postData,
      clicks: 0,
    });

    // Sync to shortLinks table
    if (args.shortLinkSlug && args.shortLinkSlug.trim() !== "") {
      const slugClean = args.shortLinkSlug.trim().toLowerCase();
      const syncId = `post-sync-${newId}`;
      await ctx.db.insert("shortLinks", {
        slug: slugClean,
        url: args.url,
        openInApp: args.openInApp,
        clicks: 0,
        syncId,
      });
    }

    return newId;
  },
});

// Update an existing post
export const update = mutation({
  args: {
    passcode: v.string(),
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
    shortLinkSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    const { id, passcode, ...data } = args;

    const existingPost = await ctx.db.get(id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    // Sync to shortLinks table
    const syncId = `post-sync-${id}`;
    const existingShortLink = await ctx.db
      .query("shortLinks")
      .filter((q) => q.eq(q.field("syncId"), syncId))
      .first();

    if (args.shortLinkSlug && args.shortLinkSlug.trim() !== "") {
      const slugClean = args.shortLinkSlug.trim().toLowerCase();
      
      if (existingShortLink) {
        if (existingShortLink.slug !== slugClean) {
          const duplicate = await ctx.db
            .query("shortLinks")
            .filter((q) => q.eq(q.field("slug"), slugClean) && q.neq(q.field("_id"), existingShortLink._id))
            .first();
          if (duplicate) {
            throw new Error(`The slug "${slugClean}" is already in use by another redirect link.`);
          }
        }
        await ctx.db.patch(existingShortLink._id, {
          slug: slugClean,
          url: args.url,
          openInApp: args.openInApp,
        });
      } else {
        const duplicate = await ctx.db
          .query("shortLinks")
          .filter((q) => q.eq(q.field("slug"), slugClean))
          .first();
        if (duplicate) {
          throw new Error(`The slug "${slugClean}" is already in use by another redirect link.`);
        }
        await ctx.db.insert("shortLinks", {
          slug: slugClean,
          url: args.url,
          openInApp: args.openInApp,
          clicks: 0,
          syncId,
        });
      }
    } else {
      if (existingShortLink) {
        await ctx.db.delete(existingShortLink._id);
      }
    }

    await ctx.db.patch(id, data);
  },
});

// Delete a post
export const deletePost = mutation({
  args: {
    passcode: v.string(),
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
    
    // Also delete any synced shortLink
    const syncId = `post-sync-${args.id}`;
    const existingShortLink = await ctx.db
      .query("shortLinks")
      .filter((q) => q.eq(q.field("syncId"), syncId))
      .first();
    if (existingShortLink) {
      await ctx.db.delete(existingShortLink._id);
    }
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
