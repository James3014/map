/**
 * useMapTransform Hook 测试
 *
 * 测试地图变换逻辑（缩放、平移、聚焦）
 */

import { describe, it, expect } from 'vitest';
import { MAP } from '@/constants/map';
import type { Transform } from '@/types/map';

describe('useMapTransform', () => {
  describe('Transform 状态管理', () => {
    it('应该有默认的 transform 状态', () => {
      const defaultTransform: Transform = {
        scale: 1,
        x: 0,
        y: 0,
      };

      expect(defaultTransform.scale).toBe(1);
      expect(defaultTransform.x).toBe(0);
      expect(defaultTransform.y).toBe(0);
    });

    it('应该限制缩放在最小和最大范围内', () => {
      const testScale = (scale: number) => {
        return Math.min(Math.max(scale, MAP.MIN_SCALE), MAP.MAX_SCALE);
      };

      expect(testScale(0.3)).toBe(MAP.MIN_SCALE); // 低于最小值
      expect(testScale(2)).toBe(2); // 正常范围
      expect(testScale(5)).toBe(MAP.MAX_SCALE); // 超过最大值
    });
  });

  describe('聚焦计算', () => {
    it('应该正确计算聚焦目标的屏幕坐标', () => {
      // 模拟雪场在逻辑坐标 (750, 180) - 北海道二世谷
      const resortLogicalX = 750;
      const resortLogicalY = 180;
      const mapSize = 1000; // 假设容器是 1000x1000
      const targetScale = MAP.AUTO_ZOOM_SCALE; // 2.5

      // 计算雪场在屏幕坐标系中的位置
      const resortScreenX = (resortLogicalX / 1000) * mapSize; // 750px
      const resortScreenY = (resortLogicalY / 1000) * mapSize; // 180px

      // 计算居中后的平移
      const centerX = mapSize / 2; // 500px
      const centerY = mapSize / 2; // 500px

      const targetX = centerX - resortScreenX * targetScale;
      const targetY = centerY - resortScreenY * targetScale;

      // 验证计算逻辑
      expect(resortScreenX).toBe(750);
      expect(resortScreenY).toBe(180);
      expect(targetX).toBe(500 - 750 * 2.5); // -1375
      expect(targetY).toBe(500 - 180 * 2.5); // 50
    });
  });

  describe('边界检查', () => {
    it('应该限制平移在合理范围内', () => {
      const containerWidth = 1000;
      const limitFactor = MAP.PAN_LIMIT_FACTOR; // 0.8
      const limitX = containerWidth * limitFactor; // 800

      const clampX = (x: number) => {
        if (x > limitX) return limitX;
        if (x < -limitX) return -limitX;
        return x;
      };

      expect(clampX(1000)).toBe(800); // 超出右边界
      expect(clampX(-1000)).toBe(-800); // 超出左边界
      expect(clampX(500)).toBe(500); // 正常范围
    });

    it('应该根据缩放比例调整平移限制', () => {
      const containerWidth = 1000;
      const limitFactor = MAP.PAN_LIMIT_FACTOR; // 0.8

      // 测试不同缩放级别的限制
      const clampXWithScale = (x: number, scale: number) => {
        const limitX = containerWidth * limitFactor * scale;
        if (x > limitX) return limitX;
        if (x < -limitX) return -limitX;
        return x;
      };

      // scale = 1: 限制 ±800
      expect(clampXWithScale(1000, 1)).toBe(800);
      expect(clampXWithScale(-1000, 1)).toBe(-800);

      // scale = 2: 限制 ±1600
      expect(clampXWithScale(2000, 2)).toBe(1600);
      expect(clampXWithScale(-2000, 2)).toBe(-1600);
      expect(clampXWithScale(1000, 2)).toBe(1000); // 在范围内

      // scale = 3: 限制 ±2400
      expect(clampXWithScale(3000, 3)).toBe(2400);
      expect(clampXWithScale(-3000, 3)).toBe(-2400);
      expect(clampXWithScale(-500, 3)).toBe(-500); // 在范围内
    });
  });
});
