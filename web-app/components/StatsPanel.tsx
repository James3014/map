/**
 * StatsPanel - 進度統計面板組件
 *
 * 顯示用戶的雪場訪問進度統計：
 * - 完成度百分比進度條
 * - 已去過的雪場數量
 * - 待探索的雪場數量
 */

'use client';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface StatsPanelProps {
  /** 已訪問雪場數量 */
  visitedCount: number;
  /** 總雪場數量 */
  totalCount: number;
  /** 完成度百分比 (0-100) */
  progress: number;
}

export function StatsPanel({
  visitedCount,
  totalCount,
  progress,
}: StatsPanelProps) {
  return (
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
    </motion.aside>
  );
}
