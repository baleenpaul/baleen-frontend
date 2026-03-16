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

  const fetchFeed = async (filterAI?: boolean, sensitivity?: number, whitelist?: string[]) => {
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
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10">
        <span className="text-sm font-semibold text-slate-900">Baleen</span>
        <button className="text-slate-500 hover:text-slate-700 text-lg">⚙️</button>
      </div>
      <div className="p-6 max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center text-slate-500 py-12">Loading...</div>
        ) : (
          posts.map((post: any) => (
            <PostItem
              key={post.id}
              post={post}
              likedPosts={likedPosts}
              repostedPosts={repostedPosts}
              loadingActions={loadingActions}
              onLike={handleLike}
              onRepost={handleRepost}
            />
          ))
        )}
      </div>
    </div>
  );
}
