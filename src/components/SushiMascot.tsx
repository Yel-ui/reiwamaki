import { useState } from "react";

/**
 * Cute floating sushi mascot — anime-styled SVG with bobbing/wave animation.
 * Sits in a corner, says hello on hover.
 */
const SushiMascot = () => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="fixed bottom-4 right-4 z-40 select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* speech bubble */}
      <div
        className={`absolute -top-12 right-2 px-3 py-1.5 rounded-2xl bg-white text-cherry-dark text-xs font-medium shadow-lg whitespace-nowrap transition-all duration-300 ${
          hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{ boxShadow: "0 8px 20px -6px hsla(340, 70%, 50%, 0.4)" }}
      >
        Konnichiwa! 🍣
        <span className="absolute -bottom-1 right-6 w-3 h-3 bg-white rotate-45" />
      </div>

      <div className="mascot-bob drop-shadow-[0_10px_15px_rgba(196,92,124,0.45)]">
        <svg
          width="92"
          height="92"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
        >
          <defs>
            <radialGradient id="rice" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3e9d7" />
            </radialGradient>
            <radialGradient id="salmon" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffb89c" />
              <stop offset="60%" stopColor="#ff8a6e" />
              <stop offset="100%" stopColor="#e85a3a" />
            </radialGradient>
            <linearGradient id="stripe" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* shadow */}
          <ellipse cx="60" cy="112" rx="30" ry="4" fill="rgba(0,0,0,0.18)" />

          {/* rice base */}
          <ellipse cx="60" cy="78" rx="42" ry="22" fill="url(#rice)" stroke="#e5d8bf" strokeWidth="1.5" />

          {/* salmon top */}
          <path
            d="M20 62 Q60 30 100 62 Q100 70 60 70 Q20 70 20 62 Z"
            fill="url(#salmon)"
            stroke="#c9492c"
            strokeWidth="1.5"
          />
          {/* salmon stripes */}
          <path d="M30 58 Q60 42 90 58" fill="none" stroke="url(#stripe)" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 52 Q60 38 85 52" fill="none" stroke="url(#stripe)" strokeWidth="1.5" strokeLinecap="round" />

          {/* nori belt */}
          <rect x="46" y="60" width="28" height="22" rx="3" fill="#1a2a1a" />
          <rect x="46" y="60" width="28" height="22" rx="3" fill="url(#stripe)" opacity="0.15" />

          {/* face on nori */}
          {/* eyes */}
          <g>
            {hover ? (
              <>
                <path d="M52 70 Q54 67 56 70" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <path d="M64 70 Q66 67 68 70" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="54" cy="70" rx="2.2" ry="3" fill="#fff" />
                <ellipse cx="66" cy="70" rx="2.2" ry="3" fill="#fff" />
                <circle cx="54.5" cy="70.5" r="1" fill="#1a2a1a" />
                <circle cx="66.5" cy="70.5" r="1" fill="#1a2a1a" />
              </>
            )}
          </g>
          {/* blush */}
          <circle cx="50" cy="76" r="2" fill="#ff9eb5" opacity="0.7" />
          <circle cx="70" cy="76" r="2" fill="#ff9eb5" opacity="0.7" />
          {/* smile */}
          <path d="M56 77 Q60 80 64 77" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />

          {/* waving hand (rice ball) */}
          <g className="mascot-wave" style={{ transformBox: "fill-box" }}>
            <circle cx="100" cy="60" r="8" fill="url(#rice)" stroke="#e5d8bf" strokeWidth="1.2" />
            <rect x="96" y="62" width="8" height="3" fill="#1a2a1a" />
          </g>

          {/* sakura petal accent */}
          <g transform="translate(18,40)">
            <path
              d="M0 0 Q3 -4 6 0 Q3 4 0 0 Z"
              fill="#f8c8d8"
              transform="rotate(-20)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SushiMascot;
