import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Post } from "../../../lib/db";
import {
  Play,
  Heart,
  MessageSquare,
  Repeat,
  Clock,
  CheckCircle2,
  ExternalLink,
  ThumbsUp,
  Layers,
  User,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface PostFormModalProps {
  postForm: Partial<Post> & { _id?: string };
  onChange: (form: Partial<Post> & { _id?: string }) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

// Custom SVG Brand Icons
const InstagramIcon = () => (
  <svg
    className="w-3 h-3 text-[#FF2D55] fill-none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = () => (
  <svg
    className="w-3 h-3 text-[#FF453A]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

// Helper utility to make JSONP requests to bypass CORS on localhost
interface JsonpWindow extends Window {
  [key: string]: ((data: unknown) => void) | unknown;
}

function fetchJsonp<T = unknown>(
  url: string,
  callbackParam: string = "callback",
  timeoutMs: number = 8000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_cb_${Math.round(Math.random() * 1000000)}_${Date.now()}`;
    let script: HTMLScriptElement | null = document.createElement("script");

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`JSONP request to ${url} timed out`));
    }, timeoutMs);

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (script) {
        script.onerror = null;
        script.onload = null;
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        script = null;
      }
      delete (window as unknown as JsonpWindow)[callbackName];
    };

    (window as unknown as JsonpWindow)[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`JSONP script load error for ${url}`));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}${callbackParam}=${callbackName}`;
    script.async = true;

    document.body.appendChild(script);
  });
}

export const PostFormModal: React.FC<PostFormModalProps> = ({
  postForm,
  onChange,
  onSave,
  onClose,
}) => {
  const status = useQuery(api.hubStatus.get);
  const [urlInput, setUrlInput] = React.useState<string>(postForm.url || "");
  const [rawInstagramMetadata, setRawInstagramMetadata] = React.useState<string>("");
  const [showInstagramRawImport, setShowInstagramRawImport] = React.useState<boolean>(false);
  const [showManualFields, setShowManualFields] = React.useState<boolean>(
    !!postForm._id || !!postForm.id,
  );
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [fetchError, setFetchError] = React.useState<string>("");

  const parseRawInstagramMetadata = (rawText: string) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const fields = new Map<string, string>();
    let currentKey = "";

    for (const line of lines) {
      const keyMatch = line.match(/^([A-Za-z0-9:_-]+)\s*$/);
      if (keyMatch) {
        currentKey = keyMatch[1].toLowerCase();
        if (!fields.has(currentKey)) {
          fields.set(currentKey, "");
        }
        continue;
      }

      if (currentKey) {
        const existingValue = fields.get(currentKey) || "";
        fields.set(currentKey, existingValue ? `${existingValue}\n${line}` : line);
      }
    }

    const pickFirst = (...keys: string[]) => {
      for (const key of keys) {
        const value = fields.get(key.toLowerCase())?.trim();
        if (value) return value;
      }
      return "";
    };

    const title = pickFirst("og:title", "twitter:title");
    const description = pickFirst("og:description", "twitter:description", "description");
    let thumbnail = pickFirst("og:image", "twitter:image", "twitter:image:src");
    const author = pickFirst("instapp:owner_username", "twitter:site").replace(/^@/, "") || pickFirst("author");
    const url = pickFirst("og:url");

    const imageUrlsFromText = rawText.match(/https?:\/\/[^\s)"']+/gi) || [];
    const imageUrlFromText =
      imageUrlsFromText.find((candidate) => {
        const lowerCandidate = candidate.toLowerCase();
        return (
          lowerCandidate.includes("fbcdn.net") ||
          /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(lowerCandidate)
        );
      }) || "";

    if (thumbnail && !/^https?:\/\//i.test(thumbnail)) {
      const maybeUrl = thumbnail.match(/https?:\/\/\S+/i)?.[0];
      if (maybeUrl) {
        thumbnail = maybeUrl;
      }
    }

    if (!thumbnail || !/^https?:\/\//i.test(thumbnail)) {
      thumbnail = imageUrlFromText || thumbnail;
    }

    if (thumbnail && /^https?:\/\//i.test(thumbnail)) {
      thumbnail = thumbnail.replace(/["'.,;]+$/g, "");
    }

    const likesMatch = description.match(/(\d[\d,]*)\s*likes?/i);
    const commentsMatch = description.match(/(\d[\d,]*)\s*comments?/i);

    const normalizeCount = (value: string | undefined) => {
      if (!value) return undefined;
      const numeric = Number(value.replace(/,/g, ""));
      return Number.isNaN(numeric) ? undefined : numeric;
    };

    const nextForm: Partial<Post> = {
      ...postForm,
      type: "instagram",
      url: url || postForm.url || urlInput,
      title: title || postForm.title || "Instagram Post",
      description: description || postForm.description || "",
      thumbnail: thumbnail || postForm.thumbnail || "",
      author: author || postForm.author || "instagram_user",
      tag: postForm.tag || "Instagram Reel",
      likes: normalizeCount(likesMatch?.[1]) ?? postForm.likes,
      comments: normalizeCount(commentsMatch?.[1]) ?? postForm.comments,
      openInApp: true,
    };

    if (nextForm.url) {
      onChange(nextForm);
      setUrlInput(nextForm.url);
      setShowManualFields(true);
      setFetchError("");
    }
  };

  const handleFetchMetadata = async () => {
    console.log("=====================================");
    console.log("🔍 FETCH PREVIEW BUTTON CLICKED");
    console.log("Raw URL input:", urlInput);

    let normalized = urlInput.trim();
    if (!normalized) {
      console.warn("Fetch Preview aborted: URL input is empty");
      setFetchError("Please enter a URL first.");
      return;
    }
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }
    console.log("Normalized URL to fetch:", normalized);

    setIsFetching(true);
    setFetchError("");

    try {
      const url = new URL(normalized);
      let detectedType:
        | "youtube"
        | "instagram"
        | "twitter"
        | "linkedin"
        | "blog" = "blog";

      const hostname = url.hostname.toLowerCase();
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        detectedType = "youtube";
      } else if (hostname.includes("instagram.com")) {
        detectedType = "instagram";
      } else if (
        hostname.includes("twitter.com") ||
        hostname.includes("x.com")
      ) {
        detectedType = "twitter";
      } else if (hostname.includes("linkedin.com")) {
        detectedType = "linkedin";
      } else {
        detectedType = "blog";
      }

      let title = "";
      let tag = "";
      let description = "";
      let thumbnail = "";
      const duration = undefined;
      const likes = undefined;
      const comments = undefined;
      const views = undefined;
      const reposts = undefined;
      let author = "";

      if (detectedType === "youtube") {
        tag = "YouTube Vlog";
        let videoId = "";
        if (hostname.includes("youtu.be")) {
          videoId = url.pathname.slice(1);
        } else {
          videoId = url.searchParams.get("v") || "";
          if (!videoId && url.pathname.includes("/shorts/")) {
            videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
          }
        }
        if (videoId) {
          thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      } else if (detectedType === "instagram") {
        tag = "Instagram Reel";
        const pathSegments = url.pathname.split("/").filter(Boolean);
        if (pathSegments.length > 0) {
          if (
            pathSegments[0] === "reel" ||
            pathSegments[0] === "p" ||
            pathSegments[0] === "tv"
          ) {
            author = "instagram_user";
          } else {
            author = pathSegments[0];
          }
        } else {
          author = "instagram_user";
        }
      } else if (detectedType === "twitter") {
        tag = "X Update";
        const pathParts = url.pathname.split("/").filter(Boolean);
        author = pathParts[0] || "twitter_user";
      } else if (detectedType === "linkedin") {
        tag = "Creator Economy";
        author = status?.profileName || "Ramith K S";
      } else {
        tag = "Gear Guide";
      }

      let scrapeSucceeded = false;
      let usedFallback = false;
      let scrapeErrorReason = "";

      try {
        if (detectedType === "youtube") {
          const embedUrl = `https://noembed.com/embed?url=${encodeURIComponent(normalized)}`;
          let embedData: Record<string, unknown> | null = null;
          const youtubeErrors: string[] = [];
          try {
            // First try JSONP to bypass localhost CORS
            embedData = await fetchJsonp(embedUrl, "callback", 5000);
          } catch (jsonpErr: unknown) {
            youtubeErrors.push(`JSONP: ${jsonpErr instanceof Error ? jsonpErr.message : String(jsonpErr)}`);
            console.warn(
              "YouTube JSONP failed, trying direct fetch:",
              jsonpErr,
            );
            try {
              const res = await fetch(embedUrl);
              if (res.ok) {
                embedData = await res.json();
              } else {
                youtubeErrors.push(`Direct Fetch: HTTP ${res.status}`);
              }
            } catch (fetchErr: unknown) {
              youtubeErrors.push(`Direct Fetch error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
              console.error("YouTube direct fetch failed:", fetchErr);
            }
          }

          if (embedData && typeof embedData.title === "string") {
            title = embedData.title;
            if (typeof embedData.author_name === "string") {
              author = embedData.author_name;
            }
            if (typeof embedData.thumbnail_url === "string") {
              thumbnail = embedData.thumbnail_url;
            }
            scrapeSucceeded = true;
          } else {
            if (embedData && typeof embedData.error === "string") {
              scrapeErrorReason = `YouTube oEmbed returned error: ${embedData.error}`;
            } else if (embedData) {
              scrapeErrorReason = `YouTube oEmbed response missing title. Keys present: ${Object.keys(embedData).join(", ")}`;
            } else {
              scrapeErrorReason = `YouTube oEmbed failed. Errors: ${youtubeErrors.join("; ")}`;
            }
          }
          console.log("=== YOUTUBE FETCH RESULT ===");
          console.log("URL:", normalized);
          console.log("Embed Data:", embedData);
          console.log("Resolved Title:", title);
          console.log("Resolved Author:", author);
          console.log("Resolved Thumbnail:", thumbnail);
          console.log("scrapeSucceeded:", scrapeSucceeded);
          console.log("============================");
        } else if (detectedType === "twitter") {
          // Twitter official CORS-friendly oEmbed
          const twitterCompatibleUrl = normalized.replace(
            "x.com",
            "twitter.com",
          );
          const embedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(twitterCompatibleUrl)}`;
          let embedData: Record<string, unknown> | null = null;
          const twitterErrors: string[] = [];

          try {
            // First try JSONP to bypass localhost CORS
            embedData = await fetchJsonp(embedUrl, "callback", 5000);
          } catch (jsonpErr: unknown) {
            twitterErrors.push(`JSONP: ${jsonpErr instanceof Error ? jsonpErr.message : String(jsonpErr)}`);
            console.warn(
              "Twitter JSONP failed, trying allorigins proxy fallback:",
              jsonpErr,
            );
            try {
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(embedUrl)}`;
              const res = await fetch(proxyUrl);
              if (res.ok) {
                const data = await res.json();
                if (data && data.contents) {
                  embedData = JSON.parse(data.contents) as Record<string, unknown>;
                } else {
                  twitterErrors.push(`AllOrigins proxy: empty contents`);
                }
              } else {
                twitterErrors.push(`AllOrigins proxy: HTTP ${res.status}`);
              }
            } catch (fetchErr: unknown) {
              twitterErrors.push(`AllOrigins proxy fetch error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
              console.error("Twitter proxied fetch failed:", fetchErr);
            }
          }

          if (embedData) {
            if (typeof embedData.author_name === "string") {
              author = embedData.author_name;
            }
            if (typeof embedData.author_url === "string") {
              const parts = embedData.author_url.split("/");
              const handle = parts[parts.length - 1];
              if (handle) {
                author = handle;
              }
            }
            if (typeof embedData.html === "string") {
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = embedData.html;
              const pText = tempDiv.querySelector("p")?.textContent;
              if (pText) {
                description = pText.trim();
                title = description.slice(0, 60); // Auto-fill title to satisfy constraints
                scrapeSucceeded = true;
              } else {
                scrapeErrorReason = `Twitter oEmbed HTML snippet did not contain a paragraph (<p>) tag. HTML: ${embedData.html.slice(0, 100)}...`;
              }
            } else {
              scrapeErrorReason = `Twitter oEmbed JSON returned but is missing HTML property. Keys present: ${Object.keys(embedData).join(", ")}`;
            }
          } else {
            scrapeErrorReason = `Twitter oEmbed failed. Errors: ${twitterErrors.join("; ")}`;
          }
          console.log("=== TWITTER FETCH RESULT ===");
          console.log("URL:", normalized);
          console.log("Embed Data:", embedData);
          console.log("Resolved Title:", title);
          console.log("Resolved Description:", description);
          console.log("Resolved Author:", author);
          console.log("scrapeSucceeded:", scrapeSucceeded);
          console.log("============================");
        } else {
          // Robust multi-proxy sequence to fetch HTML content
          let bestHtml = "";
          let bestParsedTitle = "";
          let bestParsedDesc = "";
          let bestProxyError = "";

          const cacheBuster = `_cb=${Date.now()}`;
          const busterUrl =
            normalized + (normalized.includes("?") ? "&" : "?") + cacheBuster;

          const instagramProxies = [
            {
              name: "AllOriginsRaw",
              url: `https://api.allorigins.win/raw?url=${encodeURIComponent(busterUrl)}`,
              parse: (res: Response) => res.text(),
            },
            {
              name: "CodeTabs",
              url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(busterUrl)}`,
              parse: (res: Response) => res.text(),
            },
            {
              name: "AllOrigins",
              url: `https://api.allorigins.win/get?url=${encodeURIComponent(busterUrl)}&_nocache=${Date.now()}`,
              parse: async (res: Response) => {
                const json = await res.json();
                return json.contents || "";
              },
            },
          ];

          const genericProxies = [
            {
              name: "CORSProxy.io",
              url: `https://corsproxy.io/?${encodeURIComponent(busterUrl)}`,
              parse: (res: Response) => res.text(),
            },
            {
              name: "AllOrigins",
              url: `https://api.allorigins.win/get?url=${encodeURIComponent(busterUrl)}&_nocache=${Date.now()}`,
              parse: async (res: Response) => {
                const json = await res.json();
                return json.contents || "";
              },
            },
            {
              name: "CodeTabs",
              url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(busterUrl)}`,
              parse: (res: Response) => res.text(),
            },
          ];

          const proxies = detectedType === "instagram" ? instagramProxies : genericProxies;

          const proxyErrors: string[] = [];
          for (const proxy of proxies) {
            try {
              console.log(
                `[Metadata Fetch] Attempting to fetch HTML via proxy: ${proxy.name} (URL: ${proxy.url})`,
              );
              const res = await fetch(proxy.url);
              console.log(
                `[Metadata Fetch] Proxy ${proxy.name} response status:`,
                res.status,
              );

              if (res.ok) {
                const parsedContent = await proxy.parse(res);
                console.log(
                  `[Metadata Fetch] Success fetching via ${proxy.name}. Length: ${parsedContent?.length || 0}`,
                );

                if (
                  parsedContent &&
                  !parsedContent.trim().startsWith("{") &&
                  !parsedContent.trim().startsWith('{"')
                ) {
                  const domParser = new DOMParser();
                  const doc = domParser.parseFromString(
                    parsedContent,
                    "text/html",
                  );

                  // Extract Title using various possible SEO meta tags
                  const ogTitle =
                    doc
                      .querySelector('meta[property="og:title"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="og:title"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="twitter:title"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[property="twitter:title"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="title"]')
                      ?.getAttribute("content") ||
                    doc.querySelector("title")?.textContent ||
                    doc.title;

                  // Extract Description
                  const ogDesc =
                    doc
                      .querySelector('meta[property="og:description"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="og:description"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="twitter:description"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[property="twitter:description"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="description"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[property="description"]')
                      ?.getAttribute("content");

                  // Extract Image / Thumbnail
                  const ogImage =
                    doc
                      .querySelector('meta[property="og:image"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="og:image"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="twitter:image"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[property="twitter:image"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="twitter:image:src"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('link[rel="image_src"]')
                      ?.getAttribute("href");

                  // Extract Author
                  const ogAuthor =
                    doc
                      .querySelector('meta[name="author"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[property="og:article:author"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[property="og:site_name"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="twitter:creator"]')
                      ?.getAttribute("content") ||
                    doc
                      .querySelector('meta[name="twitter:site"]')
                      ?.getAttribute("content");

                  // Extract from JSON-LD
                  let jsonLdTitle = "";
                  let jsonLdDesc = "";
                  let jsonLdImage = "";
                  let jsonLdAuthor = "";

                  try {
                    const ldScripts = doc.querySelectorAll(
                      'script[type="application/ld+json"]',
                    );
                    console.log(
                      `[Metadata Fetch] Found ${ldScripts.length} application/ld+json script tags.`,
                    );
                    ldScripts.forEach((script, idx) => {
                      try {
                        const content = script.textContent;
                        if (content) {
                          const data = JSON.parse(content);
                          console.log(
                            `[Metadata Fetch] JSON-LD [${idx}] content:`,
                            data,
                          );

                          const checkObj = (obj: Record<string, unknown>) => {
                            if (!obj || typeof obj !== "object") return;

                            // Title/Name
                            if (typeof obj.name === "string" && !jsonLdTitle) jsonLdTitle = obj.name;
                            if (typeof obj.headline === "string" && !jsonLdTitle) jsonLdTitle = obj.headline;
                            if (typeof obj.caption === "string" && !jsonLdTitle) jsonLdTitle = obj.caption;

                            // Description
                            if (typeof obj.description === "string" && !jsonLdDesc) jsonLdDesc = obj.description;
                            if (typeof obj.articleBody === "string" && !jsonLdDesc) jsonLdDesc = obj.articleBody;

                            // Image
                            if (obj.image) {
                              if (typeof obj.image === "string") {
                                if (!jsonLdImage) jsonLdImage = obj.image;
                              } else if (Array.isArray(obj.image) && typeof obj.image[0] === "string") {
                                if (!jsonLdImage) jsonLdImage = obj.image[0];
                              } else if (typeof obj.image === "object" && obj.image !== null && "url" in obj.image && typeof (obj.image as { url?: unknown }).url === "string") {
                                if (!jsonLdImage) jsonLdImage = (obj.image as { url: string }).url;
                              }
                            }

                            // Author
                            if (obj.author) {
                              if (typeof obj.author === "string" && !jsonLdAuthor) {
                                jsonLdAuthor = obj.author;
                              } else if (typeof obj.author === "object" && obj.author !== null && "name" in obj.author && typeof (obj.author as { name?: unknown }).name === "string" && !jsonLdAuthor) {
                                jsonLdAuthor = (obj.author as { name: string }).name;
                              } else if (Array.isArray(obj.author) && typeof obj.author[0] === "object" && obj.author[0] !== null && "name" in obj.author[0] && typeof (obj.author[0] as { name?: unknown }).name === "string" && !jsonLdAuthor) {
                                jsonLdAuthor = (obj.author[0] as { name: string }).name;
                              }
                            }
                          };

                          if (Array.isArray(data)) {
                            data.forEach(checkObj);
                          } else {
                            checkObj(data);
                          }
                        }
                      } catch (jsonLdErr) {
                        console.warn(
                          `[Metadata Fetch] Failed to parse JSON-LD script [${idx}]:`,
                          jsonLdErr,
                        );
                      }
                    });
                  } catch (ldSelectionErr) {
                    console.warn(
                      "[Metadata Fetch] Failed selecting/iterating JSON-LD scripts:",
                      ldSelectionErr,
                    );
                  }

                  // Resolve final parsed values
                  const resolvedTitle = jsonLdTitle || ogTitle || "";
                  const resolvedDesc = jsonLdDesc || ogDesc || "";
                  const resolvedAuthor = jsonLdAuthor || ogAuthor || "";
                  let resolvedImage = jsonLdImage || ogImage || "";

                  if (resolvedImage && !/^https?:\/\//i.test(resolvedImage)) {
                    try {
                      resolvedImage = new URL(
                        resolvedImage,
                        url.origin,
                      ).toString();
                    } catch (relativeUrlError) {
                      void relativeUrlError;
                    }
                  }

                  // Check if title or content represents a login wall, proxy error, or placeholder
                  const lowerTitle = (resolvedTitle || "").toLowerCase().trim();
                  const lowerDesc = (resolvedDesc || "").toLowerCase().trim();

                  let matchReason = "";
                  if (lowerTitle === "instagram") {
                    matchReason =
                      "Title is exactly 'Instagram' (Instagram Login Wall)";
                  } else if (lowerTitle === "facebook") {
                    matchReason =
                      "Title is exactly 'Facebook' (Facebook Login Wall)";
                  } else if (
                    /\b(login|log-in|log_in|log in)\b/i.test(resolvedTitle)
                  ) {
                    matchReason = `Title contains 'log in' / 'login' word boundary ("${resolvedTitle}")`;
                  } else if (
                    /\b(signin|sign-in|sign_in|sign in)\b/i.test(resolvedTitle)
                  ) {
                    matchReason = `Title contains 'sign in' / 'signin' word boundary ("${resolvedTitle}")`;
                  } else if (
                    /\b(signup|sign-up|sign_up|sign up)\b/i.test(resolvedTitle)
                  ) {
                    matchReason = `Title contains 'sign up' / 'signup' word boundary ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("error")) {
                    matchReason = `Title contains 'error' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("timeout")) {
                    matchReason = `Title contains 'timeout' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("cloudflare")) {
                    matchReason = `Title contains 'cloudflare' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("allorigins")) {
                    matchReason = `Title contains 'allorigins' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("codetabs")) {
                    matchReason = `Title contains 'codetabs' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("corsproxy")) {
                    matchReason = `Title contains 'corsproxy' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("just a moment")) {
                    matchReason = `Title contains 'just a moment' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("ddos")) {
                    matchReason = `Title contains 'ddos' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("captcha")) {
                    matchReason = `Title contains 'captcha' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("security check")) {
                    matchReason = `Title contains 'security check' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("bad gateway")) {
                    matchReason = `Title contains 'bad gateway' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("internal server")) {
                    matchReason = `Title contains 'internal server' ("${resolvedTitle}")`;
                  } else if (lowerTitle.includes("service unavailable")) {
                    matchReason = `Title contains 'service unavailable' ("${resolvedTitle}")`;
                  } else if (
                    lowerTitle.length <= 3 &&
                    !lowerTitle.match(/^[a-z0-9]+$/i) &&
                    lowerTitle.length > 0
                  ) {
                    matchReason = `Title is too short and non-alphanumeric ("${resolvedTitle}")`;
                  } else if (lowerTitle === "" && lowerDesc === "") {
                    matchReason =
                      "Both parsed Title and Description are empty/missing";
                  }

                  const isProxyErrorOrLoginWall = matchReason !== "";

                  // Log all fetched and parsed fields for debug inspection
                  console.log(
                    `=== METADATA SCRAPING RESULT (${proxy.name}) ===`,
                  );
                  console.log("URL:", normalized);
                  console.log("Detected Type:", detectedType);
                  console.log("Raw Meta Tags:");
                  console.log("- og:title:", ogTitle);
                  console.log("- og:description:", ogDesc);
                  console.log("- og:image:", ogImage);
                  console.log("- og:author:", ogAuthor);
                  console.log("Raw JSON-LD parsed fields:");
                  console.log("- JSON-LD title:", jsonLdTitle);
                  console.log("- JSON-LD description:", jsonLdDesc);
                  console.log("- JSON-LD image:", jsonLdImage);
                  console.log("- JSON-LD author:", jsonLdAuthor);
                  console.log("Final Extracted Fields (Before Verification):");
                  console.log("- Title:", resolvedTitle);
                  console.log("- Description:", resolvedDesc);
                  console.log("- Image:", resolvedImage);
                  console.log("- Author:", resolvedAuthor);
                  console.log(
                    "- isProxyErrorOrLoginWall:",
                    isProxyErrorOrLoginWall,
                  );
                  if (isProxyErrorOrLoginWall) {
                    console.log("- matchReason:", matchReason);
                  }
                  console.log("=================================");

                  if (!isProxyErrorOrLoginWall && (resolvedTitle || resolvedDesc || resolvedImage)) {
                    title = resolvedTitle;
                    description = resolvedDesc;
                    thumbnail = resolvedImage;
                    author = resolvedAuthor;
                    scrapeSucceeded = true;
                    break;
                  } else {
                    if (!bestProxyError) {
                      bestProxyError =
                        matchReason || "Failed classification check";
                      bestHtml = parsedContent;
                      bestParsedTitle = resolvedTitle;
                      bestParsedDesc = resolvedDesc;
                    }
                    proxyErrors.push(
                      `${proxy.name}: rejected via classification [${matchReason}]`,
                    );
                    console.warn(
                      `[Metadata Fetch] Proxy ${proxy.name} rejected via classification [${matchReason}], trying next proxy.`,
                    );
                  }
                } else {
                  const info = parsedContent
                    ? parsedContent.trim().slice(0, 100) + "..."
                    : "empty HTML";
                  proxyErrors.push(
                    `${proxy.name}: returned invalid/JSON content or empty (${info})`,
                  );
                  console.warn(
                    `[Metadata Fetch] Proxy ${proxy.name} returned empty/invalid/JSON content, trying next proxy.`,
                  );
                }
              } else {
                let errText = "";
                try {
                  errText = (await res.text()).slice(0, 100) + "...";
                } catch (responseTextError) {
                  void responseTextError;
                }
                proxyErrors.push(
                  `${proxy.name}: HTTP status ${res.status} (${errText})`,
                );
                console.warn(
                  `[Metadata Fetch] Proxy ${proxy.name} returned non-OK status: ${res.status}`,
                );
              }
            } catch (err: unknown) {
              proxyErrors.push(`${proxy.name}: network/CORS error (${err instanceof Error ? err.message : String(err)})`);
              console.error(
                `[Metadata Fetch] Proxy ${proxy.name} fetch encountered error (possibly CORS blocked or connection timeout):`,
                err,
              );
            }
          }

          if (!scrapeSucceeded) {
            if (bestHtml) {
              if (
                detectedType === "instagram" &&
                bestParsedTitle.toLowerCase().trim() === "instagram"
              ) {
                scrapeSucceeded = true;
                title = postForm.title || "Instagram Post";
                description =
                  postForm.description ||
                  "Instagram content preview unavailable. Please review the post details manually.";
                thumbnail = postForm.thumbnail || thumbnail;
                author = postForm.author || author || "instagram_user";
                bestProxyError = "Instagram login wall detected";
                scrapeErrorReason =
                  "Instagram login wall detected, using fallback preview state.";
              } else {
                scrapeErrorReason = `Classification block: ${bestProxyError} (parsed Title: "${bestParsedTitle || "(empty)"}", parsed Description: "${bestParsedDesc || "(empty)"}")`;
              }
            } else {
              scrapeErrorReason = `Failed to fetch HTML from all proxies. Errors: [${proxyErrors.join(" | ")}]`;
            }
          }
        }
      } catch (err: unknown) {
        scrapeErrorReason = `CORS/oEmbed fetching encountered an error: ${err instanceof Error ? err.message : String(err)}`;
        console.error(
          "[Metadata Fetch] CORS/oEmbed fetching encountered an error:",
          err,
        );
      }

      const isNewUrl = normalized !== postForm.url;

      if (
        !scrapeSucceeded ||
        !title ||
        (detectedType === "twitter" && !description) ||
        (detectedType !== "twitter" && !title)
      ) {
        usedFallback = true;
        let baseErrorMsg =
          scrapeErrorReason ||
          "Scraping did not succeed or returned incomplete data.";
        if (scrapeSucceeded && !title) {
          baseErrorMsg = `Title is empty after successful scrape.`;
        } else if (
          scrapeSucceeded &&
          detectedType === "twitter" &&
          !description
        ) {
          baseErrorMsg = `Description is empty for Twitter post.`;
        }

        console.error(
          `[Metadata Fetch] Scraping did not succeed or returned incomplete data. Base error: ${baseErrorMsg}`,
        );
        setFetchError(baseErrorMsg);
      }

      if (detectedType === "youtube" && !tag) tag = "YouTube Vlog";
      if (detectedType === "instagram" && !tag) tag = "Instagram Reel";
      if (detectedType === "twitter" && !tag) tag = "X Update";
      if (detectedType === "linkedin" && !tag) tag = "Creator Economy";
      if (detectedType === "blog" && !tag) tag = "Gear Guide";

      const todayStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const finalTitle =
        scrapeSucceeded && title ? title : isNewUrl ? "" : postForm.title || "";
      const finalDesc =
        scrapeSucceeded && description
          ? description
          : isNewUrl
            ? ""
            : postForm.description || "";
      const finalThumbnail =
        scrapeSucceeded && thumbnail
          ? thumbnail
          : isNewUrl
            ? ""
            : postForm.thumbnail || "";
      const finalAuthor =
        scrapeSucceeded && author
          ? author
          : isNewUrl
            ? ""
            : postForm.author || "";

      const finalLikes =
        scrapeSucceeded && likes !== undefined
          ? likes
          : isNewUrl
            ? undefined
            : postForm.likes;
      const finalComments =
        scrapeSucceeded && comments !== undefined
          ? comments
          : isNewUrl
            ? undefined
            : postForm.comments;
      const finalViews =
        scrapeSucceeded && views !== undefined
          ? views
          : isNewUrl
            ? undefined
            : postForm.views;
      const finalReposts =
        scrapeSucceeded && reposts !== undefined
          ? reposts
          : isNewUrl
            ? undefined
            : postForm.reposts;
      const finalDuration =
        scrapeSucceeded && duration !== undefined
          ? duration
          : isNewUrl
            ? undefined
            : postForm.duration;

      console.log("=== UPDATING STATE WITH METADATA ===");
      console.log({
        type: detectedType,
        url: normalized,
        title: finalTitle,
        tag: tag || postForm.tag || "",
        description: finalDesc,
        thumbnail: finalThumbnail,
        date: postForm.date || todayStr,
        openInApp: true,
        duration: finalDuration,
        likes: finalLikes,
        comments: finalComments,
        views: finalViews,
        reposts: finalReposts,
        author: finalAuthor,
      });
      console.log("usedFallback:", usedFallback);
      console.log("=====================================");

      onChange({
        ...postForm,
        type: detectedType,
        url: normalized,
        title: finalTitle,
        tag: tag || postForm.tag || "",
        description: finalDesc,
        thumbnail: finalThumbnail,
        date: postForm.date || todayStr,
        openInApp: true,
        duration: finalDuration,
        likes: finalLikes,
        comments: finalComments,
        views: finalViews,
        reposts: finalReposts,
        author: finalAuthor,
      });

      setUrlInput(normalized);
      if (usedFallback) {
        setShowManualFields(true);
      } else {
        setShowManualFields(false);
      }
    } catch (error) {
      void error;
      setFetchError("Invalid URL format. Please enter a valid URL.");
      setShowManualFields(true);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSetTodayDate = () => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    onChange({ ...postForm, date: todayStr });
  };

  const renderPreviewCard = () => {
    const type = postForm.type || "blog";
    const title = postForm.title || "Untitled Post";
    const tag = postForm.tag || "Travel";
    const description =
      postForm.description || "Enter details to view stream card preview...";
    const date = postForm.date || "Just now";
    const thumbnail = postForm.thumbnail;
    const author = postForm.author || "ramithks";

    switch (type) {
      case "youtube":
        return (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl text-left relative overflow-hidden w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              {thumbnail && (
                <div className="relative w-full sm:w-36 aspect-video shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black">
                  <img
                    src={thumbnail}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#FF453A] flex items-center justify-center text-white">
                      <Play className="w-3 h-3 fill-white ml-0.5" />
                    </div>
                  </div>
                  {postForm.duration && (
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold bg-black/80 px-1 py-0.5 rounded border border-white/10 text-white">
                      {postForm.duration}
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-1 text-[9px]">
                    <span className="font-bold text-[#FF453A] bg-[#FF453A]/10 px-2 py-0.5 rounded border border-[#FF453A]/15 flex items-center gap-1">
                      <YoutubeIcon /> YouTube Video
                    </span>
                    <span className="text-[#8E8E93] font-mono">{date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-[10px] text-[#AEAEB2] mt-1 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2C2C2E] text-[9px] text-[#8E8E93]">
                  <span className="font-mono">
                    {postForm.views
                      ? `${postForm.views.toLocaleString()} views`
                      : "Live"}
                  </span>
                  <span className="text-[#FF453A] font-semibold flex items-center gap-1">
                    Watch Video <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "instagram":
        return (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl text-left relative overflow-hidden w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              {thumbnail && (
                <div className="relative w-full sm:w-24 aspect-square shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black">
                  <img
                    src={thumbnail}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-1 text-[9px]">
                    <span className="font-bold text-[#FF2D55] bg-[#FF2D55]/10 px-2 py-0.5 rounded border border-[#FF2D55]/15 flex items-center gap-1">
                      <InstagramIcon /> Instagram
                    </span>
                    <span className="text-[#8E8E93] font-mono">{date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-[10px] text-[#AEAEB2] mt-1 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2C2C2E] text-[9px] text-[#8E8E93]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 fill-[#FF2D55]/20 stroke-[#8E8E93]" />{" "}
                      {postForm.likes || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="w-2.5 h-2.5" />{" "}
                      {postForm.comments || 0}
                    </span>
                  </div>
                  <span className="text-[#FF2D55] font-semibold flex items-center gap-1">
                    View Photo <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "twitter":
        return (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl text-left relative overflow-hidden w-full">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2 text-[9px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#2C2C2E] border border-[#3A3A3C] flex items-center justify-center overflow-hidden shrink-0">
                      {status?.profilePhoto ? (
                        <img
                          src={status.profilePhoto}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-0.5 leading-none">
                        <span className="font-bold text-white">
                          {status?.profileName || "Ramith K S"}
                        </span>
                        <CheckCircle2 className="w-2 h-2 fill-[#0A84FF] stroke-black" />
                      </div>
                      <span className="text-[#8E8E93] font-mono leading-none">
                        @{author}
                      </span>
                    </div>
                  </div>
                  <span className="text-[#8E8E93] font-mono">{date}</span>
                </div>
                <p className="text-[10px] font-semibold text-white leading-relaxed whitespace-pre-line line-clamp-4">
                  {description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2C2C2E] text-[9px] text-[#8E8E93]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5">
                    <MessageSquare className="w-2.5 h-2.5" />{" "}
                    {postForm.comments || 0}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Repeat className="w-2.5 h-2.5" /> {postForm.reposts || 0}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5" /> {postForm.likes || 0}
                  </span>
                </div>
                <span className="text-white font-semibold flex items-center gap-1">
                  View on X <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        );

      case "linkedin":
        return (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl text-left relative overflow-hidden w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              {thumbnail && (
                <div className="relative w-full sm:w-28 aspect-video shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black">
                  <img
                    src={thumbnail}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-2 text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#2C2C2E] border border-[#3A3A3C] flex items-center justify-center overflow-hidden shrink-0">
                        {status?.profilePhoto ? (
                          <img
                            src={status.profilePhoto}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-0.5 leading-none">
                          <span className="font-bold text-white">
                            {author === "ramithks"
                              ? status?.profileName || "Ramith K S"
                              : author}
                          </span>
                          <span className="text-[#8E8E93] text-[9px]">
                            • 1st
                          </span>
                        </div>
                        <span className="text-[7px] text-[#8E8E93] tracking-wide block uppercase font-medium leading-none mt-0.5">
                          {status?.profileSubtitle ||
                            "Content Creator & Traveler"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#8E8E93] font-mono">{date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-[10px] text-[#AEAEB2] mt-1 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2C2C2E] text-[9px] text-[#8E8E93]">
                  <span className="flex items-center gap-0.5">
                    <ThumbsUp className="w-2.5 h-2.5 text-[#0A84FF] fill-[#0A84FF]/20" />{" "}
                    {postForm.likes || 0} reactions
                  </span>
                  <span className="text-[#0A84FF] font-semibold flex items-center gap-1">
                    Read Post <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "blog":
      default:
        return (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl text-left relative overflow-hidden w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              {thumbnail && (
                <div className="relative w-full sm:w-28 aspect-video shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black">
                  <img
                    src={thumbnail}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-[9px]">
                    <span className="font-bold text-[#8E8E93] bg-[#2C2C2E] px-2.5 py-0.5 rounded border border-[#3A3A3C] flex items-center gap-1">
                      <Layers className="w-2 h-2" /> {tag}
                    </span>
                    <span className="text-[#8E8E93] font-mono">{date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-[10px] text-[#AEAEB2] mt-1 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2C2C2E] text-[9px] text-[#8E8E93]">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> 5 min read
                  </span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    Read Thought <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] space-y-5 selection:bg-white/20 selection:text-black">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FA2356]" />
            {postForm._id || postForm.id ? "Edit Feed Post" : "Create New Post via URL"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-[#86868B] hover:text-white border border-white/10 hover:border-white/20 bg-white/5 px-2.5 py-1 rounded-md transition-colors"
          >
            Close
          </button>
        </div>

        {/* URL Input Area */}
        <div className="space-y-2">
          <label className="block text-xs text-[#86868B] font-semibold">
            Paste Post Link URL (YouTube, Instagram, Twitter, LinkedIn, etc.)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={() => {
                if (urlInput.trim() && urlInput.trim() !== postForm.url) {
                  handleFetchMetadata();
                }
              }}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white font-mono"
            />
            <button
              type="button"
              onClick={handleFetchMetadata}
              disabled={isFetching}
              className="py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <span>Fetch Details</span>
              )}
            </button>
          </div>
          {fetchError && (
            <p className="text-red-400 text-[10px] font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fetchError}
            </p>
          )}
        </div>

        {/* Live Timeline Card Preview */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
          <span className="block text-[9px] font-bold text-[#86868B] uppercase tracking-wider">
            Live Card Preview (As rendered in Timeline Feed)
          </span>
          <div className="border border-white/[0.03] rounded-2xl p-1 bg-black/40">
            {renderPreviewCard()}
          </div>
        </div>

        {/* Main form */}
        <form onSubmit={onSave} className="space-y-4">
          {/* Publish Date Quick Controller */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                Publish Date
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postForm.date || ""}
                  onChange={(e) =>
                    onChange({ ...postForm, date: e.target.value })
                  }
                  placeholder="e.g. May 22, 2026"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={handleSetTodayDate}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1"
                  title="Set Publish Date to Now"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Now</span>
                </button>
              </div>
            </div>

            {/* App Opener Toggle */}
            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl h-[42px]">
                <span className="text-xs font-semibold text-[#F5F5F7]">
                  Open Native App
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...postForm, openInApp: !postForm.openInApp })
                  }
                  className="text-white focus:outline-none"
                >
                  {postForm.openInApp ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-white/30" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Accordion header to view/edit details manually */}
          <button
            type="button"
            onClick={() => setShowManualFields(!showManualFields)}
            className="w-full flex items-center justify-between py-2.5 px-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] rounded-xl transition-all"
          >
            <span className="text-xs font-bold text-white">
              Edit Details Manually
            </span>
            {showManualFields ? (
              <ChevronUp className="w-4 h-4 text-[#86868B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#86868B]" />
            )}
          </button>

          {/* Collapsible Manual Fields */}
          {showManualFields && (
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Type & Tag */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                    Post Type / Source Platform
                  </label>
                  <select
                    value={postForm.type || "blog"}
                    onChange={(e) =>
                      onChange({
                        ...postForm,
                        type: e.target.value as Post["type"],
                      })
                    }
                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white"
                  >
                    <option value="blog">Blog Post / Thought</option>
                    <option value="youtube">YouTube Video</option>
                    <option value="instagram">Instagram Photo</option>
                    <option value="twitter">X / Twitter Tweet</option>
                    <option value="linkedin">LinkedIn Post</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                    Tag / Category
                  </label>
                  <input
                    type="text"
                    value={postForm.tag || ""}
                    onChange={(e) =>
                      onChange({ ...postForm, tag: e.target.value })
                    }
                    placeholder="e.g. Travel, Gear"
                    className="w-full bg-[#0c0c0e]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white"
                    required
                  />
                </div>
              </div>

              {/* Title - Conditionally required based on type */}
              {postForm.type !== "twitter" && (
                <div>
                  <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={postForm.title || ""}
                    onChange={(e) =>
                      onChange({ ...postForm, title: e.target.value })
                    }
                    placeholder="e.g. Sunset Ride Vlog"
                    className="w-full bg-[#0c0c0e]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white"
                    required
                  />
                </div>
              )}

              {/* Destination URL */}
              <div>
                <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                  Destination Link URL
                </label>
                <input
                  type="url"
                  value={postForm.url || ""}
                  onChange={(e) => {
                    onChange({ ...postForm, url: e.target.value });
                    setUrlInput(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full bg-[#0c0c0e]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white font-mono"
                  required
                />
              </div>

              {/* Thumbnail URL */}
              {postForm.type !== "twitter" && (
                <div>
                  <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    value={postForm.thumbnail || ""}
                    onChange={(e) =>
                      onChange({ ...postForm, thumbnail: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0c0c0e]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-white/40 text-white font-mono"
                  />
                </div>
              )}

              {/* Description / Content Body */}
              <div>
                <label className="block text-xs text-[#86868B] mb-1 font-semibold">
                  {postForm.type === "twitter"
                    ? "Tweet Body Content"
                    : "Description / Summary Text"}
                </label>
                <textarea
                  value={postForm.description || ""}
                  onChange={(e) =>
                    onChange({ ...postForm, description: e.target.value })
                  }
                  placeholder={
                    postForm.type === "twitter"
                      ? "Write tweet message..."
                      : "Write a brief summary of the post..."
                  }
                  className="w-full bg-[#0c0c0e]/60 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/40 text-white h-20 resize-none"
                  required
                />
              </div>

              {/* Dynamic stats values */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                {postForm.type === "youtube" && (
                  <>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Views
                      </label>
                      <input
                        type="number"
                        value={postForm.views || ""}
                        onChange={(e) =>
                          onChange({
                            ...postForm,
                            views:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={postForm.duration || ""}
                        onChange={(e) =>
                          onChange({ ...postForm, duration: e.target.value })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                {postForm.type === "instagram" && (
                  <>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Likes
                      </label>
                      <input
                        type="number"
                        value={postForm.likes || ""}
                        onChange={(e) =>
                          onChange({
                            ...postForm,
                            likes:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Comments
                      </label>
                      <input
                        type="number"
                        value={postForm.comments || ""}
                        onChange={(e) =>
                          onChange({
                            ...postForm,
                            comments:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                {postForm.type === "twitter" && (
                  <>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Likes
                      </label>
                      <input
                        type="number"
                        value={postForm.likes || ""}
                        onChange={(e) =>
                          onChange({
                            ...postForm,
                            likes:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Retweets
                      </label>
                      <input
                        type="number"
                        value={postForm.reposts || ""}
                        onChange={(e) =>
                          onChange({
                            ...postForm,
                            reposts:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Author Handle
                      </label>
                      <input
                        type="text"
                        value={postForm.author || ""}
                        onChange={(e) =>
                          onChange({ ...postForm, author: e.target.value })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                {postForm.type === "linkedin" && (
                  <>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Reactions
                      </label>
                      <input
                        type="number"
                        value={postForm.likes || ""}
                        onChange={(e) =>
                          onChange({
                            ...postForm,
                            likes:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#86868B] mb-0.5">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={postForm.author || ""}
                        onChange={(e) =>
                          onChange({ ...postForm, author: e.target.value })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Instagram raw metadata import - collapsed by default */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowInstagramRawImport(!showInstagramRawImport)}
                  className="w-full flex items-center justify-between py-2.5 px-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] rounded-xl transition-all"
                >
                  <span className="text-xs font-bold text-white">
                    Instagram Raw Text Import
                  </span>
                  {showInstagramRawImport ? (
                    <ChevronUp className="w-4 h-4 text-[#86868B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#86868B]" />
                  )}
                </button>

                {showInstagramRawImport && (
                  <div className="mt-3 space-y-3 p-4 rounded-xl border border-white/5 bg-white/[0.01] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-[#86868B] leading-relaxed">
                          Paste raw OG metadata here when Instagram fetch fails. It will parse title, description, image, and author into the preview.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => parseRawInstagramMetadata(rawInstagramMetadata)}
                        className="shrink-0 py-2 px-3 rounded-lg bg-white text-black font-bold text-[10px] hover:bg-gray-200 transition-colors"
                      >
                        Parse Raw Text
                      </button>
                    </div>
                    <textarea
                      value={rawInstagramMetadata}
                      onChange={(e) => setRawInstagramMetadata(e.target.value)}
                      onBlur={() => {
                        if (rawInstagramMetadata.trim()) {
                          parseRawInstagramMetadata(rawInstagramMetadata);
                        }
                      }}
                      placeholder={`og:type\narticle\nog:site_name\nInstagram\nog:title\nRamith Gowda on Instagram: "..."\nog:image\nhttps://...\nog:url\nhttps://www.instagram.com/...\nog:description\n44 likes, 4 comments - ...\n\ntwitter:title\nRamith Gowda (@ramithks) • Instagram reel`}
                      className="w-full min-h-48 bg-[#0c0c0e] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white/40 resize-y whitespace-pre-wrap"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors shadow-md"
            >
              Save Feed Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
