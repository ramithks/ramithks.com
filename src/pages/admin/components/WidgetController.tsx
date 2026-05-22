import React from "react";
import type { HubStatus, SocialLink, ShortLink } from "../../../lib/db";
import { Music, Check, ToggleLeft, ToggleRight, User, Link2, Plus, Copy, Edit2, Trash2, Quote } from "lucide-react";

interface WidgetControllerProps {
  widgetForm: HubStatus;
  onChange: (form: HubStatus) => void;
  links: SocialLink[];
  onChangeLinks: (links: SocialLink[]) => void;
  shortLinks: ShortLink[];
  onSave: (e: React.FormEvent) => void;
  widgetSavedSuccess: boolean;
  onAddShortLink: () => void;
  onEditShortLink: (sl: ShortLink) => void;
  onDeleteShortLink: (id: string) => void;
}

export const WidgetController: React.FC<WidgetControllerProps> = ({
  widgetForm,
  onChange,
  links,
  onChangeLinks,
  shortLinks,
  onSave,
  widgetSavedSuccess,
  onAddShortLink,
  onEditShortLink,
  onDeleteShortLink,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleLinkUrlChange = (id: string, newUrl: string) => {
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, url: newUrl } : link
    );
    onChangeLinks(updatedLinks);
  };

  const handleLinkToggleOpenInApp = (id: string) => {
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, openInApp: !link.openInApp } : link
    );
    onChangeLinks(updatedLinks);
  };

  const handleLinkShortSlugChange = (id: string, slug?: string) => {
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, shortLinkSlug: slug } : link
    );
    onChangeLinks(updatedLinks);
  };

  const handleCopyLink = (slug: string, id: string) => {
    const fullLink = `${window.location.origin}/l/${slug}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Helper to get platform colors/icons for links editor
  const getPlatformGlow = (icon: string) => {
    switch (icon) {
      case 'youtube': return 'focus-within:border-[#FF453A]/40';
      case 'instagram': return 'focus-within:border-[#FF2D55]/40';
      case 'x': return 'focus-within:border-white/20';
      case 'linkedin': return 'focus-within:border-[#0A84FF]/40';
      default: return 'focus-within:border-white/20';
    }
  };

  const customRedirects = shortLinks.filter(sl => !sl.id.startsWith("sl-sync-"));

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-extrabold tracking-tight">Profile & Socials</h2>
        <p className="text-xs text-[#86868B]">Configure your identity details and social links displayed on your profile hub</p>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        
        {/* 1. Profile Profile Identity Settings */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Profile Identity Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs text-[#86868B] mb-1 font-semibold">Display Name</label>
                <input 
                  type="text" 
                  value={widgetForm.profileName || ""} 
                  onChange={(e) => onChange({ ...widgetForm, profileName: e.target.value })}
                  placeholder="e.g. Ramith K S"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#86868B] mb-1 font-semibold">Profile Subtitle / Tagline</label>
                <input 
                  type="text" 
                  value={widgetForm.profileSubtitle || ""} 
                  onChange={(e) => onChange({ ...widgetForm, profileSubtitle: e.target.value })}
                  placeholder="e.g. Vlogger & Creator"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white"
                />
              </div>
            </div>

            {/* Circular Preview of Avatar */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl bg-black/20 border border-white/5">
              <span className="block text-[10px] text-[#86868B] mb-2 font-bold uppercase tracking-wider">Avatar Preview</span>
              <img 
                src={widgetForm.profilePhoto || "/dp.png"} 
                alt="Avatar Preview" 
                className="w-20 h-20 rounded-full border border-white/10 object-cover bg-black p-0.5"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop";
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#86868B] mb-1 font-semibold">Profile Photo URL</label>
            <input 
              type="text" 
              value={widgetForm.profilePhoto || ""} 
              onChange={(e) => onChange({ ...widgetForm, profilePhoto: e.target.value })}
              placeholder="e.g. /dp.png or https://images.unsplash.com/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-[#86868B] mb-1 font-semibold">Bio / Description Statement</label>
            <textarea 
              value={widgetForm.profileBio || ""} 
              onChange={(e) => onChange({ ...widgetForm, profileBio: e.target.value })}
              placeholder="Tell your story..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white h-20 resize-none"
            />
          </div>
        </div>

        {/* 2. Status Indicator Config */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30D158] animate-pulse" />
            Live Activity Status
          </h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-[#86868B] mb-1 font-semibold">Emoji</label>
              <input 
                type="text" 
                value={widgetForm.statusEmoji} 
                onChange={(e) => onChange({ ...widgetForm, statusEmoji: e.target.value })}
                placeholder="🏍️"
                maxLength={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-center text-white"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-[#86868B] mb-1 font-semibold">Status Text Message</label>
              <input 
                type="text" 
                value={widgetForm.statusText} 
                onChange={(e) => onChange({ ...widgetForm, statusText: e.target.value })}
                placeholder="Editing the Ladakh highway vlog 🎬"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white"
              />
            </div>
          </div>
        </div>

        {/* Quote Widget Config */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Quote className="w-4 h-4 text-[#BF5AF2]" />
            Quote Widget Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#86868B] mb-1 font-semibold">Quote Text</label>
              <textarea 
                value={widgetForm.quoteText || ""} 
                onChange={(e) => onChange({ ...widgetForm, quoteText: e.target.value })}
                placeholder="e.g. Stay hungry, stay foolish."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white h-16 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Mock Music Player Widget Config */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-[#FA2356]" />
              Mock Music Player Widget
            </h3>
            <button
              type="button"
              onClick={() => onChange({ ...widgetForm, spotifyActive: !widgetForm.spotifyActive })}
              className="text-white focus:outline-none"
            >
              {widgetForm.spotifyActive ? (
                <span className="text-xs text-[#FA2356] font-bold flex items-center gap-1.5">
                  <ToggleRight className="w-8 h-8 text-[#FA2356]" />
                  <span>WIDGET VISIBLE</span>
                </span>
              ) : (
                <span className="text-xs text-white/30 font-bold flex items-center gap-1.5">
                  <ToggleLeft className="w-8 h-8 text-white/30" />
                  <span>WIDGET HIDDEN</span>
                </span>
              )}
            </button>
          </div>

          {widgetForm.spotifyActive && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#86868B] mb-1 font-semibold">Track Title</label>
                <input 
                  type="text" 
                  value={widgetForm.spotifyTrack} 
                  onChange={(e) => onChange({ ...widgetForm, spotifyTrack: e.target.value })}
                  placeholder="e.g. Dangerous"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#86868B] mb-1 font-semibold">Artist Name</label>
                <input 
                  type="text" 
                  value={widgetForm.spotifyArtist} 
                  onChange={(e) => onChange({ ...widgetForm, spotifyArtist: e.target.value })}
                  placeholder="e.g. Michael Jackson"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Social Links Manager Config */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400" />
            Social Profile Links
          </h3>
          <p className="text-[10px] text-[#86868B]">Edit destination URLs, App Opener toggles, and associated short link redirects (slugs)</p>
          
          <div className="space-y-3.5">
            {links.map((link) => (
              <div 
                key={link.id} 
                className={`p-4 rounded-xl bg-black/40 border border-white/5 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-4 items-center ${getPlatformGlow(link.icon)}`}
              >
                {/* Platform Label */}
                <div className="col-span-1 lg:col-span-2">
                  <span className="block font-bold text-xs text-white capitalize leading-tight">{link.label}</span>
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider">{link.icon}</span>
                </div>

                {/* Destination URL Input */}
                <div className="col-span-1 lg:col-span-5">
                  <input 
                    type="url" 
                    value={link.url}
                    onChange={(e) => handleLinkUrlChange(link.id, e.target.value)}
                    placeholder={`https://www.${link.label.toLowerCase()}.com/...`}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/30 font-mono text-blue-400"
                    required
                  />
                </div>

                {/* App Opener Toggle */}
                <div className="col-span-1 lg:col-span-2 flex items-center justify-between lg:justify-center bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
                  <span className="text-[9px] text-[#86868B] font-semibold lg:hidden">App Opener:</span>
                  <button
                    type="button"
                    onClick={() => handleLinkToggleOpenInApp(link.id)}
                    className="text-white focus:outline-none flex items-center gap-1.5"
                    title="Direct mobile redirection instead of web-views"
                  >
                    <span className="text-[9px] text-[#86868B] font-semibold hidden lg:inline">App Opener:</span>
                    {link.openInApp ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-white/20" />
                    )}
                  </button>
                </div>

                {/* Slug Input */}
                <div className="col-span-1 lg:col-span-3 flex items-center gap-2">
                  <span className="text-xs text-[#86868B] font-mono shrink-0">/l/</span>
                  <input 
                    type="text"
                    value={link.shortLinkSlug || ""}
                    onChange={(e) => {
                      const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
                      handleLinkShortSlugChange(link.id, val || undefined);
                    }}
                    placeholder="Enter slug to enable"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Custom Redirect Links */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />
                Custom Redirect Links
              </h3>
              <p className="text-[10px] text-[#86868B]">Create custom short URL paths that redirect visitors to any website</p>
            </div>
            <button
              type="button"
              onClick={onAddShortLink}
              className="py-1.5 px-3 rounded-lg bg-white text-black font-bold text-[10px] hover:bg-gray-200 transition-colors flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Link</span>
            </button>
          </div>

          <div className="space-y-2">
            {customRedirects.map((sl) => (
              <div key={sl.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-white">/l/{sl.slug}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(sl.slug, sl.id)}
                      className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                      title="Copy short link"
                    >
                      {copiedId === sl.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    {sl.openInApp && (
                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">App Opener</span>
                    )}
                  </div>
                  <a href={sl.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline block truncate mt-1">
                    {sl.url}
                  </a>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEditShortLink(sl)}
                      className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-white/60 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteShortLink(sl.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {customRedirects.length === 0 && (
              <div className="text-center py-6 text-white/30 text-xs border border-dashed border-white/10 rounded-xl">
                No custom redirect links created yet. Click "Add Custom Link" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Save button actions */}
        <div className="flex items-center gap-4 justify-end pt-2">
          {widgetSavedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved Successfully!
            </span>
          )}
          <button
            type="submit"
            className="py-3 px-8 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors shadow-lg"
          >
            Save Profile State
          </button>
        </div>

      </form>
    </div>
  );
};
