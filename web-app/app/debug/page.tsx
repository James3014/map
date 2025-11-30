'use client';

import { getAllResorts, REGIONS } from '@/data/resorts';

export default function DebugPage() {
  const resorts = getAllResorts();

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl mb-4">雪場數據調試</h1>

      <div className="mb-8">
        <h2 className="text-xl mb-2">總計: {resorts.length} 個雪場</h2>
        <div className="space-y-2">
          {resorts.map((resort) => (
            <div key={resort.id} className="p-2 bg-gray-800 rounded">
              <div>{resort.name} ({resort.nameEn})</div>
              <div className="text-sm text-gray-400">
                位置: x={resort.position.x}, y={resort.position.y}
              </div>
              <div className="text-sm text-gray-400">
                區域: {resort.region} - 顏色: {REGIONS[resort.region].color}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-4">SVG 測試</h2>
        <svg width="500" height="500" viewBox="0 0 1000 1000" className="bg-gray-800 border border-cyan-500">
          {/* 繪製網格 */}
          <line x1="0" y1="500" x2="1000" y2="500" stroke="gray" strokeWidth="1" />
          <line x1="500" y1="0" x2="500" y2="1000" stroke="gray" strokeWidth="1" />

          {/* 測試標記 - 應該在中心可見 */}
          <circle cx="500" cy="500" r="50" fill="red" opacity="0.5" />
          <text x="500" y="510" textAnchor="middle" fill="white" fontSize="20">測試點</text>

          {/* 繪製雪場標記 */}
          {resorts.map((resort) => (
            <g key={resort.id}>
              <circle
                cx={resort.position.x}
                cy={resort.position.y}
                r="30"
                fill="transparent"
                stroke="cyan"
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => alert(`點擊了: ${resort.name}`)}
              />
              <text
                x={resort.position.x}
                y={resort.position.y}
                textAnchor="middle"
                fill="white"
                fontSize="12"
              >
                {resort.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
