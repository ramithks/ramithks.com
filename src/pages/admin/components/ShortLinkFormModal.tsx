import React from "react";
import type { ShortLink } from "../../../lib/db";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface ShortLinkFormModalProps {
  shortLinkForm: Partial<ShortLink>;
  onChange: (form: Partial<ShortLink>) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ShortLinkFormModal: React.FC<ShortLinkFormModalProps> = ({
  shortLinkForm,
  onChange,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <h3 className="text-lg font-bold mb-4 text-white">
          {shortLinkForm.id ? "Edit Short Link" : "Create Short Link"}
        </h3>
        
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs text-[#86868B] mb-1 font-semibold">Short URL Path (Slug)</label>
            <div className="flex items-center">
              <span className="bg-white/[0.04] border border-r-0 border-white/10 text-white/40 text-xs px-3 py-2.5 rounded-l-xl font-mono">
                ramitks.com/l/
              </span>
              <input 
                type="text" 
                value={shortLinkForm.slug || ""} 
                onChange={(e) => onChange({ ...shortLinkForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                placeholder="youtube"
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 font-mono text-white"
                required
                disabled={!!shortLinkForm.id}
              />
            </div>
            <span className="text-[9px] text-[#86868B] mt-1 block">Only lowercase alphanumeric letters, hyphens, and underscores</span>
          </div>

          <div>
            <label className="block text-xs text-[#86868B] mb-1 font-semibold">Target Redirect URL</label>
            <input 
              type="url" 
              value={shortLinkForm.url || ""} 
              onChange={(e) => onChange({ ...shortLinkForm, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <div>
              <span className="block text-xs font-semibold text-[#F5F5F7]">Open in Native App (App Opener)</span>
              <span className="text-[10px] text-[#86868B]">Enable deep linking on mobile devices</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...shortLinkForm, openInApp: !shortLinkForm.openInApp })}
              className="text-white focus:outline-none"
            >
              {shortLinkForm.openInApp ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
            </button>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors shadow-md"
            >
              Save Short Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
