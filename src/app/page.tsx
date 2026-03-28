'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AIWarningBadge } from './components/AIWarningBadge';

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
  // AI Detection fields
  aiScore?: number;
  isAI?: boolean;
  aiEvidence?: string[];
  aiWarning?: boolean;
  aiBlocked?: boolean;
}

export default function InteractivePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<'landing' | 'feed' | 'control'>('landing');
  const [currentMode, setCurrentMode] = useState('splash');
  
  // Load initial bar values from localStorage
  const [barValues, setBarValues] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('baleen-filter-values');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [50, 50, 50, 50, 50, 50];
        }
      }
    }
    return [50, 50, 50, 50, 50, 50];
  });
  
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [liftedFilters, setLiftedFilters] = useState<Set<string>>(new Set());
  const dragStateRef = useRef({ active: false, bar: null as number | null, barRect: null as DOMRect | null });

  // Save filter settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('baleen-filter-values', JSON.stringify(barValues));
  }, [barValues]);

  // Landing page: show for 5 seconds then transition to feed
  useEffect(() => {
    if (page === 'landing') {
      const timer = setTimeout(() => {
        setPage('feed');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [page]);

  // Initial fetch when landing on feed page
  useEffect(() => {
    if (page === 'feed') {
      fetchFeed();
    }
  }, [page]);

  // Refetch feed when filters change (while on feed page)
  useEffect(() => {
    if (page === 'feed') {
      fetchFeed();
    }
  }, [barValues]);

  const fetchFeed = async () => {
    try {
      setFeedLoading(true);
      // Wire filter bars to API: barValues[0] = AI Slop sensitivity (0-100)
      const aiSensitivity = Math.round(barValues[0]);
      const params = new URLSearchParams();
      params.append('filterAI', 'true');
      params.append('sensitivity', aiSensitivity.toString());
      const filterUrl = `https://baleen-backend.onrender.com/feed?${params.toString()}`;
      const response = await fetch(filterUrl);
      const data = await response.json();
      if (data.items) {
        // Sort by timestamp descending (newest first)
        const sorted = data.items.sort((a: FeedItem, b: FeedItem) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setFeed(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setFeedLoading(false);
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

  const goToFilterPage = () => {
    if (currentMode === 'splash') {
      setCurrentMode('filter');
    }
  };

  const goToFeedPage = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (currentMode === 'splash') {
      setCurrentMode('feeds');
    }
  };

  const goToSplash = () => {
    setCurrentMode('splash');
  };

  useEffect(() => {
    barValues.forEach((value: number, index: number) => {
      updateBar(index, value);
    });
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      const target = (e.target as HTMLElement);
      const filterBarText = target.closest('[data-bar-text]');
      
      if (filterBarText) {
        const container = filterBarText.closest('[data-bar]');
        if (container) {
          dragStateRef.current.active = true;
          dragStateRef.current.bar = parseInt(container.getAttribute('data-bar') || '0');
          dragStateRef.current.barRect = container.getBoundingClientRect();
          if (e instanceof MouseEvent) {
            e.preventDefault();
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.active || !dragStateRef.current.barRect || dragStateRef.current.bar === null) return;
      const barHeight = dragStateRef.current.barRect.height;
      const relativY = e.clientY - dragStateRef.current.barRect.top;
      let newValue = ((barHeight - relativY) / barHeight) * 100;
      newValue = Math.max(0, Math.min(100, newValue));
      
      const newBarValues = [...barValues];
      newBarValues[dragStateRef.current.bar] = newValue;
      setBarValues(newBarValues);
      updateBar(dragStateRef.current.bar, newValue);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStateRef.current.active || !dragStateRef.current.barRect || dragStateRef.current.bar === null) return;
      const barHeight = dragStateRef.current.barRect.height;
      const touch = e.touches[0];
      const relativY = touch.clientY - dragStateRef.current.barRect.top;
      let newValue = ((barHeight - relativY) / barHeight) * 100;
      newValue = Math.max(0, Math.min(100, newValue));
      
      const newBarValues = [...barValues];
      newBarValues[dragStateRef.current.bar] = newValue;
      setBarValues(newBarValues);
      updateBar(dragStateRef.current.bar, newValue);
    };

    const handleMouseUp = () => {
      dragStateRef.current.active = false;
      dragStateRef.current.bar = null;
      dragStateRef.current.barRect = null;
    };

    document.addEventListener('mousedown', handleMouseDown as any);
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown as any);
    document.addEventListener('touchmove', handleTouchMove as any);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown as any);
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleMouseDown as any);
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [barValues]);

  const updateBar = (barIndex: number, value: number) => {
    const barContainer = containerRef.current?.querySelector(`[data-bar="${barIndex}"]`);
    if (!barContainer) return;
    
    const text = barContainer.querySelector('.filter-bar-text') as HTMLElement;
    const fill = barContainer.querySelector('.filter-bar-fill') as HTMLElement;
    
    if (text) text.style.top = (100 - value) + '%';
    if (fill) {
      fill.style.height = value + '%';
      const opacity = (value / 100) * 0.8;
      fill.style.background = `linear-gradient(180deg, rgba(0, 217, 255, ${opacity}), rgba(0, 217, 255, ${opacity * 0.25}))`;
    }
  };

  const handleWhaleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const zone = e.currentTarget as HTMLElement;
    zone.classList.add('drag-over');
  };

  const handleWhaleDragLeave = (e: React.DragEvent) => {
    const zone = e.currentTarget as HTMLElement;
    zone.classList.remove('drag-over');
  };

  const handleWhaleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const source = e.dataTransfer.getData('source');
    const zone = e.currentTarget as HTMLElement;
    zone.classList.remove('drag-over');
    console.log('Feed source dropped:', source);
  };

  const handleFeedIconDragStart = (e: React.DragEvent, sourceId: string) => {
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('source', sourceId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* Landing Page */
        .landing-page {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-50;
          background: linear-gradient(to br, #0f0f1e, #000000, #1a0f2e);
          animation: landingFadeOut 1s ease-in 4s forwards;
        }

        @keyframes landingFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        .landing-whale {
          animation: fadeInScale 0.8s ease-out;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        @media (max-width: 480px) {
          .landing-whale {
            width: 120px;
            height: 120px;
            margin-bottom: 12px;
          }
        }

        .landing-logo {
          animation: fadeInScale 0.8s ease-out 0.2s both;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(to br, #14b8a6, #06b6d4);
          border-radius: 20px;
          box-shadow: 0 0 40px rgba(0, 217, 255, 0.5);
        }

        @media (max-width: 480px) {
          .landing-logo {
            width: 50px;
            height: 50px;
            border-radius: 12px;
          }
        }
          margin-bottom: 20px;
        }

        .landing-logo-text {
          font-size: 32px;
          font-weight: 900;
          color: #000;
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
          margin-bottom: 12px;
        }

        .landing-tagline {
          animation: fadeInScale 0.8s ease-out 0.6s both;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 1px;
          color: rgba(0, 217, 255, 0.6);
          text-transform: uppercase;
          text-align: center;
        }

        /* Live Feed */
        .live-feed {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 8px;
        }

        @media (max-width: 768px) {
          .live-feed {
            max-width: 100%;
            padding: 0 4px;
          }
        }

        @media (max-width: 480px) {
          .live-feed {
            max-width: 100%;
            padding: 0 2px;
          }
        }

        .feed-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.8));
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 217, 255, 0.2);
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .feed-header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: opacity 0.3s;
        }

        .feed-header-logo:hover {
          opacity: 0.8;
        }

        .feed-header-logo-box {
          width: 40px;
          height: 40px;
          background: linear-gradient(to br, #14b8a6, #06b6d4);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
          font-weight: 900;
          font-size: 14px;
          color: #000;
        }

        .feed-header-text {
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: linear-gradient(135deg, #00d9ff 0%, #0099ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feed-refresh {
          padding: 8px 12px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          color: rgba(0, 217, 255, 0.8);
          border: 1px solid rgba(0, 217, 255, 0.3);
          background: rgba(0, 217, 255, 0.05);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .feed-refresh:hover {
          background: rgba(0, 217, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.6);
        }

        .feed-loading {
          padding: 80px 20px;
          text-align: center;
          color: rgba(0, 217, 255, 0.6);
        }

        .feed-post {
          border-bottom: 1px solid rgba(0, 217, 255, 0.1);
          padding: 16px;
          transition: all 0.3s;
          cursor: pointer;
          border-left: 2px solid transparent;
        }

        .feed-post:hover {
          background: rgba(0, 217, 255, 0.05);
          border-left-color: rgba(0, 217, 255, 0.3);
        }

        .feed-post-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .feed-post-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid currentColor;
          flex-shrink: 0;
          font-size: 14px;
        }

        .feed-post-info {
          flex: 1;
        }

        .feed-post-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .feed-post-author {
          font-weight: bold;
          color: white;
        }

        .feed-post-handle {
          color: rgba(255, 255, 255, 0.5);
        }

        .feed-post-time {
          color: rgba(255, 255, 255, 0.4);
        }

        .feed-post-platform {
          font-size: 20px;
          padding: 8px 12px;
          border-radius: 4px;
          font-weight: bold;
        }

        .feed-post-text {
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.5;
          margin-bottom: 12px;
          word-break: break-word;
        }

        .feed-post-images {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
        }

        .feed-post-images.multi {
          grid-template-columns: 1fr 1fr;
        }

        .feed-post-images img {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
          background: rgba(0, 217, 255, 0.1);
        }

        .feed-post-stats {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .feed-post-stats span:hover {
          color: rgba(0, 217, 255, 0.8);
        }

        /* Control Panel */
        .control-panel {
          position: fixed;
          inset: 0;
          z-40;
          background: linear-gradient(to br, #0a1f3a, #0f1a2a, #1a0f2e);
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .interactive-container {
          width: 100%;
          max-width: 1000px;
          height: 700px;
          background: linear-gradient(180deg, #0a1f3a 0%, #0f1a2a 40%, #1a0f2e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          border: 0.5px solid rgba(0, 217, 255, 0.15);
        }

        @media (max-width: 768px) {
          .interactive-container {
            max-width: 100%;
            height: auto;
            min-height: 100vh;
            border-radius: 0;
            border: none;
          }
        }

        @media (max-width: 480px) {
          .interactive-container {
            max-width: 100%;
            height: auto;
            min-height: 100vh;
          }
        }

        .logo {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 100;
          cursor: pointer;
        }

        .logo:hover {
          opacity: 0.8;
        }

        .logo-text {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          background: linear-gradient(135deg, #00d9ff 0%, #0099ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .back-button {
          position: absolute;
          bottom: 40px;
          left: 40px;
          padding: 10px 20px;
          background: rgba(0, 217, 255, 0.1);
          border: 1px solid rgba(0, 217, 255, 0.5);
          color: rgba(0, 217, 255, 0.8);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease-in-out;
          z-index: 100;
          display: none;
        }

        .filter-mode .back-button, .feed-mode .back-button { display: block; }

        .back-button:hover {
          background: rgba(0, 217, 255, 0.2);
          border-color: rgba(0, 217, 255, 0.9);
        }

        .filter-wall {
          display: grid;
          grid-template-columns: auto 60px 60px 60px 60px 60px 60px auto;
          gap: 20px;
          height: 80%;
          max-height: 520px;
          position: relative;
          align-items: center;
          justify-content: center;
        }

        .feed-mode .filter-wall { display: none !important; }

        @media (max-width: 480px) {
          .filter-wall {
            transform: scale(0.6);
            gap: 8px;
            max-height: 300px;
          }
        }

        .decorative-side {
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: 0.35;
          transition: opacity 0.6s ease-in-out;
        }

        .filter-mode .decorative-side { opacity: 0; }

        .mini-strand {
          width: 1.5px;
          height: 180px;
          background: linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent);
          box-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
          animation: pulse-mini 2.5s infinite;
        }

        .mini-strand:nth-child(1) { animation-delay: 0s; }
        .mini-strand:nth-child(2) { animation-delay: 0.3s; }
        .mini-strand:nth-child(3) { animation-delay: 0.6s; }

        @keyframes pulse-mini {
          0%, 100% { opacity: 0.35; box-shadow: 0 0 8px rgba(0, 217, 255, 0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 14px rgba(0, 217, 255, 0.7); }
        }

        .grid-item {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .letter-strand {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.6));
          animation: pulse-letter 2.8s infinite;
          cursor: pointer;
          transition: all 0.6s ease-in-out;
          opacity: 1;
          pointer-events: all;
        }

        .letter-strand:hover { transform: scale(1.05); }
        .filter-mode .letter-strand { opacity: 0; pointer-events: none; }

        .letter-strand:nth-of-type(1) { animation-delay: 0s; }
        .letter-strand:nth-of-type(2) { animation-delay: 0.3s; }
        .letter-strand:nth-of-type(3) { animation-delay: 0.6s; }
        .letter-strand:nth-of-type(4) { animation-delay: 0.9s; }
        .letter-strand:nth-of-type(5) { animation-delay: 1.2s; }
        .letter-strand:nth-of-type(6) { animation-delay: 1.5s; }

        @keyframes pulse-letter {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.9)) drop-shadow(0 0 35px rgba(0, 153, 255, 0.5)); }
        }

        .letter-text {
          font-size: 120px;
          font-weight: 700;
          color: #00d9ff;
          text-shadow: 0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 153, 255, 0.4);
          line-height: 1;
          transform: scaleY(4.8) scaleX(0.16);
          transform-origin: center;
          white-space: nowrap;
        }

        .filter-bar { height: 420px; width: 30px; opacity: 0; pointer-events: none; transition: all 0.6s ease-in-out; visibility: hidden; position: relative; }

        .grid-item:nth-child(2) .filter-bar { margin-left: -48px; }
        .grid-item:nth-child(3) .filter-bar { margin-left: -42.6px; }
        .grid-item:nth-child(4) .filter-bar { margin-left: -52.2px; }
        .grid-item:nth-child(5) .filter-bar { margin-left: -51.8px; }
        .grid-item:nth-child(6) .filter-bar { margin-left: -51.4px; }
        .grid-item:nth-child(7) .filter-bar { margin-left: -51px; }

        .filter-mode .filter-bar { opacity: 1; pointer-events: all; visibility: visible; }

        .filter-bar-outline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(0, 217, 255, 0.6);
          border-radius: 8px;
          background: rgba(0, 217, 255, 0.05);
          pointer-events: none;
          box-sizing: border-box;
        }

        .filter-bar-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background: linear-gradient(180deg, rgba(0, 217, 255, 0.8), rgba(0, 217, 255, 0.2));
          border-radius: 6px;
          transition: height 0.05s ease-out;
          pointer-events: none;
        }

        .filter-bar-text {
          position: absolute;
          width: 100%;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          line-height: 1.1;
          transform: translateX(-50%) rotate(180deg);
          cursor: grab;
          user-select: none;
          z-index: 10;
          left: 50%;
          top: 50%;
        }

        .filter-bar-text:active { cursor: grabbing; }

        .bubble {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          opacity: 1;
          pointer-events: all;
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
          animation: float-feeds 6s ease-in-out infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          margin-left: 35px;
        }

        .bubble-f { background: rgba(0, 217, 255, 0.2); color: #00d9ff; animation-delay: 0s; }
        .bubble-e1 { background: rgba(0, 153, 255, 0.2); color: #0099ff; animation-delay: 0.8s; }
        .bubble-e2 { background: rgba(0, 217, 255, 0.15); color: #00d9ff; animation-delay: 1.6s; }
        .bubble-d { background: rgba(0, 153, 255, 0.15); color: #0099ff; animation-delay: 2.4s; }
        .bubble-s { background: rgba(0, 217, 255, 0.2); color: #00d9ff; animation-delay: 3.2s; }

        @keyframes float-feeds {
          0% { transform: translate(-50%, calc(-50% - 120px)); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translate(-50%, -50%); }
          85% { opacity: 1; }
          100% { transform: translate(-50%, calc(-50% + 120px)); opacity: 0; }
        }

        .filter-mode .bubble { opacity: 0 !important; pointer-events: none; animation: none !important; }
        .feed-mode .bubble { opacity: 0 !important; pointer-events: none; animation: none !important; }

        .feeds-page {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.6s ease-in-out;
          overflow: hidden;
          gap: 40px;
          padding: 60px 40px;
          align-items: center;
          justify-content: space-between;
        }

        .feed-mode .feeds-page { opacity: 1; pointer-events: all; }

        .feeds-left-panel {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .feeds-icons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 200px;
        }

        .feeds-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: radial-gradient(circle at 30% 30%, rgba(0, 217, 255, 0.3), rgba(0, 217, 255, 0.05));
          border: 1px solid rgba(0, 217, 255, 0.4);
          border-radius: 50%;
          cursor: grab;
          user-select: none;
          width: 100px;
          height: 100px;
          justify-content: center;
          box-shadow: 0 0 25px rgba(0, 217, 255, 0.2), inset -10px -10px 20px rgba(0, 0, 0, 0.3), inset 5px 5px 15px rgba(0, 217, 255, 0.1);
          animation: float-icon 4s ease-in-out infinite;
          transition: all 0.3s ease-in-out;
        }

        @keyframes float-icon {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 25px rgba(0, 217, 255, 0.2), inset -10px -10px 20px rgba(0, 0, 0, 0.3), inset 5px 5px 15px rgba(0, 217, 255, 0.1); }
          50% { transform: translateY(-15px); box-shadow: 0 0 40px rgba(0, 217, 255, 0.4), inset -10px -10px 20px rgba(0, 0, 0, 0.3), inset 5px 5px 15px rgba(0, 217, 255, 0.2); }
        }

        .feeds-icon:hover {
          background: radial-gradient(circle at 30% 30%, rgba(0, 217, 255, 0.5), rgba(0, 217, 255, 0.1));
          border-color: rgba(0, 217, 255, 0.7);
          transform: scale(1.15);
          box-shadow: 0 0 50px rgba(0, 217, 255, 0.5), inset -10px -10px 20px rgba(0, 0, 0, 0.4), inset 8px 8px 20px rgba(0, 217, 255, 0.2);
        }

        .feeds-icon-emoji {
          font-size: 40px;
          line-height: 1;
        }

        .feeds-icon-label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(0, 217, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
          line-height: 1.2;
        }

        .whale-right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 100%;
          max-width: 500px;
        }

        .whale-svg-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .whale-mouth-zone {
          position: absolute;
          bottom: 35%;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 100px;
          border: 2px dashed rgba(0, 217, 255, 0.4);
          border-radius: 12px;
          background: rgba(0, 217, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease-in-out;
          cursor: pointer;
        }

        .whale-mouth-zone:hover {
          border-color: rgba(0, 217, 255, 0.6);
          background: rgba(0, 217, 255, 0.1);
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
        }

        .whale-mouth-zone.drag-over {
          border-color: rgba(0, 217, 255, 0.95);
          background: rgba(0, 217, 255, 0.25);
          box-shadow: 0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 20px rgba(0, 217, 255, 0.3);
          border-style: solid;
        }

        .feeds-label {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(0, 217, 255, 0.6);
          font-size: 12px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.6s ease-in-out;
          z-index: 20;
        }

        .feed-mode .feeds-label { opacity: 1; }

        .filter-label {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(0, 217, 255, 0.6);
          font-size: 12px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.6s ease-in-out;
          z-index: 20;
        }

        .filter-mode .filter-label { opacity: 1; }
      `}</style>

      {/* Landing Page */}
      {page === 'landing' && (
        <div className="landing-page">
          <div className="landing-whale">
            <Image
              src="/images/whale.jpg"
              alt="whale"
              width={300}
              height={300}
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(0, 217, 255, 0.6))' }}
              priority
            />
          </div>
          <div className="landing-logo">
            <Image
              src="/images/IIB_logo.png"
              alt="IIB Baleen"
              width={80}
              height={80}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="landing-text">Baleen</div>
          <div className="landing-tagline">Unified Feed, without the noise</div>
        </div>
      )}

      {/* Live Feed */}
      {page === 'feed' && (
        <div className="live-feed">
          <div className="feed-header">
            <div className="feed-header-logo" onClick={() => setPage('control')}>
              <Image
                src="/images/IIB_logo.png"
                alt="IIB Baleen"
                width={50}
                height={50}
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
            </div>
            <button className="feed-refresh" onClick={() => fetchFeed()}>Refresh</button>
          </div>

          {feedLoading ? (
            <div className="feed-loading">Filtering feed...</div>
          ) : feed.length === 0 ? (
            <div className="feed-loading">No posts found</div>
          ) : (
            feed.map((post) => {
              const filterLifted = liftedFilters.has(post.id);
              const showWarning = post.aiWarning && !filterLifted;

              return (
                <div key={post.id}>
                  {showWarning && (
                    <AIWarningBadge
                      aiScore={post.aiScore}
                      isWarning={true}
                      isBlocked={false}
                      evidence={post.aiEvidence}
                      onDismiss={() => {
                        setLiftedFilters(prev => new Set([...prev, post.id]));
                      }}
                    />
                  )}
                  
                  <div className="feed-post">
                    <div className="feed-post-header">
                      <div className="feed-post-avatar" style={{ color: platformColor(post.platform) }}>
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="feed-post-info">
                        <div className="feed-post-meta">
                          <span className="feed-post-author">{post.author}</span>
                          <span className="feed-post-handle">@{post.authorHandle}</span>
                          <span className="feed-post-time">{formatDate(post.timestamp)}</span>
                          <span className="feed-post-platform" style={{ backgroundColor: platformColor(post.platform) + '20', color: platformColor(post.platform) }}>
                            {post.platform === 'bluesky' ? '🦋' : '🐘'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="feed-post-text">{post.text}</p>

                    {post.images && post.images.length > 0 && (
                      <div className={`feed-post-images ${post.images.length > 1 ? 'multi' : ''}`}>
                        {post.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Post image"
                            onError={(e) => {
                              console.warn(`Image failed to load: ${img}`);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="feed-post-stats">
                      <span>💬 {post.replyCount}</span>
                      <span>🔄 {post.repostCount}</span>
                      <span>❤️ {post.likeCount}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Control Panel */}
      {page === 'control' && (
        <div className="control-panel">
          <div 
            ref={containerRef}
            className={`interactive-container ${currentMode === 'filter' ? 'filter-mode' : ''} ${currentMode === 'feeds' ? 'feed-mode' : ''}`}
          >
            {/* Logo */}
            <div className="logo" onClick={() => setPage('feed')}>
              <Image
                src="/images/IIB_logo.png"
                alt="IIB Baleen"
                width={80}
                height={80}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>

            {/* Back button */}
            {currentMode !== 'splash' && (
              <button className="back-button" onClick={goToSplash}>← Back</button>
            )}

            <div className="filter-label">Filter Controls</div>
            <div className="feeds-label">Feed Sources</div>

            {/* Filter wall */}
            <div className="filter-wall">
              <div className="decorative-side"><div className="mini-strand"></div><div className="mini-strand"></div><div className="mini-strand"></div></div>
              
              <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">F</div></div><div className="bubble bubble-f" onClick={(e) => goToFeedPage(e)}>f</div><div className="filter-bar" data-bar="0"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text" data-bar-text>AI</div></div></div>
              <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">I</div></div><div className="bubble bubble-e1" onClick={(e) => goToFeedPage(e)}>e</div><div className="filter-bar" data-bar="1"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text" data-bar-text>Ad</div></div></div>
              <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">L</div></div><div className="bubble bubble-e2" onClick={(e) => goToFeedPage(e)}>e</div><div className="filter-bar" data-bar="2"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text" data-bar-text>W1</div></div></div>
              <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">T</div></div><div className="bubble bubble-d" onClick={(e) => goToFeedPage(e)}>d</div><div className="filter-bar" data-bar="3"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text" data-bar-text>B1</div></div></div>
              <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">E</div></div><div className="bubble bubble-s" onClick={(e) => goToFeedPage(e)}>s</div><div className="filter-bar" data-bar="4"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text" data-bar-text>B2</div></div></div>
              <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">R</div></div><div className="filter-bar" data-bar="5"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text" data-bar-text>CU</div></div></div>
              
              <div className="decorative-side"><div className="mini-strand"></div><div className="mini-strand"></div><div className="mini-strand"></div></div>
            </div>

            {/* Feeds page */}
            <div className="feeds-page">
              {/* Left Panel: SM Icons */}
              <div className="feeds-left-panel">
                <div className="feeds-icons-grid">
                  <div className="feeds-icon" draggable onDragStart={(e) => handleFeedIconDragStart(e, 'bluesky')}>
                    <div className="feeds-icon-emoji">🦋</div>
                    <div className="feeds-icon-label">Bluesky</div>
                  </div>
                  <div className="feeds-icon" draggable onDragStart={(e) => handleFeedIconDragStart(e, 'mastodon')}>
                    <div className="feeds-icon-emoji">🐘</div>
                    <div className="feeds-icon-label">Mastodon</div>
                  </div>
                  <div className="feeds-icon" style={{opacity: 0.4, cursor: 'not-allowed'}} title="Coming soon">
                    <div className="feeds-icon-emoji">🤖</div>
                    <div className="feeds-icon-label">Reddit</div>
                    <div style={{fontSize: '10px', marginTop: '4px', color: '#00d9ff'}}>Coming soon</div>
                  </div>
                  <div className="feeds-icon" style={{opacity: 0.4, cursor: 'not-allowed'}} title="Coming soon">
                    <div className="feeds-icon-emoji">📰</div>
                    <div className="feeds-icon-label">Substack</div>
                    <div style={{fontSize: '10px', marginTop: '4px', color: '#00d9ff'}}>Coming soon</div>
                  </div>
                  <div className="feeds-icon" style={{opacity: 0.4, cursor: 'not-allowed'}} title="Coming soon">
                    <div className="feeds-icon-emoji">𝕏</div>
                    <div className="feeds-icon-label">Twitter</div>
                    <div style={{fontSize: '10px', marginTop: '4px', color: '#00d9ff'}}>Coming soon</div>
                  </div>
                  <div className="feeds-icon" style={{opacity: 0.4, cursor: 'not-allowed'}} title="Coming soon">
                    <div className="feeds-icon-emoji">🧵</div>
                    <div className="feeds-icon-label">Threads</div>
                    <div style={{fontSize: '10px', marginTop: '4px', color: '#00d9ff'}}>Coming soon</div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Whale */}
              <div className="whale-right-panel">
                <div className="whale-svg-container">
                  <Image
                    src="/images/whale.jpg"
                    alt="whale"
                    width={400}
                    height={400}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.4))' }}
                    priority
                  />
                </div>

                {/* Drop zone at mouth */}
                <div 
                  className="whale-mouth-zone"
                  onDragOver={handleWhaleDragOver}
                  onDragLeave={handleWhaleDragLeave}
                  onDrop={handleWhaleDrop}
                >
                  <div style={{ textAlign: 'center', fontSize: '9px', lineHeight: '1.2', fontWeight: 700 }}>DROP FEED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
