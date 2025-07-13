import React, { useEffect, useRef } from 'react';

export default function ParticleSystem({ count = 15 }) {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            background: `hsl(${200 + Math.random() * 60}, 70%, 70%)`,
            borderRadius: '50%',
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${20 + Math.random() * 10}s`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
        />
      ))}
    </div>
  );
}