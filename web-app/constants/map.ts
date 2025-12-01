/**
 * 地图相关常量
 *
 * Linus Principle: "No magic numbers"
 * 所有数字都应该有清晰的含义和集中管理
 */

/**
 * 地图尺寸和缩放配置
 */
export const MAP = {
  /** 逻辑坐标系大小 (SVG viewBox) */
  LOGICAL_SIZE: 1000,

  /** 最小缩放倍数 */
  MIN_SCALE: 0.5,

  /** 最大缩放倍数 */
  MAX_SCALE: 4,

  /** 自动聚焦时的缩放倍数 */
  AUTO_ZOOM_SCALE: 1.35,

  /** 平移边界限制因子 (允许拖动到屏幕的 80%) */
  PAN_LIMIT_FACTOR: 0.8,
} as const;

/**
 * Canvas 刮除配置
 */
export const SCRATCH = {
  /** 笔刷大小 (逻辑坐标) */
  BRUSH_SIZE: 80,

  /** 雪场检测半径 (逻辑坐标) */
  DETECTION_RADIUS: 150,

  /** 完成刮除的进度阈值 (0.0 - 1.0，0.7 = 70%) */
  COMPLETE_THRESHOLD: 0.7,

  /** 进度检测的采样率 (检测每 N 个像素，提升性能) */
  SAMPLE_RATE: 4,

  /** 进度检测区域半径 (逻辑坐标，只检测中心圆形区域) */
  CHECK_RADIUS: 200,

  /** 进度检测频率 (每 N 次刮除检测一次，降低计算量) */
  CHECK_FREQUENCY: 5,

  /** 笔刷纹理生成参数 */
  BRUSH_TEXTURE: {
    SIZE: 64,
    POINTS: 50,
    MAX_RADIUS: 6,
  },
} as const;

/**
 * 动画时长配置 (ms)
 */
export const ANIMATION = {
  /** 自动缩放动画时长 */
  ZOOM_DURATION: 800,

  /** 重置地图动画时长 */
  RESET_DURATION: 500,

  /** Confetti 延迟 (刮除完成后) */
  CONFETTI_DELAY: 2500,

  /** 聚焦提示自动消失时间 */
  HINT_TIMEOUT: 10000,
} as const;

/**
 * 设备像素比 (用于高清屏幕渲染)
 */
export const getDevicePixelRatio = () => {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
};
