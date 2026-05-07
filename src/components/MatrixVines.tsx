import { useEffect, useMemo, useRef } from "react";

interface Props {
  className?: string;
  density?: number;
}

/**
 * Matrix-style binary rain mixed with green vine accents.
 * Pure canvas — performant background for the admin dashboard.
 */
const MatrixVines = ({ className = "", density = 1 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Floating vine leaves overlaid on top of the matrix rain
  const vines = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 14,
        duration: 14 + Math.random() * 16,
        size: 14 + Math.random() * 18,
        sway: 30 + Math.random() * 80,
        rotate: Math.random() * 360,
        hue: 110 + Math.random() * 40,
      })),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let columns = 0;
    let drops: number[] = [];
    const fontSize = 14;
    const chars = "01<>/${}[]ERROR0xFFAABB01アカサナ".split("");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => Math.random() * -50);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(8, 12, 10, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px ui-monospace, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // occasional red "error" glitch
        const isError = Math.random() < 0.008;
        ctx.fillStyle = isError ? "rgba(255,80,80,0.85)" : "rgba(80,255,140,0.75)";
        ctx.fillText(text, x, y);

        // bright leading char
        if (Math.random() < 0.02) {
          ctx.fillStyle = "rgba(220,255,230,0.95)";
          ctx.fillText(text, x, y);
        }

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.4 + Math.random() * 0.4 * density;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden z-0 ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />
      {/* subtle vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.7)_100%)]" />
      {/* drifting vine leaves */}
      {vines.map((v) => (
        <span
          key={v.id}
          className="vine-leaf"
          style={{
            left: `${v.left}%`,
            width: `${v.size}px`,
            height: `${v.size}px`,
            animationDelay: `${v.delay}s`,
            animationDuration: `${v.duration}s`,
            background: `radial-gradient(ellipse at 30% 30%, hsl(${v.hue} 80% 70%) 0%, hsl(${v.hue} 70% 45%) 55%, hsl(${v.hue} 60% 25%) 100%)`,
            boxShadow: `0 0 8px hsla(${v.hue}, 80%, 50%, 0.5)`,
            ["--sway" as any]: `${v.sway}px`,
            ["--rot" as any]: `${v.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
};

export default MatrixVines;
