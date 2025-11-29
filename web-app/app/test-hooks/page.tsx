'use client';

/**
 * Hooks 集成测试页面
 *
 * 目的：在真实环境测试 useGesture + useMapTransform + useScratch
 * Linus Principle: "Show me the code that works"
 */

import { useRef, useState } from 'react';
import { useGesture } from '@/hooks/useGesture';
import { useMapTransform } from '@/hooks/useMapTransform';
import { useScratch } from '@/hooks/useScratch';
import type { Point } from '@/types/map';
import type { Resort } from '@/data/resorts';

// 模拟雪场数据
const MOCK_RESORT: Resort = {
  id: 'niseko_test',
  name: '二世谷测试',
  nameEn: 'Niseko Test',
  prefecture: '北海道',
  region: 'hokkaido',
  position: { x: 500, y: 500 }, // 地图中心
};

export default function TestHooksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [focusedResort, setFocusedResort] = useState<Resort | null>(null);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Hook 1: 地图变换
  const { transform, pan, zoom, focusOnResort, reset } = useMapTransform(
    containerRef
  );

  // Hook 2: 刮除逻辑
  const { scratch } = useScratch(canvasRef, {
    focusedResort,
    visitedResortIds: visitedIds,
    onComplete: (resortId) => {
      setVisitedIds((prev) => [...prev, resortId]);
      addDebug(`✅ 完成刮除: ${resortId}`);
      setTimeout(() => {
        setFocusedResort(null);
        reset();
      }, 2000);
    },
  });

  // Hook 3: 手势控制
  const { mode } = useGesture(containerRef, {
    focusedResort,
    onPan: (delta: Point) => {
      pan(delta);
      addDebug(`🖐️ 平移: dx=${delta.x.toFixed(0)}, dy=${delta.y.toFixed(0)}`);
    },
    onZoom: (scaleChange: number, center: Point) => {
      zoom(scaleChange, center);
      addDebug(`🔍 缩放: scale=${scaleChange.toFixed(2)}`);
    },
    onScratch: (point: Point) => {
      scratch(point);
    },
  });

  const addDebug = (msg: string) => {
    setDebugInfo((prev) => [...prev.slice(-4), msg]);
  };

  const handleFocusResort = () => {
    setFocusedResort(MOCK_RESORT);
    focusOnResort(MOCK_RESORT);
    addDebug('🎯 聚焦雪场');
  };

  const handleReset = () => {
    setFocusedResort(null);
    reset();
    addDebug('🔄 重置视角');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* 顶部状态栏 - 移动端精简版 */}
      <div className="bg-slate-800 p-2 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">🧪 Hooks 测试</h1>
          <div className="text-xs bg-cyan-600 px-2 py-1 rounded font-mono">
            {mode}
          </div>
        </div>

        {/* 精简状态栏 */}
        <div className="grid grid-cols-3 gap-1 text-xs mb-2">
          <div className="bg-slate-700 p-1 rounded text-center">
            <div className="font-mono text-cyan-400">
              {transform.scale.toFixed(1)}x
            </div>
          </div>
          <div className="bg-slate-700 p-1 rounded text-center">
            <div className="font-mono text-cyan-400">
              X:{transform.x.toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-700 p-1 rounded text-center">
            <div className="font-mono text-cyan-400">
              Y:{transform.y.toFixed(0)}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-2">
          <button
            onClick={handleFocusResort}
            disabled={!!focusedResort}
            className="flex-1 px-3 py-2 bg-cyan-600 active:bg-cyan-700 disabled:bg-gray-600 rounded font-semibold text-sm"
          >
            🎯 聚焦
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-600 active:bg-slate-700 rounded font-semibold text-sm"
          >
            🔄 重置
          </button>
        </div>
      </div>

      {/* 地图区域 */}
      <div className="flex-1 relative overflow-hidden select-none">
        {/* 可变换容器 */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            touchAction: 'none', // 禁止浏览器默认手势
          }}
        >
          {/* 背景网格（帮助观察平移/缩放） */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 网格线 */}
            <defs>
              <pattern
                id="grid"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#grid)" />

            {/* 中心十字 */}
            <line
              x1="0"
              y1="500"
              x2="1000"
              y2="500"
              stroke="rgba(34, 211, 238, 0.3)"
              strokeWidth="2"
            />
            <line
              x1="500"
              y1="0"
              x2="500"
              y2="1000"
              stroke="rgba(34, 211, 238, 0.3)"
              strokeWidth="2"
            />

            {/* 模拟雪场标记 */}
            <circle
              cx={MOCK_RESORT.position.x}
              cy={MOCK_RESORT.position.y}
              r="40"
              fill={visitedIds.includes(MOCK_RESORT.id) ? '#22d3ee' : '#64748b'}
              stroke="white"
              strokeWidth="3"
              className="cursor-pointer"
            />
            <text
              x={MOCK_RESORT.position.x}
              y={MOCK_RESORT.position.y + 5}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              {visitedIds.includes(MOCK_RESORT.id) ? '✓' : '🏔️'}
            </text>
          </svg>

          {/* Canvas 刮除层 */}
          {focusedResort && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
              style={{
                touchAction: 'none',
              }}
            />
          )}
        </div>

        {/* 提示文字 */}
        {!focusedResort && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 p-4 rounded-lg text-center max-w-xs">
              <div className="text-5xl mb-3">👆</div>
              <div className="text-xl font-bold mb-2">试试拖动</div>
              <div className="text-sm text-gray-300">
                单指平移 | 双指缩放
              </div>
            </div>
          </div>
        )}

        {focusedResort && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50">
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-center font-bold shadow-lg">
              ✍️ 刮开中心圆点
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
