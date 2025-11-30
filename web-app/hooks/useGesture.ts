/**
 * useGesture - 統一手勢控制 Hook
 *
 * Linus Principle: "Simplicity is the ultimate sophistication"
 * 將 200 行手勢邏輯提取為獨立 Hook，單一職責，易於測試
 *
 * 移動端優化：
 * - 低閾值確保響應靈敏
 * - passive: false 確保可以阻止預設行為
 * - 支援雙指縮放的中心點計算
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import { GestureMode, type GestureCallbacks } from '@/types/gestures';
import type { Point } from '@/types/map';
import { GESTURE } from '@/constants/gestures';
import type { Resort } from '@/data/resorts';

interface UseGestureOptions extends GestureCallbacks {
  /** 當前聚焦的雪場（影響手勢判定） */
  focusedResort?: Resort | null;
  /** 是否禁用手勢 */
  disabled?: boolean;
}

export function useGesture(
  containerRef: RefObject<HTMLElement | null>,
  options: UseGestureOptions
) {
  const { onScratch, onPan, onZoom, focusedResort, disabled = false } = options;

  // 手勢模式狀態
  const [mode, setMode] = useState<GestureMode>(GestureMode.IDLE);

  // 瞬態狀態（避免不必要的 re-render）
  const lastPointRef = useRef<Point | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // P3-9: 性能優化 - RAF 節流
  const rafIdRef = useRef<number | null>(null);
  const pendingPanRef = useRef<Point | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // ========== 工具函數 ==========

    /**
     * P3-9: RAF 節流的 pan 調用（優化性能）
     * 將多次 pan 合併為單次 RAF 回調
     */
    const throttledPan = (delta: Point) => {
      if (!pendingPanRef.current) {
        pendingPanRef.current = delta;
      } else {
        // 累積 delta
        pendingPanRef.current.x += delta.x;
        pendingPanRef.current.y += delta.y;
      }

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingPanRef.current) {
            onPan?.(pendingPanRef.current);
            pendingPanRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    };

    /**
     * 計算兩個觸摸點之間的距離
     */
    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // ========== Touch 事件處理 ==========

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // 單指觸控
        const touch = e.touches[0];
        lastPointRef.current = { x: touch.clientX, y: touch.clientY };
        isDraggingRef.current = true;

        // 智能模式判斷（Linus Principle: 消除特殊情況）
        // 如果已聚焦雪場，單指預設為刮除；否則為平移
        const newMode = focusedResort ? GestureMode.SCRATCH : GestureMode.PAN;
        setMode(newMode);
      } else if (e.touches.length === 2) {
        // 雙指觸控 = 縮放
        e.preventDefault();
        initialPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
        isDraggingRef.current = true;
        setMode(GestureMode.ZOOM);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      // 關鍵：阻止瀏覽器預設行為（縮放、滾動）
      e.preventDefault();

      if (e.touches.length === 1 && lastPointRef.current) {
        const touch = e.touches[0];
        const currentPoint: Point = { x: touch.clientX, y: touch.clientY };

        if (mode === GestureMode.SCRATCH) {
          // 刮除模式
          onScratch?.(currentPoint);
        } else if (mode === GestureMode.PAN) {
          // 平移模式 - P3-9: 使用 RAF 節流
          const delta: Point = {
            x: currentPoint.x - lastPointRef.current.x,
            y: currentPoint.y - lastPointRef.current.y,
          };
          throttledPan(delta);
        }

        lastPointRef.current = currentPoint;
      } else if (e.touches.length === 2 && initialPinchDistanceRef.current) {
        // 雙指縮放模式
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = currentDistance / initialPinchDistanceRef.current;

        // 計算雙指中心點
        const center: Point = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };

        onZoom?.(scaleChange, center);
        initialPinchDistanceRef.current = currentDistance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialPinchDistanceRef.current = null;
      }
      if (e.touches.length === 0) {
        isDraggingRef.current = false;
        lastPointRef.current = null;
        setMode(GestureMode.IDLE);
      }
    };

    // ========== Mouse 事件處理 ==========

    const handleMouseDown = (e: MouseEvent) => {
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = true;

      // 桌面端：聚焦時判斷是否在雪場附近，決定刮除或平移
      const newMode = focusedResort ? GestureMode.SCRATCH : GestureMode.PAN;
      setMode(newMode);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !lastPointRef.current) return;

      e.preventDefault();
      const currentPoint: Point = { x: e.clientX, y: e.clientY };

      if (mode === GestureMode.SCRATCH) {
        onScratch?.(currentPoint);
      } else if (mode === GestureMode.PAN) {
        // P3-9: 使用 RAF 節流
        const delta: Point = {
          x: currentPoint.x - lastPointRef.current.x,
          y: currentPoint.y - lastPointRef.current.y,
        };
        throttledPan(delta);
      }

      lastPointRef.current = currentPoint;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      lastPointRef.current = null;
      setMode(GestureMode.IDLE);
    };

    // ========== 綁定事件監聽器 ==========

    // Touch 事件（移動端）
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // Mouse 事件（桌面端）
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove); // 全局監聽，防止拖出容器
    window.addEventListener('mouseup', handleMouseUp);

    // ========== Wheel 事件處理（滾輪縮放） ==========

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // 計算縮放比例（向下滾動放大，向上滾動縮小）
      const delta = -e.deltaY;
      const scaleChange = delta > 0 ? 1.1 : 0.9;

      // 以滑鼠位置為中心縮放
      const center: Point = { x: e.clientX, y: e.clientY };
      onZoom?.(scaleChange, center);
    };

    // ========== 綁定 Wheel 事件 ==========
    container.addEventListener('wheel', handleWheel, { passive: false });

    // ========== 清理 ==========

    return () => {
      // P3-9: 取消待處理的 RAF
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);

      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, onScratch, onPan, onZoom, focusedResort, disabled, mode]);

  return { mode };
}
