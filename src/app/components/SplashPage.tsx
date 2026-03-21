'use client';

interface SplashPageProps {
  onGoToFilter: () => void;
  onGoToFeeds: () => void;
}

export default function SplashPage({ onGoToFilter, onGoToFeeds }: SplashPageProps) {
  const letters = ['F', 'I', 'L', 'T', 'E', 'R'];

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Filter wall grid */}
      <div className="grid gap-5 h-4/5 max-h-96 items-center justify-center"
        style={{
          gridTemplateColumns: 'auto 60px 60px 60px 60px 60px 60px auto'
        }}
      >
        {/* Left decorative side */}
        <div className="flex flex-col gap-3">
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

        {/* Letters F I L T E R */}
        {letters.map((letter, index) => (
          <div
            key={letter}
            className="h-full w-full flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform"
            onClick={onGoToFilter}
          >
            <div
              className="h-full w-full flex items-center justify-center"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(0, 217, 255, 0.6))',
                animation: `pulseLetter 2.8s infinite`,
                animationDelay: `${index * 0.3}s`,
              }}
            >
              <div
                className="text-9xl font-bold text-cyan-400"
                style={{
                  textShadow: '0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 153, 255, 0.4)',
                  transform: 'scaleY(4.8) scaleX(0.16)',
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                }}
              >
                {letter}
              </div>
            </div>
          </div>
        ))}

        {/* Right decorative side */}
        <div className="flex flex-col gap-3">
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

      {/* Floating bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { id: 'f', x: '15%', y: '20%', emoji: 'f' },
          { id: 'e1', x: '80%', y: '30%', emoji: 'e' },
          { id: 'e2', x: '35%', y: '75%', emoji: 'e' },
          { id: 'd', x: '85%', y: '70%', emoji: 'd' },
          { id: 's', x: '50%', y: '50%', emoji: 's' },
        ].map((bubble, idx) => (
          <div
            key={bubble.id}
            className="absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl cursor-pointer pointer-events-auto hover:scale-110 transition-transform"
            style={{
              left: bubble.x,
              top: bubble.y,
              background: idx % 2 === 0 ? 'rgba(0, 217, 255, 0.2)' : 'rgba(0, 153, 255, 0.2)',
              color: idx % 2 === 0 ? '#00d9ff' : '#0099ff',
              boxShadow: '0 0 15px rgba(0, 217, 255, 0.4)',
              animation: `floatBubble 4s ease-in-out infinite`,
              animationDelay: `${idx * 0.5}s`,
              transform: bubble.id === 's' ? 'translateX(-50%) translateY(-50%)' : undefined,
            }}
            onClick={onGoToFeeds}
          >
            {bubble.emoji}
          </div>
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulseMini {
          0%, 100% { opacity: 0.35; box-shadow: 0 0 8px rgba(0, 217, 255, 0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 14px rgba(0, 217, 255, 0.7); }
        }
        @keyframes pulseLetter {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.9)) drop-shadow(0 0 35px rgba(0, 153, 255, 0.5)); }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 15px rgba(0, 217, 255, 0.4); }
          50% { transform: translateY(-20px); box-shadow: 0 0 25px rgba(0, 217, 255, 0.7); }
        }
      `}</style>
    </div>
  );
}
