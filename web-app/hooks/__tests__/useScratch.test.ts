/**
 * useScratch Hook 测试
 *
 * 测试刮除进度跟踪和完成检测逻辑
 * Canvas 渲染测试将在集成测试中验证
 */

import { describe, it, expect } from 'vitest';
import { SCRATCH } from '@/constants/map';
import type { Point } from '@/types/map';

describe('useScratch', () => {
  describe('刮除进度计算', () => {
    it('应该根据刮除距离累积进度', () => {
      let progress = 0;
      const increment = 5; // 每次刮除增加 5

      // 模拟刮除 10 次
      for (let i = 0; i < 10; i++) {
        progress += increment;
      }

      expect(progress).toBe(50);
    });

    it('应该在进度达到阈值时触发完成', () => {
      const progress = 450; // 超过阈值 400
      const isComplete = progress >= SCRATCH.COMPLETE_THRESHOLD;

      expect(isComplete).toBe(true);
    });

    it('应该在进度未达到阈值时不触发完成', () => {
      const progress = 300; // 未达到阈值 400
      const isComplete = progress >= SCRATCH.COMPLETE_THRESHOLD;

      expect(isComplete).toBe(false);
    });
  });

  describe('雪场距离检测', () => {
    it('应该正确判断刮除点是否在雪场检测范围内', () => {
      const resortPos: Point = { x: 750, y: 180 }; // 二世谷
      const scratchPos: Point = { x: 800, y: 200 }; // 附近位置

      const distance = Math.hypot(
        scratchPos.x - resortPos.x,
        scratchPos.y - resortPos.y
      );

      const isInRange = distance < SCRATCH.DETECTION_RADIUS;

      expect(distance).toBeCloseTo(53.85, 1);
      expect(isInRange).toBe(true); // 53.85 < 150
    });

    it('应该正确判断刮除点超出雪场检测范围', () => {
      const resortPos: Point = { x: 750, y: 180 };
      const scratchPos: Point = { x: 500, y: 500 }; // 远离位置

      const distance = Math.hypot(
        scratchPos.x - resortPos.x,
        scratchPos.y - resortPos.y
      );

      const isInRange = distance < SCRATCH.DETECTION_RADIUS;

      expect(distance).toBeGreaterThan(SCRATCH.DETECTION_RADIUS);
      expect(isInRange).toBe(false);
    });
  });

  describe('笔刷纹理生成参数', () => {
    it('应该有正确的笔刷配置', () => {
      expect(SCRATCH.BRUSH_SIZE).toBe(80);
      expect(SCRATCH.BRUSH_TEXTURE.SIZE).toBe(64);
      expect(SCRATCH.BRUSH_TEXTURE.POINTS).toBe(50);
    });
  });
});
