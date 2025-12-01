/**
 * labelCollision - 標籤碰撞檢測工具
 *
 * 解決地圖上標籤重疊問題：
 * - 計算邊界框（Bounding Box）
 * - 檢測碰撞
 * - 根據優先級決定顯示哪些標籤
 *
 * Design Philosophy (Linus):
 * - 簡潔的數據結構優先
 * - 高效的碰撞檢測算法（O(n²) 可接受，因為 n ≈ 40）
 * - 明確的優先級邏輯
 */

import type { Resort } from '@/data/resorts';
import type { Transform } from '@/types/map';

/**
 * 標籤邊界框
 */
export interface LabelBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 標籤優先級
 */
export enum LabelPriority {
  HOVERED = 5,      // 懸停（最高）
  FOCUSED = 4,      // 焦點
  VISITED = 3,      // 已訪問
  HIGHLIGHTED = 2,  // 搜尋高亮
  NEIGHBOR = 2,     // 焦點鄰居
  DEFAULT = 1,      // 默認
}

/**
 * 標籤信息
 */
export interface LabelInfo {
  resortId: string;
  resort: Resort;
  bounds: LabelBounds;
  priority: LabelPriority;
}

/**
 * 計算標籤邊界框
 *
 * @param resort - 雪場數據
 * @param transform - 地圖變換
 * @param labelPadding - 標籤內邊距（默認 8px）
 * @returns 標籤邊界框
 */
export function calculateLabelBounds(
  resort: Resort,
  transform: Transform,
  labelPadding = 8
): LabelBounds {
  // 估算標籤寬度（中文字符寬度較大）
  const charsCount = resort.name.length;
  const estimatedWidth = charsCount * 14 + labelPadding * 2; // 14px per char
  const estimatedHeight = 28; // 固定高度

  // 計算屏幕座標
  const screenX = resort.x * transform.scale + transform.translateX;
  const screenY = resort.y * transform.scale + transform.translateY;

  // 標籤位於標記右側偏上方
  return {
    x: screenX + 12, // 標記右側
    y: screenY - 20, // 標記上方
    width: estimatedWidth,
    height: estimatedHeight,
  };
}

/**
 * 檢測兩個邊界框是否碰撞
 *
 * @param a - 邊界框 A
 * @param b - 邊界框 B
 * @param margin - 額外間距（默認 4px）
 * @returns 是否碰撞
 */
export function checkCollision(
  a: LabelBounds,
  b: LabelBounds,
  margin = 4
): boolean {
  return !(
    a.x + a.width + margin < b.x ||
    b.x + b.width + margin < a.x ||
    a.y + a.height + margin < b.y ||
    b.y + b.height + margin < a.y
  );
}

/**
 * 計算標籤優先級
 *
 * @param resortId - 雪場 ID
 * @param options - 優先級選項
 * @returns 優先級等級
 */
export function calculatePriority(
  resortId: string,
  options: {
    isHovered: boolean;
    isFocused: boolean;
    isVisited: boolean;
    isHighlighted: boolean;
    isNeighbor: boolean;
  }
): LabelPriority {
  if (options.isHovered) return LabelPriority.HOVERED;
  if (options.isFocused) return LabelPriority.FOCUSED;
  if (options.isVisited) return LabelPriority.VISITED;
  if (options.isHighlighted || options.isNeighbor) return LabelPriority.HIGHLIGHTED;
  return LabelPriority.DEFAULT;
}

/**
 * 從候選標籤中選擇不碰撞的標籤集合
 *
 * 算法：貪心算法 + 優先級排序
 * 1. 按優先級從高到低排序
 * 2. 依次嘗試添加標籤
 * 3. 如果與已添加標籤碰撞，則跳過
 *
 * @param candidates - 候選標籤列表
 * @param margin - 碰撞檢測間距
 * @returns 不碰撞的標籤 ID 集合
 */
export function selectNonCollidingLabels(
  candidates: LabelInfo[],
  margin = 4
): Set<string> {
  const selected = new Set<string>();
  const selectedBounds: LabelBounds[] = [];

  // 按優先級從高到低排序
  const sorted = [...candidates].sort((a, b) => b.priority - a.priority);

  for (const candidate of sorted) {
    // 檢查是否與已選標籤碰撞
    const hasCollision = selectedBounds.some((bounds) =>
      checkCollision(candidate.bounds, bounds, margin)
    );

    if (!hasCollision) {
      selected.add(candidate.resortId);
      selectedBounds.push(candidate.bounds);
    }
  }

  return selected;
}

/**
 * 過濾出應該嘗試顯示的標籤
 *
 * 基礎過濾規則（在碰撞檢測前）：
 * - 懸停、焦點、已訪問、高亮、鄰居：總是嘗試顯示
 * - 縮放級別 > 閾值：所有標籤都嘗試顯示
 * - 否則：不顯示
 *
 * @param resorts - 所有雪場
 * @param transform - 地圖變換
 * @param options - 過濾選項
 * @returns 候選標籤列表
 */
export function filterCandidateLabels(
  resorts: Resort[],
  transform: Transform,
  options: {
    hoveredResortId: string | null;
    focusedResortId: string | null;
    visitedResortIds: string[];
    highlightedResortIds: string[];
    nearestResortIds: string[];
    showAllLabels: boolean;
    scaleThreshold: number;
  }
): LabelInfo[] {
  const candidates: LabelInfo[] = [];

  for (const resort of resorts) {
    const isHovered = resort.id === options.hoveredResortId;
    const isFocused = resort.id === options.focusedResortId;
    const isVisited = options.visitedResortIds.includes(resort.id);
    const isHighlighted = options.highlightedResortIds.includes(resort.id);
    const isNeighbor = options.nearestResortIds.includes(resort.id);

    // 基礎過濾：決定是否成為候選標籤
    const shouldBeCandidate =
      isHovered ||
      isFocused ||
      isVisited ||
      isHighlighted ||
      isNeighbor ||
      options.showAllLabels ||
      transform.scale > options.scaleThreshold;

    if (!shouldBeCandidate) continue;

    // 計算邊界框和優先級
    const bounds = calculateLabelBounds(resort, transform);
    const priority = calculatePriority(resort.id, {
      isHovered,
      isFocused,
      isVisited,
      isHighlighted,
      isNeighbor,
    });

    candidates.push({
      resortId: resort.id,
      resort,
      bounds,
      priority,
    });
  }

  return candidates;
}
