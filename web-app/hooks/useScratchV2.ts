/**
 * useScratchV2 - 重新設計的刮刮樂系統
 *
 * 核心改進：
 * 1. 區塊檢測系統（10×10 格子）取代像素檢測
 * 2. 連續軌跡繪製（Bresenham 演算法）
 * 3. 實時進度反饋（圓環進度條）
 * 4. 分階段視覺效果（25% / 50% / 75% / 100%）
 *
 * Design Philosophy: Playful & Rewarding
 */

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import type { Point } from '@/types/map';
import type { Resort } from '@/data/resorts';
import { MAP, getDevicePixelRatio } from '@/constants/map';
import confetti from 'canvas-confetti';

interface GridCell {
  x: number;
  y: number;
  scratched: boolean;
  active: boolean;
}

interface UseScratchV2Options {
  focusedResort: Resort | null;
  visitedResortIds: string[];
  onComplete?: (resortId: string) => void;
  onExitFocus?: () => void;
  onProgressChange?: (progress: number) => void; // 新增：進度變化回調
}

// 配置常量
const SCRATCH_CONFIG = {
  GRID_SIZE: 10,              // 10×10 格子
  BRUSH_RADIUS: 40,           // 筆刷半徑（邏輯座標）
  COMPLETE_THRESHOLD: 0.7,    // 完成閾值 70%
  SCRATCH_AREA_RADIUS: 200,   // 刮除區域半徑
  MILESTONE_THRESHOLDS: [0.25, 0.5, 0.75, 1.0], // 里程碑進度
} as const;

export function useScratchV2(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseScratchV2Options
) {
  const { focusedResort, visitedResortIds, onComplete, onExitFocus, onProgressChange } = options;

  // 狀態 Refs
  const gridRef = useRef<GridCell[][]>([]);
  const progressRef = useRef(0);
  const activeCellCountRef = useRef(0);
  const scratchedActiveCellsRef = useRef(0);
  const lastPointRef = useRef<Point | null>(null);
  const hasCompletedRef = useRef(false);
  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const hasStartedScratchingRef = useRef(false);

  /**
   * 創建格子網格（10×10）
   */
  const createGrid = useCallback((): GridCell[][] => {
    const grid: GridCell[][] = [];
    const { GRID_SIZE, SCRATCH_AREA_RADIUS } = SCRATCH_CONFIG;
    const cellSize = (SCRATCH_AREA_RADIUS * 2) / GRID_SIZE;
    let activeCells = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      grid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const offsetX = (col + 0.5) * cellSize - SCRATCH_AREA_RADIUS;
        const offsetY = (row + 0.5) * cellSize - SCRATCH_AREA_RADIUS;
        const isActive = Math.hypot(offsetX, offsetY) <= SCRATCH_AREA_RADIUS;

        grid[row][col] = {
          x: col,
          y: row,
          scratched: false,
          active: isActive,
        };

        if (isActive) {
          activeCells++;
        }
      }
    }

    activeCellCountRef.current = activeCells;
    return grid;
  }, []);

  /**
   * 根據邏輯座標獲取對應的格子
   */
  const getGridCell = useCallback((logicalPoint: Point, center: Point | null): GridCell | null => {
    if (!center) return null;

    const { GRID_SIZE, SCRATCH_AREA_RADIUS } = SCRATCH_CONFIG;

    // 轉換為相對中心的座標
    const relativeX = logicalPoint.x - center.x;
    const relativeY = logicalPoint.y - center.y;

    // 檢查是否在刮除區域內
    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
    if (distance > SCRATCH_AREA_RADIUS) return null;

    // 轉換為格子座標（-RADIUS ~ +RADIUS → 0 ~ GRID_SIZE）
    const gridX = Math.floor(((relativeX + SCRATCH_AREA_RADIUS) / (SCRATCH_AREA_RADIUS * 2)) * GRID_SIZE);
    const gridY = Math.floor(((relativeY + SCRATCH_AREA_RADIUS) / (SCRATCH_AREA_RADIUS * 2)) * GRID_SIZE);

    // 邊界檢查
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
      return null;
    }

    const cell = gridRef.current[gridY]?.[gridX];
    if (!cell || !cell.active) return null;

    return cell;
  }, []);

  /**
   * Bresenham 直線演算法（確保軌跡連續）
   */
  const bresenhamLine = useCallback((from: Point, to: Point): Point[] => {
    const points: Point[] = [];
    let x0 = Math.floor(from.x);
    let y0 = Math.floor(from.y);
    const x1 = Math.floor(to.x);
    const y1 = Math.floor(to.y);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({ x: x0, y: y0 });

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return points;
  }, []);

  /**
   * 觸發里程碑效果（25% / 50% / 75% / 100%）
   */
  const triggerMilestoneEffect = useCallback((progress: number) => {
    const { MILESTONE_THRESHOLDS } = SCRATCH_CONFIG;

    for (const threshold of MILESTONE_THRESHOLDS) {
      if (progress >= threshold && !milestonesReachedRef.current.has(threshold)) {
        milestonesReachedRef.current.add(threshold);

        // 根據進度觸發不同效果
        if (threshold === 0.25) {
          // 25%: 小粒子
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#22D3EE', '#38BDF8'],
            startVelocity: 20,
          });
        } else if (threshold === 0.5) {
          // 50%: 中粒子
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#22D3EE', '#3B82F6', '#60A5FA'],
            startVelocity: 30,
          });
        } else if (threshold === 0.75) {
          // 75%: 大粒子
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#22D3EE', '#3B82F6', '#60A5FA', '#F472B6'],
            startVelocity: 40,
          });
        } else if (threshold === 1.0) {
          // 100%: 彩紙爆炸
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#22D3EE', '#F472B6', '#FBBF24', '#A78BFA'],
            startVelocity: 50,
            gravity: 1.2,
          });
        }
      }
    }
  }, []);

  /**
   * 初始化 Canvas（金屬質感刮刮樂遮罩）
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

    requestAnimationFrame(() => {
      const centerX = focusedResort.position.x;
      const centerY = focusedResort.position.y;
      const radius = SCRATCH_CONFIG.SCRATCH_AREA_RADIUS;

      // 1. 繪製銀色金屬漸變
      const metalGradient = ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
      );
      metalGradient.addColorStop(0, '#C0C0C0');
      metalGradient.addColorStop(0.5, '#A8A8A8');
      metalGradient.addColorStop(1, '#C0C0C0');
      ctx.fillStyle = metalGradient;
      ctx.fillRect(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);

      // 2. 添加光澤效果
      ctx.globalAlpha = 0.4;
      const shimmer = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius
      );
      shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      shimmer.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);
      ctx.globalAlpha = 1;

      // 3. 添加噪點紋理（刮獎券質感）
      const imageData = ctx.getImageData(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20; // ±10 亮度
        data[i] += noise;     // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B
      }
      ctx.putImageData(imageData, 0, 0);

      // 如果已經訪問過，直接透明
      if (visitedResortIds.includes(focusedResort.id)) {
        ctx.clearRect(0, 0, MAP.LOGICAL_SIZE, MAP.LOGICAL_SIZE);
      }
    });

    // 重置狀態
    gridRef.current = createGrid();
    scratchedActiveCellsRef.current = 0;
    progressRef.current = 0;
    milestonesReachedRef.current.clear();
    onProgressChange?.(
      visitedResortIds.includes(focusedResort.id) ? 1 : 0
    );

    if (visitedResortIds.includes(focusedResort.id)) {
      progressRef.current = 1;
      scratchedActiveCellsRef.current = activeCellCountRef.current;
    }
  }, [canvasRef, focusedResort, visitedResortIds, createGrid, onProgressChange]);

  /**
   * 刮除函數（連續軌跡 + 區塊標記）
   */
  const scratch = useCallback(
    (screenPoint: Point) => {
      const canvas = canvasRef.current;
      if (!canvas || !focusedResort || hasCompletedRef.current) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scratchCenter = focusedResort.position;

      // 轉換為邏輯座標
      const logicalX = ((screenPoint.x - rect.left) / rect.width) * MAP.LOGICAL_SIZE;
      const logicalY = ((screenPoint.y - rect.top) / rect.height) * MAP.LOGICAL_SIZE;
      const logicalPoint: Point = { x: logicalX, y: logicalY };

      // 檢查是否在刮除區域內
      const distance = Math.sqrt(
        (logicalX - scratchCenter.x) ** 2 + (logicalY - scratchCenter.y) ** 2
      );

      // 第一次點擊時檢查距離，如果太遠則退出
      if (!hasStartedScratchingRef.current && distance > SCRATCH_CONFIG.SCRATCH_AREA_RADIUS + 100) {
        onExitFocus?.();
        return;
      }

      if (distance < SCRATCH_CONFIG.SCRATCH_AREA_RADIUS) {
        hasStartedScratchingRef.current = true;
      }

      // 繪製連續軌跡（如果有上一個點）
      const pointsToDraw: Point[] = lastPointRef.current
        ? bresenhamLine(lastPointRef.current, logicalPoint)
        : [logicalPoint];

      // 繪製並標記格子
      pointsToDraw.forEach((point) => {
        // 繪製刮除效果
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(point.x, point.y, SCRATCH_CONFIG.BRUSH_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // 標記格子為已刮除
        const cell = getGridCell(point, scratchCenter);
        if (cell && !cell.scratched) {
          cell.scratched = true;
          scratchedActiveCellsRef.current++;
        }
      });

      lastPointRef.current = logicalPoint;

      // 計算進度
      const totalActiveCells = activeCellCountRef.current || 1;
      const newProgress = scratchedActiveCellsRef.current / totalActiveCells;
      if (newProgress > progressRef.current) {
        progressRef.current = newProgress;
        onProgressChange?.(newProgress);

        // 觸發里程碑效果
        triggerMilestoneEffect(newProgress);

        // 檢查是否完成
        if (
          newProgress >= SCRATCH_CONFIG.COMPLETE_THRESHOLD &&
          !visitedResortIds.includes(focusedResort.id)
        ) {
          hasCompletedRef.current = true;

          // 清除整個 Canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 觸發完成回調
          onComplete?.(focusedResort.id);
        }
      }
    },
    [
      canvasRef,
      focusedResort,
      visitedResortIds,
      onComplete,
      onExitFocus,
      onProgressChange,
      bresenhamLine,
      getGridCell,
      triggerMilestoneEffect,
    ]
  );

  /**
   * 重置刮除狀態
   */
  const reset = useCallback(() => {
    gridRef.current = createGrid();
    progressRef.current = 0;
    lastPointRef.current = null;
    hasCompletedRef.current = false;
    hasStartedScratchingRef.current = false;
    scratchedActiveCellsRef.current = 0;
    milestonesReachedRef.current.clear();
    onProgressChange?.(0);
    initializeCanvas();
  }, [createGrid, initializeCanvas, onProgressChange]);

  // 聚焦雪場時初始化 Canvas
  useEffect(() => {
    if (focusedResort) {
      hasStartedScratchingRef.current = false;
      hasCompletedRef.current = false;
      lastPointRef.current = null;
      initializeCanvas();
    }
  }, [focusedResort, initializeCanvas]);

  return {
    scratch,
    reset,
    progress: progressRef.current,
  };
}
