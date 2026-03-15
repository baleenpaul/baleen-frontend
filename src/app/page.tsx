"use client";
import { useEffect, useState } from "react";
import AISlop FilterPanel from "./components/AISlop FilterPanel";

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [deduplicate, setDeduplicate] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set<string>());
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set<string>());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set<string>());
  
  // AI Filter state
  const [aiFilterEnabled, setAiFilterEnabled] = useState(false);
  const [aiSensitivity, setAiSensitivity] = useState(50);
  const [aiWhitelist, setAiWhitelist] = useState<string[]>([]);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async (
    filterAI?: boolean,
    sensitivity?: number,
    whitelist?: string[]
  ) => {
    try {
      const params = new URLSearchParams();
      
      if (deduplicate) {
        params.append("deduplicate", "true");
      }
      
      if (filterAI ?? aiFilterEnabled) {
        params.append("filterAI", "true");
        params.append("sensitivity", String(sensitivity ?? aiSensitivity));
        
        const whitelistToUse = whitelist ?? aiWhitelist;
        if (whitelistToUse.length > 0) {
          params.append("whitelist", whitelistToUse.join(","));
        }
      }

      const url = params.toString()
        ? `https://baleen-backend.onrender.com/feed?${params.toString()}`
        : "https://baleen-backend.onrender.com/feed";
      
      const res = await fetch(url);
      const data = await res.json();
      
      // Handle both array and object responses
      const feedItems = Array.isArray(data) ? data : data.items || data;
      
      console.log("FEED DATA:", feedItems);
      setPosts(feedItems);

      const likedIds = new Set<string>();
      const repostedIds = new Set<string>();
      feedItems.forEach((post: any) => {
        if (post.liked) likedIds.add(post.id);
        if (post.reposted) repostedIds.add(post.id);
      });
      setLikedPosts(likedIds);
      setRepostedPosts(repostedIds);
    } catch (err) {
      console.error("FEED ERROR", err);
    }
  };

  const handleFilterChange = (settings: any) => {
    setAiFilterEnabled(settings.enabled);
    setAiSensitivity(settings.sensitivity);
    setAiWhitelist(settings.whitelist);

    // Refetch feed with new filter settings
    fetchFeed(settings.enabled, settings.sensitivity, settings.whitelist);
  };

  const handleLike = async (post: any) => {
    const isLiked = likedPosts.has(post.id);
    const action = isLiked ? "unlike" : "like";
    const actionKey = `${post.id}-like`;
    setLoadingActions(new Set([...loadingActions, actionKey]));
    try {
      const res = await fetch("https://baleen-backend.onrender.com/feed/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          platform: post.platform,
          action,
        }),
      });
      if (res.ok) {
        const newLiked = new Set(likedPosts);
        if (isLiked) {
          newLiked.delete(post.id);
        } else {
          newLiked.add(post.id);
        }
        setLikedPosts(newLiked);
        setPosts(posts.map((p: any) =>
          p.id === post.id
            ? {
                ...p,
                liked: !isLiked,
                likeCount: p.likeCount + (isLiked ? -1 : 1),
              }
            : p
        ));
      }
    } catch (err) {
      console.error("Like action failed:", err);
    } finally {
      const newLoading = new Set(loadingActions);
      newLoading.delete(actionKey);
      setLoadingActions(newLoading);
    }
  };

  const handleRepost = async (post: any) => {
    const isReposted = repostedPosts.has(post.id);
    const action = isReposted ? "unrepost" : "repost";
    const actionKey = `${post.id}-repost`;
    setLoadingActions(new Set([...loadingActions, actionKey]));
    try {
      const res = await fetch("https://baleen-backend.onrender.com/feed/repost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          platform: post.platform,
          action,
        }),
      });
      if (res.ok) {
        const newReposted = new Set(repostedPosts);
        if (isReposted) {
          newReposted.delete(post.id);
        } else {
          newReposted.add(post.id);
        }
        setRepostedPosts(newReposted);
        setPosts(posts.map((p: any) =>
          p.id === post.id
            ? {
                ...p,
                reposted: !isReposted,
                repostCount: p.repostCount + (isReposted ? -1 : 1),
              }
            : p
        ));
      }
    } catch (err) {
      console.error("Repost action failed:", err);
    } finally {
      const newLoading = new Set(loadingActions);
      newLoading.delete(actionKey);
      setLoadingActions(newLoading);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      const feedTimer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(feedTimer);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="min-h-screen transition-colors duration-[10000ms]"
      style={{
        backgroundColor: isOpen ? '#f8fafc' : '#0f172a',
        transitionTimingFunction: 'linear'
      }}
    >
      <style>{`
        @keyframes whaleRise {
          0% {
            transform: translateY(200px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }
        @keyframes krillFloat {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }
        @keyframes logoGlow {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }
        @keyframes waterShimmer {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        @keyframes zoomIn {
          0% {
            transform: scale(0.3) translateY(100px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeOutContent {
          0% {
            opacity: 1;
            pointer-events: auto;
          }
          100% {
            opacity: 0;
            pointer-events: none;
          }
        }
        .whale-animation {
          animation: whaleRise 5s linear forwards;
        }
        .krill {
          animation: krillFloat 5s linear forwards;
        }
        .logo-glow {
          animation: logoGlow 3s linear forwards;
          animation-delay: 2s;
        }
        .water-shimmer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background: linear-gradient(45deg, transparent 0%, rgba(20, 184, 166, 0.02) 25%, transparent 50%, rgba(20, 184, 166, 0.02) 75%, transparent 100%);
          background-size: 400% 400%;
          animation: waterShimmer 12s ease-in-out infinite;
        }
        .zoom-in {
          animation: zoomIn 5s ease-out forwards;
        }
        .fade-out-content {
          animation: fadeOutContent 5s ease-out forwards;
        }
      `}</style>

      {/* WHALE EMERGENCE ANIMATION */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[3000ms]"
        style={{ 
          opacity: showAnimation ? '1' : '0',
          transitionTimingFunction: 'linear',
          pointerEvents: 'none'
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={`krill-${i}`}
            className="krill absolute"
            style={{
              left: `${20 + (i * 7)}%`,
              top: `${40 + (i % 3) * 15}%`,
              animationDelay: `${0.1 + i * 0.15}s`,
            }}
          >
            <svg viewBox="0 0 20 20" className="w-2 h-2" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="10" cy="10" rx="5" ry="3" fill="#14b8a6" opacity="0.8" />
            </svg>
          </div>
        ))}
        <div className="whale-animation">
          <svg viewBox="0 0 300 200" className="w-80 h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse cx="150" cy="100" rx="90" ry="45" fill="#1e3a4c" opacity="0.9" filter="url(#glow)" />
            <ellipse cx="80" cy="85" rx="35" ry="30" fill="#1e3a4c" opacity="0.9" />
            <path d="M 50 100 Q 70 120 90 115" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.7" />
            <line x1="65" y1="105" x2="65" y2="145" stroke="#14b8a6" strokeWidth="2.5" opacity="0.8" />
            <line x1="75" y1="105" x2="75" y2="150" stroke="#14b8a6" strokeWidth="2.5" opacity="0.8" />
            <line x1="85" y1="105" x2="85" y2="152" stroke="#14b8a6" strokeWidth="2.5" opacity="0.8" />
            <line x1="95" y1="105" x2="95" y2="150" stroke="#14b8a6" strokeWidth="2.5" opacity="0.8" />
            <line x1="105" y1="105" x2="105" y2="145" stroke="#14b8a6" strokeWidth="2.5" opacity="0.8" />
            <circle cx="70" cy="75" r="4" fill="#14b8a6" opacity="0.8" />
            <path d="M 230 90 Q 270 70 280 100 Q 270 130 230 110" fill="#1e3a4c" opacity="0.8" />
            <path d="M 235 85 Q 265 65 275 95" stroke="#14b8a6" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
        </div>
        <div className="logo-glow absolute">
          <svg viewBox="0 0 120 120" className="w-32 h-32" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="50" rx="28" ry="20" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.5" />
            <path d="M 88 50 Q 100 45 105 60 Q 100 75 88 70" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
            <line x1="35" y1="65" x2="35" y2="95" stroke="#14b8a6" strokeWidth="3" />
            <line x1="43" y1="65" x2="43" y2="98" stroke="#14b8a6" strokeWidth="3" />
            <line x1="51" y1="65" x2="51" y2="100" stroke="#14b8a6" strokeWidth="3" />
            <line x1="59" y1="65" x2="59" y2="100" stroke="#14b8a6" strokeWidth="3" />
            <line x1="67" y1="65" x2="67" y2="98" stroke="#14b8a6" strokeWidth="3" />
            <line x1="75" y1="65" x2="75" y2="95" stroke="#14b8a6" strokeWidth="3" />
            <line x1="83" y1="65" x2="83" y2="90" stroke="#14b8a6" strokeWidth="3" />
            <circle cx="60" cy="45" r="3" fill="#14b8a6" />
          </svg>
        </div>
      </div>

      {/* SPLASH SCREEN */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-[3000ms]"
        style={{ 
          opacity: (showAnimation || isOpen) ? '0' : '1',
          transitionTimingFunction: 'linear',
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
      >
        {!showSettings ? (
          <div className="text-center space-y-8 max-w-sm pointer-events-auto fade-out-content" style={{ animationPlayState: showSettings ? 'running' : 'paused' }}>
            {/* MAIN LOGO */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-center hover:opacity-80 transition-opacity"
              title="Toggle feed"
            >
              <svg viewBox="0 0 120 120" className="w-24 h-24" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="50" rx="28" ry="20" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />
                <path d="M 88 50 Q 100 45 105 60 Q 100 75 88 70" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
                <line x1="35" y1="65" x2="35" y2="95" stroke="white" strokeWidth="3" />
                <line x1="43" y1="65" x2="43" y2="98" stroke="white" strokeWidth="3" />
                <line x1="51" y1="65" x2="51" y2="100" stroke="white" strokeWidth="3" />
                <line x1="59" y1="65" x2="59" y2="100" stroke="white" strokeWidth="3" />
                <line x1="67" y1="65" x2="67" y2="98" stroke="white" strokeWidth="3" />
                <line x1="75" y1="65" x2="75" y2="95" stroke="white" strokeWidth="3" />
                <line x1="83" y1="65" x2="83" y2="90" stroke="white" strokeWidth="3" />
                <circle cx="60" cy="45" r="3" fill="#14b8a6" opacity="0.8" />
              </svg>
            </button>
            <h1 className="text-5xl font-light tracking-widest text-white">BALEEN</h1>
            <p className="text-lg text-gray-300 font-light max-w-sm leading-relaxed">
              Social, without the noise.
            </p>
            {/* SETTINGS BUTTON */}
            <div className="pt-8">
              <button
                onClick={() => setShowSettings(true)}
                className="flex justify-center items-center hover:opacity-70 transition-opacity"
                title="Filter settings"
              >
                <svg viewBox="0 0 80 100" className="w-12 h-16" xmlns="http://www.w3.org/2000/svg">
                  <line x1="20" y1="30" x2="20" y2="80" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                  <line x1="30" y1="30" x2="30" y2="82" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                  <line x1="40" y1="30" x2="40" y2="85" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                  <line x1="50" y1="30" x2="50" y2="85" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                  <line x1="60" y1="30" x2="60" y2="82" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                  <text x="40" y="20" textAnchor="middle" className="text-[8px] fill-gray-300">
                    Filter
                  </text>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // EXPANDED SETTINGS VIEW
          <div className="zoom-in w-full h-full flex flex-col items-center justify-center p-8 pointer-events-auto">
            <div className="max-w-2xl space-y-8">
              {/* Close button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white hover:opacity-70 transition-opacity text-2xl"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              {/* BALEEN VISUAL WITH SETTINGS */}
              <div className="flex justify-center mb-8">
                <svg viewBox="0 0 400 500" className="w-96 h-full max-h-96" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 150 100 Q 200 120 250 100" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.6" />
                  {/* BALEEN PLATE 1 - MUTE KEYWORDS */}
                  <g>
                    <line x1="80" y1="120" x2="80" y2="350" stroke="#14b8a6" strokeWidth="4" opacity="0.8" />
                    <text x="90" y="155" className="text-[13px] fill-gray-300" fontFamily="Arial" fontWeight="600">
                      MUTE
                    </text>
                    <text x="90" y="180" className="text-[11px] fill-gray-400" fontFamily="Arial">
                      trump
                    </text>
                    <text x="90" y="205" className="text-[11px] fill-gray-400" fontFamily="Arial">
                      bitcoin
                    </text>
                    <text x="90" y="230" className="text-[11px] fill-gray-400" fontFamily="Arial">
                      football
                    </text>
                  </g>
                  {/* BALEEN PLATE 2 - HIGHLIGHT KEYWORDS */}
                  <g>
                    <line x1="150" y1="120" x2="150" y2="360" stroke="#14b8a6" strokeWidth="4" opacity="0.8" />
                    <text x="160" y="155" className="text-[13px] fill-gray-300" fontFamily="Arial" fontWeight="600">
                      HIGHLIGHT
                    </text>
                    <text x="160" y="180" className="text-[11px] fill-gray-400" fontFamily="Arial">
                      ireland
                    </text>
                    <text x="160" y="205" className="text-[11px] fill-gray-400" fontFamily="Arial">
                      climate
                    </text>
                    <text x="160" y="230" className="text-[11px] fill-gray-400" fontFamily="Arial">
                      housing
                    </text>
                  </g>
                  {/* BALEEN PLATE 3 - DEDUPLICATION TOGGLE */}
                  <g>
                    <line x1="220" y1="120" x2="220" y2="365" stroke="#14b8a6" strokeWidth="4" opacity="0.8" />
                    <text x="230" y="155" className="text-[13px] fill-gray-300" fontFamily="Arial" fontWeight="600">
                      DEDUP
                    </text>
                    <rect
                      x="230"
                      y="175"
                      width="55"
                      height="24"
                      rx="12"
                      fill={deduplicate ? "#14b8a6" : "none"}
                      stroke="#14b8a6"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                    <circle
                      cx={deduplicate ? "268" : "237"}
                      cy="187"
                      r="8"
                      fill="#14b8a6"
                      opacity="0.8"
                    />
                    <text x="230" y="235" className="text-[10px] fill-gray-400" fontFamily="Arial">
                      Hide duplicates
                    </text>
                    <text x="230" y="253" className="text-[10px] fill-gray-400" fontFamily="Arial">
                      within 24 hours
                    </text>
                  </g>
                  {/* BALEEN PLATE 4 - FEED ACTION */}
                  <g>
                    <line x1="290" y1="120" x2="290" y2="360" stroke="#14b8a6" strokeWidth="4" opacity="0.8" />
                    <text x="300" y="185" className="text-[12px] fill-gray-300" fontFamily="Arial" fontWeight="600">
                      ENTER
                    </text>
                    <text x="300" y="210" className="text-[12px] fill-gray-300" fontFamily="Arial" fontWeight="600">
                      FEED
                    </text>
                  </g>
                  {/* BALEEN PLATE 5 */}
                  <g>
                    <line x1="350" y1="120" x2="350" y2="355" stroke="#14b8a6" strokeWidth="4" opacity="0.8" />
                  </g>
                </svg>
              </div>
              {/* INTERACTIVE CONTROLS */}
              <div className="flex flex-col gap-6 text-center">
                <label className="flex items-center justify-center gap-3 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={deduplicate}
                    onChange={(e) => {
                      setDeduplicate(e.target.checked);
                      fetchFeed(aiFilterEnabled, aiSensitivity, aiWhitelist);
                    }}
                    className="w-5 h-5 accent-teal-500"
                  />
                  <span className="text-sm">Hide duplicate posts (24h window)</span>
                </label>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setIsOpen(true);
                  }}
                  className="px-12 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-base font-semibold"
                >
                  Enter Feed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FEED */}
      <div 
        className="transition-opacity duration-[3000ms]"
        style={{ 
          opacity: isOpen ? '1' : '0',
          transitionTimingFunction: 'linear',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        <div className="water-shimmer" style={{ position: 'fixed', pointerEvents: 'none' }} />
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-center relative z-10">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            title="Back to menu"
          >
            <svg viewBox="0 0 120 120" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="60" cy="50" rx="28" ry="20" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.3" />
              <path d="M 88 50 Q 100 45 105 60 Q 100 75 88 70" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.2" />
              <line x1="35" y1="65" x2="35" y2="95" stroke="#14b8a6" strokeWidth="3" />
              <line x1="43" y1="65" x2="43" y2="98" stroke="#14b8a6" strokeWidth="3" />
              <line x1="51" y1="65" x2="51" y2="100" stroke="#14b8a6" strokeWidth="3" />
              <line x1="59" y1="65" x2="59" y2="100" stroke="#14b8a6" strokeWidth="3" />
              <line x1="67" y1="65" x2="67" y2="98" stroke="#14b8a6" strokeWidth="3" />
              <line x1="75" y1="65" x2="75" y2="95" stroke="#14b8a6" strokeWidth="3" />
              <line x1="83" y1="65" x2="83" y2="90" stroke="#14b8a6" strokeWidth="3" />
              <circle cx="60" cy="45" r="3" fill="#14b8a6" opacity="0.8" />
            </svg>
            <span className="text-sm font-semibold text-slate-900">Baleen</span>
          </button>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          {/* AI SLOP FILTER PANEL */}
          <div className="mb-8">
            <AISlop FilterPanel 
              onFilterChange={handleFilterChange}
              initialSettings={{
                enabled: aiFilterEnabled,
                sensitivity: aiSensitivity,
                whitelist: aiWhitelist,
              }}
            />
          </div>

          {/* FEED ITEMS */}
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <p>Loading your feed...</p>
            </div>
          ) : (
            posts.map((post: any, i: number) => (
              <div
                key={i}
                className={`relative rounded-xl p-5 mb-6 shadow-sm transition-all hover:shadow-md hover:bg-white ${
                  post.highlighted
                    ? "bg-teal-50 border-l-4 border-teal-500"
                    : "bg-white border border-slate-200"
                }`}
              >
                {/* AI Score Badge (if available) */}
                {post.aiScore !== undefined && post.aiScore > 0 && (
                  <div className="mb-3 inline-block">
                    <div className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      post.aiScore > 60 
                        ? "bg-red-100 text-red-700" 
                        : post.aiScore > 30 
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      🤖 AI Score: {post.aiScore}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{post.author}</span>
                    {post.platform === "bluesky" && (
                      <img src="/icons/bluesky.svg" className="w-4 h-4" alt="Bluesky" />
                    )}
                    {post.platform === "mastodon" && (
                      <img src="/icons/mastodon.svg" className="w-4 h-4" alt="Mastodon" />
                    )}
                    {post.platform === "threads" && (
                      <img src="/icons/threads.svg" className="w-4 h-4" alt="Threads" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(post.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="mb-3 whitespace-pre-wrap text-slate-900 text-sm leading-relaxed">
                  {post.text}
                </div>
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {post.images.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        className="rounded-lg border border-slate-200 w-full h-auto object-contain"
                        loading="lazy"
                        alt="Post image"
                      />
                    ))}
                  </div>
                )}
                {post.links && post.links.length > 0 && (
                  <div className="text-teal-600 underline text-sm mt-1 space-y-1">
                    {post.links.map((url: string, idx: number) => (
                      <div key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end text-slate-400 text-xs mt-3 space-x-6">
                  <button
                    onClick={() => handleLike(post)}
                    disabled={loadingActions.has(`${post.id}-like`)}
                    className={`flex items-center gap-1 transition-all hover:scale-110 ${
                      likedPosts.has(post.id) ? "text-red-500" : "text-slate-400"
                    } disabled:opacity-50`}
                  >
                    <span>{likedPosts.has(post.id) ? "❤️" : "🤍"}</span>
                    <span>{post.likeCount}</span>
                  </button>
                  <button
                    onClick={() => handleRepost(post)}
                    disabled={loadingActions.has(`${post.id}-repost`)}
                    className={`flex items-center gap-1 transition-all hover:scale-110 ${
                      repostedPosts.has(post.id) ? "text-teal-500" : "text-slate-400"
                    } disabled:opacity-50`}
                  >
                    <span>{repostedPosts.has(post.id) ? "🔄" : "↻"}</span>
                    <span>{post.repostCount}</span>
                  </button>
                  <span>💬 {Math.floor(Math.random() * 20)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
