/**
 * UI Constants - 集中管理所有 UI 相關的魔法數字
 *
 * Linus Principle: "No magic numbers in code"
 * Clean Code: 常量集中管理，語義化命名
 */

export const UI = {
  // 自動關閉延遲（毫秒）
  AUTO_CLOSE_DELAY: 1200,

  // 地圖相關
  NEAREST_NEIGHBORS_COUNT: 5,          // 顯示最近鄰居數量
  LABEL_SHOW_SCALE_THRESHOLD: 2.8,    // 標籤自動顯示的縮放閾值（提高以避免擁擠）

  // 側邊欄尺寸
  SIDEBAR_MAX_HEIGHT: 500,             // 雪場列表最大高度（px）
  MAP_MIN_HEIGHT: 600,                 // 地圖最小高度（px）

  // 刮刮卡相關
  SCRATCH_CARD_SIZE: 320,              // 刮刮卡畫布尺寸（px）
  DETECTION_MARGIN: 20,                // 刮除檢測邊界（px）

  // 進度圓環
  PROGRESS_RING: {
    DEFAULT_SIZE: 120,                 // 默認尺寸（px）
    DEFAULT_STROKE_WIDTH: 8,           // 默認線條寬度（px）
    COLOR_THRESHOLDS: {
      CYAN: 0,      // 0-25%: 青色
      BLUE: 0.25,   // 25-50%: 藍色
      PURPLE: 0.5,  // 50-75%: 紫色
      PINK: 0.75,   // 75-100%: 粉色
      AMBER: 1.0,   // 100%: 琥珀色
    },
    HINT_THRESHOLDS: {
      CONTINUE: 70,  // < 70%: 繼續刮開
      ALMOST: 100,   // 70-99%: 快完成了
    },
  },
} as const;

/**
 * 進度顏色映射
 */
export const PROGRESS_COLORS = {
  CYAN: '#22D3EE',
  BLUE: '#3B82F6',
  PURPLE: '#A78BFA',
  PINK: '#F472B6',
  AMBER: '#FBBF24',
} as const;

/**
 * 獲取進度對應的顏色
 */
export function getProgressColor(progress: number): string {
  const { COLOR_THRESHOLDS } = UI.PROGRESS_RING;

  if (progress < COLOR_THRESHOLDS.BLUE) return PROGRESS_COLORS.CYAN;
  if (progress < COLOR_THRESHOLDS.PURPLE) return PROGRESS_COLORS.BLUE;
  if (progress < COLOR_THRESHOLDS.PINK) return PROGRESS_COLORS.PURPLE;
  if (progress < COLOR_THRESHOLDS.AMBER) return PROGRESS_COLORS.PINK;
  return PROGRESS_COLORS.AMBER;
}

/**
 * 獲取進度對應的提示文字
 */
export function getProgressHint(progress: number): string {
  const percentage = Math.round(progress * 100);
  const { HINT_THRESHOLDS } = UI.PROGRESS_RING;

  if (percentage < HINT_THRESHOLDS.CONTINUE) return '繼續刮開';
  if (percentage < HINT_THRESHOLDS.ALMOST) return '快完成了！';
  return '完成！';
}
