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
      if (target.getAttribute('data-bar-text')) {
        const barDiv = target.closest('[data-bar-index]');
        if (barDiv) {
          const barIndex = parseInt(barDiv.getAttribute('data-bar-index') || '0');
          dragStateRef.current.active = true;
          dragStateRef.current.bar = barIndex;
          dragStateRef.current.barRect = barDiv.getBoundingClientRect();
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
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Filter wall grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 60px 60px 60px 60px 60px 60px auto',
        gap: '20px',
        height: '80%',
        maxHeight: '520px',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Left decorative side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`left-${i}`}
              style={{
                width: '1.5px',
                height: '180px',
                background: 'linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent)',
                boxShadow: '0 0 8px rgba(0, 217, 255, 0.4)',
              }}
            />
          ))}
        </div>

        {/* Filter bars */}
        {barLabels.map((label, index) => (
          <div
            key={index}
            data-bar-index={index}
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '420px',
                width: '30px',
                position: 'relative',
              }}
            >
              {/* Bar outline */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '2px solid rgba(0, 217, 255, 0.6)',
                  borderRadius: '8px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  boxSizing: 'border-box',
                }}
              />

              {/* Bar fill */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: `${barValues[index]}%`,
                  background: `linear-gradient(180deg, rgba(0, 217, 255, ${(barValues[index] / 100) * 0.8}), rgba(0, 217, 255, ${(barValues[index] / 100) * 0.2}))`,
                  borderRadius: '6px',
                  transition: 'height 0.05s ease-out, background 0.05s ease-out',
                  pointerEvents: 'none',
                }}
              />

              {/* Bar label */}
              <div
                data-bar-text
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 0 10px rgba(0, 217, 255, 0.8)',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                  transform: 'translateX(-50%) rotate(180deg)',
                  cursor: 'grab',
                  userSelect: 'none',
                  zIndex: 10,
                  left: '50%',
                  top: `${100 - barValues[index]}%`,
                  transition: 'top 0.05s ease-out',
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}

        {/* Right decorative side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`right-${i}`}
              style={{
                width: '1.5px',
                height: '180px',
                background: 'linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent)',
                boxShadow: '0 0 8px rgba(0, 217, 255, 0.4)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
