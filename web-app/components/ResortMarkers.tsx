/**
 * ResortMarkers - 雪場標記組件
 *
 * Linus Principle: "Bad programmers worry about the code. Good programmers worry about data structures"
 * 這個組件純粹是展示層，所有數據都從 props 傳入
 *
 * P1-4 重構：使用狀態機消除條件分支（"Good Taste"）
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
  /** P3-7: 搜索高亮的雪場 ID 列表 */
  highlightedResortIds?: string[];
  /** 雪場點擊回調 */
  onResortClick: (resort: Resort) => void;
  /** 懸停狀態變化回調 */
  onHoverChange: (resortId: string | null) => void;
}

/**
 * 標記狀態（優先級從高到低）
 * Linus: 用清晰的狀態機替代複雜的條件判斷
 * P3-7: 新增 highlighted 狀態
 */
type MarkerState = 'focused' | 'hovered' | 'highlighted' | 'visited' | 'default';

/**
 * 計算標記當前狀態（零條件分支）
 * P3-7: 新增搜索高亮邏輯
 */
function getMarkerState(
  isFocused: boolean,
  isHovered: boolean,
  isHighlighted: boolean,
  isVisited: boolean
): MarkerState {
  if (isFocused) return 'focused';
  if (isHovered) return 'hovered';
  if (isHighlighted) return 'highlighted';
  if (isVisited) return 'visited';
  return 'default';
}

/**
 * 狀態配置（數據驅動，消除特殊情況）
 */
const MARKER_CONFIG: Record<MarkerState, {
  showPulse: boolean;
  showLabel: boolean;
  iconFillColor: (color: string) => string;
  scale: number;
  glowEffect?: boolean; // P3-7: 搜索高亮發光效果
}> = {
  focused: {
    showPulse: false,
    showLabel: true,
    iconFillColor: (color) => color,
    scale: 1.5,
    glowEffect: false,
  },
  hovered: {
    showPulse: false,
    showLabel: true,
    iconFillColor: (color) => color,
    scale: 1.2,
    glowEffect: false,
  },
  highlighted: {
    showPulse: false,
    showLabel: false,
    iconFillColor: (color) => color,
    scale: 1.15,
    glowEffect: true, // 搜索高亮時發光
  },
  visited: {
    showPulse: true,
    showLabel: false,
    iconFillColor: (color) => color,
    scale: 1,
    glowEffect: false,
  },
  default: {
    showPulse: false,
    showLabel: false,
    iconFillColor: () => '#64748b',
    scale: 1,
    glowEffect: false,
  },
};

export function ResortMarkers({
  resorts,
  focusedResort,
  visitedResortIds,
  hoveredResort,
  highlightedResortIds = [],
  onResortClick,
  onHoverChange,
}: ResortMarkersProps) {
  return (
    <>
      {resorts.map((resort) => {
        // 計算狀態（單一真相來源）
        const isFocused = focusedResort?.id === resort.id;
        const isVisited = visitedResortIds.includes(resort.id);
        const isHovered = hoveredResort === resort.id;
        const isHighlighted = highlightedResortIds.includes(resort.id); // P3-7: 搜索高亮
        const color = REGIONS[resort.region].color;

        // 狀態機：零條件判斷
        const state = getMarkerState(isFocused, isHovered, isHighlighted, isVisited);
        const config = MARKER_CONFIG[state];

        return (
          <g key={resort.id}>
            {/* 脈衝光環 - 數據驅動 */}
            {config.showPulse && (
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

            {/* P3-7: 搜索高亮發光效果 */}
            {config.glowEffect && (
              <motion.circle
                cx={resort.position.x}
                cy={resort.position.y}
                r="18"
                fill={color}
                opacity={0.3}
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
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
              animate={{ scale: config.scale }}
            >
              {/* 透明點擊熱區 (半徑 30px) */}
              <circle r="30" fill="transparent" />

              {/* 陰影 */}
              <ellipse cx="0" cy="12" rx="12" ry="4" fill="rgba(0,0,0,0.3)" />

              {/* 雪山圖標 */}
              <g transform="translate(-12, -12) scale(0.8)">
                {/* 山體 - 數據驅動顏色 */}
                <path
                  d="M15 2 L28 25 L2 25 Z"
                  fill={config.iconFillColor(color)}
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* 山頂積雪 */}
                <path d="M15 2 L19 9 L15 7 L11 9 Z" fill="white" />
              </g>

              {/* 標籤 - 數據驅動顯示 */}
              {config.showLabel && (
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
