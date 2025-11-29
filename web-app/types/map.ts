/**
 * 地图相关类型定义
 *
 * Linus Principle: "Good programmers worry about data structures"
 * 清晰的数据结构是优雅代码的基础
 */

import type { Resort } from '@/data/resorts';

/**
 * 二维坐标点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 2D 变换 (平移 + 缩放)
 */
export interface Transform {
  scale: number;  // 缩放倍数 (0.5 - 4.0)
  x: number;      // X 轴平移 (px)
  y: number;      // Y 轴平移 (px)
}

/**
 * 地图状态 (统一管理，避免多个独立 useState)
 */
export interface MapState {
  transform: Transform;
  focusedResort: Resort | null;
  scratchProgress: number;  // 0-100
}

/**
 * 刮除事件回调参数
 */
export interface ScratchEvent {
  point: Point;           // 刮除位置 (逻辑坐标)
  progress: number;       // 当前进度 (0-100)
  isComplete: boolean;    // 是否完成
}

/**
 * 边界矩形 (用于边界检查)
 */
export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
