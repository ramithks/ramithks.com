import { mutation } from "./_generated/server";

const DEFAULT_LINKS = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/ramithks",
    icon: "instagram" as const,
    openInApp: true,
    clicks: 0,
    shortLinkSlug: "insta",
  },
  {
    label: "X (Twitter)",
    url: "https://x.com/ramithks",
    icon: "x" as const,
    openInApp: true,
    clicks: 0,
    shortLinkSlug: "x",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/ramith-k-s/",
    icon: "linkedin" as const,
    openInApp: true,
    clicks: 0,
    shortLinkSlug: "linkedin",
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/ramith.ks/",
    icon: "facebook" as const,
    openInApp: true,
    clicks: 0,
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@ramith_ks",
    icon: "youtube" as const,
    openInApp: true,
    clicks: 0,
    shortLinkSlug: "yt",
  },
];

const DEFAULT_POSTS = [
  {
    title: "Riding Through the Toughest Pass: Spiti Valley Motorcycle Adventure 🏍️",
    tag: "YouTube Vlog",
    thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop",
    description: "An epic journey across river crossings, gravel roads, and high-altitude passes. Watch the raw vlogging experience!",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    openInApp: true,
    date: "May 20, 2026",
    clicks: 0,
    type: "youtube" as const,
    views: 24500,
    duration: "18:45",
  },
  {
    title: "Sunset ride in the heart of Spiti Valley. Pure bliss! 🌄",
    tag: "Instagram Ride",
    thumbnail: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop",
    description: "Chasing sunsets across the cold desert. The mountains have a way of putting life into perspective. Swipe for more frames.",
    url: "https://www.instagram.com/ramithks",
    openInApp: true,
    date: "May 19, 2026",
    clicks: 0,
    type: "instagram" as const,
    likes: 854,
    comments: 42,
  },
  {
    title: "Planning a solo coastal highway ride next month! Any hidden food spots or route recommendations along the coast?",
    tag: "X Update",
    thumbnail: "",
    description: "Gears packed, bike serviced. Looking for recommendations for local food joints, scenic stops, and coastal homestays. Drop them below!",
    url: "https://x.com/ramithks",
    openInApp: true,
    date: "May 15, 2026",
    clicks: 0,
    type: "twitter" as const,
    likes: 312,
    comments: 18,
    reposts: 45,
    author: "ramithks",
  },
  {
    title: "The Creator Economy: The Business and Workflow of Travel Creators 📈",
    tag: "Creator Economy",
    thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=600&auto=format&fit=crop",
    description: "A deep dive into how modern travel vloggers coordinate sponsorship logistics, equipment management, and editing workflows while constantly on the move.",
    url: "https://www.linkedin.com/in/ramith-k-s/",
    openInApp: true,
    date: "May 10, 2026",
    clicks: 0,
    type: "linkedin" as const,
    likes: 420,
    comments: 31,
    author: "Ramith K S",
  },
  {
    title: "My Complete Moto-Vlogging Gear List: Cameras, Rigs, & Comm Systems 🎒",
    tag: "Gear Guide",
    thumbnail: "https://images.unsplash.com/photo-1502740479091-635887520276?q=80&w=600&auto=format&fit=crop",
    description: "Detailed gear list breakdown covering main action cameras, helmet microphone setups, mounting adapters, riding jackets, and lightweight tripods.",
    url: "https://github.com/ramithks",
    openInApp: false,
    date: "May 02, 2026",
    clicks: 0,
    type: "blog" as const,
  },
];

const DEFAULT_SHORT_LINKS = [
  {
    slug: "insta",
    url: "https://www.instagram.com/ramithks",
    openInApp: true,
    clicks: 0,
  },
  {
    slug: "yt",
    url: "https://www.youtube.com/@ramith_ks",
    openInApp: true,
    clicks: 0,
  },
  {
    slug: "linkedin",
    url: "https://www.linkedin.com/in/ramith-k-s/",
    openInApp: true,
    clicks: 0,
  },
  {
    slug: "x",
    url: "https://x.com/ramithks",
    openInApp: true,
    clicks: 0,
  },
];

const DEFAULT_STATUS = {
  statusEmoji: "🌊",
  statusText: "Editing the Gokarna travel vlog 🎬",
  spotifyActive: true,
  spotifyTrack: "Dangerous",
  spotifyArtist: "Michael Jackson",
  profilePhoto: "/dp.png",
  profileName: "Ramith K S",
  profileSubtitle: "Vlogger & Creator",
  profileBio: "Just figuring things out while building something of my own.\n\nI post a mix of startup stuff, tech, daily life, and moto vlogs — basically whatever I’m up to. Some days it’s work, some days it’s rides, some days it’s just random moments.\n\nNothing too polished, just real.",
};

export const resetDB = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all existing data
    const posts = await ctx.db.query("posts").collect();
    for (const p of posts) {
      await ctx.db.delete(p._id);
    }
    
    const socialLinks = await ctx.db.query("socialLinks").collect();
    for (const s of socialLinks) {
      await ctx.db.delete(s._id);
    }

    const shortLinks = await ctx.db.query("shortLinks").collect();
    for (const sl of shortLinks) {
      await ctx.db.delete(sl._id);
    }

    const hubStatus = await ctx.db.query("hubStatus").collect();
    for (const hs of hubStatus) {
      await ctx.db.delete(hs._id);
    }

    // Insert seeds
    for (const p of DEFAULT_POSTS) {
      await ctx.db.insert("posts", p);
    }

    // Keep track of sync IDs mapping to links
    for (const l of DEFAULT_LINKS) {
      const linkId = await ctx.db.insert("socialLinks", l);
      
      // If it has a shortLinkSlug, sync to shortLinks table
      if (l.shortLinkSlug) {
        await ctx.db.insert("shortLinks", {
          slug: l.shortLinkSlug.toLowerCase().trim(),
          url: l.url,
          openInApp: l.openInApp,
          clicks: 0,
          syncId: `sl-sync-${linkId}`,
        });
      }
    }

    // Insert other standard custom shortlinks that are not connected to social buttons directly
    for (const sl of DEFAULT_SHORT_LINKS) {
      const existing = await ctx.db
        .query("shortLinks")
        .filter((q) => q.eq(q.field("slug"), sl.slug.toLowerCase().trim()))
        .first();
      if (!existing) {
        await ctx.db.insert("shortLinks", {
          ...sl,
          slug: sl.slug.toLowerCase().trim(),
        });
      }
    }

    await ctx.db.insert("hubStatus", DEFAULT_STATUS);
  },
});
