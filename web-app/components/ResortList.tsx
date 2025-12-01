/**
 * ResortList - 雪場列表組件
 *
 * 提供雪場列表的篩選和顯示功能：
 * - 區域篩選按鈕
 * - 搜尋框
 * - 可滾動的雪場列表
 * - 快速標記訪問狀態
 */

'use client';

import { MapPin } from 'lucide-react';
import type { Resort } from '@/data/resorts';
import { REGIONS } from '@/data/resorts';
import { UI } from '@/constants/ui';

interface ResortListProps {
  /** 篩選後的雪場列表 */
  filteredResorts: Resort[];
  /** 已訪問的雪場 ID 列表 */
  visitedResortIds: string[];
  /** 搜尋關鍵字 */
  searchQuery: string;
  /** 選中的區域 ID */
  selectedRegion: string | null;
  /** 設置搜尋關鍵字 */
  setSearchQuery: (query: string) => void;
  /** 設置選中的區域 */
  setSelectedRegion: (region: string | null) => void;
  /** 打開刮刮卡回調 */
  onOpenScratch: (resortId: string) => void;
  /** 切換訪問狀態回調 */
  onToggleVisited: (resortId: string) => void;
}

export function ResortList({
  filteredResorts,
  visitedResortIds,
  searchQuery,
  selectedRegion,
  setSearchQuery,
  setSelectedRegion,
  onOpenScratch,
  onToggleVisited,
}: ResortListProps) {
  return (
    <div
      className="glass-panel rounded-xl p-6 flex flex-col"
      style={{ maxHeight: `${UI.SIDEBAR_MAX_HEIGHT}px`, overflow: 'hidden' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold">雪場列表</h2>
      </div>

      {/* 區域篩選按鈕 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setSelectedRegion(null)}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            !selectedRegion
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          全部
        </button>
        {Object.values(REGIONS).map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.id)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              selectedRegion === region.id
                ? 'text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
            style={
              selectedRegion === region.id
                ? { backgroundColor: region.color }
                : {}
            }
          >
            {region.name}
          </button>
        ))}
      </div>

      {/* 搜尋框 */}
      <input
        type="text"
        placeholder="搜尋雪場名稱或地區..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800/50 border border-gray-700/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
      />

      {/* 雪場列表 */}
      <div className="space-y-2 overflow-y-auto flex-1" style={{ touchAction: 'pan-y' }}>
        {filteredResorts.length > 0 ? (
          filteredResorts.map((resort) => {
            const isVisited = visitedResortIds.includes(resort.id);
            return (
              <div key={resort.id} className="flex gap-2">
                <button
                  onClick={() => onOpenScratch(resort.id)}
                  className={`flex-1 text-left p-3 rounded-lg transition-all ${
                    isVisited
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${isVisited ? 'text-cyan-300' : 'text-gray-300'}`}>
                        {resort.name}
                      </div>
                      <div className="text-xs text-gray-500">{resort.prefecture}</div>
                    </div>
                    {isVisited && (
                      <div className="text-cyan-400">✓</div>
                    )}
                  </div>
                </button>
                {/* 快速切換按鈕 */}
                <button
                  onClick={() => onToggleVisited(resort.id)}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    isVisited
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                  }`}
                  title={isVisited ? '取消標記' : '標記已訪問'}
                >
                  {isVisited ? '✗' : '✓'}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            找不到符合的雪場
          </div>
        )}
      </div>
    </div>
  );
}
