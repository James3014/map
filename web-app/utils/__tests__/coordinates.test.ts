/**
 * 坐标转换工具测试
 *
 * TDD: Red → Green → Refactor
 * Linus Principle: "Show me the code that works"
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinateTransform } from '../coordinates';
import type { Point } from '@/types/map';

describe('CoordinateTransform', () => {
  let transform: CoordinateTransform;
  let mockRect: DOMRect;

  beforeEach(() => {
    transform = new CoordinateTransform();
    // 模拟一个 1000x1000 的 Canvas 元素
    mockRect = {
      left: 0,
      top: 0,
      width: 1000,
      height: 1000,
      right: 1000,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  });

  describe('screenToLogical', () => {
    it('应该将屏幕左上角 (0, 0) 转换为逻辑坐标 (0, 0)', () => {
      const screenPoint: Point = { x: 0, y: 0 };
      const result = transform.screenToLogical(screenPoint, mockRect);

      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('应该将屏幕右下角 (1000, 1000) 转换为逻辑坐标 (1000, 1000)', () => {
      const screenPoint: Point = { x: 1000, y: 1000 };
      const result = transform.screenToLogical(screenPoint, mockRect);

      expect(result).toEqual({ x: 1000, y: 1000 });
    });

    it('应该将屏幕中心 (500, 500) 转换为逻辑坐标 (500, 500)', () => {
      const screenPoint: Point = { x: 500, y: 500 };
      const result = transform.screenToLogical(screenPoint, mockRect);

      expect(result).toEqual({ x: 500, y: 500 });
    });

    it('应该正确处理 Canvas 有偏移的情况', () => {
      const offsetRect: DOMRect = {
        ...mockRect,
        left: 100,
        top: 50,
      };

      // 屏幕坐标 (600, 550) 在偏移 Canvas 中相当于 Canvas 内的 (500, 500)
      const screenPoint: Point = { x: 600, y: 550 };
      const result = transform.screenToLogical(screenPoint, offsetRect);

      expect(result).toEqual({ x: 500, y: 500 });
    });

    it('应该正确处理 Canvas 尺寸缩放的情况', () => {
      const scaledRect: DOMRect = {
        ...mockRect,
        width: 500,
        height: 500,
      };

      // 屏幕坐标 (250, 250) 在 500x500 的 Canvas 中应该是逻辑坐标 (500, 500)
      const screenPoint: Point = { x: 250, y: 250 };
      const result = transform.screenToLogical(screenPoint, scaledRect);

      expect(result).toEqual({ x: 500, y: 500 });
    });
  });

  describe('logicalToScreen', () => {
    it('应该将逻辑坐标 (0, 0) 转换为屏幕坐标 (0, 0)', () => {
      const logicalPoint: Point = { x: 0, y: 0 };
      const result = transform.logicalToScreen(logicalPoint, mockRect);

      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('应该将逻辑坐标 (1000, 1000) 转换为屏幕坐标 (1000, 1000)', () => {
      const logicalPoint: Point = { x: 1000, y: 1000 };
      const result = transform.logicalToScreen(logicalPoint, mockRect);

      expect(result).toEqual({ x: 1000, y: 1000 });
    });

    it('应该正确处理 Canvas 有偏移的情况', () => {
      const offsetRect: DOMRect = {
        ...mockRect,
        left: 100,
        top: 50,
      };

      const logicalPoint: Point = { x: 500, y: 500 };
      const result = transform.logicalToScreen(logicalPoint, offsetRect);

      expect(result).toEqual({ x: 600, y: 550 });
    });
  });

  describe('distance', () => {
    it('应该正确计算两点之间的距离', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };
      const result = transform.distance(p1, p2);

      expect(result).toBe(5); // 3-4-5 直角三角形
    });

    it('应该正确计算相同点的距离为 0', () => {
      const p1: Point = { x: 100, y: 200 };
      const p2: Point = { x: 100, y: 200 };
      const result = transform.distance(p1, p2);

      expect(result).toBe(0);
    });

    it('应该正确计算负坐标的距离', () => {
      const p1: Point = { x: -3, y: -4 };
      const p2: Point = { x: 0, y: 0 };
      const result = transform.distance(p1, p2);

      expect(result).toBe(5);
    });
  });

  describe('屏幕坐标 ↔ 逻辑坐标 互转', () => {
    it('应该保证往返转换的精度', () => {
      const originalScreen: Point = { x: 753, y: 421 };

      // 屏幕 → 逻辑 → 屏幕
      const logical = transform.screenToLogical(originalScreen, mockRect);
      const backToScreen = transform.logicalToScreen(logical, mockRect);

      expect(backToScreen.x).toBeCloseTo(originalScreen.x, 2);
      expect(backToScreen.y).toBeCloseTo(originalScreen.y, 2);
    });
  });
});
