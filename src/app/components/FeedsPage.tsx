'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function FeedsPage() {
  const [dragOver, setDragOver] = useState(false);
  const [connectedFeeds, setConnectedFeeds] = useState<string[]>([]);

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
    
    if (source && !connectedFeeds.includes(source)) {
      setConnectedFeeds([...connectedFeeds, source]);
      console.log('Feed source dropped:', source);
    }
  };

  return (
    <div className="w-full h-full flex gap-10 p-15 items-center justify-between overflow-hidden">
      {/* Left panel: Social media icons grid */}
      <div className="flex-shrink-0 flex items-center justify-center h-full">
        <div className="grid grid-cols-2 gap-5" style={{ width: '200px' }}>
          {feedSources.map((source) => (
            <div
              key={source.id}
              className="flex flex-col items-center gap-2 p-4 bg-cyan-400 bg-opacity-5 border border-cyan-400 border-opacity-30 rounded hover:bg-opacity-15 hover:border-opacity-60 transition-all cursor-grab active:cursor-grabbing hover:scale-105"
              draggable
              onDragStart={(e) => handleDragStart(e, source.id)}
            >
              <div className="text-3xl leading-none">{source.emoji}</div>
              <div className="text-xs font-bold text-cyan-400 text-opacity-80 uppercase tracking-tighter text-center leading-tight">
                {source.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Whale illustration with drop zone */}
      <div className="flex-1 flex items-center justify-center relative h-full max-w-xl">
        {/* Whale image container */}
        <div className="w-full h-full flex items-center justify-center relative">
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

        {/* Drop zone positioned at whale's mouth */}
        <div
          className={`absolute transition-all rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer ${
            dragOver
              ? 'border-2 border-cyan-400 border-opacity-95 bg-cyan-400 bg-opacity-25'
              : 'border-2 border-dashed border-cyan-400 border-opacity-40 bg-cyan-400 bg-opacity-5 hover:bg-opacity-10 hover:border-opacity-60'
          }`}
          style={{
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '100px',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {dragOver && (
            <style>{`
              @keyframes dropZoneGlow {
                0%, 100% { box-shadow: 0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 20px rgba(0, 217, 255, 0.3); }
                50% { box-shadow: 0 0 40px rgba(0, 217, 255, 1), inset 0 0 30px rgba(0, 217, 255, 0.5); }
              }
            `}</style>
          )}
          
          <div className="text-center text-xs leading-tight font-bold text-cyan-400 text-opacity-70 uppercase tracking-wider">
            DROP FEED
          </div>

          {connectedFeeds.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center w-full">
              {connectedFeeds.map((feed) => {
                const source = feedSources.find((s) => s.id === feed);
                return source ? (
                  <div
                    key={feed}
                    className="text-xl"
                    style={{
                      animation: 'popIn 0.3s ease-out',
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

      {/* Animations */}
      <style>{`
        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
