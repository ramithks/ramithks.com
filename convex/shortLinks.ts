import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all short links
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shortLinks").collect();
  },
});

// Get a single short link by its slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slugLower = args.slug.toLowerCase();
    return await ctx.db
      .query("shortLinks")
      .filter((q) => q.eq(q.field("slug"), slugLower))
      .first();
  },
});

// Create a short link
export const create = mutation({
  args: {
    passcode: v.string(),
    slug: v.string(),
    url: v.string(),
    openInApp: v.boolean(),
    syncId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    const slugLower = args.slug.toLowerCase().trim();
    const existing = await ctx.db
      .query("shortLinks")
      .filter((q) => q.eq(q.field("slug"), slugLower))
      .first();
    if (existing) {
      throw new Error(`A short link with slug "${args.slug}" already exists.`);
    }

    return await ctx.db.insert("shortLinks", {
      slug: slugLower,
      url: args.url,
      openInApp: args.openInApp,
      clicks: 0,
      syncId: args.syncId,
    });
  },
});

// Update a short link
export const update = mutation({
  args: {
    passcode: v.string(),
    id: v.id("shortLinks"),
    slug: v.string(),
    url: v.string(),
    openInApp: v.boolean(),
    syncId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    const { id, passcode, ...data } = args;
    const slugLower = args.slug.toLowerCase().trim();
    
    const existing = await ctx.db
      .query("shortLinks")
      .filter((q) => q.eq(q.field("slug"), slugLower))
      .first();
    if (existing && existing._id !== id) {
      throw new Error(`A short link with slug "${args.slug}" already exists.`);
    }

    await ctx.db.patch(id, {
      ...data,
      slug: slugLower,
    });
  },
});

// Delete a short link
export const deleteLink = mutation({
  args: {
    passcode: v.string(),
    id: v.id("shortLinks"),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

// Increment short link click count by slug
export const incrementClicks = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slugLower = args.slug.toLowerCase().trim();
    const shortLink = await ctx.db
      .query("shortLinks")
      .filter((q) => q.eq(q.field("slug"), slugLower))
      .first();
    if (shortLink) {
      await ctx.db.patch(shortLink._id, {
        clicks: (shortLink.clicks || 0) + 1,
      });
    }
  },
});
