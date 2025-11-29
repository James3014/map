/**
 * 坐标转换工具类
 *
 * Linus Principle: "Keep it simple"
 * 清晰的坐标转换逻辑，单一职责，易于测试
 */

import type { Point } from '@/types/map';
import { MAP } from '@/constants/map';

export class CoordinateTransform {
  private readonly logicalSize: number;

  constructor(logicalSize: number = MAP.LOGICAL_SIZE) {
    this.logicalSize = logicalSize;
  }

  /**
   * 将屏幕坐标转换为逻辑坐标 (0-1000)
   *
   * @param screenPoint - 屏幕坐标 (相对于视口)
   * @param rect - Canvas 元素的 DOMRect
   * @returns 逻辑坐标
   */
  screenToLogical(screenPoint: Point, rect: DOMRect): Point {
    return {
      x: ((screenPoint.x - rect.left) / rect.width) * this.logicalSize,
      y: ((screenPoint.y - rect.top) / rect.height) * this.logicalSize,
    };
  }

  /**
   * 将逻辑坐标转换为屏幕坐标
   *
   * @param logicalPoint - 逻辑坐标 (0-1000)
   * @param rect - Canvas 元素的 DOMRect
   * @returns 屏幕坐标
   */
  logicalToScreen(logicalPoint: Point, rect: DOMRect): Point {
    return {
      x: (logicalPoint.x / this.logicalSize) * rect.width + rect.left,
      y: (logicalPoint.y / this.logicalSize) * rect.height + rect.top,
    };
  }

  /**
   * 计算两点之间的欧几里得距离
   *
   * @param p1 - 第一个点
   * @param p2 - 第二个点
   * @returns 距离
   */
  distance(p1: Point, p2: Point): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
}
