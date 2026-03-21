'use client';

interface SplashPageProps {
  onGoToFilter: () => void;
  onGoToFeeds: () => void;
}

export default function SplashPage({ onGoToFilter, onGoToFeeds }: SplashPageProps) {
  const letters = ['F', 'I', 'L', 'T', 'E', 'R'];
  const bubbles = [
    { label: 'f', left: '15%', top: '20%' },
    { label: 'e', left: '80%', top: '30%' },
    { label: 'e', left: '35%', top: '75%' },
    { label: 'd', left: '85%', top: '70%' },
    { label: 's', left: '50%', top: '50%' },
  ];

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Filter wall grid - exact grid structure from reference */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.35 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`left-${i}`}
              style={{
                width: '1.5px',
                height: '180px',
                background: 'linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent)',
                boxShadow: '0 0 8px rgba(0, 217, 255, 0.4)',
                animation: `pulse-mini 2.5s infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Letters F I L T E R */}
        {letters.map((letter, index) => (
          <div
            key={letter}
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={onGoToFilter}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 0 12px rgba(0, 217, 255, 0.6))',
                animation: `pulse-letter 2.8s infinite`,
                animationDelay: `${index * 0.3}s`,
                transition: 'all 0.6s ease-in-out',
              }}
            >
              <div
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '120px',
                  fontWeight: 700,
                  color: '#00d9ff',
                  textShadow: '0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 153, 255, 0.4)',
                  lineHeight: '1',
                  transform: 'scaleY(4.8) scaleX(0.16)',
                  whiteSpace: 'nowrap',
                }}
              >
                {letter}
              </div>
            </div>
          </div>
        ))}

        {/* Right decorative side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.35 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`right-${i}`}
              style={{
                width: '1.5px',
                height: '180px',
                background: 'linear-gradient(180deg, transparent, #00d9ff 25%, #0099ff 50%, #00d9ff 75%, transparent)',
                boxShadow: '0 0 8px rgba(0, 217, 255, 0.4)',
                animation: `pulse-mini 2.5s infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bubbles container */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        {bubbles.map((bubble, idx) => (
          <div
            key={`bubble-${idx}`}
            style={{
              position: 'absolute',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              cursor: 'pointer',
              animation: `float-bubble 4s ease-in-out infinite`,
              animationDelay: `${idx * 0.5}s`,
              pointerEvents: 'auto',
              background: idx % 2 === 0 ? 'rgba(0, 217, 255, 0.2)' : 'rgba(0, 153, 255, 0.2)',
              color: idx % 2 === 0 ? '#00d9ff' : '#0099ff',
              boxShadow: '0 0 15px rgba(0, 217, 255, 0.4)',
              left: bubble.left,
              top: bubble.top,
              transform: bubble.label === 's' ? 'translateX(-50%) translateY(-50%)' : 'translate(0)',
            }}
            onClick={onGoToFeeds}
          >
            {bubble.label}
          </div>
        ))}
      </div>
    </div>
  );
}
