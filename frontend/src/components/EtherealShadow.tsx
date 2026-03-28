import React from 'react';
import { motion } from 'framer-motion';

interface EtherealShadowProps {
  color: string;
  animation?: { scale: number; speed: number };
  noise?: { opacity: number; scale: number };
  sizing?: 'fill' | 'container';
}

export const EtherealShadow: React.FC<EtherealShadowProps> = ({
  color,
  animation = { scale: 40, speed: 60 },
  noise = { opacity: 0.2, scale: 1.2 },
  sizing = 'fill',
}) => {
  return (
    <div
      className={`pointer-events-none overflow-hidden ${
        sizing === 'fill' ? 'absolute inset-0' : 'relative w-full h-full'
      }`}
    >
      {/* Primary central glow */}
      <motion.div
        animate={{
          scale: [1, 1 + animation.scale / 200, 1],
          opacity: [0.4, 0.65, 0.4],
        }}
        transition={{
          duration: animation.speed / 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />
      {/* Secondary offset glow for depth */}
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.2, 0.35, 0.2],
          x: ['-10%', '10%', '-10%'],
        }}
        transition={{
          duration: animation.speed / 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          width: '60%',
          height: '60%',
          background: `radial-gradient(ellipse at center, ${color} 0%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
      />
      {/* Noise overlay — very subtle */}
      {noise && noise.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: noise.opacity * 0.15,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
};
