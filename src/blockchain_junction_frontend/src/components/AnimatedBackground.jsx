import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-40">
      {/* Static dreamy gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 50%, #4facfe 100%)'
        }}
      />
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
      </div>
    </div>
  );
}