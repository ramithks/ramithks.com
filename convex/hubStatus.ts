import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_STATUS = {
  statusEmoji: "",
  statusText: "",
  spotifyActive: false,
  spotifyTrack: "",
  spotifyArtist: "",
  profilePhoto: "",
  profileName: "",
  profileSubtitle: "",
  profileBio: "",
};

// Get the single status document (returns default if not set in db)
export const get = query({
  args: {},
  handler: async (ctx) => {
    const status = await ctx.db.query("hubStatus").first();
    if (!status) {
      return {
        _id: "temp-status-id",
        ...DEFAULT_STATUS,
      };
    }
    return status;
  },
});

// Update or initialize status document
export const update = mutation({
  args: {
    statusEmoji: v.string(),
    statusText: v.string(),
    spotifyActive: v.boolean(),
    spotifyTrack: v.string(),
    spotifyArtist: v.string(),
    profilePhoto: v.optional(v.string()),
    profileName: v.optional(v.string()),
    profileSubtitle: v.optional(v.string()),
    profileBio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("hubStatus").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("hubStatus", args);
    }
  },
});
