"use client";
import { useEffect, useState } from "react";
import { CommentsSection } from "./components/CommentsSection";
import { ReplyInput } from "./components/ReplyInput";
import { usePostInteractions } from "@/hooks/usePostInteractions";

function PostItem({ post, likedPosts, repostedPosts, loadingActions, onLike, onRepost }: any) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const {
    comments,
    showComments,
    loading,
    error,
    isFollowing,
    fetchComments,
    reply,
    follow,
    unfollow,
  } = usePostInteractions(post.id, post.platform, post.cid, post.authorDid, post.authorId);

  const handleReply = async (replyText: string) => {
    await reply(replyText);
    setShowReplyInput(false);
  };

  return (
    <div
      key={post.id}
      className={`relative rounded-xl p-5 mb-6 shadow-sm transition-all hover:shadow-md hover:bg-white ${
        post.highlighted
          ? "bg-teal-50 border-l-4 border-teal-500"
          : "bg-white border border-slate-200"
      }`}
    >
      {post.aiScore !== undefined && post.aiScore > 0 && (
        <div className="mb-3 inline-block">
          <div
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              post.aiScore > 60
                ? "bg-red-100 text-red-700"
                : post.aiScore > 30
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
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
          <span className="text-xs text-slate-500">
            {new Date(post.timestamp).toLocaleString()}
          </span>
        </div>
        <button
          onClick={isFollowing ? unfollow : follow}
          disabled={loading}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            isFollowing
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-teal-500 text-white hover:bg-teal-600"
          } disabled:opacity-50`}
        >
          {loading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
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

      <div className="flex justify-between text-slate-400 text-xs mt-4 space-x-4 border-t border-slate-100 pt-3">
        <button
          onClick={() => onLike(post)}
          disabled={loadingActions.has(`${post.id}-like`)}
          className={`flex items-center gap-1 transition-all hover:scale-110 ${
            likedPosts.has(post.id) ? "text-red-500" : "text-slate-400"
          } disabled:opacity-50`}
        >
          <span>{likedPosts.has(post.id) ? "❤️" : "🤍"}</span>
          <span>{post.likeCount}</span>
        </button>
        <button
          onClick={() => onRepost(post)}
          disabled={loadingActions.has(`${post.id}-repost`)}
          className={`flex items-center gap-1 transition-all hover:scale-110 ${
            repostedPosts.has(post.id) ? "text-teal-500" : "text-slate-400"
          } disabled:opacity-50`}
        >
          <span>{repostedPosts.has(post.id) ? "🔄" : "↻"}</span>
          <span>{post.repostCount}</span>
        </button>
        <button
          onClick={fetchComments}
          className="flex items-center gap-1 transition-all hover:scale-110 text-slate-400 hover:text-slate-600"
        >
          <span>💬</span>
          <span>{comments.length > 0 ? comments.length : "Reply"}</span>
        </button>
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="flex items-center gap-1 transition-all hover:scale-110 text-slate-400 hover:text-orange-500"
        >
          <span>↩️</span>
          <span>Reply</span>
        </button>
      </div>

      {showComments && (
        <CommentsSection
          comments={comments}
          isLoading={loading}
          error={error}
        />
      )}

      {showReplyInput && (
        <ReplyInput
          onSubmit={handleReply}
          isLoading={loading}
          placeholder={`Reply to ${post.author}...`}
        />
      )}
    </div>
  );
}

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [deduplicate, setDeduplicate] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set<string>());
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set<string>());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set<string>());
  
  const [aiFilterEnabled, setAiFilterEnabled] = useState(false);
  const [aiSensitivity, setAiSensitivity] = useState(50);
  const [aiWhitelist, setAiWhitelist] = useState<string[]>([]);
  const [aiWhitelistInput, setAiWhitelistInput] = useState("");

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
      if (deduplicate) params.append("deduplicate", "true");
      if (filterAI ?? aiFilterEnabled) {
        params.append("filterAI", "true");
        params.append("sensitivity", String(sensitivity ?? aiSensitivity));
        const whitelistToUse = whitelist ?? aiWhitelist;
        if (whitelistToUse.length > 0) params.append("whitelist", whitelistToUse.join(","));
      }
      const url = params.toString()
        ? `https://baleen-backend.onrender.com/feed?${params.toString()}`
        : "https://baleen-backend.onrender.com/feed";
      const res = await fetch(url);
      const data = await res.json();
      const feedItems = Array.isArray(data) ? data : data.items || data;
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

  const handleAiWhitelistAdd = () => {
    if (!aiWhitelistInput.trim()) return;
    const newWhitelist = [...aiWhitelist, aiWhitelistInput.trim()];
    setAiWhitelist(newWhitelist);
    setAiWhitelistInput("");
  };

  const handleAiWhitelistRemove = (index: number) => {
    const newWhitelist = aiWhitelist.filter((_, i) => i !== index);
    setAiWhitelist(newWhitelist);
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
        body: JSON.stringify({ postId: post.id, platform: post.platform, action }),
      });
      if (res.ok) {
        const newLiked = new Set(likedPosts);
        if (isLiked) newLiked.delete(post.id);
        else newLiked.add(post.id);
        setLikedPosts(newLiked);
        setPosts(posts.map((p: any) =>
          p.id === post.id
            ? { ...p, liked: !isLiked, likeCount: p.likeCount + (isLiked ? -1 : 1) }
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
        body: JSON.stringify({ postId: post.id, platform: post.platform, action }),
      });
      if (res.ok) {
        const newReposted = new Set(repostedPosts);
        if (isReposted) newReposted.delete(post.id);
        else newReposted.add(post.id);
        setRepostedPosts(newReposted);
        setPosts(posts.map((p: any) =>
          p.id === post.id
            ? { ...p, reposted: !isReposted, repostCount: p.repostCount + (isReposted ? -1 : 1) }
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
      const feedTimer = setTimeout(() => setIsOpen(true), 5000);
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
        @keyframes whaleRise { 0% { transform: translateY(200px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(0); opacity: 0; } }
        @keyframes krillFloat { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-100px); } }
        @keyframes logoGlow { 0% { opacity: 0; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.2); } }
        .whale-animation { animation: whaleRise 5s linear forwards; }
        .krill { animation: krillFloat 5s linear forwards; }
        .logo-glow { animation: logoGlow 3s linear forwards; animation-delay: 2s; }
      `}</style>

      {/* WHALE EMERGENCE ANIMATION */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[3000ms]"
        style={{ opacity: showAnimation ? '1' : '0', pointerEvents: 'none' }}
      >
        {[...Array(12)].map((_, i) => (
          <div key={`krill-${i}`} className="krill absolute" style={{ left: `${20 + i * 7}%`, top: `${40 + (i % 3) * 15}%`, animationDelay: `${0.1 + i * 0.15}s` }}>
            <svg viewBox="0 0 20 20" className="w-2 h-2"><ellipse cx="10" cy="10" rx="5" ry="3" fill="#14b8a6" opacity="0.8" /></svg>
          </div>
        ))}
        <div className="whale-animation"><svg viewBox="0 0 300 200" className="w-80 h-auto"><ellipse cx="150" cy="100" rx="90" ry="45" fill="#1e3a4c" opacity="0.9" /></svg></div>
      </div>

      {/* SPLASH SCREEN */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-[3000ms]"
        style={{ opacity: (showAnimation || isOpen) ? '0' : '1', pointerEvents: isOpen ? 'none' : 'auto' }}
      >
        {!showSettings ? (
          <div className="text-center space-y-8 max-w-sm pointer-events-auto">
            <button onClick={() => setIsOpen(true)} className="flex justify-center hover:opacity-80 transition-opacity">
              <svg viewBox="0 0 120 120" className="w-24 h-24"><circle cx="60" cy="45" r="3" fill="#14b8a6" opacity="0.8" /></svg>
            </button>
            <h1 className="text-5xl font-light tracking-widest text-white">BALEEN</h1>
            <p className="text-lg text-gray-300 font-light">Social, without the noise.</p>
            <button onClick={() => setShowSettings(true)} className="flex justify-center items-center hover:opacity-70 transition-opacity">
              <svg viewBox="0 0 80 100" className="w-12 h-16"><line x1="20" y1="30" x2="20" y2="80" stroke="#14b8a6" strokeWidth="2" opacity="0.8" /></svg>
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 pointer-events-auto overflow-y-auto">
            <div className="max-w-3xl space-y-8 py-8">
              <div className="flex justify-end">
                <button onClick={() => setShowSettings(false)} className="text-white hover:opacity-70 text-2xl">✕</button>
              </div>
              <div className="space-y-6 bg-slate-800 bg-opacity-50 p-6 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer text-white">
                  <input type="checkbox" checked={deduplicate} onChange={(e) => { setDeduplicate(e.target.checked); fetchFeed(aiFilterEnabled, aiSensitivity, aiWhitelist); }} className="w-5 h-5 accent-teal-500" />
                  <span className="text-sm">Hide duplicate posts (24h window)</span>
                </label>
                <div className="border-t border-slate-600 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer text-white">
                    <input type="checkbox" checked={aiFilterEnabled} onChange={(e) => { setAiFilterEnabled(e.target.checked); fetchFeed(e.target.checked, aiSensitivity, aiWhitelist); }} className="w-5 h-5 accent-teal-500" />
                    <span className="text-sm font-semibold">🐋 Filter AI Slop</span>
                  </label>
                </div>
              </div>
              <button onClick={() => { setShowSettings(false); setIsOpen(true); }} className="w-full px-12 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-base font-semibold">Enter Feed</button>
            </div>
          </div>
        )}
      </div>

      {/* FEED */}
      <div style={{ opacity: isOpen ? '1' : '0', transitionTimingFunction: 'linear', pointerEvents: isOpen ? 'auto' : 'none' }} className="transition-opacity duration-[3000ms]">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between relative z-10">
          <button onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="text-sm font-semibold text-slate-900">Baleen</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="text-slate-500 hover:text-slate-700 transition text-lg">⚙️</button>
        </div>
        <div className="p-6 max-w-2xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-12">Loading your feed...</div>
          ) : (
            posts.map((post: any) => (
              <PostItem key={post.id} post={post} likedPosts={likedPosts} repostedPosts={repostedPosts} loadingActions={loadingActions} onLike={handleLike} onRepost={handleRepost} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
