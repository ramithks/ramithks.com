import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all social links
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("socialLinks").collect();
  },
});

// Save all social links (syncs frontend list with db and shortLinks)
export const saveAll = mutation({
  args: {
    links: v.array(
      v.object({
        id: v.optional(v.string()),
        label: v.string(),
        url: v.string(),
        icon: v.union(
          v.literal("instagram"),
          v.literal("x"),
          v.literal("linkedin"),
          v.literal("facebook"),
          v.literal("youtube"),
          v.literal("globe")
        ),
        openInApp: v.boolean(),
        clicks: v.number(),
        shortLinkSlug: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingLinks = await ctx.db.query("socialLinks").collect();
    const existingIds = new Set(existingLinks.map((l) => l._id));
    const keptIds = new Set<string>();

    for (const link of args.links) {
      let docId = null;
      if (link.id) {
        try {
          const parsed = ctx.db.normalizeId("socialLinks", link.id);
          if (parsed && existingIds.has(parsed)) {
            docId = parsed;
          }
        } catch {
          // Ignore
        }
      }

      const docData = {
        label: link.label,
        url: link.url,
        icon: link.icon,
        openInApp: link.openInApp,
        clicks: link.clicks,
        shortLinkSlug: link.shortLinkSlug,
      };

      let finalLinkId;
      if (docId) {
        await ctx.db.patch(docId, docData);
        keptIds.add(docId);
        finalLinkId = docId;
      } else {
        const newId = await ctx.db.insert("socialLinks", docData);
        keptIds.add(newId);
        finalLinkId = newId;
      }

      // Sync to shortLinks table
      const syncId = `sl-sync-${finalLinkId}`;
      const existingShortLink = await ctx.db
        .query("shortLinks")
        .filter((q) => q.eq(q.field("syncId"), syncId))
        .first();

      if (link.shortLinkSlug && link.shortLinkSlug.trim() !== "") {
        const slugClean = link.shortLinkSlug.trim().toLowerCase();
        if (existingShortLink) {
          await ctx.db.patch(existingShortLink._id, {
            slug: slugClean,
            url: link.url,
            openInApp: link.openInApp,
          });
        } else {
          // Verify if slug is already taken by a non-synced shortlink
          const duplicate = await ctx.db
            .query("shortLinks")
            .filter((q) => q.eq(q.field("slug"), slugClean))
            .first();
          if (!duplicate) {
            await ctx.db.insert("shortLinks", {
              slug: slugClean,
              url: link.url,
              openInApp: link.openInApp,
              clicks: 0,
              syncId,
            });
          }
        }
      } else {
        // If shortLinkSlug is removed, delete corresponding synced shortLink
        if (existingShortLink) {
          await ctx.db.delete(existingShortLink._id);
        }
      }
    }

    // Delete any links that were removed
    for (const link of existingLinks) {
      if (!keptIds.has(link._id)) {
        await ctx.db.delete(link._id);
        // Also delete any synced shortLink
        const syncId = `sl-sync-${link._id}`;
        const existingShortLink = await ctx.db
          .query("shortLinks")
          .filter((q) => q.eq(q.field("syncId"), syncId))
          .first();
        if (existingShortLink) {
          await ctx.db.delete(existingShortLink._id);
        }
      }
    }
  },
});

// Increment social link click count
export const incrementClicks = mutation({
  args: { id: v.id("socialLinks") },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.id);
    if (link) {
      await ctx.db.patch(args.id, { clicks: (link.clicks || 0) + 1 });
    }
  },
});
