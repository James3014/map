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
        >
          <ResortMarkers
            resorts={resorts}
            focusedResort={focusedResort}
            visitedResortIds={visitedResortIds}
            hoveredResort={hoveredResort}
            highlightedResortIds={highlightedResortIds}
            onResortClick={focusAndScratch}
            onHoverChange={setHoveredResort}
          />
        </svg>

        {/* Canvas 刮除層 (z-50) - 僅聚焦時顯示 */}
        <ScratchCanvas
          canvasRef={canvasRef}
          focusedResort={focusedResort}
        />
      </div>

      {/* 最上層：聚焦提示 (z-60) - 不隨地圖縮放 */}
      <FocusHint focusedResort={focusedResort} visitedResortIds={visitedResortIds} />
    </div>
  );
}
