import React from 'react';

interface QuotedPostProps {
  quotedPost: {
    id: string;
    author: string;
    authorHandle: string;
    text: string;
    timestamp: string;
    images: string[];
    likeCount: number;
    repostCount: number;
    replyCount: number;
  };
}

export function QuotedPost({ quotedPost }: QuotedPostProps) {
  if (!quotedPost) return null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="quoted-post">
      <div className="quoted-post-header">
        <span className="quoted-post-author">{quotedPost.author}</span>
        <span className="quoted-post-handle">@{quotedPost.authorHandle}</span>
        <span className="quoted-post-time">{formatDate(quotedPost.timestamp)}</span>
      </div>

      <p className="quoted-post-text">{quotedPost.text}</p>

      {quotedPost.images && quotedPost.images.length > 0 && (
        <div className="quoted-post-images">
          {quotedPost.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Quoted post image"
              onError={(e) => {
                console.warn(`Image failed to load: ${img}`);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ))}
        </div>
      )}

      <div className="quoted-post-stats">
        <span>💬 {quotedPost.replyCount}</span>
        <span>🔄 {quotedPost.repostCount}</span>
        <span>❤️ {quotedPost.likeCount}</span>
      </div>
    </div>
  );
}
