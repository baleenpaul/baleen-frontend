'use client';

import { useEffect, useRef } from 'react';

interface FilterPageProps {
  barValues: number[];
  onUpdateBar: (index: number, value: number) => void;
}

export default function FilterPage({ barValues, onUpdateBar }: FilterPageProps) {
  const dragStateRef = useRef({ active: false, bar: null as number | null, barRect: null as DOMRect | null });
  const barLabels = ['AI', 'Ad', 'W1', 'B1', 'B2', 'CU'];

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const filterBarText = target.closest('[data-bar-text]');
      
      if (filterBarText) {
        const barElement = filterBarText.closest('[data-bar]');
        if (barElement) {
          dragStateRef.current.active = true;
          dragStateRef.current.bar = parseInt(barElement.getAttribute('data-bar') || '0');
          dragStateRef.current.barRect = barElement.getBoundingClientRect();
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
      
      onUpdateBar(dragStateRef.current.bar, newValue);
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
  }, [onUpdateBar]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Filter wall grid */}
      <div className="grid gap-5 h-4/5 max-h-96 items-center justify-center"
        style={{
          gridTemplateColumns: 'auto 60px 60px 60px 60px 60px 60px auto'
        }}
      >
        {/* Left decorative side */}
        <div className="flex flex-col gap-3 opacity-35">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-0.5 h-44"
              style={{
                background: 'linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent)',
                boxShadow: '0 0 8px rgba(0, 217, 255, 0.4)',
                animation: `pulseMini 2.5s infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Filter bars */}
        {barLabels.map((label, index) => (
          <div
            key={index}
            className="h-full w-full flex items-center justify-center relative"
            data-bar={index}
          >
            <div className="h-96 w-8 relative">
              {/* Outline */}
              <div className="absolute inset-0 border-2 border-cyan-400 border-opacity-60 rounded-lg bg-cyan-400 bg-opacity-5" />
              
              {/* Fill */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-md transition-all"
                style={{
                  height: `${barValues[index]}%`,
                  background: `linear-gradient(180deg, rgba(0, 217, 255, ${(barValues[index] / 100) * 0.8}), rgba(0, 217, 255, ${(barValues[index] / 100) * 0.2}))`,
                }}
              />
              
              {/* Text label */}
              <div
                className="absolute left-1/2 w-full h-8 flex items-center justify-center font-bold text-xs text-white text-opacity-95 cursor-grab active:cursor-grabbing select-none z-10 transition-all"
                data-bar-text
                style={{
                  transform: `translateX(-50%) rotate(180deg)`,
                  top: `${100 - barValues[index]}%`,
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                  textShadow: '0 0 10px rgba(0, 217, 255, 0.8)',
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}

        {/* Right decorative side */}
        <div className="flex flex-col gap-3 opacity-35">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-0.5 h-44"
              style={{
                background: 'linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent)',
                boxShadow: '0 0 8px rgba(0, 217, 255, 0.4)',
                animation: `pulseMini 2.5s infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulseMini {
          0%, 100% { opacity: 0.35; box-shadow: 0 0 8px rgba(0, 217, 255, 0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 14px rgba(0, 217, 255, 0.7); }
        }
      `}</style>
    </div>
  );
}
