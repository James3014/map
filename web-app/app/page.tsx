'use client';

import { JapanMap } from '@/components/JapanMap';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getAllResorts, REGIONS } from '@/data/resorts';
import { motion } from 'framer-motion';
import { Mountain, Award, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [visitedResortIds, setVisitedResortIds, isLoaded] = useLocalStorage<string[]>(
    'visited-resorts',
    []
  );
  const [focusedResortId, setFocusedResortId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const resorts = getAllResorts();

  // 篩選雪場
  const filteredResorts = resorts.filter(resort =>
    resort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resort.prefecture.includes(searchQuery) ||
    resort.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visitedCount = visitedResortIds.length;
  const totalCount = resorts.length;
  const progress = Math.round((visitedCount / totalCount) * 100);

  const handleResortClick = (resortId: string) => {
    // 刮除完成後標記為已訪問
    setVisitedResortIds((prev) => {
      if (!prev.includes(resortId)) {
        return [...prev, resortId];
      }
      return prev;
    });
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
        <motion.aside
          className="lg:col-span-1 space-y-4"
          style={{ touchAction: 'pan-y' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* 進度卡片 */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold">你的進度</h2>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">完成度</span>
                  <span className="text-cyan-400 font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">{visitedCount}</div>
                  <div className="text-xs text-gray-400">已去過</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-500">{totalCount - visitedCount}</div>
                  <div className="text-xs text-gray-400">待探索</div>
                </div>
              </div>
            </div>
          </div>

          {/* 雪場列表 */}
          <div className="glass-panel rounded-xl p-6 max-h-[500px] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">雪場列表</h2>
            </div>

            {/* 搜尋框 */}
            <input
              type="text"
              placeholder="搜尋雪場名稱或地區..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800/50 border border-gray-700/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />

            <div className="space-y-2 overflow-y-auto flex-1" style={{ touchAction: 'pan-y' }}>
              {filteredResorts.length > 0 ? (
                filteredResorts.map((resort) => {
                  const isVisited = visitedResortIds.includes(resort.id);
                  return (
                    <div key={resort.id} className="flex gap-2">
                      <button
                        onClick={() => {
                          // 聚焦雪場（如果未訪問，會進入刮除流程）
                          setFocusedResortId(resort.id);
                        }}
                        className={`flex-1 text-left p-3 rounded-lg transition-all ${isVisited
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
                        onClick={() => toggleVisited(resort.id)}
                        className={`px-3 py-2 rounded-lg transition-all ${isVisited
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
        </motion.aside>

        {/* 地圖主體 */}
        <motion.section
          className="lg:col-span-3 glass-panel rounded-2xl p-6 md:p-8 min-h-[600px]"
          style={{ touchAction: 'none' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <JapanMap
            visitedResortIds={visitedResortIds}
            onResortClick={handleResortClick}
            resorts={resorts}
            externalFocusedResortId={focusedResortId}
            onFocusChange={setFocusedResortId}
          />
        </motion.section>
      </div>

      {/* Footer Hint */}
      <motion.footer
        className="max-w-7xl mx-auto mt-8 text-center text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        點擊地圖上的雪場標記或側邊欄列表來記錄你的足跡 🎿
        <br />
        <span className="text-cyan-400">✨ 試試用手指或滑鼠在地圖上滑動刮開！</span>
      </motion.footer>
    </main>
  );
}
