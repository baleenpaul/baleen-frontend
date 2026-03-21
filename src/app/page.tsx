'use client';

import { useState } from 'react';
import SplashPage from './components/SplashPage';
import FilterPage from './components/FilterPage';
import FeedsPage from './components/FeedsPage';

export default function InteractivePage() {
  const [currentMode, setCurrentMode] = useState<'splash' | 'filter' | 'feeds'>('splash');
  const [barValues, setBarValues] = useState([50, 50, 50, 50, 50, 50]);

  const goToFilterPage = () => {
    if (currentMode === 'splash') {
      setCurrentMode('filter');
    }
  };

  const goToFeedPage = () => {
    if (currentMode === 'splash') {
      setCurrentMode('feeds');
    }
  };

  const goToSplash = () => {
    setCurrentMode('splash');
  };

  const updateBar = (barIndex: number, value: number) => {
    const newValues = [...barValues];
    newValues[barIndex] = value;
    setBarValues(newValues);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-5">
      <div 
        className="relative overflow-hidden rounded-xl border"
        style={{
          width: '1000px',
          height: '700px',
          maxWidth: '100%',
          aspectRatio: '1000 / 700',
          background: 'linear-gradient(180deg, #0a1f3a 0%, #0f1a2a 40%, #1a0f2e 100%)',
          borderColor: 'rgba(0, 217, 255, 0.15)',
          borderWidth: '0.5px',
        }}
      >
        {/* Logo */}
        <div className="absolute top-5 right-5 flex items-center gap-3 z-50">
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
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(0, 217, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Baleen
          </div>
        </div>

        {/* Back button */}
        {currentMode !== 'splash' && (
          <button
            onClick={goToSplash}
            className="absolute bottom-10 left-10 px-5 py-2 rounded font-bold z-50 transition-all"
            style={{
              background: 'rgba(0, 217, 255, 0.1)',
              border: '1px solid rgba(0, 217, 255, 0.5)',
              color: 'rgba(0, 217, 255, 0.8)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.5)';
            }}
          >
            ← Back
          </button>
        )}

        {/* Filter label */}
        {currentMode === 'filter' && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs uppercase tracking-widest pointer-events-none z-30" style={{ color: 'rgba(0, 217, 255, 0.6)', fontSize: '12px', letterSpacing: '2px' }}>
            Filter Controls
          </div>
        )}

        {/* Feeds label */}
        {currentMode === 'feeds' && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs uppercase tracking-widest pointer-events-none z-30" style={{ color: 'rgba(0, 217, 255, 0.6)', fontSize: '12px', letterSpacing: '2px' }}>
            Feed Sources
          </div>
        )}

        {/* Page content */}
        <div className="w-full h-full flex items-center justify-center relative">
          {currentMode === 'splash' && (
            <SplashPage 
              onGoToFilter={goToFilterPage}
              onGoToFeeds={goToFeedPage}
            />
          )}

          {currentMode === 'filter' && (
            <FilterPage 
              barValues={barValues}
              onUpdateBar={updateBar}
            />
          )}

          {currentMode === 'feeds' && (
            <FeedsPage />
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-mini {
          0%, 100% { opacity: 0.35; box-shadow: 0 0 8px rgba(0, 217, 255, 0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 14px rgba(0, 217, 255, 0.7); }
        }
        @keyframes pulse-letter {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.9)) drop-shadow(0 0 35px rgba(0, 153, 255, 0.5)); }
        }
        @keyframes float-bubble {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 15px rgba(0, 217, 255, 0.4); }
          50% { transform: translateY(-20px); box-shadow: 0 0 25px rgba(0, 217, 255, 0.7); }
        }
      `}</style>
    </div>
  );
}
