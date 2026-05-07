import { useMemo } from "react";

/**
 * Cute floating theme creatures: onigiri, koi fish, paper lanterns, dango,
 * and tiny sushi pieces drifting gently across the screen.
 */

const EMOJI_SET = ["🍙", "🐟", "🏮", "🍡", "🍣", "🥢", "🍵", "🌸"];

interface Floater {
  id: number;
  emoji: string;
  top: number;
  size: number;
  delay: number;
  duration: number;
  direction: "lr" | "rl";
  amplitude: number;
}

const ThemeCreatures = ({ count = 10 }: { count?: number }) => {
  const floaters = useMemo<Floater[]>(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        emoji: EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)],
        top: 8 + Math.random() * 80,
        size: 22 + Math.random() * 22,
        delay: Math.random() * 18,
        duration: 22 + Math.random() * 18,
        direction: Math.random() > 0.5 ? "lr" : "rl",
        amplitude: 12 + Math.random() * 24,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {floaters.map((f) => (
        <span
          key={f.id}
          className={`theme-floater ${f.direction === "lr" ? "drift-lr" : "drift-rl"}`}
          style={{
            top: `${f.top}%`,
            fontSize: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            ["--amp" as any]: `${f.amplitude}px`,
          }}
        >
          <span className="creature-bob inline-block">{f.emoji}</span>
        </span>
      ))}
    </div>
  );
};

export default ThemeCreatures;
