/**
 * JapanMap - 日本雪場地圖主組件 (重構版)
 *
 * Linus Principle: "Good programmers know what to write. Great ones know what to rewrite"
 * 從 826 行重構到 < 150 行，通過提取 Hooks 和子組件實現清晰的分層架構
 */

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Resort, REGIONS } from '@/data/resorts';
import { JapanBaseMap } from './JapanBaseMap';
import { ResortMarkers } from './ResortMarkers';
import { ScratchCanvas } from './ScratchCanvas';
import { FocusHint } from './FocusHint';
import { useMapTransform } from '@/hooks/useMapTransform';
import { useGesture } from '@/hooks/useGesture';
import { useScratch } from '@/hooks/useScratch';

interface JapanMapProps {
  visitedResortIds: string[];
  onResortClick: (resortId: string) => void;
  resorts: Resort[];
  externalFocusedResortId?: string | null;
  onFocusChange?: (resortId: string | null) => void;
  highlightedResortIds?: string[]; // P3-7: 搜索高亮
}

export function JapanMap({
  visitedResortIds,
  onResortClick,
  resorts,
  externalFocusedResortId,
  onFocusChange,
  highlightedResortIds = [], // P3-7: 默认空数组
}: JapanMapProps) {
  const [hoveredResort, setHoveredResort] = useState<string | null>(null);
  const [focusedResort, setFocusedResort] = useState<Resort | null>(null);
  const [showAllLabels, setShowAllLabels] = useState(false); // 切換顯示所有標籤

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 根據都道府縣代碼獲取區域顏色
  const getRegionColor = (code: number) => {
    const region = Object.values(REGIONS).find(r => r.prefectureCode.includes(code));
    return region ? region.color : '#EEEEEE';
  };

  // Hook 1: 地圖變換管理
  const { transform, pan, zoom, focusOnResort, reset } =
    useMapTransform(containerRef);

  /**
   * 退出聚焦模式
   */
  const exitFocus = useCallback(() => {
    setFocusedResort(null);
    onFocusChange?.(null);
    reset();
  }, [onFocusChange, reset]);

  // Hook 2: 刮除邏輯
  const { scratch } = useScratch(canvasRef, {
    focusedResort,
    visitedResortIds,
    onComplete: (resortId) => {
      onResortClick(resortId);
      setTimeout(() => {
        exitFocus();
      }, 2000);
    },
    onExitFocus: exitFocus,
  });

  // Hook 3: 手势控制
  const { mode } = useGesture(containerRef, {
    focusedResort,
    onPan: (delta) => pan(delta),
    onZoom: (scaleChange, center) => zoom(scaleChange, center),
    onScratch: (point) => scratch(point),
  });

  /**
   * 聚焦並啟動刮除流程
   */
  const focusAndScratch = useCallback(
    (resort: Resort) => {
      setFocusedResort(resort);
      focusOnResort(resort);
      onFocusChange?.(resort.id);
    },
    [focusOnResort, onFocusChange]
  );

  /**
   * 響應外部聚焦請求
   */
  useEffect(() => {
    if (externalFocusedResortId) {
      const resort = resorts.find((r) => r.id === externalFocusedResortId);
      if (resort && resort.id !== focusedResort?.id) {
        focusAndScratch(resort);
      }
    } else if (externalFocusedResortId === null && focusedResort) {
      setFocusedResort(null);
      reset();
    }
  }, [externalFocusedResortId, resorts, focusedResort, focusAndScratch, reset]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* 標籤切換按鈕 - 移動端友好 */}
      <button
        onClick={() => setShowAllLabels(!showAllLabels)}
        className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-lg font-medium transition-all ${
          showAllLabels
            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
            : 'bg-gray-800/90 text-gray-300 border border-gray-700/50 hover:bg-gray-700/90'
        }`}
        style={{ touchAction: 'auto' }}
      >
        {showAllLabels ? '隱藏標籤' : '顯示標籤'}
      </button>

      {/* 縮放提示 - 僅在未顯示標籤且未縮放時顯示 */}
      {!showAllLabels && transform.scale <= 1.8 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800/90 text-gray-300 text-sm rounded-lg border border-gray-700/50">
          💡 提示：放大地圖或點擊「顯示標籤」查看雪場名稱
        </div>
      )}

      {/* 可變換容器 - 包含所有圖層 */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: 'none', // 禁止瀏覽器預設手勢
        }}
      >
        {/* 底層：日本地圖輪廓 (z-10) */}
        <div className="absolute inset-0 w-full h-full z-10">
          <JapanBaseMap getRegionColor={getRegionColor} />
        </div>

        {/* SVG 地圖層 (z-30) - 雪場標記 */}
        <svg
          className="absolute inset-0 w-full h-full z-30"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: 'auto' }}
        >
          {/* 應用與 JapanBaseMap 相同的 transform */}
          <g transform="matrix(1.028807, 0, 0, 1.028807, -47.544239, -28.806583)">
            <g transform="matrix(1, 0, 0, 1, 6, 18)">
              {/* Mountain icons with hover labels */}
              {resorts.map(resort => {
            const isVisited = visitedResortIds.includes(resort.id);
            const isFocused = focusedResort?.id === resort.id;
            const isHovered = hoveredResort === resort.id;
            const isHighlighted = highlightedResortIds.includes(resort.id);
            const color = REGIONS[resort.region].color;

            // 決定是否顯示標籤
            // 1. Hover（桌面端）
            // 2. 聚焦或高亮
            // 3. 手動切換顯示所有標籤
            // 4. 縮放到一定程度自動顯示（scale > 1.8）
            const isZoomedIn = transform.scale > 1.8;
            const showLabel = isHovered || isFocused || isHighlighted || showAllLabels || isZoomedIn;
            const scale = isHovered ? 1.3 : isFocused ? 1.5 : 1;

            return (
              <g
                key={resort.id}
                transform={`translate(${resort.position.x}, ${resort.position.y}) scale(${scale})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  focusAndScratch(resort);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  focusAndScratch(resort);
                }}
                onMouseEnter={() => setHoveredResort(resort.id)}
                onMouseLeave={() => setHoveredResort(null)}
                style={{ transformOrigin: 'center' }}
              >
                {/* 山形圖標 */}
                <path
                  d="M0,-10 L8,8 L-8,8 Z"
                  fill={isVisited ? color : '#64748b'}
                  stroke="white"
                  strokeWidth="1.5"
                />
                {/* 山頂雪 */}
                <path
                  d="M0,-10 L3,-3 L0,-5 L-3,-3 Z"
                  fill="white"
                />

                {/* Hover 時顯示標籤 */}
                {showLabel && (
                  <g transform="translate(0, -20)" pointerEvents="none">
                    {/* 背景框 */}
                    <rect
                      x="-40"
                      y="-15"
                      width="80"
                      height="18"
                      rx="9"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* 名稱文字 */}
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {resort.name}
                    </text>
                    {/* 下方小三角 */}
                    <path
                      d="M-4,3 L0,8 L4,3 Z"
                      fill={color}
                    />
                  </g>
                )}

                {/* 高亮發光效果 */}
                {isHighlighted && (
                  <circle
                    r="15"
                    fill={color}
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
            </g>
          </g>
        </svg>

        {/* Canvas 刮除層 (z-50) - 僅聚焦時顯示 */}
        <ScratchCanvas
          canvasRef={canvasRef}
          focusedResort={focusedResort}
        />

        {/* 標籤層 (z-60) - 在 Canvas 之上，顯示聚焦雪場的名稱 */}
        {focusedResort && (
          <div
            className="absolute z-60 pointer-events-none"
            style={{
              left: '50%',
              top: '40%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="glass-panel px-6 py-3 rounded-xl border-2" style={{ borderColor: REGIONS[focusedResort.region].color }}>
              <div className="text-2xl font-bold text-white text-center">
                {focusedResort.name}
              </div>
              <div className="text-sm text-gray-400 text-center mt-1">
                {focusedResort.prefecture} · {REGIONS[focusedResort.region].name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 最上層：聚焦提示 (z-70) - 不隨地圖縮放 */}
      <FocusHint focusedResort={focusedResort} visitedResortIds={visitedResortIds} />
    </div>
  );
}
