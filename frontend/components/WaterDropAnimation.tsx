"use client";

import { useEffect, useState } from "react";

export const WaterDropAnimation = () => {
  const [mounted, setMounted] = useState(false);
  const [drops, setDrops] = useState<{ left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate random positions only on client side
    const newDrops = [...Array(5)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${i * 0.5}s`,
      duration: `${2 + Math.random() * 2}s`,
    }));
    setDrops(newDrops);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((drop, i) => (
        <div
          key={i}
          className="absolute animate-water-drop"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        >
          <div className="text-4xl opacity-20">💧</div>
        </div>
      ))}
    </div>
  );
};

export const RippleEffect = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="absolute w-32 h-32 bg-primary/30 rounded-full animate-water-ripple" />
      <div className="absolute w-32 h-32 bg-primary/20 rounded-full animate-water-ripple animation-delay-200" />
      <div className="absolute w-32 h-32 bg-primary/10 rounded-full animate-water-ripple animation-delay-400" />
    </div>
  );
};

