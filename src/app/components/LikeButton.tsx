import React, { useState } from 'react';

interface LikeButtonProps {
  postId: string;
  platform: 'bluesky' | 'mastodon';
  cid?: string; // Bluesky only
  initialLiked: boolean;
  initialLikeCount: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export function LikeButton({ postId, platform, cid, initialLiked, initialLikeCount, onLikeChange }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      setLoading(true);
      const action = liked ? 'unlike' : 'like';
      
      const body: any = {
        postId,
        platform,
        action,
      };
      
      // Add cid for Bluesky posts
      if (platform === 'bluesky' && cid) {
        body.cid = cid;
      }
      
      const response = await fetch('https://baleen-backend.onrender.com/interactions/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error('Failed to like post');
        return;
      }

      const data = await response.json();
      setLiked(data.result?.liked || !liked);
      setLikeCount(data.result?.likeCount || likeCount);
      onLikeChange?.(data.result?.liked || !liked, data.result?.likeCount || likeCount);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="interaction-button like-button"
      onClick={handleLike}
      disabled={loading}
      title={liked ? 'Unlike' : 'Like'}
    >
      <span className={`like-icon ${liked ? 'liked' : ''}`}>❤️</span>
      <span className="interaction-count">{likeCount}</span>
    </button>
  );
}
