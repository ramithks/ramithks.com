import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    tag: v.string(),
    thumbnail: v.string(),
    description: v.string(),
    url: v.string(),
    openInApp: v.boolean(),
    date: v.string(),
    clicks: v.number(),
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
  }),
  socialLinks: defineTable({
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
  }),
  shortLinks: defineTable({
    slug: v.string(),
    url: v.string(),
    openInApp: v.boolean(),
    clicks: v.number(),
    syncId: v.optional(v.string()),
  }),
  hubStatus: defineTable({
    statusEmoji: v.string(),
    statusText: v.string(),
    spotifyActive: v.boolean(),
    spotifyTrack: v.string(),
    spotifyArtist: v.string(),
    profilePhoto: v.optional(v.string()),
    profileName: v.optional(v.string()),
    profileSubtitle: v.optional(v.string()),
    profileBio: v.optional(v.string()),
  }),
});
