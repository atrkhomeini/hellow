"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundBeamsWithCollisionProps {
  children: React.ReactNode;
  className?: string;
}

export function BackgroundBeamsWithCollision({
  children,
  className,
}: BackgroundBeamsWithCollisionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [beams, setBeams] = useState<{
    x: number;
    y: number;
    angle: number;
    velocity: number;
    opacity: number;
    length: number;
    color: string;
  }[]>([]);
  const [explosions, setExplosions] = useState<{
    x: number;
    y: number;
    particles: { x: number; y: number; vx: number; vy: number; opacity: number }[];
  }[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const colors = [
      "rgba(62, 207, 142, 0.5)",
      "rgba(45, 212, 191, 0.4)",
      "rgba(139, 92, 246, 0.4)",
      "rgba(236, 72, 153, 0.3)",
    ];

    // Initialize beams
    const initialBeams = Array.from({ length: 8 }, () => ({
      x: Math.random() * (containerRef.current?.clientWidth || 800),
      y: -50,
      angle: Math.random() * 60 + 60,
      velocity: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      length: Math.random() * 150 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setBeams(initialBeams);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 600;

      setBeams((prevBeams) =>
        prevBeams.map((beam) => {
          const rad = (beam.angle * Math.PI) / 180;
          const newX = beam.x + Math.cos(rad) * beam.velocity;
          const newY = beam.y + Math.sin(rad) * beam.velocity;

          // Reset beam if it goes off screen
          if (newY > height + 50) {
            return {
              ...beam,
              x: Math.random() * width,
              y: -50,
              opacity: Math.random() * 0.5 + 0.3,
            };
          }

          return { ...beam, x: newX, y: newY };
        })
      );

      // Update explosion particles
      setExplosions((prevExplosions) => {
        return prevExplosions
          .map((exp) => ({
            ...exp,
            particles: exp.particles
              .map((p) => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                opacity: p.opacity - 0.02,
              }))
              .filter((p) => p.opacity > 0),
          }))
          .filter((exp) => exp.particles.length > 0);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particles = Array.from({ length: 12 }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      opacity: 1,
    }));

    setExplosions((prev) => [...prev, { x, y, particles }]);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden bg-surface-100",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-100 via-surface-200/50 to-surface-100" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Beams */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {beams.map((beam, i) => {
          const rad = (beam.angle * Math.PI) / 180;
          const endX = beam.x + Math.cos(rad) * beam.length;
          const endY = beam.y + Math.sin(rad) * beam.length;

          return (
            <motion.line
              key={i}
              x1={beam.x}
              y1={beam.y}
              x2={endX}
              y2={endY}
              stroke={beam.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={beam.opacity}
              initial={{ opacity: 0 }}
              animate={{ opacity: beam.opacity }}
              transition={{ duration: 0.5 }}
            />
          );
        })}

        {/* Explosion particles */}
        {explosions.map((exp, i) =>
          exp.particles.map((p, j) => (
            <circle
              key={`${i}-${j}`}
              cx={p.x}
              cy={p.y}
              r="2"
              fill="rgba(62, 207, 142, 0.8)"
              opacity={p.opacity}
            />
          ))
        )}
      </svg>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}