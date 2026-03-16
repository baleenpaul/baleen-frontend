"use client";

import React, { useState } from "react";

interface ReplyInputProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export function ReplyInput({
  onSubmit,
  isLoading,
  placeholder = "Reply to this post...",
}: ReplyInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    if (text.length > 300) {
      setError("Reply must be less than 300 characters");
      return;
    }

    try {
      setError(null);
      await onSubmit(text);
      setText("");
    } catch (err: any) {
      setError(err.message || "Failed to send reply");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reply-input-container">
      <div className="reply-input-wrapper">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          disabled={isLoading}
          maxLength={300}
          rows={2}
          className="reply-textarea"
        />
        <div className="reply-footer">
          <span className="char-count">
            {text.length}/300
          </span>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="reply-submit-btn"
          >
            {isLoading ? "Sending..." : "Reply"}
          </button>
        </div>
      </div>

      {error && <div className="reply-error">{error}</div>}

      <style jsx>{`
        .reply-input-container {
          margin-top: 1rem;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reply-input-wrapper {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .reply-input-wrapper:focus-within {
          background: #ffffff;
          border-color: #0d9488;
          box-shadow: 0 0 12px rgba(13, 148, 136, 0.15);
        }

        .reply-textarea {
          width: 100%;
          background: transparent;
          border: none;
          color: #1f2937;
          font-family: "DM Mono", monospace;
          font-size: 0.95rem;
          resize: none;
          outline: none;
          line-height: 1.5;
        }

        .reply-textarea::placeholder {
          color: rgba(107, 114, 128, 0.6);
        }

        .reply-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reply-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .char-count {
          font-family: "DM Mono", monospace;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .reply-submit-btn {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: #ffffff;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-family: "Cormorant Garamond", serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
        }

        .reply-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
        }

        .reply-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .reply-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reply-error {
          color: #dc2626;
          font-family: "DM Mono", monospace;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(220, 38, 38, 0.1);
          border-left: 2px solid #dc2626;
          border-radius: 2px;
        }
      `}</style>
    </form>
  );
}
