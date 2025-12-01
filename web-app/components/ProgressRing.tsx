/**
 * ProgressRing - 刮刮樂進度圓環組件
 *
 * Design Philosophy: Playful & Rewarding
 * - 實時視覺反饋，讓用戶清楚知道還需要刮多少
 * - 分階段顏色變化（25% 藍 → 50% 紫 → 75% 粉 → 100% 金）
 * - 動畫流暢，提升互動樂趣
 */

'use client';

import { useMemo } from 'react';
import { UI, getProgressColor, getProgressHint } from '@/constants/ui';

interface ProgressRingProps {
  /** 進度 (0.0 ~ 1.0) */
  progress: number;
  /** 圓環大小（像素） */
  size?: number;
  /** 線條寬度（像素） */
  strokeWidth?: number;
}

export function ProgressRing({
  progress,
  size = UI.PROGRESS_RING.DEFAULT_SIZE,
  strokeWidth = UI.PROGRESS_RING.DEFAULT_STROKE_WIDTH
}: ProgressRingProps) {
  // 計算 SVG 參數
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  // 根據進度動態變化顏色（使用集中管理的函數）
  const color = useMemo(() => getProgressColor(progress), [progress]);
  const percentage = Math.round(progress * 100);
  const hint = getProgressHint(progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 背景圓環 */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* 進度圓環 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
      </svg>

      {/* 中心百分比文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color }}
          >
            {percentage}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {hint}
          </div>
        </div>
      </div>
    </div>
  );
}
