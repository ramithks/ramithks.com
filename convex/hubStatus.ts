import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_STATUS = {
  statusEmoji: "🌊",
  statusText: "Editing the Gokarna travel vlog 🎬",
  spotifyActive: false,
  spotifyTrack: "",
  spotifyArtist: "",
  profilePhoto: "/dp.png",
  profileName: "Ramith K S",
  profileSubtitle: "Vlogger & Creator",
  profileBio: "Building products, writing code, and riding motorbikes. Sharing daily life, startup insights, and travel vlogs.",
  quoteText: "Stay hungry, stay foolish.",
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
    passcode: v.string(),
    statusEmoji: v.string(),
    statusText: v.string(),
    spotifyActive: v.boolean(),
    spotifyTrack: v.string(),
    spotifyArtist: v.string(),
    profilePhoto: v.optional(v.string()),
    profileName: v.optional(v.string()),
    profileSubtitle: v.optional(v.string()),
    profileBio: v.optional(v.string()),
    quoteText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminPassword = (globalThis as any).process?.env?.ADMIN_PASSWORD || "admin";
    if (args.passcode !== adminPassword) {
      throw new Error("Unauthorized");
    }
    const { passcode, ...statusData } = args;
    const existing = await ctx.db.query("hubStatus").first();
    if (existing) {
      await ctx.db.replace(existing._id, statusData);
    } else {
      await ctx.db.insert("hubStatus", statusData);
    }
  },
});
