"use client";

const particles = Array.from({ length: 20 }).map((_, i) => ({
  left: (i * 5) % 100,
  duration: 8 + (i % 10),
  delay: i * 0.5,
}));

export default function BackgroundParticles() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}