/**
 * ResortMarkers - 雪場標記組件
 *
 * Linus Principle: "Bad programmers worry about the code. Good programmers worry about data structures"
 * 這個組件純粹是展示層，所有數據都從 props 傳入
 */

'use client';

import { motion } from 'framer-motion';
import { Resort, REGIONS } from '@/data/resorts';

interface ResortMarkersProps {
  /** 所有雪場數據 */
  resorts: Resort[];
  /** 當前聚焦的雪場 */
  focusedResort: Resort | null;
  /** 已訪問的雪場 ID 列表 */
  visitedResortIds: string[];
  /** 當前懸停的雪場 ID */
  hoveredResort: string | null;
  /** 雪場點擊回調 */
  onResortClick: (resort: Resort) => void;
  /** 懸停狀態變化回調 */
  onHoverChange: (resortId: string | null) => void;
}

export function ResortMarkers({
  resorts,
  focusedResort,
  visitedResortIds,
  hoveredResort,
  onResortClick,
  onHoverChange,
}: ResortMarkersProps) {
  return (
    <>
      {resorts.map((resort) => {
        const isFocused = focusedResort?.id === resort.id;
        const isVisited = visitedResortIds.includes(resort.id);
        const isHovered = hoveredResort === resort.id;
        const color = REGIONS[resort.region].color;

        return (
          <g key={resort.id}>
            {/* 脈衝光環 - 僅已訪問且未聚焦時顯示 */}
            {isVisited && !isFocused && (
              <motion.circle
                cx={resort.position.x}
                cy={resort.position.y}
                fill="none"
                stroke={color}
                strokeWidth={2}
                initial={{ r: 12, opacity: 0.8 }}
                animate={{
                  r: [12, 25, 12],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* 雪場標記點 - 雪山圖標 */}
            <motion.g
              transform={`translate(${resort.position.x}, ${resort.position.y})`}
              className="cursor-pointer pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                onResortClick(resort);
              }}
              onMouseEnter={() => onHoverChange(resort.id)}
              onMouseLeave={() => onHoverChange(null)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={isFocused ? { scale: 1.5 } : {}}
            >
              {/* 透明點擊熱區 (半徑 30px) */}
              <circle r="30" fill="transparent" />

              {/* 陰影 */}
              <ellipse cx="0" cy="12" rx="12" ry="4" fill="rgba(0,0,0,0.3)" />

              {/* 雪山圖標 */}
              <g transform="translate(-12, -12) scale(0.8)">
                {/* 山體 */}
                <path
                  d="M15 2 L28 25 L2 25 Z"
                  fill={isVisited ? color : '#64748b'}
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* 山頂積雪 */}
                <path d="M15 2 L19 9 L15 7 L11 9 Z" fill="white" />
              </g>

              {/* 標籤 (Hover 或 Focus 時顯示) */}
              {(isHovered || isFocused) && (
                <g transform="translate(0, -25)">
                  <rect
                    x="-50"
                    y="-20"
                    width="100"
                    height="20"
                    rx="10"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={color}
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="-6"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {resort.name}
                  </text>
                  {/* 下方小三角 */}
                  <path d="M-5 -1 L0 4 L5 -1 Z" fill={color} />
                </g>
              )}
            </motion.g>
          </g>
        );
      })}
    </>
  );
}
