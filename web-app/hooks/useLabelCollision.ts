/**
 * useLabelCollision - 標籤碰撞檢測 Hook
 *
 * 管理地圖上的標籤顯示，避免重疊
 */

import { useMemo } from 'react';
import type { Resort } from '@/data/resorts';
import type { Transform } from '@/types/map';
import { filterCandidateLabels, selectNonCollidingLabels } from '@/utils/labelCollision';
import { UI } from '@/constants/ui';

interface UseLabelCollisionOptions {
  /** 所有雪場 */
  resorts: Resort[];
  /** 地圖變換 */
  transform: Transform;
  /** 懸停的雪場 ID */
  hoveredResortId: string | null;
  /** 焦點雪場 ID */
  focusedResortId: string | null;
  /** 已訪問雪場 ID 列表 */
  visitedResortIds: string[];
  /** 搜尋高亮雪場 ID 列表 */
  highlightedResortIds: string[];
  /** 焦點附近最近鄰居 ID 列表 */
  nearestResortIds: string[];
  /** 是否顯示所有標籤 */
  showAllLabels: boolean;
}

/**
 * 標籤碰撞檢測 Hook
 *
 * @param options - Hook 選項
 * @returns 應該顯示標籤的雪場 ID 集合
 */
export function useLabelCollision(options: UseLabelCollisionOptions): Set<string> {
  const {
    resorts,
    transform,
    hoveredResortId,
    focusedResortId,
    visitedResortIds,
    highlightedResortIds,
    nearestResortIds,
    showAllLabels,
  } = options;

  // 計算應該顯示標籤的雪場集合
  const visibleLabelIds = useMemo(() => {
    // 1. 過濾出候選標籤
    const candidates = filterCandidateLabels(resorts, transform, {
      hoveredResortId,
      focusedResortId,
      visitedResortIds,
      highlightedResortIds,
      nearestResortIds,
      showAllLabels,
      scaleThreshold: UI.LABEL_SHOW_SCALE_THRESHOLD,
    });

    // 2. 從候選標籤中選出不碰撞的標籤
    const selected = selectNonCollidingLabels(candidates);

    return selected;
  }, [
    resorts,
    transform,
    hoveredResortId,
    focusedResortId,
    visitedResortIds,
    highlightedResortIds,
    nearestResortIds,
    showAllLabels,
  ]);

  return visibleLabelIds;
}
