export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: 'instagram' | 'x' | 'linkedin' | 'facebook' | 'youtube' | 'globe';
  openInApp: boolean;
  clicks: number;
  shortLinkSlug?: string;
}

export interface Post {
  id: string;
  title: string;
  tag: string;
  thumbnail: string; // can be empty or a URL
  description: string;
  url: string;
  openInApp: boolean;
  date: string;
  clicks: number;
  type: 'blog' | 'youtube' | 'instagram' | 'twitter' | 'linkedin';
  // Platform specific metadata
  likes?: number;
  views?: number;
  comments?: number;
  reposts?: number;
  duration?: string;
  author?: string;
}

export interface ShortLink {
  id: string;
  slug: string;
  url: string;
  openInApp: boolean;
  clicks: number;
}

export interface HubStatus {
  statusEmoji: string;
  statusText: string;
  spotifyActive: boolean;
  spotifyTrack: string;
  spotifyArtist: string;
  profilePhoto?: string;
  profileName?: string;
  profileSubtitle?: string;
  profileBio?: string;
  quoteText?: string;
}


const STORAGE_KEYS = {
  LINKS: 'ramithks_links',
  POSTS: 'ramithks_posts',
  SHORT_LINKS: 'ramithks_short_links',
  STATUS: 'ramithks_status',
};

const DEFAULT_LINKS: SocialLink[] = [
  {
    id: 'link-1',
    label: 'Instagram',
    url: 'https://www.instagram.com/ramithks',
    icon: 'instagram',
    openInApp: true,
    clicks: 0,
    shortLinkSlug: 'insta',
  },
  {
    id: 'link-2',
    label: 'X (Twitter)',
    url: 'https://x.com/ramithks',
    icon: 'x',
    openInApp: true,
    clicks: 0,
    shortLinkSlug: 'x',
  },
  {
    id: 'link-3',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/ramith-k-s/',
    icon: 'linkedin',
    openInApp: true,
    clicks: 0,
    shortLinkSlug: 'linkedin',
  },
  {
    id: 'link-4',
    label: 'Facebook',
    url: 'https://www.facebook.com/ramith.ks/',
    icon: 'facebook',
    openInApp: true,
    clicks: 0,
  },
  {
    id: 'link-5',
    label: 'YouTube',
    url: 'https://www.youtube.com/@ramith_ks',
    icon: 'youtube',
    openInApp: true,
    clicks: 0,
    shortLinkSlug: 'yt',
  },
];

const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-yt-1',
    title: 'Riding Through the Toughest Pass: Spiti Valley Motorcycle Adventure 🏍️',
    tag: 'YouTube Vlog',
    thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop',
    description: 'An epic journey across river crossings, gravel roads, and high-altitude passes. Watch the raw vlogging experience!',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    openInApp: true,
    date: 'May 20, 2026',
    clicks: 0,
    type: 'youtube',
    views: 24500,
    duration: '18:45',
  },
  {
    id: 'post-ig-1',
    title: 'Sunset ride in the heart of Spiti Valley. Pure bliss! 🌄',
    tag: 'Instagram Ride',
    thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop',
    description: 'Chasing sunsets across the cold desert. The mountains have a way of putting life into perspective. Swipe for more frames.',
    url: 'https://www.instagram.com/ramithks',
    openInApp: true,
    date: 'May 19, 2026',
    clicks: 0,
    type: 'instagram',
    likes: 854,
    comments: 42,
  },
  {
    id: 'post-x-1',
    title: 'Planning a solo coastal highway ride next month! Any hidden food spots or route recommendations along the coast?',
    tag: 'X Update',
    thumbnail: '',
    description: 'Gears packed, bike serviced. Looking for recommendations for local food joints, scenic stops, and coastal homestays. Drop them below!',
    url: 'https://x.com/ramithks',
    openInApp: true,
    date: 'May 15, 2026',
    clicks: 0,
    type: 'twitter',
    likes: 312,
    comments: 18,
    reposts: 45,
    author: 'ramithks',
  },
  {
    id: 'post-li-1',
    title: 'The Creator Economy: The Business and Workflow of Travel Creators 📈',
    tag: 'Creator Economy',
    thumbnail: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=600&auto=format&fit=crop',
    description: 'A deep dive into how modern travel vloggers coordinate sponsorship logistics, equipment management, and editing workflows while constantly on the move.',
    url: 'https://www.linkedin.com/in/ramith-k-s/',
    openInApp: true,
    date: 'May 10, 2026',
    clicks: 0,
    type: 'linkedin',
    likes: 420,
    comments: 31,
    author: 'Ramith K S',
  },
  {
    id: 'post-blog-1',
    title: 'My Complete Moto-Vlogging Gear List: Cameras, Rigs, & Comm Systems 🎒',
    tag: 'Gear Guide',
    thumbnail: 'https://images.unsplash.com/photo-1502740479091-635887520276?q=80&w=600&auto=format&fit=crop',
    description: 'Detailed gear list breakdown covering main action cameras, helmet microphone setups, mounting adapters, riding jackets, and lightweight tripods.',
    url: 'https://github.com/ramithks',
    openInApp: false,
    date: 'May 02, 2026',
    clicks: 0,
    type: 'blog',
  },
];

const DEFAULT_SHORT_LINKS: ShortLink[] = [
  {
    id: 'sl-sync-link-1',
    slug: 'insta',
    url: 'https://www.instagram.com/ramithks',
    openInApp: true,
    clicks: 0,
  },
  {
    id: 'sl-sync-link-5',
    slug: 'yt',
    url: 'https://www.youtube.com/@ramith_ks',
    openInApp: true,
    clicks: 0,
  },
  {
    id: 'sl-sync-link-3',
    slug: 'linkedin',
    url: 'https://www.linkedin.com/in/ramith-k-s/',
    openInApp: true,
    clicks: 0,
  },
  {
    id: 'sl-sync-link-2',
    slug: 'x',
    url: 'https://x.com/ramithks',
    openInApp: true,
    clicks: 0,
  },
];

const DEFAULT_STATUS: HubStatus = {
  statusEmoji: '🌊',
  statusText: 'Editing the Gokarna travel vlog 🎬',
  spotifyActive: true,
  spotifyTrack: 'Dangerous',
  spotifyArtist: 'Michael Jackson',
  profilePhoto: '/dp.png',
  profileName: 'Ramith K S',
  profileSubtitle: 'Vlogger & Creator',
  profileBio: 'Just figuring things out while building something of my own.\n\nI post a mix of startup stuff, tech, daily life, and moto vlogs — basically whatever I’m up to. Some days it’s work, some days it’s rides, some days it’s just random moments.\n\nNothing too polished, just real.',
  quoteText: 'Stay hungry, stay foolish.',
};


const DB_VERSION_KEY = 'ramithks_db_version';
const CURRENT_DB_VERSION = 'v5_social_short_links';


const initializeDB = () => {
  const version = localStorage.getItem(DB_VERSION_KEY);
  if (version !== CURRENT_DB_VERSION) {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(DEFAULT_LINKS));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    localStorage.setItem(STORAGE_KEYS.SHORT_LINKS, JSON.stringify(DEFAULT_SHORT_LINKS));
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(DEFAULT_STATUS));
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.LINKS)) {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(DEFAULT_LINKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SHORT_LINKS)) {
    localStorage.setItem(STORAGE_KEYS.SHORT_LINKS, JSON.stringify(DEFAULT_SHORT_LINKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STATUS)) {
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(DEFAULT_STATUS));
  }
};

export const db = {
  // Links
  getLinks(): SocialLink[] {
    initializeDB();
    const data = localStorage.getItem(STORAGE_KEYS.LINKS);
    return data ? JSON.parse(data) : DEFAULT_LINKS;
  },

  saveLinks(links: SocialLink[]): void {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  },

  incrementLinkClicks(id: string): void {
    const links = this.getLinks();
    const index = links.findIndex(l => l.id === id);
    if (index !== -1) {
      links[index].clicks += 1;
      this.saveLinks(links);
    }
  },

  // Posts
  getPosts(): Post[] {
    initializeDB();
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : DEFAULT_POSTS;
  },

  savePosts(posts: Post[]): void {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  incrementPostClicks(id: string): void {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index].clicks += 1;
      this.savePosts(posts);
    }
  },

  // Short Links
  getShortLinks(): ShortLink[] {
    initializeDB();
    const data = localStorage.getItem(STORAGE_KEYS.SHORT_LINKS);
    return data ? JSON.parse(data) : DEFAULT_SHORT_LINKS;
  },

  saveShortLinks(shortLinks: ShortLink[]): void {
    localStorage.setItem(STORAGE_KEYS.SHORT_LINKS, JSON.stringify(shortLinks));
  },

  incrementShortLinkClicks(slug: string): void {
    const shortLinks = this.getShortLinks();
    const index = shortLinks.findIndex(sl => sl.slug.toLowerCase() === slug.toLowerCase());
    if (index !== -1) {
      shortLinks[index].clicks += 1;
      this.saveShortLinks(shortLinks);
    }
  },

  // Hub Status & Widgets
  getStatus(): HubStatus {
    initializeDB();
    const data = localStorage.getItem(STORAGE_KEYS.STATUS);
    return data ? JSON.parse(data) : DEFAULT_STATUS;
  },

  saveStatus(status: HubStatus): void {
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(status));
  },



  // Reset database to defaults
  resetDB(): void {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(DEFAULT_LINKS));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    localStorage.setItem(STORAGE_KEYS.SHORT_LINKS, JSON.stringify(DEFAULT_SHORT_LINKS));
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(DEFAULT_STATUS));
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
  }
};
