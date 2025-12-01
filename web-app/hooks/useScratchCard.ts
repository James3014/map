/**
 * useScratchCard - 固定尺寸刮刮卡邏輯（脫離地圖座標）
 *
 * 設計目標：
 * - 固定 320×320 畫布，中心刮除區域，避免地圖縮放/平移帶來的點擊偏移
 * - 10×10 格子進度檢測，活躍格子只覆蓋圓形區域
 * - 里程碑煙花 + 完成清屏
 */

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { getDevicePixelRatio } from '@/constants/map';
import type { Point } from '@/types/map';
import confetti from 'canvas-confetti';
import { updateCanvas } from '@/utils/canvasDrawing';

interface GridCell {
  x: number;
  y: number;
  scratched: boolean;
  active: boolean;
}

interface UseScratchCardOptions {
  visited: boolean;
  onComplete?: () => void;
  onProgressChange?: (progress: number) => void;
}

const CARD_CONFIG = {
  SIZE: 320, // 畫布邏輯尺寸
  GRID_SIZE: 10,
  BRUSH_RADIUS: 28,
  AREA_RADIUS: 140,
  COMPLETE_THRESHOLD: 0.8,  // 降低閾值：98% → 80%，提升用戶體驗
  MILESTONES: [0.25, 0.5, 0.75, 1],
  THROTTLE_MS: 16,  // 60fps 節流（1000ms / 60 ≈ 16ms）
} as const;

export function useScratchCard(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseScratchCardOptions
) {
  const { visited, onComplete, onProgressChange } = options;

  const gridRef = useRef<GridCell[][]>([]);
  const activeCellCountRef = useRef(0);
  const scratchedActiveCellsRef = useRef(0);
  const progressRef = useRef(visited ? 1 : 0);
  const lastPointRef = useRef<Point | null>(null);
  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const hasCompletedRef = useRef(false);
  const lastScratchTimeRef = useRef(0);  // 用於 60fps 節流

  const createGrid = useCallback((): GridCell[][] => {
    const grid: GridCell[][] = [];
    const { GRID_SIZE, AREA_RADIUS } = CARD_CONFIG;
    const cellSize = (AREA_RADIUS * 2) / GRID_SIZE;
    let activeCells = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      grid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const offsetX = (col + 0.5) * cellSize - AREA_RADIUS;
        const offsetY = (row + 0.5) * cellSize - AREA_RADIUS;
        const isActive = Math.hypot(offsetX, offsetY) <= AREA_RADIUS;

        grid[row][col] = {
          x: col,
          y: row,
          scratched: false,
          active: isActive,
        };

        if (isActive) activeCells++;
      }
    }

    activeCellCountRef.current = activeCells;
    return grid;
  }, []);

  const getGridCell = useCallback((point: Point): GridCell | null => {
    const center = CARD_CONFIG.SIZE / 2;
    const { GRID_SIZE, AREA_RADIUS } = CARD_CONFIG;

    const relativeX = point.x - center;
    const relativeY = point.y - center;
    const distance = Math.hypot(relativeX, relativeY);
    if (distance > AREA_RADIUS) return null;

    const gridX = Math.floor(((relativeX + AREA_RADIUS) / (AREA_RADIUS * 2)) * GRID_SIZE);
    const gridY = Math.floor(((relativeY + AREA_RADIUS) / (AREA_RADIUS * 2)) * GRID_SIZE);

    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) return null;
    const cell = gridRef.current[gridY]?.[gridX];
    if (!cell || !cell.active) return null;
    return cell;
  }, []);

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

  const triggerMilestones = useCallback((progress: number) => {
    for (const threshold of CARD_CONFIG.MILESTONES) {
      if (progress >= threshold && !milestonesReachedRef.current.has(threshold)) {
        milestonesReachedRef.current.add(threshold);

        const colors =
          threshold === 1
            ? ['#22D3EE', '#F472B6', '#FBBF24', '#A78BFA']
            : ['#22D3EE', '#38BDF8', '#60A5FA'];

        confetti({
          particleCount: threshold === 1 ? 120 : 30 + threshold * 60,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors,
          startVelocity: 25 + threshold * 30,
          gravity: 1,
        });
      }
    }
  }, []);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = getDevicePixelRatio();
    const size = CARD_CONFIG.SIZE;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // 使用提取的繪圖函數更新畫布
    updateCanvas(ctx, size, CARD_CONFIG.AREA_RADIUS, visited);

    gridRef.current = createGrid();
    scratchedActiveCellsRef.current = visited ? activeCellCountRef.current : 0;
    progressRef.current = visited ? 1 : 0;
    milestonesReachedRef.current.clear();
    onProgressChange?.(progressRef.current);
    hasCompletedRef.current = visited;
  }, [canvasRef, visited, createGrid, onProgressChange]);

  const scratch = useCallback(
    (screenPoint: Point) => {
      // 60fps 節流：防止過快連續刮除，提升性能
      const now = Date.now();
      if (now - lastScratchTimeRef.current < CARD_CONFIG.THROTTLE_MS) return;
      lastScratchTimeRef.current = now;

      const canvas = canvasRef.current;
      if (!canvas || hasCompletedRef.current) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const logicalPoint: Point = {
        x: ((screenPoint.x - rect.left) / rect.width) * CARD_CONFIG.SIZE,
        y: ((screenPoint.y - rect.top) / rect.height) * CARD_CONFIG.SIZE,
      };

      const center = CARD_CONFIG.SIZE / 2;
      const distance = Math.hypot(logicalPoint.x - center, logicalPoint.y - center);
      if (distance > CARD_CONFIG.AREA_RADIUS + 20) {
        // 點擊過遠，忽略
        lastPointRef.current = null;
        return;
      }

      const points = lastPointRef.current
        ? bresenhamLine(lastPointRef.current, logicalPoint)
        : [logicalPoint];

      points.forEach((p) => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(p.x, p.y, CARD_CONFIG.BRUSH_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        const cell = getGridCell(p);
        if (cell && !cell.scratched) {
          cell.scratched = true;
          scratchedActiveCellsRef.current++;
        }
      });

      lastPointRef.current = logicalPoint;

      const totalActive = activeCellCountRef.current || 1;
      const progress = scratchedActiveCellsRef.current / totalActive;
      if (progress > progressRef.current) {
        progressRef.current = progress;
        onProgressChange?.(progress);
        triggerMilestones(progress);

        if (progress >= CARD_CONFIG.COMPLETE_THRESHOLD) {
          hasCompletedRef.current = true;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onProgressChange?.(1);
          onComplete?.();
        }
      }
    },
    [canvasRef, getGridCell, bresenhamLine, onProgressChange, onComplete, triggerMilestones]
  );

  const reset = useCallback(() => {
    progressRef.current = visited ? 1 : 0;
    scratchedActiveCellsRef.current = visited ? activeCellCountRef.current : 0;
    lastPointRef.current = null;
    lastScratchTimeRef.current = 0;  // 重置節流計時器
    milestonesReachedRef.current.clear();
    hasCompletedRef.current = visited;
    initializeCanvas();
  }, [initializeCanvas, visited]);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  return {
    scratch,
    reset,
    progress: progressRef.current,
  };
}
