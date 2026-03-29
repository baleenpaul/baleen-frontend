'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CredentialModal from '../components/CredentialModal';

export default function FeedsPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [connectedFeeds, setConnectedFeeds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<'bluesky' | 'mastodon' | null>(null);

  const feedSources = [
    { id: 'bluesky', emoji: '🦋', label: 'Bluesky' },
    { id: 'mastodon', emoji: '🐘', label: 'Mastodon' },
    { id: 'reddit', emoji: '🤖', label: 'Reddit' },
    { id: 'substack', emoji: '📰', label: 'Substack' },
    { id: 'twitter', emoji: '𝕏', label: 'Twitter' },
    { id: 'threads', emoji: '🧵', label: 'Threads' },
  ];

  const handleDragStart = (e: React.DragEvent, sourceId: string) => {
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('source', sourceId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const source = e.dataTransfer!.getData('source');
    setDragOver(false);

    // For Bluesky and Mastodon, always open credential modal (allows updating)
    if (source === 'bluesky' || source === 'mastodon') {
      setModalPlatform(source as 'bluesky' | 'mastodon');
      setModalOpen(true);
    } else if (source && !connectedFeeds.includes(source)) {
      // For other platforms, just add them (not yet implemented)
      setConnectedFeeds([...connectedFeeds, source]);
    }
  };

  const handleAddCredential = async (handle: string, token: string) => {
    if (!modalPlatform) return;

    const jwtToken = localStorage.getItem('baleen_token');
    if (!jwtToken) {
      throw new Error('Not authenticated. Please log in again.');
    }

    const response = await fetch('https://baleen-backend.onrender.com/auth/add-credential', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        platform: modalPlatform,
        handle,
        token,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to add credential');
    }

    // Add to connected feeds
    setConnectedFeeds([...connectedFeeds, modalPlatform]);
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100,
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#06b6d4',
            color: '#0f172a',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Go to Feed
        </button>
      </div>

      <div className="w-full h-full flex relative overflow-hidden" style={{ gap: '40px', padding: '60px 40px' }}>
        {/* Left panel: Social media icons */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            width: '200px',
          }}>
            {feedSources.map((source) => (
              <div
                key={source.id}
                draggable
                onDragStart={(e) => handleDragStart(e, source.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'grab',
                  transition: 'all 0.3s ease-in-out',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '32px', lineHeight: '1' }}>{source.emoji}</div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(0, 217, 255, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}>
                  {source.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Whale with drop zone */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: '100%',
          maxWidth: '500px',
        }}>
          {/* Whale image container */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <Image
              src="/images/whale.jpg"
              alt="whale drop zone"
              width={400}
              height={400}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.4))',
              }}
              priority
            />
          </div>

          {/* Drop zone at whale mouth */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '100px',
              border: dragOver ? '2px solid rgba(0, 217, 255, 0.95)' : '2px dashed rgba(0, 217, 255, 0.4)',
              borderRadius: '12px',
              background: dragOver ? 'rgba(0, 217, 255, 0.25)' : 'rgba(0, 217, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              boxShadow: dragOver ? '0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 20px rgba(0, 217, 255, 0.3)' : 'none',
            }}
          >
            <div style={{
              textAlign: 'center',
              fontSize: '9px',
              lineHeight: '1.2',
              fontWeight: 700,
              color: 'rgba(0, 217, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              DROP FEED
            </div>

            {connectedFeeds.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
              }}>
                {connectedFeeds.map((feed) => {
                  const source = feedSources.find((s) => s.id === feed);
                  return source ? (
                    <div
                      key={feed}
                      style={{
                        fontSize: '20px',
                        animation: 'pop-in 0.3s ease-out',
                      }}
                    >
                      {source.emoji}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>

      <CredentialModal
        platform={modalPlatform}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalPlatform(null);
        }}
        onSubmit={handleAddCredential}
      />
    </>
  );
}
