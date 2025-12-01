/**
 * useFilteredResorts - 雪場篩選 Hook
 *
 * 根據搜尋關鍵字和區域篩選雪場列表
 * 返回篩選後的雪場和高亮雪場 ID 列表
 */

import { useMemo } from 'react';
import type { Resort } from '@/data/resorts';

interface UseFilteredResortsOptions {
  /** 全部雪場列表 */
  resorts: Resort[];
  /** 搜尋關鍵字 */
  searchQuery: string;
  /** 選中的區域 ID */
  selectedRegion: string | null;
}

interface UseFilteredResortsReturn {
  /** 篩選後的雪場列表 */
  filteredResorts: Resort[];
  /** 高亮的雪場 ID 列表（用於地圖搜尋高亮） */
  highlightedResortIds: string[];
}

/**
 * 雪場篩選 Hook
 *
 * @param options - 篩選選項
 * @returns 篩選結果
 */
export function useFilteredResorts({
  resorts,
  searchQuery,
  selectedRegion,
}: UseFilteredResortsOptions): UseFilteredResortsReturn {
  // 篩選雪場：搜索 + 區域
  const filteredResorts = useMemo(() => {
    return resorts.filter((resort) => {
      // 搜索篩選
      const matchesSearch = searchQuery
        ? resort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resort.prefecture.includes(searchQuery) ||
          resort.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // 區域篩選
      const matchesRegion = selectedRegion
        ? resort.region === selectedRegion
        : true;

      return matchesSearch && matchesRegion;
    });
  }, [resorts, searchQuery, selectedRegion]);

  // 搜索高亮的雪場 ID 列表
  const highlightedResortIds = useMemo(() => {
    return searchQuery ? filteredResorts.map((r) => r.id) : [];
  }, [searchQuery, filteredResorts]);

  return {
    filteredResorts,
    highlightedResortIds,
  };
}
