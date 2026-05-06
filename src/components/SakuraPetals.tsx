import { useMemo } from "react";

interface Props {
  count?: number;
  className?: string;
}

const SakuraPetals = ({ count = 24, className = "" }: Props) => {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 8 + Math.random() * 10,
        size: 12 + Math.random() * 18,
        sway: 20 + Math.random() * 60,
        rotate: Math.random() * 360,
        opacity: 0.5 + Math.random() * 0.5,
      })),
    [count],
  );

  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="sakura-petal"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
            ["--sway" as any]: `${p.sway}px`,
            ["--rot" as any]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
};

export default SakuraPetals;
