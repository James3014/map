/**
 * useScratch - 刮除邏輯 Hook
 *
 * Linus Principle: "Keep it simple"
 * Canvas 刮除就是簡單的 destination-out 操作 + 進度追蹤
 */

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import type { Point } from '@/types/map';
import type { Resort } from '@/data/resorts';
import { MAP, SCRATCH, ANIMATION, getDevicePixelRatio } from '@/constants/map';
import { CoordinateTransform } from '@/utils/coordinates';
import confetti from 'canvas-confetti';

interface UseScratchOptions {
  /** 聚焦的雪場 */
  focusedResort: Resort | null;
  /** 已訪問的雪場 ID 列表 */
  visitedResortIds: string[];
  /** 刮除完成回調 */
  onComplete?: (resortId: string) => void;
  /** 退出聚焦回調（點擊遠離雪場的位置） */
  onExitFocus?: () => void;
}

export function useScratch(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseScratchOptions
) {
  const { focusedResort, visitedResortIds, onComplete, onExitFocus } = options;

  const progressRef = useRef(0);
  const brushRef = useRef<HTMLCanvasElement | null>(null);
  const coordinateTransformRef = useRef(new CoordinateTransform());
  const hasStartedScratchingRef = useRef(false);

  /**
   * 生成粗糙筆刷紋理
   */
  const createBrushTexture = useCallback(() => {
    const { SIZE, POINTS, MAX_RADIUS } = SCRATCH.BRUSH_TEXTURE;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const center = SIZE / 2;
    const radius = SIZE / 2;

    // 繪製多個隨機噪點圓形，模擬粗糙邊緣
    for (let i = 0; i < POINTS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(x, y, Math.random() * MAX_RADIUS + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.5 + 0.5})`;
      ctx.fill();
    }

    return canvas;
  }, []);

  /**
   * 初始化 Canvas（繪製銀灰色金屬質感遮罩）
   */
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !focusedResort) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = getDevicePixelRatio();

    // 設置物理像素尺寸
    canvas.width = MAP.LOGICAL_SIZE * dpr;
    canvas.height = MAP.LOGICAL_SIZE * dpr;

    // 縮放 Context 以匹配邏輯座標系
    ctx.scale(dpr, dpr);

    // 使用 requestAnimationFrame 確保 Canvas 已準備好
    requestAnimationFrame(() => {
      // 繪製金屬質感漸變
      const gradient = ctx.createRadialGradient(
        MAP.LOGICAL_SIZE / 2,
        MAP.LOGICAL_SIZE / 2,
        0,
        MAP.LOGICAL_SIZE / 2,
        MAP.LOGICAL_SIZE / 2,
        MAP.LOGICAL_SIZE / 2
      );
      gradient.addColorStop(0, 'rgba(180, 180, 180, 0.95)');
      gradient.addColorStop(0.5, 'rgba(140, 140, 140, 0.98)');
      gradient.addColorStop(1, 'rgba(100, 100, 100, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);

      // 添加金屬光澤
      ctx.globalAlpha = 0.3;
      const shimmer = ctx.createLinearGradient(0, 0, MAP.LOGICAL_SIZE, 0);
      shimmer.addColorStop(0, 'rgba(255, 255, 255, 0)');
      shimmer.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
      shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);
      ctx.globalAlpha = 1;

      // 如果已經訪問過，直接透明
      if (visitedResortIds.includes(focusedResort.id)) {
        ctx.clearRect(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);
      }
    });

    // 重置進度
    progressRef.current = 0;
  }, [canvasRef, focusedResort, visitedResortIds]);

  /**
   * 刮除函數
   */
  const scratch = useCallback(
    (screenPoint: Point) => {
      const canvas = canvasRef.current;
      const brush = brushRef.current;
      if (!canvas || !brush || !focusedResort) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();

      // 轉換為邏輯座標
      const logicalPoint = coordinateTransformRef.current.screenToLogical(
        screenPoint,
        rect
      );

      // 檢查是否在雪場範圍內
      const distance = coordinateTransformRef.current.distance(
        logicalPoint,
        focusedResort.position
      );

      // 只在第一次點擊時檢查距離，如果太遠（超過 400px）則退出聚焦
      // 一旦開始刮除，就不再退出
      if (!hasStartedScratchingRef.current && distance > 400) {
        onExitFocus?.();
        return;
      }

      // 標記已開始刮除
      if (distance < SCRATCH.DETECTION_RADIUS) {
        hasStartedScratchingRef.current = true;
      }

      // 刮除操作
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(
        brush,
        logicalPoint.x - SCRATCH.BRUSH_SIZE / 2,
        logicalPoint.y - SCRATCH.BRUSH_SIZE / 2,
        SCRATCH.BRUSH_SIZE,
        SCRATCH.BRUSH_SIZE
      );
      ctx.globalCompositeOperation = 'source-over';

      if (distance < SCRATCH.DETECTION_RADIUS) {
        progressRef.current += 5;

        // 檢查是否完成
        if (progressRef.current >= SCRATCH.COMPLETE_THRESHOLD) {
          if (!visitedResortIds.includes(focusedResort.id)) {
            // 觸發完成回調
            onComplete?.(focusedResort.id);

            // Confetti 動畫
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { x: 0.5, y: 0.5 },
              colors: ['#22d3ee', '#fbbf24', '#f472b6', '#a78bfa'],
              startVelocity: 50,
              gravity: 1.2,
            });
          }
        }
      }
    },
    [canvasRef, focusedResort, visitedResortIds, onComplete, onExitFocus]
  );

  /**
   * 重置刮除狀態
   */
  const reset = useCallback(() => {
    progressRef.current = 0;
    hasStartedScratchingRef.current = false;
    initializeCanvas();
  }, [initializeCanvas]);

  // 初始化筆刷紋理
  useEffect(() => {
    brushRef.current = createBrushTexture();
  }, [createBrushTexture]);

  // 聚焦雪場時初始化 Canvas
  useEffect(() => {
    if (focusedResort) {
      hasStartedScratchingRef.current = false;
      initializeCanvas();
    }
  }, [focusedResort, initializeCanvas]);

  return {
    scratch,
    reset,
    progress: progressRef.current,
  };
}
