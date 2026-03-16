"use client";

import React from "react";
import { CommentsSection } from "./CommentsSection";
import { ReplyInput } from "./ReplyInput";
import { usePostInteractions } from "@/hooks/usePostInteractions";

interface PostCardProps {
  id: string;
  platform: "bluesky" | "mastodon";
  author: string;
  authorHandle: string;
  authorDid?: string;
  authorId?: string;
  text: string;
  timestamp: string;
  images: string[];
  likeCount: number;
  repostCount: number;
  cid?: string;
  onLike?: () => void;
  onRepost?: () => void;
}

export function PostCard({
  id,
  platform,
  author,
  authorHandle,
  authorDid,
  authorId,
  text,
  timestamp,
  images,
  likeCount,
  repostCount,
  cid,
  onLike,
  onRepost,
}: PostCardProps) {
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
  } = usePostInteractions(id, platform, cid, authorDid, authorId);

  const [showReplyInput, setShowReplyInput] = React.useState(false);

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async (replyText: string) => {
    await reply(replyText);
    setShowReplyInput(false);
  };

  return (
    <div className="post-card">
      {/* Header with Author & Follow Button */}
      <div className="post-header">
        <div className="author-info">
          <h3 className="author-name">{author}</h3>
          <span className="author-handle">@{authorHandle}</span>
          <span className="post-time">{formatTimestamp(timestamp)}</span>
        </div>
        <button
          onClick={isFollowing ? unfollow : follow}
          disabled={loading}
          className={`follow-btn ${isFollowing ? "following" : ""}`}
        >
          {loading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p className="post-text">{text}</p>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className={`images-grid images-grid-${Math.min(images.length, 4)}`}>
            {images.map((img, idx) => (
              <div key={idx} className="image-wrapper">
                <img
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  className="post-image"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="post-stats">
        <span className="stat">♥ {likeCount} likes</span>
        <span className="stat">🔄 {repostCount} reposts</span>
      </div>

      {/* Action Buttons */}
      <div className="post-actions">
        <button
          onClick={onLike}
          className="action-btn like-btn"
          title="Like"
        >
          ♥ Like
        </button>
        <button
          onClick={onRepost}
          className="action-btn repost-btn"
          title="Repost"
        >
          🔄 Repost
        </button>
        <button
          onClick={fetchComments}
          className="action-btn comments-btn"
          title="Comments"
        >
          💬 {comments.length > 0 ? comments.length : "Replies"}
        </button>
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="action-btn reply-btn"
          title="Reply"
        >
          ↩️ Reply
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentsSection
          comments={comments}
          isLoading={loading}
          error={error}
        />
      )}

      {/* Reply Input */}
      {showReplyInput && (
        <ReplyInput
          onSubmit={handleReply}
          isLoading={loading}
          placeholder={`Reply to ${author}...`}
        />
      )}

      <style jsx>{`
        .post-card {
          background: linear-gradient(135deg, rgba(0, 30, 60, 0.6), rgba(0, 50, 100, 0.3));
          border: 1px solid rgba(100, 200, 255, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .post-card:hover {
          background: linear-gradient(135deg, rgba(0, 30, 60, 0.8), rgba(0, 50, 100, 0.5));
          border-color: rgba(100, 200, 255, 0.5);
          box-shadow: 0 8px 24px rgba(0, 153, 255, 0.1);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .author-name {
          margin: 0;
          font-family: "Cormorant Garamond", serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.5px;
        }

        .author-handle {
          font-family: "DM Mono", monospace;
          color: #64c8ff;
          font-size: 0.9rem;
        }

        .post-time {
          font-family: "DM Mono", monospace;
          color: #888;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        .follow-btn {
          background: linear-gradient(135deg, #0099ff, #00ccff);
          color: #001a33;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-family: "Cormorant Garamond", serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 153, 255, 0.2);
        }

        .follow-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 153, 255, 0.4);
        }

        .follow-btn.following {
          background: rgba(100, 200, 255, 0.2);
          color: #64c8ff;
          border: 1px solid rgba(100, 200, 255, 0.5);
        }

        .follow-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .post-content {
          margin-bottom: 1rem;
        }

        .post-text {
          color: #c0c0c0;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .images-grid {
          display: grid;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .images-grid-1 {
          grid-template-columns: 1fr;
        }

        .images-grid-2 {
          grid-template-columns: 1fr 1fr;
        }

        .images-grid-3 {
          grid-template-columns: 2fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .images-grid-3 > :nth-child(2) {
          grid-column: 2;
          grid-row: 1 / 3;
        }

        .images-grid-4 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .image-wrapper {
          overflow: hidden;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.3);
          aspect-ratio: 1;
        }

        .post-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .image-wrapper:hover .post-image {
          transform: scale(1.05);
        }

        .post-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(100, 200, 255, 0.15);
        }

        .stat {
          font-family: "DM Mono", monospace;
          font-size: 0.9rem;
          color: #888;
        }

        .post-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .action-btn {
          background: rgba(100, 200, 255, 0.1);
          color: #64c8ff;
          border: 1px solid rgba(100, 200, 255, 0.3);
          padding: 0.6rem 0.75rem;
          border-radius: 4px;
          font-family: "DM Mono", monospace;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(100, 200, 255, 0.2);
          border-color: rgba(100, 200, 255, 0.6);
          transform: translateY(-1px);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .like-btn:hover {
          color: #ff6b9d;
          border-color: rgba(255, 107, 157, 0.5);
          background: rgba(255, 107, 157, 0.1);
        }

        .repost-btn:hover {
          color: #64ff64;
          border-color: rgba(100, 255, 100, 0.5);
          background: rgba(100, 255, 100, 0.1);
        }

        .comments-btn:hover {
          color: #ffff00;
          border-color: rgba(255, 255, 0, 0.5);
          background: rgba(255, 255, 0, 0.1);
        }

        .reply-btn:hover {
          color: #ff9900;
          border-color: rgba(255, 153, 0, 0.5);
          background: rgba(255, 153, 0, 0.1);
        }

        @media (max-width: 640px) {
          .post-actions {
            grid-template-columns: repeat(2, 1fr);
          }

          .post-header {
            flex-direction: column;
            gap: 1rem;
          }

          .follow-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
