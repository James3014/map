/**
 * FocusHint - 聚焦提示組件
 *
 * Linus Principle: "When you have code that's too abstract, you have bugs you can't find"
 * 提示界面不需要抽象，直接顯示就好
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Resort } from '@/data/resorts';

interface FocusHintProps {
  /** 聚焦的雪場 */
  focusedResort: Resort | null;
  /** 已訪問的雪場 ID 列表 */
  visitedResortIds: string[];
}

export function FocusHint({
  focusedResort,
  visitedResortIds,
}: FocusHintProps) {
  // 只在聚焦且未訪問時顯示提示
  const shouldShow =
    focusedResort && !visitedResortIds.includes(focusedResort.id);

  return (
    <AnimatePresence>
      {shouldShow && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[60]"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 脈衝圈 - 更粗更明顯 */}
          <motion.circle
            cx={focusedResort.position.x}
            cy={focusedResort.position.y}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={8}
            strokeDasharray="20 10"
            initial={{ r: 70, opacity: 1 }}
            animate={{
              r: [70, 120, 70],
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />

          {/* 閃爍中心區域 */}
          <motion.circle
            cx={focusedResort.position.x}
            cy={focusedResort.position.y}
            fill="rgba(251, 191, 36, 0.3)"
            initial={{ r: 50 }}
            animate={{
              r: [50, 90, 50],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />

          {/* 大字提示框 - 雪場上方 */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* 背景 */}
            <rect
              x={focusedResort.position.x - 120}
              y={focusedResort.position.y - 170}
              width={240}
              height={90}
              rx={20}
              fill="rgba(15, 23, 42, 0.98)"
              stroke="#fbbf24"
              strokeWidth={4}
              filter="drop-shadow(0 10px 40px rgba(0,0,0,0.7))"
            />

            {/* 雪場名 */}
            <text
              x={focusedResort.position.x}
              y={focusedResort.position.y - 135}
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="28"
              fontWeight="700"
            >
              {focusedResort.name}
            </text>

            {/* 操作指示 - 閃爍 */}
            <motion.text
              x={focusedResort.position.x}
              y={focusedResort.position.y - 100}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="22"
              fontWeight="700"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              👇 滑動刮開
            </motion.text>
          </motion.g>

          {/* 向下箭頭動畫 */}
          <motion.polygon
            points={`${focusedResort.position.x},${focusedResort.position.y - 60}
                     ${focusedResort.position.x - 20},${focusedResort.position.y - 80}
                     ${focusedResort.position.x - 8},${focusedResort.position.y - 80}
                     ${focusedResort.position.x - 8},${focusedResort.position.y - 95}
                     ${focusedResort.position.x + 8},${focusedResort.position.y - 95}
                     ${focusedResort.position.x + 8},${focusedResort.position.y - 80}
                     ${focusedResort.position.x + 20},${focusedResort.position.y - 80}`}
            fill="#fbbf24"
            stroke="#fff"
            strokeWidth={3}
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      )}
    </AnimatePresence>
  );
}
