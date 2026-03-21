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
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <div className={`w-full max-w-4xl h-screen max-h-96 relative overflow-hidden rounded-xl border border-cyan-400 border-opacity-15 ${
        currentMode === 'filter' ? 'filter-mode' : ''
      } ${currentMode === 'feeds' ? 'feed-mode' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #0a1f3a 0%, #0f1a2a 40%, #1a0f2e 100%)',
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
          <div className="text-sm font-bold text-cyan-400 text-opacity-70 uppercase tracking-wider">Baleen</div>
        </div>

        {/* Back button */}
        {currentMode !== 'splash' && (
          <button
            onClick={goToSplash}
            className="absolute bottom-10 left-10 px-5 py-2 bg-cyan-400 bg-opacity-10 border border-cyan-400 border-opacity-50 text-cyan-400 text-opacity-80 rounded hover:bg-opacity-20 hover:border-opacity-90 transition-all font-bold z-50"
          >
            ← Back
          </button>
        )}

        {/* Filter/Feed labels */}
        {currentMode === 'filter' && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-cyan-400 text-opacity-60 text-xs uppercase tracking-widest pointer-events-none z-30">
            Filter Controls
          </div>
        )}

        {currentMode === 'feeds' && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-cyan-400 text-opacity-60 text-xs uppercase tracking-widest pointer-events-none z-30">
            Feed Sources
          </div>
        )}

        {/* Page content */}
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
  );
}
