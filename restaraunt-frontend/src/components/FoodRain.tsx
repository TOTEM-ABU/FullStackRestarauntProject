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
    return [...Array(40)].map((_, i) => {
      const food = foods[Math.floor(Math.random() * foods.length)];
      const delay = Math.random() * 15;
      const duration = 10 + Math.random() * 10;
      const left = Math.random() * 100;
      const size = 20 + Math.random() * 30;

      return {
        food,
        delay,
        duration,
        left,
        size,
        key: i,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.key}
          className="absolute animate-fall will-change-transform"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            top: "-50px",
            filter: "drop-shadow(0 0 8px rgba(255,215,0,0.7))",
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
