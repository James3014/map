/**
 * ScratchModal - 固定尺寸刮刮卡彈窗
 *
 * 目的：將刮除體驗與地圖座標解耦，避免縮放/平移導致觸控偏移
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { Resort } from '@/data/resorts';
import { REGIONS } from '@/data/resorts';
import { ProgressRing } from './ProgressRing';
import { useScratchCard } from '@/hooks/useScratchCard';
import { X } from 'lucide-react';
import { UI } from '@/constants/ui';

interface ScratchModalProps {
  resort: Resort | null;
  visited: boolean;
  onClose: () => void;
  onComplete: (resortId: string) => void;
}

export function ScratchModal({
  resort,
  visited,
  onClose,
  onComplete,
}: ScratchModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(visited ? 1 : 0);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = () => {
    if (!resort) return;
    setJustCompleted(true);
    onComplete(resort.id);
    // 自動關閉
    setTimeout(onClose, UI.AUTO_CLOSE_DELAY);
  };

  const { scratch, reset } = useScratchCard(canvasRef, {
    visited,
    onComplete: handleComplete,
    onProgressChange: setProgress,
  });

  // 切換雪場時重置
  useEffect(() => {
    setJustCompleted(false);
    setProgress(visited ? 1 : 0);
    reset();
  }, [resort, visited, reset]);

  if (!resort) return null;

  const accent = REGIONS[resort.region].color;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4">
          <div>
            <div className="text-sm text-slate-400">刮開卡片解鎖雪場</div>
            <div className="text-2xl font-bold text-white">{resort.name}</div>
            <div className="text-xs text-slate-400">
              {resort.prefecture} · {resort.nameEn}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
            <div className="mt-4 relative mx-auto w-80 h-80 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-inner flex items-center justify-center">
            {/* 底圖：可見的「獎勵圖」 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 35%),
                  radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12), transparent 40%),
                  linear-gradient(135deg, ${accent} 0%, #0f172a 60%),
                  repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 6px, transparent 6px, transparent 16px)
                `,
              }}
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair rounded-2xl z-10"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => {
                e.preventDefault();
                scratch({ x: e.clientX, y: e.clientY });
              }}
              onPointerMove={(e) => {
                if (e.pressure === 0 && e.buttons === 0) return;
                e.preventDefault();
                scratch({ x: e.clientX, y: e.clientY });
              }}
            />

            {/* 背後的圖像/顏色底 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-black pointer-events-none z-0" />

            {/* 中心信息 / 解鎖標籤 */}
            <div className="relative z-20 text-center pointer-events-none space-y-2">
              <div className="text-xl font-semibold text-white">{resort.name}</div>
              <div className="text-xs text-slate-400">{resort.prefecture}</div>
              <div className="flex justify-center pt-2">
                <ProgressRing progress={progress} />
              </div>
            </div>

            {justCompleted && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="px-4 py-2 rounded-full bg-black/70 border border-white/30 text-white font-semibold shadow-lg">
                  已解鎖：{resort.name}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-slate-400 space-y-1">
            <div>單指滑動刮開，約 80% 即完成解鎖。</div>
            {justCompleted && <div className="text-green-400">已解鎖！自動關閉中…</div>}
            {visited && !justCompleted && <div className="text-cyan-400">已解鎖的雪場，可直接關閉。</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
