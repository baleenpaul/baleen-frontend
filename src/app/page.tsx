'use client';

import { useState, useEffect } from 'react';

interface FeedItem {
  id: string;
  platform: 'bluesky' | 'mastodon';
  author: string;
  authorHandle: string;
  text: string;
  timestamp: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  images: string[];
}

export default function Home() {
  const [page, setPage] = useState<'landing' | 'feed' | 'control'>('landing');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [controlMode, setControlMode] = useState<'splash' | 'filter' | 'feeds'>('splash');

  // Landing page: show for 3 seconds then transition to feed
  useEffect(() => {
    if (page === 'landing') {
      const timer = setTimeout(() => {
        setPage('feed');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [page]);

  // Fetch feed data
  useEffect(() => {
    if (page === 'feed') {
      fetchFeed();
    }
  }, [page]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://baleen-backend.onrender.com/feed');
      const data = await response.json();
      if (data.items) {
        setFeed(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const platformColor = (platform: string) => {
    return platform === 'bluesky' ? '#1185FE' : '#6364FF';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Landing Page */}
      {page === 'landing' && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-slate-950 via-black to-slate-900">
          <style>{`
            @keyframes fadeInScale {
              0% { opacity: 0; transform: scale(0.8); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes dissolveOut {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
            .landing-whale {
              animation: fadeInScale 0.8s ease-out;
              font-size: 120px;
              margin-bottom: 20px;
            }
            .landing-logo {
              animation: fadeInScale 0.8s ease-out 0.2s both;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }
            .landing-text {
              animation: fadeInScale 0.8s ease-out 0.4s both;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 3px;
              text-transform: uppercase;
              background: linear-gradient(135deg, #00d9ff 0%, #0099ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
          `}</style>
          <div className="landing-whale">🐋</div>
          <div className="landing-logo">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50">
              <span className="text-3xl font-black text-black">IIB</span>
            </div>
          </div>
          <div className="landing-text">Baleen</div>
        </div>
      )}

      {/* Control Panel */}
      {page === 'control' && (
        <div className="fixed inset-0 z-40 bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-y-auto">
          <ControlPanel mode={controlMode} setMode={setControlMode} onBack={() => setPage('feed')} />
        </div>
      )}

      {/* Live Feed */}
      {page === 'feed' && (
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-gradient-to-b from-black via-black to-transparent backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => setPage('control')}>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-lg font-bold text-black">IIB</span>
              </div>
              <span className="font-bold text-sm uppercase letter-spacing-2">Baleen</span>
            </div>
            <button
              onClick={() => fetchFeed()}
              className="px-3 py-2 text-xs uppercase font-bold text-teal-400 hover:bg-teal-500/10 rounded-lg transition"
            >
              Refresh
            </button>
          </div>

          {/* Feed */}
          <div className="divide-y divide-slate-800">
            {loading ? (
              <div className="py-20 text-center text-slate-400">Loading feed...</div>
            ) : (
              feed.map((post) => (
                <div
                  key={post.id}
                  className="px-4 py-4 hover:bg-slate-900/50 transition cursor-pointer border-l-2 border-l-transparent hover:border-l-cyan-500/50"
                >
                  {/* Author Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: platformColor(post.platform) + '20', borderColor: platformColor(post.platform), borderWidth: '2px' }}>
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{post.author}</span>
                        <span className="text-slate-500 text-sm">@{post.authorHandle}</span>
                        <span className="text-xs text-slate-600">{formatDate(post.timestamp)}</span>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: platformColor(post.platform) + '20', color: platformColor(post.platform) }}>
                          {post.platform === 'bluesky' ? '🦋' : '🐘'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-slate-100 leading-relaxed mb-3 break-words">{post.text}</p>

                  {/* Images */}
                  {post.images.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Post image"
                          className="rounded-lg w-full max-h-96 object-cover bg-slate-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-6 text-slate-500 text-sm">
                    <span className="hover:text-cyan-400 transition">💬 {post.replyCount}</span>
                    <span className="hover:text-cyan-400 transition">🔄 {post.repostCount}</span>
                    <span className="hover:text-cyan-400 transition">❤️ {post.likeCount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlPanel({
  mode,
  setMode,
  onBack,
}: {
  mode: 'splash' | 'filter' | 'feeds';
  setMode: (mode: 'splash' | 'filter' | 'feeds') => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition font-bold"
      >
        ← Back
      </button>

      <div className="max-w-2xl w-full">
        {mode === 'splash' && <SplashPage setMode={setMode} />}
        {mode === 'filter' && <FilterPage setMode={setMode} />}
        {mode === 'feeds' && <FeedsPage setMode={setMode} />}
      </div>
    </div>
  );
}

function SplashPage({ setMode }: { setMode: (mode: 'filter' | 'feeds') => void }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-8">🐋</div>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">BALEEN</h1>
      <p className="text-slate-400 mb-12 text-lg">Unified Social Media Aggregator</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('filter')}
          className="p-6 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition">🎛️</div>
          <div className="font-bold mb-2">Filter</div>
          <div className="text-xs text-slate-400">Customize your feed</div>
        </button>

        <button
          onClick={() => setMode('feeds')}
          className="p-6 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition">📡</div>
          <div className="font-bold mb-2">Sources</div>
          <div className="text-xs text-slate-400">Connect accounts</div>
        </button>
      </div>
    </div>
  );
}

function FilterPage({ setMode }: { setMode: (mode: 'splash') => void }) {
  const [filters, setFilters] = useState({
    ai: 50,
    ad: 50,
    w1: 50,
    b1: 50,
    b2: 50,
    cu: 50,
  });

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Filter Controls</h2>

      <div className="space-y-6">
        {Object.entries(filters).map(([key, value]) => (
          <div key={key} className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold uppercase text-sm">{key}</label>
              <span className="text-cyan-400 font-bold">{value}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setFilters({ ...filters, [key]: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setMode('splash')}
        className="mt-12 w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
      >
        Back to Menu
      </button>
    </div>
  );
}

function FeedsPage({ setMode }: { setMode: (mode: 'splash') => void }) {
  const sources = [
    { name: 'Bluesky', emoji: '🦋', connected: true },
    { name: 'Mastodon', emoji: '🐘', connected: true },
    { name: 'Threads', emoji: '🧵', connected: false },
    { name: 'Twitter/X', emoji: '𝕏', connected: false },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Feed Sources</h2>

      <div className="grid grid-cols-2 gap-4 mb-12">
        {sources.map((source) => (
          <div
            key={source.name}
            className={`p-6 rounded-lg border-2 transition cursor-pointer ${
              source.connected ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-800/30 border-slate-700 opacity-50'
            }`}
          >
            <div className="text-4xl mb-3">{source.emoji}</div>
            <div className="font-bold mb-1">{source.name}</div>
            <div className="text-xs text-slate-400">{source.connected ? '✓ Connected' : 'Not connected'}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setMode('splash')}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
      >
        Back to Menu
      </button>
    </div>
  );
}
