import { useState } from "react";

interface Comment {
  id: string;
  author: string;
  authorHandle: string;
  text: string;
  timestamp: string;
  likeCount: number;
}

export function usePostInteractions(
  postId: string,
  platform: "bluesky" | "mastodon",
  postCid?: string,
  authorDid?: string,
  authorId?: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "https://baleen-backend.onrender.com";

  // Fetch comments
  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const encodedPostId = encodeURIComponent(postId);
      const response = await fetch(
        `${apiBase}/interactions/comments/${platform}/${encodedPostId}`
      );

      if (!response.ok) throw new Error("Failed to fetch comments");

      const data = await response.json();
      setComments(data.replies || []);
      setShowComments(true);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reply to post
  const reply = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const body: any = {
        postId,
        platform,
        text,
      };

      if (platform === "bluesky" && postCid) {
        body.postCid = postCid;
      }

      const response = await fetch(`${apiBase}/interactions/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to send reply");

      const data = await response.json();
      console.log("Reply sent:", data);
      
      // Refresh comments
      await fetchComments();
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to reply:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Follow user
  const follow = async () => {
    setLoading(true);
    setError(null);

    try {
      const body: any = { platform };

      if (platform === "bluesky" && authorDid) {
        body.userDid = authorDid;
      } else if (platform === "mastodon" && authorId) {
        body.userId = authorId;
      } else {
        throw new Error("Missing user ID");
      }

      const response = await fetch(`${apiBase}/interactions/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to follow");

      setIsFollowing(true);
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to follow:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unfollow user
  const unfollow = async () => {
    setLoading(true);
    setError(null);

    try {
      const body: any = { platform };

      if (platform === "bluesky" && authorDid) {
        body.userDid = authorDid;
      } else if (platform === "mastodon" && authorId) {
        body.userId = authorId;
      } else {
        throw new Error("Missing user ID");
      }

      const response = await fetch(`${apiBase}/interactions/unfollow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to unfollow");

      setIsFollowing(false);
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to unfollow:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    showComments,
    loading,
    error,
    isFollowing,
    fetchComments,
    reply,
    follow,
    unfollow,
  };
}
