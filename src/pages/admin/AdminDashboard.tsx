import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Post } from "../../lib/db";
import {
  Lock, ArrowLeft, Plus, Edit2, Trash2,
  ExternalLink, BarChart3, Layers, Sparkles,
  TrendingUp, Smartphone
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

  // Convex queries
  const convexPosts = useQuery(api.posts.get);
  const convexLinks = useQuery(api.links.get);
  const convexShortLinks = useQuery(api.shortLinks.get);
  const convexStatus = useQuery(api.hubStatus.get);

  // Convex mutations
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);
  const deletePostMutation = useMutation(api.posts.deletePost);
  const createShortLink = useMutation(api.shortLinks.create);
  const updateShortLink = useMutation(api.shortLinks.update);
  const deleteShortLinkMutation = useMutation(api.shortLinks.deleteLink);
  const updateStatus = useMutation(api.hubStatus.update);
  const saveSocialLinks = useMutation(api.links.saveAll);
  const resetDBMutation = useMutation(api.seed.resetDB);

  // Data states
  const [links, setLinks] = useState<any[]>([]);
  const [widgetForm, setWidgetForm] = useState<any | null>(null);

  // Sync links when loaded from database
  useEffect(() => {
    if (convexLinks !== undefined) {
      setLinks(convexLinks.map((l: any) => ({ ...l, id: l._id })));
    }
  }, [convexLinks]);

  // Sync widgetForm when loaded from database (only if not currently editing/dirty)
  useEffect(() => {
    if (convexStatus !== undefined && widgetForm === null) {
      setWidgetForm(convexStatus);
    }
  }, [convexStatus, widgetForm]);

  const posts = (convexPosts || []).map((p: any) => ({
    ...p,
    id: p._id,
  }));
  const shortLinks = (convexShortLinks || []).map((sl: any) => ({
    ...sl,
    id: sl.syncId || sl._id,
  }));

  // Editing / Adding Modals states
  const [postForm, setPostForm] = useState<Partial<any> | null>(null);
  const [shortLinkForm, setShortLinkForm] = useState<Partial<any> | null>(null);

  // Success indicator for widget updates
  const [widgetSavedSuccess, setWidgetSavedSuccess] = useState<boolean>(false);

  const totalPostClicks = posts.reduce((sum: number, post: any) => sum + (post.clicks || 0), 0);
  const totalSocialClicks = links.reduce((sum: number, link: any) => sum + (link.clicks || 0), 0);
  const totalShortLinkClicks = shortLinks.reduce((sum: number, shortLink: any) => sum + (shortLink.clicks || 0), 0);
  const totalClicks = totalPostClicks + totalSocialClicks + totalShortLinkClicks;

  // --- POSTS CRUD ---
  const savePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm || !postForm.url) return;
    // Title is required for non-Twitter posts
    if (postForm.type !== "twitter" && !postForm.title) return;
    // Description is required for Twitter posts (the tweet body)
    if (postForm.type === "twitter" && !postForm.description) return;

    const postType = postForm.type || "blog";
    const postTitle = postForm.title || (postType === "twitter" ? (postForm.description || "").slice(0, 60) : "Untitled Post");

    const payload = {
      title: postTitle,
      tag: postForm.tag || "Travel",
      thumbnail: postForm.thumbnail || "",
      description: postForm.description || "",
      url: postForm.url || "",
      openInApp: !!postForm.openInApp,
      date: postForm.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: postType as "blog" | "youtube" | "instagram" | "twitter" | "linkedin",
      likes: postForm.likes ? Number(postForm.likes) : undefined,
      views: postForm.views ? Number(postForm.views) : undefined,
      comments: postForm.comments ? Number(postForm.comments) : undefined,
      reposts: postForm.reposts ? Number(postForm.reposts) : undefined,
      duration: postForm.duration || undefined,
      author: postForm.author || undefined,
    };

    if (postForm._id) {
      // Edit
      updatePost({ id: postForm._id, ...payload })
        .then(() => setPostForm(null))
        .catch(err => alert(err.message || "Failed to update post"));
    } else {
      // Add
      createPost(payload)
        .then(() => setPostForm(null))
        .catch(err => alert(err.message || "Failed to create post"));
    }
  };

  const deletePost = (id: any) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation({ id }).catch(console.error);
    }
  };

  // --- SHORT LINKS CRUD ---
  const saveShortLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortLinkForm || !shortLinkForm.slug || !shortLinkForm.url) return;

    // Check duplicate slug (case-insensitive)
    const duplicate = shortLinks.find(
      (sl: any) => sl.slug.toLowerCase() === shortLinkForm.slug?.toLowerCase() && sl._id !== shortLinkForm._id
    );
    if (duplicate) {
      alert("A short link with this slug already exists.");
      return;
    }

    const payload = {
      slug: shortLinkForm.slug.trim().toLowerCase(),
      url: shortLinkForm.url,
      openInApp: !!shortLinkForm.openInApp,
    };

    if (shortLinkForm._id) {
      // Edit
      updateShortLink({ id: shortLinkForm._id, ...payload })
        .then(() => setShortLinkForm(null))
        .catch(err => alert(err.message || "Failed to update short link"));
    } else {
      // Add
      createShortLink(payload)
        .then(() => setShortLinkForm(null))
        .catch(err => alert(err.message || "Failed to create short link"));
    }
  };

  const deleteShortLink = (id: any) => {
    if (confirm("Are you sure you want to delete this short link?")) {
      deleteShortLinkMutation({ id }).catch(console.error);
    }
  };

  // --- WIDGETS CONFIG ---
  const saveWidgetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetForm) return;

    try {
      // 1. Update status
      await updateStatus({
        statusEmoji: widgetForm.statusEmoji,
        statusText: widgetForm.statusText,
        spotifyActive: !!widgetForm.spotifyActive,
        spotifyTrack: widgetForm.spotifyTrack || "",
        spotifyArtist: widgetForm.spotifyArtist || "",
        profilePhoto: widgetForm.profilePhoto,
        profileName: widgetForm.profileName,
        profileSubtitle: widgetForm.profileSubtitle,
        profileBio: widgetForm.profileBio,
      });

      // 2. Save all social links (the mutation also handles syncing short links on the backend!)
      const formattedLinks = links.map(link => ({
        id: link._id,
        label: link.label,
        url: link.url,
        icon: link.icon,
        openInApp: !!link.openInApp,
        clicks: link.clicks || 0,
        shortLinkSlug: link.shortLinkSlug || undefined,
      }));
      await saveSocialLinks({ links: formattedLinks });

      setWidgetSavedSuccess(true);
      setTimeout(() => setWidgetSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save profile state");
    }
  };

  const handleResetDB = () => {
    if (confirm("Warning: This will reset all database items to their defaults (losing any custom entries/clicks). Proceed?")) {
      resetDBMutation()
        .then(() => {
          // Reset local widgetForm state to null so it re-initializes from Convex query
          setWidgetForm(null);
        })
        .catch(err => {
          alert(err.message || "Failed to reset database");
        });
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
            <p className="text-[10px] text-[#30D158] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
              CONNECTED / CONVEX BACKEND
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

          <button
            onClick={() => setActiveTab("metrics")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all ${activeTab === 'metrics' ? 'bg-[#FFFFFF] text-[#000000] shadow-lg' : 'bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04]'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics & Analytics</span>
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'metrics' ? 'bg-black/10 text-black' : 'bg-white/10 text-white/60'}`}>{totalClicks}</span>
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



              {/* Grid of posts */}
              <div className="space-y-4">
                {posts.map((post: any) => (
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
                    <div className="flex md:flex-col items-end justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                      <div className="flex gap-2">
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

          {/* TAB 3: METRICS & ANALYTICS */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Metrics & Analytics</h2>
                  <p className="text-xs text-[#86868B]">Real-time traffic and engagement breakdown across your channels</p>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Analytics Live
                </span>
              </div>

              {/* Grid with 4 Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Card 1: Total Analytics Hub */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden group hover:border-white/20 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full pointer-events-none" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <BarChart3 className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#86868B]">Total Hub Clicks</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold tracking-tight text-white">{totalClicks}</div>
                    <p className="text-[11px] text-[#AEAEB2] mt-1 leading-relaxed">Aggregated visitor interactions</p>
                  </div>
                </div>

                {/* Card 2: Timeline Performance */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden group hover:border-white/20 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Layers className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#86868B]">Timeline Feed</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold tracking-tight text-white">{totalPostClicks}</div>
                    <p className="text-[11px] text-[#AEAEB2] mt-1 leading-relaxed">
                      {totalClicks > 0 ? ((totalPostClicks / totalClicks) * 100).toFixed(0) : 0}% click share
                    </p>
                  </div>
                </div>

                {/* Card 3: Social Hub CTR */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden group hover:border-white/20 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-2xl rounded-full pointer-events-none" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#86868B]">Profile Socials</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold tracking-tight text-white">{totalSocialClicks}</div>
                    <p className="text-[11px] text-[#AEAEB2] mt-1 leading-relaxed">
                      {totalClicks > 0 ? ((totalSocialClicks / totalClicks) * 100).toFixed(0) : 0}% click share
                    </p>
                  </div>
                </div>

                {/* Card 4: Direct Redirections */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden group hover:border-white/20 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#86868B]">Short Shortcuts</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold tracking-tight text-white">{totalShortLinkClicks}</div>
                    <p className="text-[11px] text-[#AEAEB2] mt-1 leading-relaxed">
                      {totalClicks > 0 ? ((totalShortLinkClicks / totalClicks) * 100).toFixed(0) : 0}% click share
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Insights & Traffic Distribution */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Platform Insights & Traffic Distribution
                </h3>
                
                <div className="space-y-4">
                  {(() => {
                    const getUrlPlatform = (url: string) => {
                      const u = url.toLowerCase();
                      if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
                      if (u.includes("instagram.com")) return "instagram";
                      if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
                      if (u.includes("linkedin.com")) return "linkedin";
                      return "blog";
                    };

                    const platformStats = [
                      { id: "instagram", name: "Instagram", color: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
                      { id: "youtube", name: "YouTube", color: "from-[#FF0000] to-[#B30000]" },
                      { id: "twitter", name: "X (Twitter)", color: "from-[#1DA1F2] to-[#0d8ecf]" },
                      { id: "linkedin", name: "LinkedIn", color: "from-[#0077B5] to-[#005582]" },
                      { id: "blog", name: "Blog / Gear / Others", color: "from-[#6200EE] to-[#3700B3]" },
                    ];

                    const platformData = platformStats.map(p => {
                      const postClicks = posts.filter((post: any) => post.type === p.id).reduce((sum: number, post: any) => sum + (post.clicks || 0), 0);
                      const socialClicks = links.filter((l: any) => l.icon === (p.id === "twitter" ? "x" : p.id === "blog" ? "globe" : p.id)).reduce((sum: number, l: any) => sum + (l.clicks || 0), 0);
                      const shortClicks = shortLinks.filter((sl: any) => getUrlPlatform(sl.url) === p.id).reduce((sum: number, sl: any) => sum + (sl.clicks || 0), 0);
                      
                      const totalPlatformClicks = postClicks + socialClicks + shortClicks;
                      const itemCount = posts.filter((post: any) => post.type === p.id).length + links.filter((l: any) => l.icon === (p.id === "twitter" ? "x" : p.id === "blog" ? "globe" : p.id)).length;
                      
                      return {
                        ...p,
                        clicks: totalPlatformClicks,
                        items: itemCount,
                      };
                    });

                    const maxPlatformClicks = Math.max(...platformData.map(d => d.clicks), 1);

                    return platformData.map(p => {
                      const percentage = ((p.clicks / maxPlatformClicks) * 100).toFixed(0);
                      const pctOfTotal = totalClicks > 0 ? ((p.clicks / totalClicks) * 100).toFixed(0) : 0;
                      return (
                        <div key={p.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{p.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[#86868B]">{p.items} active assets</span>
                              <span className="font-bold text-white font-mono">{p.clicks} clicks ({pctOfTotal}%)</span>
                            </div>
                          </div>
                          {/* CSS percentage bar chart */}
                          <div className="w-full h-3 rounded-full bg-white/[0.02] border border-white/5 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${p.color} transition-all duration-500 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* High-CTR Leaderboards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Top Posts */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Top Performing Posts</h4>
                  <div className="space-y-3.5">
                    {(() => {
                      const topPosts = [...posts].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
                      const maxPostClicks = Math.max(...topPosts.map(p => p.clicks || 0), 1);
                      return topPosts.map((p, idx) => {
                        const widthPct = ((p.clicks || 0) / maxPostClicks) * 100;
                        return (
                          <div key={p.id} className="space-y-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-[10px] font-bold text-purple-400 font-mono w-4 shrink-0">#{idx + 1}</span>
                                <span className="font-semibold text-white truncate max-w-[140px]">{p.title || p.description}</span>
                              </div>
                              <span className="font-bold text-white shrink-0 font-mono">{p.clicks} clicks</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {posts.length === 0 && <p className="text-xs text-white/30 text-center py-4">No posts found</p>}
                  </div>
                </div>

                {/* 2. Top Social Links */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Top Social Buttons</h4>
                  <div className="space-y-3.5">
                    {(() => {
                      const topSocialLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
                      const maxSocialClicks = Math.max(...topSocialLinks.map(l => l.clicks || 0), 1);
                      return topSocialLinks.map((l, idx) => {
                        const widthPct = ((l.clicks || 0) / maxSocialClicks) * 100;
                        return (
                          <div key={l.id} className="space-y-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-[10px] font-bold text-blue-400 font-mono w-4 shrink-0">#{idx + 1}</span>
                                <span className="font-semibold text-white capitalize truncate">{l.label}</span>
                                {l.shortLinkSlug && <span className="text-[8px] font-mono text-white/30">(/l/{l.shortLinkSlug})</span>}
                              </div>
                              <span className="font-bold text-white shrink-0 font-mono">{l.clicks} clicks</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 3. Top Short Links */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">Top Redirect URLs</h4>
                  <div className="space-y-3.5">
                    {(() => {
                      const topShortLinks = [...shortLinks].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
                      const maxShortClicks = Math.max(...topShortLinks.map(sl => sl.clicks || 0), 1);
                      return topShortLinks.map((sl, idx) => {
                        const widthPct = ((sl.clicks || 0) / maxShortClicks) * 100;
                        return (
                          <div key={sl.id} className="space-y-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-[10px] font-bold text-pink-400 font-mono w-4 shrink-0">#{idx + 1}</span>
                                <span className="font-semibold text-white font-mono truncate">/l/{sl.slug}</span>
                              </div>
                              <span className="font-bold text-white shrink-0 font-mono">{sl.clicks} clicks</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {shortLinks.length === 0 && <p className="text-xs text-white/30 text-center py-4">No shortcuts found</p>}
                  </div>
                </div>
              </div>
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
