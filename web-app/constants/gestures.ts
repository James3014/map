/**
 * 手势控制常量
 *
 * Linus Principle: "Pragmatism - solve real problems"
 * 这些阈值经过移动端优化，确保流畅的触控体验
 */

/**
 * 手势判定阈值 (单位: px)
 *
 * ⚠️ 这些值直接影响移动端体验，调整时需谨慎测试
 */
export const GESTURE = {
  /**
   * 触控滑动判定阈值
   * 移动距离超过此值才认为是有效滑动
   * 过小会导致误触，过大会感觉迟钝
   */
  TOUCH_SLOP: 8,

  /**
   * 双指捏合判定阈值
   * 两指距离变化超过此值才认为是缩放手势
   * 移动端建议 20-30px
   */
  PINCH_THRESHOLD: 25,

  /**
   * 平移手势判定阈值
   * 单指移动超过此值才认为是平移（而非点击）
   */
  PAN_THRESHOLD: 10,

  /**
   * 刮除手势判定阈值
   * 在聚焦状态下，单指移动超过此值才开始刮除
   * 设置较小值确保刮除响应灵敏
   */
  SCRATCH_THRESHOLD: 5,
} as const;

/**
 * 移动端性能优化配置
 */
export const PERFORMANCE = {
  /**
   * 是否启用触控事件节流
   * 在低端设备上可以提升性能
   */
  ENABLE_THROTTLE: false,

  /**
   * 触控事件节流间隔 (ms)
   */
  THROTTLE_INTERVAL: 16, // ~60fps

  /**
   * 是否在手势过程中降低渲染质量
   * 可以提升流畅度
   */
  REDUCE_QUALITY_ON_GESTURE: false,
} as const;

/**
 * 检测是否为移动设备
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

/**
 * 检测是否支持触控
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
