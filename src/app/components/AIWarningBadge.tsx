/**
 * AI Warning Badge Component - Baleen Themed
 * Shows when a post is flagged for AI content
 * Styled with teal glow and whale filter metaphor
 */

import { useState } from 'react';

interface AIWarningProps {
  aiScore?: number; // 1-10
  isWarning?: boolean;
  isBlocked?: boolean;
  evidence?: string[];
  onDismiss?: () => void;
}

export function AIWarningBadge({ aiScore, isWarning, isBlocked, evidence, onDismiss }: AIWarningProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!isWarning && !isBlocked) {
    return null; // No warning, don't show anything
  }

  const getScoreIntensity = (score?: number) => {
    if (!score) return 0.3;
    return Math.min(score / 10, 1); // 0-1
  };

  const intensity = getScoreIntensity(aiScore);

  return (
    <div
      style={{
        border: `2px solid rgba(0, 217, 255, ${0.6 + intensity * 0.4})`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: `rgba(0, 217, 255, ${0.05})`,
        boxShadow: `0 0 ${12 + intensity * 8}px rgba(0, 217, 255, ${0.3 + intensity * 0.3}), inset 0 0 8px rgba(0, 217, 255, 0.1)`,
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{
            fontSize: '20px',
            textShadow: '0 0 8px rgba(0, 217, 255, 0.8)',
          }}>🐋</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00d9ff 0%, #0099ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Filter Engaged
          </span>
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #00d9ff 0%, #0099ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: `0 0 ${8 + intensity * 4}px rgba(0, 217, 255, 0.8)`,
        }}>
          {aiScore}/10
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: '13px',
        color: '#a3e4e0',
        marginBottom: '12px',
        lineHeight: '1.5',
      }}>
        {isBlocked 
          ? "🐋 Your baleen filter caught this post. Based on reply analysis, it shows signs of AI-generated content."
          : "🐋 Your baleen filter detected potential AI content. Reviews show suspicious patterns."}
      </p>

      {/* Evidence */}
      {evidence && evidence.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            style={{
              fontSize: '12px',
              color: '#00d9ff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#14b8a6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#00d9ff')}
          >
            {showEvidence ? '▼ Hide evidence' : '▶ Show evidence'}
          </button>
          {showEvidence && (
            <div style={{
              fontSize: '11px',
              color: '#7dd3d0',
              marginTop: '8px',
              paddingLeft: '12px',
              borderLeft: '2px solid rgba(0, 217, 255, 0.4)',
            }}>
              {evidence.map((e, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>• {e}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Button */}
      <button
        onClick={onDismiss}
        style={{
          width: '100%',
          background: 'linear-gradient(to br, #14b8a6, #06b6d4)',
          color: '#000',
          fontWeight: 'bold',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 217, 255, 0.5)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: `0 0 8px rgba(0, 217, 255, 0.3)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 217, 255, 0.6)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 217, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🐋 Lift Filter
      </button>
    </div>
  );
}
