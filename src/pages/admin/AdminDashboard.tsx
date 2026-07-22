import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { db } from "../../lib/db";
import type { SocialLink, Post, ShortLink, HubStatus } from "../../lib/db";
import {
  Lock, ArrowLeft, Plus, Edit2, Trash2,
  ExternalLink, BarChart3, Layers, Sparkles,
  TrendingUp, Link2, MousePointerClick, Smartphone, Gauge
} from "lucide-react";

import { PostFormModal } from "./components/PostFormModal";
import { ShortLinkFormModal } from "./components/ShortLinkFormModal";
import { WidgetController } from "./components/WidgetController";

export const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("ramithks_admin_auth") === "true";
  });
  const [passcode, setPasscode] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Tabs: 'posts' | 'widgets' | 'shortlinks'
  const [activeTab, setActiveTab] = useState<string>("posts");

  // Data states
  const [posts, setPosts] = useState<Post[]>(() => db.getPosts());
  const [links, setLinks] = useState<SocialLink[]>(() => db.getLinks());
  const [shortLinks, setShortLinks] = useState<ShortLink[]>(() => db.getShortLinks());

  // Editing / Adding Modals states
  const [postForm, setPostForm] = useState<Partial<Post> | null>(null);
  const [shortLinkForm, setShortLinkForm] = useState<Partial<ShortLink> | null>(null);
  const [widgetForm, setWidgetForm] = useState<HubStatus | null>(() => db.getStatus());

  // Success indicator for widget updates
  const [widgetSavedSuccess, setWidgetSavedSuccess] = useState<boolean>(false);

  const totalPostClicks = posts.reduce((sum, post) => sum + (post.clicks || 0), 0);
  const totalSocialClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalShortLinkClicks = shortLinks.reduce((sum, shortLink) => sum + (shortLink.clicks || 0), 0);
  const livePosts = posts.filter((post) => post.openInApp).length;
  const liveLinks = links.filter((link) => link.openInApp).length;
  const liveShortLinks = shortLinks.filter((shortLink) => shortLink.openInApp).length;
  const instagramPosts = posts.filter((post) => post.type === "instagram").length;
  const xPosts = posts.filter((post) => post.type === "twitter").length;
  const uniquePostPlatforms = new Set(posts.map((post) => post.type)).size;

  const feedMetricCards = [
    {
      label: "Posts",
      value: posts.length,
      detail: `${uniquePostPlatforms} platforms`,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: "Feed clicks",
      value: totalPostClicks,
      detail: "Clicks from timeline cards",
      icon: <MousePointerClick className="w-4 h-4" />,
    },
    {
      label: "Open in app",
      value: livePosts,
      detail: `${posts.length - livePosts} posts stay in web`,
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      label: "Instagram / X",
      value: instagramPosts + xPosts,
      detail: `${instagramPosts} Instagram + ${xPosts} X posts`,
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  const socialMetricCards = [
    {
      label: "Social links",
      value: links.length,
      detail: `${liveLinks} open in app`,
      icon: <Link2 className="w-4 h-4" />,
    },
    {
      label: "Short links",
      value: shortLinks.length,
      detail: `${liveShortLinks} open in app`,
      icon: <Gauge className="w-4 h-4" />,
    },
    {
      label: "Profile clicks",
      value: totalSocialClicks,
      detail: "Clicks from social buttons",
      icon: <MousePointerClick className="w-4 h-4" />,
    },
    {
      label: "Shortcut clicks",
      value: totalShortLinkClicks,
      detail: "Clicks from short links",
      icon: <Smartphone className="w-4 h-4" />,
    },
  ];

  // Autofill hook
  useEffect(() => {
    if (!isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("autofill") === "1") {
      const url = params.get("url") || "";
      const title = params.get("title") || "";
      const description = params.get("description") || "";
      const thumbnail = params.get("thumbnail") || "";
      const type = (params.get("type") as Post["type"]) || "blog";
      const author = params.get("author") || "";
      const likes = params.get("likes") ? Number(params.get("likes")) : undefined;
      const comments = params.get("comments") ? Number(params.get("comments")) : undefined;
      const views = params.get("views") ? Number(params.get("views")) : undefined;
      const reposts = params.get("reposts") ? Number(params.get("reposts")) : undefined;
      const duration = params.get("duration") || undefined;

      // Determine default tag based on type
      let tag = "Travel";
      if (type === "youtube") tag = "YouTube Vlog";
      else if (type === "instagram") tag = "Instagram Reel";
      else if (type === "twitter") tag = "X Update";
      else if (type === "linkedin") tag = "Creator Economy";
      else tag = "Gear Guide";

      setPostForm({
        url,
        title,
        description,
        thumbnail,
        type,
        author,
        likes,
        comments,
        views,
        reposts,
        duration,
        tag,
        openInApp: true,
      });

      // Scrub the query parameters from the browser URL address bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default mock admin key is 'admin'
    if (passcode.toLowerCase() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("ramithks_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Access Denied. Incorrect admin key.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ramithks_admin_auth");
  };

  // --- POSTS CRUD ---
  const savePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm || !postForm.url) return;
    // Title is required for non-Twitter posts
    if (postForm.type !== "twitter" && !postForm.title) return;
    // Description is required for Twitter posts (the tweet body)
    if (postForm.type === "twitter" && !postForm.description) return;

    let updatedPosts = [...posts];
    const postType = postForm.type || "blog";
    const postTitle = postForm.title || (postType === "twitter" ? (postForm.description || "").slice(0, 60) : "Untitled Post");

    const parsedPost: Partial<Post> = {
      ...postForm,
      title: postTitle,
      type: postType,
      likes: postForm.likes ? Number(postForm.likes) : undefined,
      views: postForm.views ? Number(postForm.views) : undefined,
      comments: postForm.comments ? Number(postForm.comments) : undefined,
      reposts: postForm.reposts ? Number(postForm.reposts) : undefined,
      duration: postForm.duration || undefined,
      author: postForm.author || undefined,
    };

    if (postForm.id) {
      // Edit
      updatedPosts = updatedPosts.map(p => p.id === postForm.id ? { ...p, ...parsedPost } as Post : p);
    } else {
      // Add
      const newPost: Post = {
        id: 'post-' + Date.now(),
        title: postTitle,
        tag: parsedPost.tag || "Travel",
        thumbnail: parsedPost.thumbnail || "",
        description: parsedPost.description || "",
        url: parsedPost.url || "",
        openInApp: !!parsedPost.openInApp,
        date: parsedPost.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        clicks: 0,
        type: postType,
        likes: parsedPost.likes,
        views: parsedPost.views,
        comments: parsedPost.comments,
        reposts: parsedPost.reposts,
        duration: parsedPost.duration,
        author: parsedPost.author,
      };
      updatedPosts.unshift(newPost);
    }

    db.savePosts(updatedPosts);
    setPosts(updatedPosts);
    setPostForm(null);
  };

  const deletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter(p => p.id !== id);
      db.savePosts(updatedPosts);
      setPosts(updatedPosts);
    }
  };



  // --- SHORT LINKS CRUD ---
  const saveShortLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortLinkForm || !shortLinkForm.slug || !shortLinkForm.url) return;

    // Check duplicate slug
    const duplicate = shortLinks.find(sl => sl.slug.toLowerCase() === shortLinkForm.slug?.toLowerCase() && sl.id !== shortLinkForm.id);
    if (duplicate) {
      alert("A short link with this slug already exists.");
      return;
    }

    let updatedShortLinks = [...shortLinks];
    if (shortLinkForm.id) {
      // Edit
      updatedShortLinks = updatedShortLinks.map(sl => sl.id === shortLinkForm.id ? { ...sl, ...shortLinkForm } as ShortLink : sl);
    } else {
      // Add
      const newSL: ShortLink = {
        id: 'sl-' + Date.now(),
        slug: shortLinkForm.slug.trim().toLowerCase(),
        url: shortLinkForm.url || "",
        openInApp: !!shortLinkForm.openInApp,
        clicks: 0
      };
      updatedShortLinks.push(newSL);
    }

    db.saveShortLinks(updatedShortLinks);
    setShortLinks(updatedShortLinks);
    setShortLinkForm(null);
  };

  const deleteShortLink = (id: string) => {
    if (confirm("Are you sure you want to delete this short link?")) {
      const updatedShortLinks = shortLinks.filter(sl => sl.id !== id);
      db.saveShortLinks(updatedShortLinks);
      setShortLinks(updatedShortLinks);
    }
  };

  // --- WIDGETS CONFIG ---
  const saveWidgetsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetForm) return;

    db.saveStatus(widgetForm);
    db.saveLinks(links);

    // Sync Social Link short link slugs to the ShortLink array
    let updatedShortLinks = [...shortLinks];
    links.forEach(link => {
      const syncId = `sl-sync-${link.id}`;
      if (link.shortLinkSlug) {
        // If a redirect is configured
        const existingIndex = updatedShortLinks.findIndex(sl => sl.id === syncId);
        if (existingIndex !== -1) {
          // Update
          updatedShortLinks[existingIndex] = {
            ...updatedShortLinks[existingIndex],
            slug: link.shortLinkSlug.trim().toLowerCase(),
            url: link.url,
            openInApp: link.openInApp,
          };
        } else {
          // Add new
          updatedShortLinks.push({
            id: syncId,
            slug: link.shortLinkSlug.trim().toLowerCase(),
            url: link.url,
            openInApp: link.openInApp,
            clicks: 0
          });
        }
      } else {
        // If redirect is disabled, remove any synced short link for this social
        updatedShortLinks = updatedShortLinks.filter(sl => sl.id !== syncId);
      }
    });

    db.saveShortLinks(updatedShortLinks);
    setShortLinks(updatedShortLinks);

    setWidgetSavedSuccess(true);
    setTimeout(() => setWidgetSavedSuccess(false), 3000);
  };



  const handleResetDB = () => {
    if (confirm("Warning: This will reset all database items to their defaults (losing any custom entries/clicks). Proceed?")) {
      db.resetDB();
      setPosts(db.getPosts());
      setLinks(db.getLinks());
      setShortLinks(db.getShortLinks());
      const statusData = db.getStatus();
      setWidgetForm(statusData);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="bg-[#030305] text-[#F5F5F7] min-h-screen flex items-center justify-center p-6 relative font-sans">
        <Helmet>
          <title>Admin Authentication</title>
        </Helmet>

        {/* Background radial glow */}
        <div className="absolute w-[60vw] h-[60vw] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-sm p-8 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-center mb-1">Admin Workspace</h1>
          <p className="text-[#86868B] text-xs text-center mb-6">Enter key to configure links and thoughts</p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (Default: admin)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20 text-white"
                required
              />
            </div>

            {authError && (
              <p className="text-red-400 text-xs font-semibold text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
            >
              Access Workspace
            </button>

            <Link
              to="/"
              className="w-full py-3 bg-transparent text-white/50 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-1 mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030305] text-[#F5F5F7] min-h-screen pb-20 font-sans selection:bg-white/20 selection:text-black">
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-[10px] text-[#FA2356] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FA2356] animate-pulse" />
              CONNECTED / LOCAL STORAGE DB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDB}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-400 hover:bg-red-500/5 text-xs font-medium transition-all"
            title="Reset DB to initial seed defaults"
          >
            Reset Seed Data
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab("posts")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all ${activeTab === 'posts' ? 'bg-[#FFFFFF] text-[#000000] shadow-lg' : 'bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04]'}`}
          >
            <Layers className="w-4 h-4" />
            <span>Timeline Feed</span>
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'posts' ? 'bg-black/10 text-black' : 'bg-black/30 text-white/60'}`}>{posts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("widgets")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all ${activeTab === 'widgets' ? 'bg-[#FFFFFF] text-[#000000] shadow-lg' : 'bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04]'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Profile & Socials</span>
            <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${activeTab === 'widgets' ? 'bg-black/10 text-black' : 'bg-[#FA2356]/10 text-[#FA2356] border border-[#FA2356]/10'}`}>Live</span>
          </button>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-3">

          {/* TAB 1: POSTS */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Timeline Feed</h2>
                  <p className="text-xs text-[#86868B]">Manage the posts displayed in your profile timeline feed</p>
                </div>
                <button
                  onClick={() => setPostForm({ type: 'blog' })}
                  className="py-2 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex-shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Feed Post</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {feedMetricCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white">
                        {card.icon}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#86868B]">{card.label}</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-extrabold tracking-tight text-white">{card.value}</div>
                      <p className="text-[11px] text-[#AEAEB2] mt-1 leading-relaxed">{card.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid of posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      {/* Thumbnail preview */}
                      <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 shrink-0 flex items-center justify-center font-bold text-xs tracking-wider overflow-hidden" style={{ background: post.thumbnail ? `url(${post.thumbnail}) center/cover` : 'linear-gradient(135deg, #111112 0%, #1c1c1e 100%)' }}>
                        {!post.thumbnail && post.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-[#FFFFFF] bg-white/10 px-2 py-0.5 rounded-full border border-white/10 uppercase">{post.type}</span>
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/10">{post.tag}</span>
                          <span className="text-[10px] text-[#86868B]">{post.date}</span>
                          {post.openInApp && (
                            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">App Opener</span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm mt-1">{post.title || post.description?.slice(0, 50) + "..."}</h3>
                        <p className="text-xs text-[#86868B] line-clamp-2 mt-1">{post.description}</p>

                        <a href={post.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline mt-2 inline-flex items-center gap-0.5">
                          <span className="max-w-[200px] truncate">{post.url}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex md:flex-col items-end justify-between border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                      <div className="flex items-center gap-1 text-[#86868B]" title="Clicks through personal hub">
                        <BarChart3 className="w-4 h-4 text-white/40" />
                        <span className="text-xs font-mono font-bold text-[#F5F5F7]">{post.clicks}</span>
                        <span className="text-[10px] text-[#86868B]">clicks</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setPostForm(post)}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 text-white/70 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-12 text-[#86868B] text-sm">
                    No posts written yet. Add some thoughts to show them off!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & SOCIALS */}
          {activeTab === "widgets" && widgetForm && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Profile & Socials</h2>
                  <p className="text-xs text-[#86868B]">Manage profile widgets, social links, and short links</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                  Live connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {socialMetricCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white">
                        {card.icon}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#86868B]">{card.label}</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-extrabold tracking-tight text-white">{card.value}</div>
                      <p className="text-[11px] text-[#AEAEB2] mt-1 leading-relaxed">{card.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <WidgetController
                widgetForm={widgetForm}
                onChange={setWidgetForm}
                links={links}
                onChangeLinks={setLinks}
                shortLinks={shortLinks}
                onSave={saveWidgetsSubmit}
                widgetSavedSuccess={widgetSavedSuccess}
                onAddShortLink={() => setShortLinkForm({})}
                onEditShortLink={(sl) => setShortLinkForm(sl)}
                onDeleteShortLink={deleteShortLink}
              />
            </div>
          )}

        </section>
      </main>

      {/* --- FORM MODALS --- */}

      {/* Post Add/Edit Modal */}
      {postForm && (
        <PostFormModal
          postForm={postForm}
          onChange={setPostForm}
          onSave={savePostSubmit}
          onClose={() => setPostForm(null)}
        />
      )}

      {/* Short Link Add/Edit Modal */}
      {shortLinkForm && (
        <ShortLinkFormModal
          shortLinkForm={shortLinkForm}
          onChange={setShortLinkForm}
          onSave={saveShortLinkSubmit}
          onClose={() => setShortLinkForm(null)}
        />
      )}

    </div>
  );
};
