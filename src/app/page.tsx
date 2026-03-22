'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function InteractivePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMode, setCurrentMode] = useState('splash');
  const [barValues, setBarValues] = useState([50, 50, 50, 50, 50, 50]);
  const dragStateRef = useRef({ active: false, bar: null as number | null, barRect: null as DOMRect | null });

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
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const filterBarText = target.closest('[data-bar-text]');
      
      if (filterBarText) {
        const container = filterBarText.closest('[data-bar]');
        if (container) {
          dragStateRef.current.active = true;
          dragStateRef.current.bar = parseInt(container.getAttribute('data-bar') || '0');
          dragStateRef.current.barRect = container.getBoundingClientRect();
          e.preventDefault();
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

    const handleMouseUp = () => {
      dragStateRef.current.active = false;
      dragStateRef.current.bar = null;
      dragStateRef.current.barRect = null;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .logo {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 100;
        }

        .logo-text {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: rgba(0, 217, 255, 0.7);
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
        }

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
          font-family: Arial, sans-serif;
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
          transition: height 0.05s ease-out, background 0.05s ease-out;
          pointer-events: none;
        }

        .filter-bar-text {
          position: absolute;
          width: 100%;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
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
          transition: top 0.05s ease-out;
        }

        .filter-bar-text:active { cursor: grabbing; }
        .feed-mode .filter-bar-text { display: none; }

        .bubble-container { position: absolute; width: 100%; height: 100%; pointer-events: none; }

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
        }

        /* Bubbles aligned with FILTER grid columns - F I L T E R */
        .bubble-f { background: rgba(0, 217, 255, 0.2); color: #00d9ff; left: 11%; top: 50%; transform: translateY(-50%); animation-delay: 0s; }
        .bubble-e1 { background: rgba(0, 153, 255, 0.2); color: #0099ff; left: 27%; top: 50%; transform: translateY(-50%); animation-delay: 0.8s; }
        .bubble-e2 { background: rgba(0, 217, 255, 0.15); color: #00d9ff; left: 43%; top: 50%; transform: translateY(-50%); animation-delay: 1.6s; }
        .bubble-d { background: rgba(0, 153, 255, 0.15); color: #0099ff; left: 59%; top: 50%; transform: translateY(-50%); animation-delay: 2.4s; }
        .bubble-s { background: rgba(0, 217, 255, 0.2); color: #00d9ff; left: 75%; top: 50%; transform: translateY(-50%); animation-delay: 3.2s; }

        @keyframes float-feeds {
          0% { transform: translateY(calc(-50% - 120px)); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(-50%); }
          85% { opacity: 1; }
          100% { transform: translateY(calc(-50% + 120px)); opacity: 0; }
        }

        .filter-mode .bubble { opacity: 0; pointer-events: none; }
        .feed-mode .bubble { opacity: 0; pointer-events: none; }
        .feed-mode .filter-wall { opacity: 0; pointer-events: none; visibility: hidden; }

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
          padding: 16px;
          background: radial-gradient(circle at 30% 30%, rgba(0, 217, 255, 0.3), rgba(0, 217, 255, 0.05));
          border: 1px solid rgba(0, 217, 255, 0.4);
          border-radius: 50%;
          cursor: grab;
          user-select: none;
          width: 80px;
          height: 80px;
          justify-content: center;
          box-shadow: 0 0 25px rgba(0, 217, 255, 0.2), inset -10px -10px 20px rgba(0, 0, 0, 0.3), inset 5px 5px 15px rgba(0, 217, 255, 0.1);
          animation: float-icon 4s ease-in-out infinite;
          transition: all 0.3s ease-in-out;
        }

        .feeds-icon:nth-child(1) { animation-delay: 0s; }
        .feeds-icon:nth-child(2) { animation-delay: 0.3s; }
        .feeds-icon:nth-child(3) { animation-delay: 0.6s; }
        .feeds-icon:nth-child(4) { animation-delay: 0.9s; }
        .feeds-icon:nth-child(5) { animation-delay: 1.2s; }
        .feeds-icon:nth-child(6) { animation-delay: 1.5s; }

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
          font-size: 32px;
          line-height: 1;
        }

        .feeds-icon-label {
          font-size: 11px;
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

      <div 
        ref={containerRef}
        className={`interactive-container ${currentMode === 'filter' ? 'filter-mode' : ''} ${currentMode === 'feeds' ? 'feed-mode' : ''}`}
      >
        {/* Logo */}
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="16" fill="rgba(0,217,255,0.1)" stroke="rgba(0,217,255,0.3)" strokeWidth="1"/>
            <g transform="translate(50,50)">
              <line x1="-15" y1="-20" x2="-15" y2="20" stroke="rgba(0,217,255,0.8)" strokeWidth="2.5"/>
              <line x1="-8" y1="-20" x2="-8" y2="20" stroke="rgba(0,217,255,0.8)" strokeWidth="2.5"/>
              <line x1="-1" y1="-20" x2="-1" y2="20" stroke="rgba(0,217,255,0.8)" strokeWidth="2.5"/>
              <line x1="6" y1="-20" x2="6" y2="20" stroke="rgba(0,217,255,0.8)" strokeWidth="2.5"/>
              <line x1="13" y1="-20" x2="13" y2="20" stroke="rgba(0,217,255,0.8)" strokeWidth="2.5"/>
              <circle cx="-15" cy="-22" r="3" fill="rgba(0,217,255,0.8)"/>
              <circle cx="-8" cy="-24" r="3" fill="rgba(0,217,255,0.7)"/>
              <circle cx="-1" cy="-22" r="3" fill="rgba(0,217,255,0.7)"/>
              <circle cx="6" cy="-25" r="3" fill="rgba(0,217,255,0.6)"/>
              <circle cx="13" cy="-22" r="3" fill="rgba(0,217,255,0.8)"/>
            </g>
          </svg>
          <div className="logo-text">Baleen</div>
        </div>

        {/* Back button */}
        {currentMode !== 'splash' && (
          <button className="back-button" onClick={goToSplash}>← Back</button>
        )}

        <div className="filter-label">Filter Controls</div>
        <div className="feeds-label">Feed Sources</div>

        {/* Filter wall - SPLASH & FILTER pages */}
        <div className="filter-wall">
          <div className="decorative-side"><div className="mini-strand"></div><div className="mini-strand"></div><div className="mini-strand"></div></div>
          
          <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">F</div></div><div className="filter-bar" data-bar="0"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text">AI</div></div></div>
          <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">I</div></div><div className="filter-bar" data-bar="1"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text">Ad</div></div></div>
          <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">L</div></div><div className="filter-bar" data-bar="2"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text">W1</div></div></div>
          <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">T</div></div><div className="filter-bar" data-bar="3"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text">B1</div></div></div>
          <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">E</div></div><div className="filter-bar" data-bar="4"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text">B2</div></div></div>
          <div className="grid-item"><div className="letter-strand" onClick={goToFilterPage}><div className="letter-text">R</div></div><div className="filter-bar" data-bar="5"><div className="filter-bar-outline"></div><div className="filter-bar-fill"></div><div className="filter-bar-text">CU</div></div></div>
          
          <div className="decorative-side"><div className="mini-strand"></div><div className="mini-strand"></div><div className="mini-strand"></div></div>
        </div>

        {/* Bubbles - SPLASH page only */}
        <div className="bubble-container">
          <div className="bubble bubble-f" onClick={(e) => goToFeedPage(e)}>f</div>
          <div className="bubble bubble-e1" onClick={(e) => goToFeedPage(e)}>e</div>
          <div className="bubble bubble-e2" onClick={(e) => goToFeedPage(e)}>e</div>
          <div className="bubble bubble-d" onClick={(e) => goToFeedPage(e)}>d</div>
          <div className="bubble bubble-s" onClick={(e) => goToFeedPage(e)}>s</div>
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
              <div className="feeds-icon" draggable onDragStart={(e) => handleFeedIconDragStart(e, 'reddit')}>
                <div className="feeds-icon-emoji">🤖</div>
                <div className="feeds-icon-label">Reddit</div>
              </div>
              <div className="feeds-icon" draggable onDragStart={(e) => handleFeedIconDragStart(e, 'substack')}>
                <div className="feeds-icon-emoji">📰</div>
                <div className="feeds-icon-label">Substack</div>
              </div>
              <div className="feeds-icon" draggable onDragStart={(e) => handleFeedIconDragStart(e, 'twitter')}>
                <div className="feeds-icon-emoji">𝕏</div>
                <div className="feeds-icon-label">Twitter</div>
              </div>
              <div className="feeds-icon" draggable onDragStart={(e) => handleFeedIconDragStart(e, 'threads')}>
                <div className="feeds-icon-emoji">🧵</div>
                <div className="feeds-icon-label">Threads</div>
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
  );
}
