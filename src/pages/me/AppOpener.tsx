import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Globe, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

// Brand details helper
interface BrandDetails {
  name: string;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
}

export const AppOpener = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Initializing secure redirect...");
  const [brand, setBrand] = useState<BrandDetails | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (!urlParam) {
      setIsError(true);
      setStatusMessage("Invalid redirect request: No destination URL specified.");
      return;
    }

    try {
      const decodedUrl = decodeURIComponent(urlParam);
      // Basic validation
      if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
        throw new Error("Invalid protocol");
      }
      setTargetUrl(decodedUrl);
      detectBrandAndRedirect(decodedUrl);
    } catch {
      setIsError(true);
      setStatusMessage("Invalid redirect request: The target URL format is incorrect.");
    }
  }, [searchParams]);

  const detectBrandAndRedirect = (url: string) => {
    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || "";
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    const mobile = isAndroid || isIOS;
    setIsMobile(mobile);

    // Identify brand and generate deep link
    let detectedBrand: BrandDetails = {
      name: "Webpage",
      color: "#2997FF",
      bgGradient: "from-blue-600/20 to-indigo-600/20",
      icon: <Globe className="w-12 h-12 text-blue-400" />
    };

    let deepLink = url;

    // 1. YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      detectedBrand = {
        name: "YouTube",
        color: "#FF0000",
        bgGradient: "from-red-600/20 to-orange-600/20",
        icon: (
          <svg className="w-12 h-12 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107A30.081 30.081 0 0 0 0 12.003a30.081 30.081 0 0 0 .502 5.84 3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107A30.081 30.081 0 0 0 24 12.003a30.081 30.081 0 0 0-.502-5.84zM9.545 15.568V8.438L15.818 12l-6.273 3.568z" />
          </svg>
        )
      };

      // Extract video ID or channel
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (videoId) {
        if (isIOS) {
          deepLink = `youtube://www.youtube.com/watch?v=${videoId}`;
        } else if (isAndroid) {
          deepLink = `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        }
      } else {
        // Fallback for Channel/Profile URLs
        const handleMatch = url.match(/youtube\.com\/(@[^/&?]+)/i);
        const handle = handleMatch ? handleMatch[1] : null;
        if (handle) {
          if (isIOS) {
            deepLink = `youtube://www.youtube.com/${handle}`;
          } else if (isAndroid) {
            deepLink = `intent://www.youtube.com/${handle}#Intent;package=com.google.android.youtube;scheme=https;end;`;
          }
        }
      }
    }
    // 2. Instagram
    else if (url.includes("instagram.com")) {
      detectedBrand = {
        name: "Instagram",
        color: "#E1306C",
        bgGradient: "from-pink-600/20 to-purple-600/20",
        icon: (
          <svg className="w-12 h-12 text-[#E1306C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        )
      };

      // Extract username or post
      const usernameMatch = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
      const username = usernameMatch ? usernameMatch[1] : null;

      if (username) {
        if (username === "p" || username === "reel" || username === "stories") {
          // Post/Reel redirect
          const postMatch = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/i);
          const postId = postMatch ? postMatch[1] : null;
          if (postId) {
            if (isIOS) {
              deepLink = `instagram://media?id=${postId}`; // or instagram://p/id
            } else if (isAndroid) {
              deepLink = `intent://instagram.com/p/${postId}/#Intent;package=com.instagram.android;scheme=https;end;`;
            }
          }
        } else {
          // Profile redirect
          if (isIOS) {
            deepLink = `instagram://user?username=${username}`;
          } else if (isAndroid) {
            deepLink = `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;end;`;
          }
        }
      }
    }
    // 3. LinkedIn
    else if (url.includes("linkedin.com")) {
      detectedBrand = {
        name: "LinkedIn",
        color: "#0077B5",
        bgGradient: "from-blue-700/20 to-cyan-700/20",
        icon: (
          <svg className="w-12 h-12 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        )
      };

      const usernameMatch = url.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
      const username = usernameMatch ? usernameMatch[1] : null;

      if (username) {
        if (isIOS) {
          deepLink = `linkedin://profile/${username}`;
        } else if (isAndroid) {
          deepLink = `intent://linkedin.com/in/${username}#Intent;package=com.linkedin.android;scheme=https;end;`;
        }
      }
    }
    // 4. X (Twitter)
    else if (url.includes("x.com") || url.includes("twitter.com")) {
      detectedBrand = {
        name: "X (Twitter)",
        color: "#ffffff",
        bgGradient: "from-gray-800/40 to-slate-900/40",
        icon: (
          <svg className="w-12 h-12 text-[#ffffff]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      };

      const handleMatch = url.match(/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)/i);
      const handle = handleMatch ? handleMatch[1] : null;

      if (handle && handle !== "home" && handle !== "explore") {
        const statusMatch = url.match(/(?:x|twitter)\.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)/i);
        const statusId = statusMatch ? statusMatch[1] : null;

        if (statusId) {
          if (isIOS) {
            deepLink = `twitter://status?id=${statusId}`;
          } else if (isAndroid) {
            deepLink = `intent://twitter.com/${handle}/status/${statusId}#Intent;package=com.twitter.android;scheme=https;end;`;
          }
        } else {
          if (isIOS) {
            deepLink = `twitter://user?screen_name=${handle}`;
          } else if (isAndroid) {
            deepLink = `intent://twitter.com/${handle}#Intent;package=com.twitter.android;scheme=https;end;`;
          }
        }
      }
    }
    // 5. Facebook
    else if (url.includes("facebook.com")) {
      detectedBrand = {
        name: "Facebook",
        color: "#1877F2",
        bgGradient: "from-blue-600/20 to-blue-800/20",
        icon: (
          <svg className="w-12 h-12 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      };

      const usernameMatch = url.match(/facebook\.com\/([a-zA-Z0-9_.]+)/i);
      const username = usernameMatch ? usernameMatch[1] : null;

      if (username) {
        if (isIOS) {
          deepLink = `fb://profile/${username}`;
        } else if (isAndroid) {
          deepLink = `intent://facebook.com/${username}#Intent;package=com.facebook.android;scheme=https;end;`;
        }
      }
    }

    setBrand(detectedBrand);
    setStatusMessage(`Opening ${detectedBrand.name}...`);

    if (mobile) {
      // Execute mobile deep link redirect
      window.location.href = deepLink;

      // Fallback timer: if the app doesn't open within 1.2 seconds, redirect to the browser page.
      const timer = setTimeout(() => {
        setStatusMessage(`Redirecting to web version...`);
        window.location.replace(url);
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      // Desktop redirect: immediate redirect to HTTPS standard URL
      const timer = setTimeout(() => {
        window.location.replace(url);
      }, 600);
      return () => clearTimeout(timer);
    }
  };

  const handleManualFallback = () => {
    if (targetUrl) {
      window.location.replace(targetUrl);
    }
  };

  return (
    <div className="bg-[#030305] text-[#F5F5F7] min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <Helmet>
        <title>Opening App...</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Background radial glow */}
      <div className={`absolute w-[80vw] h-[80vw] rounded-full blur-[140px] opacity-30 pointer-events-none transition-all duration-700 bg-radial ${brand ? brand.bgGradient : "from-blue-600/10 to-transparent"}`} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        {isError ? (
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col items-center shadow-xl w-full">
            <AlertCircle className="w-14 h-14 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold mb-2">Redirect Error</h2>
            <p className="text-sm text-[#86868B] mb-6 leading-relaxed">
              {statusMessage}
            </p>
            <button
              onClick={() => navigate("/")}
              className="py-2.5 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition-all duration-300 w-full flex items-center justify-center gap-1"
            >
              <span>Return to Hub</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            
            {/* Logo Pulsing Animation */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-full bg-white/5 animate-pulse blur-md" />
              <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0" />
                {brand?.icon ? brand.icon : <Globe className="w-12 h-12 text-[#2997FF]" />}
              </div>
              
              {/* Spinner */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#030305] border border-white/10 flex items-center justify-center shadow-md">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              </div>
            </div>

            <h1 className="text-xl font-extrabold tracking-tight mb-2">
              {brand ? `Connecting to ${brand.name}` : "Opening Link..."}
            </h1>
            
            <p className="text-[#86868B] text-xs font-mono mb-8 max-w-xs truncate" title={targetUrl}>
              {targetUrl}
            </p>

            <div className="w-full space-y-4">
              <p className="text-xs text-[#86868B] animate-pulse">
                {statusMessage}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                <button
                  onClick={handleManualFallback}
                  className="py-3 px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors w-full flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>Open Website directly</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {isMobile && (
                  <p className="text-[10px] text-white/40 max-w-xs leading-normal">
                    This window will redirect to the native application. Click the button above if your device doesn't open the app.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
