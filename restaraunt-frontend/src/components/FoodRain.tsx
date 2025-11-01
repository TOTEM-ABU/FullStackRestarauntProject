import React, { useMemo } from "react";

const foods = [
  "🍕",
  "☕",
  "🍷",
  "🥗",
  "🍔",
  "🍰",
  "🍝",
  "🍣",
  "🍜",
  "🥩",
  "🥐",
  "🍩",
  "🍪",
  "🍦",
  "🍧",
  "🍨",
  "🍫",
  "🍬",
  "🍭",
  "🍮",
];

const FoodRain: React.FC = React.memo(() => {
  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => {
      const food = foods[Math.floor(Math.random() * foods.length)];
      const delay = Math.random() * 8;
      const duration = 10 + Math.random() * 10;
      const left = Math.random() * 100;
      const size = 25 + Math.random() * 35;
      const depth = Math.random() * 300 - 150;
      const rotateX = Math.random() * 30 - 15;
      const rotateY = Math.random() * 360;
      const blur = Math.random() * 1.5;
      const opacity = 0.7 + Math.random() * 0.3;

      return {
        food,
        delay,
        duration,
        left,
        size,
        depth,
        rotateX,
        rotateY,
        blur,
        opacity,
        key: i,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden perspective-1000">
      {particles.map((p) => (
        <div
          key={p.key}
          className="absolute animate-fall-3d will-change-transform"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            transform: `translateZ(${p.depth}px) rotateX(${p.rotateX}deg) rotateY(${p.rotateY}deg)`,
            filter: `blur(${p.blur}px) drop-shadow(0 0 12px rgba(255,215,0,0.7))`,
            opacity: p.opacity,
            contain: "layout style",
          }}
        >
          {p.food}
        </div>
      ))}
    </div>
  );
});

FoodRain.displayName = "FoodRain";

export default FoodRain;
