import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { RefreshCw, AlertCircle } from "lucide-react";

export const ShortLinkRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const foundLink = useQuery(api.shortLinks.getBySlug, slug ? { slug } : "skip");
  const incrementClicks = useMutation(api.shortLinks.incrementClicks);
  
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!slug) {
      navigate("/");
      return;
    }

    if (foundLink === undefined) {
      // Still loading
      return;
    }

    if (foundLink === null) {
      setError(`The link matching "/l/${slug}" could not be found.`);
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Increment clicks
    incrementClicks({ slug: foundLink.slug }).catch(console.error);

    // Redirect
    if (foundLink.openInApp) {
      window.location.replace(`/open?url=${encodeURIComponent(foundLink.url)}`);
    } else {
      window.location.replace(foundLink.url);
    }
  }, [slug, foundLink, navigate, incrementClicks]);

  return (
    <div className="bg-[#030305] text-[#F5F5F7] min-h-screen flex flex-col items-center justify-center p-6 font-sans">
      <Helmet>
        <title>Redirecting...</title>
      </Helmet>

      {error ? (
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-lg font-bold">Link Not Found</h1>
          <p className="text-sm text-[#86868B]">
            {error}
          </p>
          <p className="text-xs text-white/30">
            Redirecting you to the home hub in a moment...
          </p>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-400 mx-auto animate-spin" />
          <h1 className="text-lg font-bold">Resolving Link</h1>
          <p className="text-xs text-[#86868B] font-mono">
            /l/{slug}
          </p>
        </div>
      )}
    </div>
  );
};
