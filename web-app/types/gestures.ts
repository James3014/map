/**
 * 手势控制相关类型定义
 *
 * Linus Principle: "Eliminate special cases"
 * 使用枚举替代字符串字面量，消除 if/else 分支
 */

import type { Point } from './map';

/**
 * 手势模式 (状态机)
 */
export enum GestureMode {
  IDLE = 'idle',         // 空闲状态
  PAN = 'pan',           // 平移地图
  ZOOM = 'zoom',         // 双指缩放
  SCRATCH = 'scratch',   // 刮除
}

/**
 * 手势状态
 */
export interface GestureState {
  mode: GestureMode;
  startPoint: Point | null;           // 初始触摸点
  lastPoint: Point | null;            // 上一次触摸点
  initialPinchDistance: number | null; // 初始捏合距离
}

/**
 * 手势事件回调
 */
export interface GestureCallbacks {
  onScratch?: (point: Point) => void;
  onPan?: (delta: Point) => void;
  onZoom?: (scale: number, center: Point) => void;
}
