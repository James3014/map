/**
 * useMapTransform - 地圖變換管理 Hook
 *
 * Linus Principle: "Data structures, not algorithms"
 * Transform 狀態就是簡單的 {scale, x, y}，清晰明瞭
 */

import { useState, useCallback, useEffect, type RefObject } from 'react';
import type { Transform, Point } from '@/types/map';
import type { Resort } from '@/data/resorts';
import { MAP, ANIMATION } from '@/constants/map';

interface UseMapTransformOptions {
  /** 初始變換狀態 */
  initialTransform?: Transform;
  /** 是否啟用過渡動畫 */
  enableTransition?: boolean;
}

export function useMapTransform(
  containerRef: RefObject<HTMLElement | null>,
  options: UseMapTransformOptions = {}
) {
  const {
    initialTransform = { scale: 1, x: 0, y: 0 },
    enableTransition = true,
  } = options;

  const [transform, setTransform] = useState<Transform>(initialTransform);

  /**
   * 應用 CSS Transform 到容器
   */
  const applyTransform = useCallback(
    (newTransform: Transform, animated = false) => {
      const container = containerRef.current;
      if (!container) return;

      // 啟用/禁用過渡動畫
      if (enableTransition && animated) {
        container.style.transition = `transform ${ANIMATION.ZOOM_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
      } else {
        container.style.transition = '';
      }

      // 應用變換
      container.style.transformOrigin = '0 0';
      container.style.transform = `translate(${newTransform.x}px, ${newTransform.y}px) scale(${newTransform.scale})`;

      // 動畫結束後移除 transition（避免影響手勢操作）
      if (animated && enableTransition) {
        setTimeout(() => {
          if (container) container.style.transition = '';
        }, ANIMATION.ZOOM_DURATION);
      }

      setTransform(newTransform);
    },
    [containerRef, enableTransition]
  );

  /**
   * 限制縮放範圍
   */
  const clampScale = useCallback((scale: number): number => {
    return Math.min(Math.max(scale, MAP.MIN_SCALE), MAP.MAX_SCALE);
  }, []);

  /**
   * 限制平移範圍（防止地圖完全拖出螢幕）
   * 注意：限制需要隨縮放比例調整，放大時需要更大的平移範圍
   */
  const clampTranslation = useCallback(
    (x: number, y: number, scale: number): Point => {
      const container = containerRef.current;
      if (!container || !container.parentElement) return { x, y };

      const rect = container.parentElement.getBoundingClientRect();
      // 限制隨縮放比例放大 - 這樣放大時才能拖到邊緣
      const limitX = rect.width * MAP.PAN_LIMIT_FACTOR * scale;
      const limitY = rect.height * MAP.PAN_LIMIT_FACTOR * scale;

      return {
        x: Math.min(Math.max(x, -limitX), limitX),
        y: Math.min(Math.max(y, -limitY), limitY),
      };
    },
    [containerRef]
  );

  /**
   * 平移地圖
   */
  const pan = useCallback(
    (delta: Point) => {
      const newX = transform.x + delta.x;
      const newY = transform.y + delta.y;
      const clamped = clampTranslation(newX, newY, transform.scale);

      applyTransform(
        {
          ...transform,
          x: clamped.x,
          y: clamped.y,
        },
        false
      );
    },
    [transform, applyTransform, clampTranslation]
  );

  /**
   * 縮放地圖（以指定中心點）
   */
  const zoom = useCallback(
    (scaleChange: number, center: Point) => {
      const container = containerRef.current;
      if (!container || !container.parentElement) return;

      const parentRect = container.parentElement.getBoundingClientRect();

      // 計算中心點相對於父容器的位置
      const relativeCenterX = center.x - parentRect.left;
      const relativeCenterY = center.y - parentRect.top;

      const oldScale = transform.scale;
      const newScale = clampScale(oldScale * scaleChange);

      // 計算中心點在邏輯空間的位置（保持中心點不動）
      const logicalCenterX = (relativeCenterX - transform.x) / oldScale;
      const logicalCenterY = (relativeCenterY - transform.y) / oldScale;

      // 計算新的平移，確保中心點位置不變
      const newX = relativeCenterX - logicalCenterX * newScale;
      const newY = relativeCenterY - logicalCenterY * newScale;

      applyTransform(
        {
          scale: newScale,
          x: newX,
          y: newY,
        },
        false
      );
    },
    [containerRef, transform, applyTransform, clampScale]
  );

  /**
   * 聚焦到雪場（自動縮放並居中）
   */
  const focusOnResort = useCallback(
    (resort: Resort) => {
      const container = containerRef.current;
      if (!container || !container.parentElement) return;

      const rect = container.parentElement.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 雪場在螢幕座標系中的位置
      const mapSize = rect.width; // 假設容器是正方形
      const resortX = (resort.position.x / 1000) * mapSize;
      const resortY = (resort.position.y / 1000) * mapSize;

      const targetScale = MAP.AUTO_ZOOM_SCALE;

      // 計算平移，使雪場居中
      const targetX = centerX - resortX * targetScale;
      const targetY = centerY - resortY * targetScale;

      applyTransform(
        {
          scale: targetScale,
          x: targetX,
          y: targetY,
        },
        true // 啟用動畫
      );
    },
    [containerRef, applyTransform]
  );

  /**
   * 重置視角
   */
  const reset = useCallback(() => {
    applyTransform(initialTransform, true);
  }, [applyTransform, initialTransform]);

  // 初始化時應用預設 transform
  useEffect(() => {
    if (containerRef.current) {
      applyTransform(initialTransform, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    transform,
    pan,
    zoom,
    focusOnResort,
    reset,
    setTransform: applyTransform,
  };
}
