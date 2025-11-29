/**
 * ScratchCanvas - 刮除層組件
 *
 * Linus Principle: "Good programmers know what to write. Great ones know what to rewrite (and reuse)"
 * 這是一個簡單的展示組件，所有邏輯都在 useScratch Hook 中
 */

'use client';

import type { RefObject } from 'react';
import type { Resort } from '@/data/resorts';

interface ScratchCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  focusedResort: Resort | null;
}

export function ScratchCanvas({ canvasRef, focusedResort }: ScratchCanvasProps) {
  if (!focusedResort) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair z-50"
      style={{ touchAction: 'none' }}
    />
  );
}
