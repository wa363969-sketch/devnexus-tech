import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function NetworkHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId = 0;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    let dims = resize();
    const nodeCount = dims.w < 768 ? 26 : 46;
    const nodes: NodePoint[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * dims.w,
      y: Math.random() * dims.h,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      radius: Math.random() * 1.8 + 1.2,
    }));

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onResize = () => {
      dims = resize();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);

    const drawFrame = () => {
      ctx.clearRect(0, 0, dims.w, dims.h);
      const isDark = theme === 'dark';
      const nodeColor = isDark ? 'rgba(56, 189, 248, 0.72)' : 'rgba(2, 132, 199, 0.55)';
      const lineBase = isDark ? [0, 210, 255] : [2, 132, 199];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!prefersReduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > dims.w) n.vx *= -1;
          if (n.y < 0 || n.y > dims.h) n.vy *= -1;

          const dxP = pointer.x - n.x;
          const dyP = pointer.y - n.y;
          const distP = Math.hypot(dxP, dyP);
          if (distP > 0 && distP < 140) {
            n.x -= (dxP / distP) * 0.35;
            n.y -= (dyP / distP) * 0.35;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < 145) {
            const alpha = (1 - dist / 145) * (isDark ? 0.24 : 0.16);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(${lineBase[0]}, ${lineBase[1]}, ${lineBase[2]}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const pDist = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (pDist < 170) {
          const alpha = (1 - pDist / 170) * 0.45;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(${lineBase[0]}, ${lineBase[1]}, ${lineBase[2]}, ${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      if (!prefersReduced) {
        animId = window.requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
}
