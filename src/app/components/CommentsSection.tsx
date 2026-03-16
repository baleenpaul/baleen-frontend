"use client";

import React from "react";

interface Comment {
  id: string;
  author: string;
  authorHandle: string;
  text: string;
  timestamp: string;
  likeCount: number;
}

interface CommentsSectionProps {
  comments: Comment[];
  isLoading: boolean;
  error?: string | null;
}

export function CommentsSection({
  comments,
  isLoading,
  error,
}: CommentsSectionProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="comments-section-loading">
        <div className="spinner" />
        <p>Fetching replies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments-section-error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="comments-section-empty">
        <p>No replies yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Replies ({comments.length})</h3>
        <div className="header-divider" />
      </div>

      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={comment.id || index} className="comment-item">
            <div className="comment-author-line">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-handle">@{comment.authorHandle}</span>
              <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
            <div className="comment-stats">
              <span className="like-count">♥ {comment.likeCount}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .comments-section {
          margin-top: 1rem;
          padding: 1rem 0;
          border-top: 1px solid #e5e7eb;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .comments-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .comments-header h3 {
          font-family: "Cormorant Garamond", serif;
          font-size: 1.2rem;
          color: #0d9488;
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .header-divider {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            #0d9488,
            transparent
          );
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment-item {
          padding: 0.75rem;
          background: #f3f4f6;
          border-left: 2px solid #14b8a6;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .comment-item:hover {
          background: #e5e7eb;
          border-left-color: #0d9488;
        }

        .comment-author-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .comment-author {
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #1f2937;
        }

        .comment-handle {
          font-family: "DM Mono", monospace;
          color: #0d9488;
          font-size: 0.85rem;
        }

        .comment-time {
          font-family: "DM Mono", monospace;
          color: #6b7280;
          font-size: 0.8rem;
          margin-left: auto;
        }

        .comment-text {
          color: #374151;
          margin: 0.5rem 0 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .comment-stats {
          margin-top: 0.5rem;
          font-family: "DM Mono", monospace;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .like-count {
          cursor: pointer;
          transition: color 0.2s;
        }

        .like-count:hover {
          color: #ff6b9d;
        }

        .comments-section-loading,
        .comments-section-error,
        .comments-section-empty {
          padding: 1.5rem;
          text-align: center;
          color: #6b7280;
          font-family: "Cormorant Garamond", serif;
          border-top: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .comments-section-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #0d9488;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .comments-section-error {
          color: #dc2626;
        }

        .comments-section-empty {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
