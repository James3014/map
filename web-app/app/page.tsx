'use client';

import { JapanMap } from '@/components/JapanMap';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFilteredResorts } from '@/hooks/useFilteredResorts';
import { getAllResorts } from '@/data/resorts';
import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScratchModal } from '@/components/ScratchModal';
import { StatsPanel } from '@/components/StatsPanel';
import { ResortList } from '@/components/ResortList';

export default function Home() {
  const [visitedResortIds, setVisitedResortIds, isLoaded] = useLocalStorage<string[]>(
    'visited-resorts',
    []
  );
  const [focusedResortId, setFocusedResortId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null); // P3-8: 区域筛选
  const [scratchTarget, setScratchTarget] = useState<string | null>(null);

  const resorts = getAllResorts();
  const scratchResort = useMemo(
    () => resorts.find((r) => r.id === scratchTarget) || null,
    [scratchTarget, resorts]
  );

  // 使用 useFilteredResorts Hook 篩選雪場
  const { filteredResorts, highlightedResortIds } = useFilteredResorts({
    resorts,
    searchQuery,
    selectedRegion,
  });

  const visitedCount = visitedResortIds.length;
  const totalCount = resorts.length;
  const progress = Math.round((visitedCount / totalCount) * 100);

  const handleScratchComplete = (resortId: string) => {
    setVisitedResortIds((prev) => {
      if (!prev.includes(resortId)) {
        return [...prev, resortId];
      }
      return prev;
    });
    setScratchTarget(null);
  };

  const handleOpenScratch = (resortId: string) => {
    setFocusedResortId(resortId); // 仍讓地圖聚焦
    setScratchTarget(resortId);
  };

  const handleCloseScratch = () => {
    setScratchTarget(null);
    setFocusedResortId(null); // 關閉刮刮卡時同步退出聚焦並重置地圖
  };

  const toggleVisited = (resortId: string) => {
    // 側邊欄按鈕：切換已訪問狀態
    setVisitedResortIds((prev) => {
      if (prev.includes(resortId)) {
        // 取消標記
        return prev.filter((id) => id !== resortId);
      } else {
        // 標記為已去過（跳過刮除流程）
        return [...prev, resortId];
      }
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400 text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <main className="h-full overflow-y-auto p-4 md:p-8" style={{ touchAction: 'pan-y' }}>
      {/* Header */}
      <motion.header
        className="max-w-7xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-panel rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Mountain className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              🗺️ 日本雪場刮刮樂
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            記錄你的滑雪足跡，收集所有日本雪場！
          </p>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 統計面板 */}
        <StatsPanel
          visitedCount={visitedCount}
          totalCount={totalCount}
          progress={progress}
        />

        {/* 雪場列表 */}
        <ResortList
          filteredResorts={filteredResorts}
          visitedResortIds={visitedResortIds}
          searchQuery={searchQuery}
          selectedRegion={selectedRegion}
          setSearchQuery={setSearchQuery}
          setSelectedRegion={setSelectedRegion}
          onOpenScratch={handleOpenScratch}
          onToggleVisited={toggleVisited}
        />

        {/* 地圖主體 - P2-6: 添加錯誤邊界 */}
        <motion.section
          className="lg:col-span-3 glass-panel rounded-2xl p-6 md:p-8 min-h-[600px]"
          style={{ touchAction: 'none' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ErrorBoundary>
            <JapanMap
              visitedResortIds={visitedResortIds}
              onOpenScratch={handleOpenScratch}
              resorts={resorts}
              externalFocusedResortId={focusedResortId}
              onFocusChange={setFocusedResortId}
              highlightedResortIds={highlightedResortIds}
            />
          </ErrorBoundary>
        </motion.section>
      </div>

      {/* Footer Hint */}
      <motion.footer
        className="max-w-7xl mx-auto mt-8 text-center text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        點擊地圖上的雪場標記或側邊欄列表，開啟刮刮卡來記錄你的足跡 🎿
      </motion.footer>

      <ScratchModal
        resort={scratchResort}
        visited={scratchResort ? visitedResortIds.includes(scratchResort.id) : false}
        onClose={handleCloseScratch}
        onComplete={handleScratchComplete}
      />
    </main>
  );
}
