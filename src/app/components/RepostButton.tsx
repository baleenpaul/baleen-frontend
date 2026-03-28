import React, { useState } from 'react';

interface RepostButtonProps {
  postId: string;
  platform: 'bluesky' | 'mastodon';
  initialReposted: boolean;
  initialRepostCount: number;
  onRepostChange?: (reposted: boolean, count: number) => void;
}

export function RepostButton({ postId, platform, initialReposted, initialRepostCount, onRepostChange }: RepostButtonProps) {
  const [reposted, setReposted] = useState(initialReposted);
  const [repostCount, setRepostCount] = useState(initialRepostCount);
  const [loading, setLoading] = useState(false);

  const handleRepost = async () => {
    try {
      setLoading(true);
      const action = reposted ? 'unrepost' : 'repost';
      
      const response = await fetch('https://baleen-backend.onrender.com/interactions/repost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          platform,
          action,
        }),
      });

      if (!response.ok) {
        console.error('Failed to repost');
        return;
      }

      const data = await response.json();
      setReposted(data.reposted);
      setRepostCount(data.repostCount);
      onRepostChange?.(data.reposted, data.repostCount);
    } catch (error) {
      console.error('Error reposting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="interaction-button repost-button"
      onClick={handleRepost}
      disabled={loading}
      title={reposted ? 'Undo repost' : 'Repost'}
    >
      <span className={`repost-icon ${reposted ? 'reposted' : ''}`}>🔄</span>
      <span className="interaction-count">{repostCount}</span>
    </button>
  );
}
