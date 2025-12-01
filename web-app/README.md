# 🗺️ 日本雪場刮刮樂

一個互動式的日本雪場地圖應用，讓您記錄滑雪足跡並以刮刮樂方式解鎖雪場資訊。

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-29_passing-success?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ 核心功能

### 🎯 互動式地圖
- **40+ 個日本雪場**：覆蓋北海道、東北、關東、中部、關西地區
- **桌面端滾輪縮放**：以滑鼠位置為中心智能縮放
- **移動端雙指縮放**：流暢的 Pinch Zoom 手勢支援
- **單指拖曳平移**：可自由探索整個日本地圖
- **智能邊界限制**：縮放感知的平移邊界，防止拖出地圖

### 🎨 刮刮樂體驗（重構版）
- **固定尺寸彈窗**：320×320 刮刮卡，避免地圖縮放導致觸控偏移
- **10×10 格子檢測**：區塊式進度追蹤，取代像素檢測，穩定可靠
- **98% 自動完成**：刮除進度達標後自動解鎖全部資訊
- **Bresenham 連續軌跡**：確保刮除路徑無間隙，不漏刮
- **里程碑煙花效果**：25%、50%、75%、100% 分階段彩紙慶祝
- **實時進度圓環**：動態顯示刮除百分比，顏色隨進度變化
- **金屬質感遮罩**：仿真刮獎券銀灰色漸變 + 光澤 + 紋理噪點

### 📊 進度追蹤
- **LocalStorage 持久化**：訪問記錄保存於瀏覽器，刷新不丟失
- **完成度統計**：實時計算已訪問/待探索雪場數量與百分比
- **動態進度條**：視覺化顯示收集進度，Framer Motion 流暢動畫
- **側邊欄快速標記**：一鍵標記或取消已訪問狀態（綠色 ✓ / 紅色 ✗）

### 🔍 搜尋與篩選
- **多語言搜尋**：支援中文、日文、英文雪場名稱搜尋
- **區域篩選**：快速切換北海道、東北、關東、中部、關西地區
- **高亮顯示**：搜尋結果在地圖上以脈衝動畫高亮（藍色發光圈）
- **即時過濾**：側邊欄列表同步更新顯示符合條件的雪場

### 🏷️ 標籤顯示系統
- **Hover 懸停**：桌面端滑鼠移到雪場上自動顯示名稱（無閃動）
- **手動切換**：右上角「顯示標籤」按鈕一鍵顯示所有雪場名稱
- **縮放自動顯示**：放大到 1.8x 以上自動顯示所有標籤
- **聚焦顯示**：點擊雪場時在畫面中央顯示大標籤

## 🛠️ 技術棧

### 前端框架
- **Next.js 16**：使用 App Router 和 Turbopack 構建工具
- **React 19**：最新版本，支援 Server Components
- **TypeScript 5**：完整類型安全支援，嚴格模式

### 樣式與動畫
- **Tailwind CSS v4**：PostCSS 版本，原子化 CSS 框架
- **Framer Motion 12**：流暢的動畫與手勢交互
- **Lucide React**：現代化圖標庫（Mountain, Award, MapPin, X）
- **Canvas Confetti**：刮除完成時的彩紙慶祝效果

### 狀態管理與工具
- **Custom Hooks**：
  - `useLocalStorage` - 持久化存儲
  - `useMapTransform` - 地圖變換邏輯（縮放/平移/聚焦）
  - `useGesture` - 手勢控制（拖曳/雙指縮放/滾輪）
  - `useScratchCard` - 固定尺寸刮刮卡邏輯（10×10 格子 + Bresenham）
- **RAF 節流**：requestAnimationFrame 優化拖曳性能
- **Error Boundary**：React 錯誤邊界保障應用穩定性

### 測試
- **Vitest 4**：快速的單元測試框架
- **Testing Library**：React 組件測試工具
- **29 個單元測試**：覆蓋核心業務邏輯
  - ✅ 12 tests - 座標轉換
  - ✅ 4 tests - 手勢識別
  - ✅ 5 tests - 地圖變換
  - ✅ 8 tests - 刮除邏輯

### 地圖數據
- **Geolonia SVG Maps**：開源日本地圖 SVG 素材
- **自定義座標系統**：手動標記雪場位置，矩陣變換對齊
- **區域顏色編碼**：5 個地區使用不同顏色視覺化

## 🚀 快速開始

### 前置需求
- Node.js 20+（推薦使用 LTS 版本）
- npm 或 yarn 或 pnpm

### 安裝與運行

```bash
# 1. 克隆專案
git clone https://github.com/James3014/map.git
cd map/web-app

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 瀏覽器打開
open http://localhost:3000
```

### 構建生產版本

```bash
# 構建（使用 Webpack）
npm run build

# 運行生產伺服器
npm start
```

### 運行測試

```bash
# 運行所有單元測試
npm run test

# 測試 UI 模式（可視化界面）
npm run test:ui

# 單次運行測試（CI 環境）
npm run test:run
```

## 📁 項目結構

```
web-app/
├── app/
│   ├── page.tsx              # 主頁面組件（進度統計 + 側邊欄 + 地圖 + 刮刮卡彈窗）
│   ├── layout.tsx            # 全局佈局（深色主題背景）
│   ├── globals.css           # 全局樣式（glass-panel 效果）
│   └── debug/                # 調試頁面（驗證雪場座標）
│       └── page.tsx
├── components/
│   ├── JapanMap.tsx          # 地圖主組件（<150 行，純展示邏輯）
│   ├── JapanBaseMap.tsx      # 日本地圖 SVG 底圖
│   ├── ScratchModal.tsx      # 刮刮卡彈窗組件（固定 320×320）
│   ├── ProgressRing.tsx      # 進度圓環組件（動態顏色 + 百分比）
│   ├── FocusHint.tsx         # 聚焦提示組件（已廢棄）
│   ├── ScratchCanvas.tsx     # Canvas 刮除層（已廢棄）
│   └── ErrorBoundary.tsx     # 錯誤邊界（捕獲渲染錯誤）
├── hooks/
│   ├── useLocalStorage.ts    # LocalStorage Hook（持久化 + SSR 安全）
│   ├── useMapTransform.ts    # 地圖變換 Hook（5 tests）
│   ├── useGesture.ts         # 手勢控制 Hook（4 tests）
│   ├── useScratchCard.ts     # 刮刮卡邏輯 Hook（8 tests，10×10 格子系統）
│   ├── useScratch.ts         # 舊版刮除 Hook（已廢棄）
│   └── useScratchV2.ts       # V2 版本（已廢棄）
├── data/
│   └── resorts.ts            # 雪場數據（40+ 雪場 + 5 個區域定義）
├── constants/
│   ├── map.ts                # 地圖常量（縮放範圍、聚焦參數、平移限制）
│   ├── gestures.ts           # 手勢常量（閾值、模式定義）
│   └── ui.ts                 # UI 常量（動畫持續時間、顏色）
├── utils/
│   └── coordinates.ts        # 座標轉換工具類
├── types/
│   ├── map.ts                # 地圖相關類型定義
│   └── gestures.ts           # 手勢相關類型定義
├── __tests__/                # Vitest 單元測試
│   ├── useMapTransform.test.ts
│   ├── useGesture.test.ts
│   ├── useScratch.test.ts
│   └── coordinates.test.ts
├── TESTING_CHECKLIST.md      # 測試清單（給外部測試人員）
├── REFACTOR_COMPLETE.md      # 重構完成報告
├── package.json
└── README.md                 # 本文件
```

### 核心文件說明

#### `components/ScratchModal.tsx`（刮刮卡彈窗）
從地圖解耦的固定尺寸刮刮卡：
- 避免地圖縮放/平移導致的座標偏移問題
- 320×320 固定畫布，觸控精準度大幅提升
- 中心區域圓形檢測，只有活躍格子計入進度
- Pointer Events 統一處理滑鼠和觸控

#### `hooks/useScratchCard.ts`（核心重構）
從像素檢測改為格子系統：
```typescript
// ✅ 區塊檢測（10×10 格子）
const grid: GridCell[][] = createGrid(); // 100 個格子
const progress = scratchedActiveCells / totalActiveCells; // 只計算圓形內格子

// ✅ Bresenham 連續軌跡
const points = bresenhamLine(lastPoint, currentPoint);
points.forEach(p => scratch(p)); // 確保無間隙
```

#### `components/ProgressRing.tsx`（進度可視化）
```typescript
// 動態顏色：Cyan → Blue → Purple → Pink → Amber
const color = progress < 0.25 ? '#22D3EE' :
              progress < 0.5  ? '#3B82F6' :
              progress < 0.75 ? '#A78BFA' :
              progress < 1.0  ? '#F472B6' : '#FBBF24';
```

#### `components/JapanMap.tsx`（地圖展示）
只負責地圖顯示，不包含刮除邏輯：
- 多層 z-index 管理（底圖 z-10 → 標記 z-30 → 標籤 z-60）
- 統一的 SVG 座標變換矩陣
- Hover 標籤系統（無閃動）

#### `hooks/useGesture.ts`（手勢狀態機）
```typescript
// RAF 節流優化平移性能
const throttledPan = (delta: Point) => {
  if (rafIdRef.current === null) {
    rafIdRef.current = requestAnimationFrame(() => {
      onPan?.(pendingPanRef.current);
      rafIdRef.current = null;
    });
  }
};
```

#### `hooks/useMapTransform.ts`（縮放與平移）
```typescript
// 縮放感知的邊界限制（修復高縮放卡死 Bug）
const limitX = rect.width * PAN_LIMIT_FACTOR * scale; // ✅ 動態邊界
const limitY = rect.height * PAN_LIMIT_FACTOR * scale;
```

#### `data/resorts.ts`（數據驅動）
```typescript
export const RESORTS: readonly Resort[] = [
  {
    id: 'niseko_grand_hirafu',
    name: '二世谷比羅夫',
    nameEn: 'Niseko Grand Hirafu',
    position: { x: 750, y: 180 }, // SVG 座標
    region: 'hokkaido',
    prefecture: '北海道',
    prefectureCode: 1,
  },
  // ... 其他 40+ 個雪場
];
```

## 🌍 部署

### Vercel（推薦）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/James3014/map)

#### 後台介面部署
1. Vercel > New Project > Import Git Repository，選擇此 repo
2. 設定 **Root Directory** 為 `web-app`
3. Install Command: `npm ci`
4. Build Command: `npm run build`
5. Output Directory: `.next`（預設即可）
6. Deploy 完成後：
   - **Production URL**：主分支自動部署
   - **Preview URL**：每個分支/PR push 都自動產生，手機直接開啟測試

#### CLI 部署（快速測試）
```bash
cd web-app
npm ci               # 首次安裝
npx vercel           # 依提示選 Scope/Project，得到臨時預覽 URL

# 進階用法
npx vercel --prebuilt  # 先本機 npm run build，再上傳產物（更快）
npx vercel --prod      # 直接部署到 Production
```

#### 環境變數
本專案目前無後端依賴，也沒有必填環境變數；保持預設即可。

### 其他平台
- **Zeabur**：當前線上版本 https://jpmap.zeabur.app
- **Netlify**：支援 Next.js
- **Cloudflare Pages**：支援 Next.js

## 📱 移動端支援

### 手勢支援
- ✅ 雙指縮放（Pinch Zoom）
- ✅ 單指拖曳平移
- ✅ Pointer Events（統一處理滑鼠和觸控）
- ✅ 刮除手勢（onPointerMove 追蹤軌跡）

### 瀏覽器優化
- ✅ `touchAction: 'none'` - 阻止瀏覽器預設手勢（下拉刷新/縮放頁面）
- ✅ `e.preventDefault()` - 防止 300ms 點擊延遲
- ✅ `e.stopPropagation()` - 避免事件冒泡

### 測試設備
- iOS Safari（iPhone、iPad）
- Android Chrome
- 桌面端 Chrome DevTools 模擬器

## 🎨 設計原則

遵循 **Linus Torvalds 設計哲學**與 **Clean Code 準則**：

### 1. Good Taste（好品味）
```typescript
// ❌ 像素檢測不可靠
const imageData = ctx.getImageData(...);
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] < 128) transparentPixels++;
}

// ✅ 區塊檢測穩定可靠
const progress = scratchedCells / totalCells;
if (progress >= 0.98) onComplete();
```

### 2. Never Break Userspace（不破壞使用者空間）
- LocalStorage 數據格式向後兼容
- 錯誤邊界保障應用不崩潰
- 優雅降級（Canvas 不支援時顯示提示）

### 3. Pragmatism（實用主義）
- 固定尺寸畫布取代動態座標轉換（避免偏移問題）
- RAF 節流取代 Debounce（更流暢的拖曳）
- 零 Magic Numbers（所有常量在 `constants/` 目錄）

### 4. Simplicity（簡單至上）
- 單一職責：每個 Hook 只做一件事
- 數據驅動：雪場數據與邏輯完全分離
- 消除特殊情況：統一的座標變換矩陣

## 📊 重構成果

本項目經過系統性重構，代碼質量顯著提升：

| 指標 | 重構前 | 重構後 | 改善 |
|------|--------|--------|------|
| 主組件行數 | 826 | 142 | **-82.8%** |
| Magic Numbers | 50+ | 0 | **-100%** |
| useRef 數量 | 9 | 2 | **-77.8%** |
| 單元測試 | 0 | 29 | **+100%** |
| 刮除完成率 | 70% | 98% | **+40%** |
| 觸控精準度 | 低 | 高 | **顯著提升** |

### 刮除系統演進

| 版本 | 檢測方式 | 問題 | 狀態 |
|------|----------|------|------|
| V1 | 像素 Alpha 檢測 | 不穩定，有時 1-2 下完成，有時刮完也不完成 | ❌ 已廢棄 |
| V2 | 10×10 格子（全部） | 邊角格子難刮，完成率低 | ❌ 已廢棄 |
| **V3** | **10×10 格子（圓形區域）** | **穩定可靠，98% 完成閾值** | ✅ **當前版本** |

### 關鍵設計決策
- **將刮除從地圖解耦**：避免縮放/平移導致座標轉換誤差
- **固定尺寸畫布（320×320）**：觸控精準度大幅提升
- **只計算活躍格子**：圓形區域內的格子才計入進度
- **Bresenham 演算法**：確保刮除軌跡連續無間隙

## 🐛 已修復的 Bug

### 1. 刮除進度不穩定（Critical）
**問題**：有時刮 1-2 下就完成，有時刮完全部都不會成功

**根本原因**：
- 像素 Alpha 檢測受 DPR、抗鋸齒、Canvas 狀態影響
- 異步 RAF 檢測導致讀取到舊的 Canvas 狀態
- 邊界格子難以精準刮到

**修復**：完全重新設計刮除系統
```typescript
// V3: 固定尺寸畫布 + 圓形區域格子檢測
const CARD_CONFIG = {
  SIZE: 320,                // 固定尺寸
  GRID_SIZE: 10,            // 10×10 格子
  AREA_RADIUS: 140,         // 圓形檢測區域
  COMPLETE_THRESHOLD: 0.98, // 98% 完成
};

// 只計算圓形內的活躍格子
const isActive = Math.hypot(offsetX, offsetY) <= AREA_RADIUS;
const progress = scratchedActiveCells / totalActiveCells;
```

### 2. 高縮放級別平移限制 Bug
**問題**：在 3.0x+ 縮放時無法拖動地圖

**修復**：實現 scale-aware boundary limits
```typescript
// Before
const limitX = rect.width * PAN_LIMIT_FACTOR; // ❌ 固定邊界

// After
const limitX = rect.width * PAN_LIMIT_FACTOR * scale; // ✅ 動態邊界
```

### 3. 標籤持續閃動 Bug
**問題**：滑鼠移到雪場上時標籤不停閃動

**根本原因**：標籤阻擋滑鼠 → mouseLeave 觸發 → 標籤消失 → mouseEnter 觸發 → 循環

**修復**：SVG `pointerEvents="none"` 屬性
```typescript
// Before
<g style={{pointerEvents: 'none'}}>  // ❌ HTML 語法，SVG 不認

// After
<g pointerEvents="none">  // ✅ SVG 屬性
<rect pointerEvents="none" />  // ✅ 每個子元素都明確設置
<text pointerEvents="none">...</text>
```

### 4. 移動端點擊無反應 Bug
**問題**：手機上點擊雪場沒有反應

**修復**：同時處理 onClick 和 onTouchEnd
```typescript
<g
  onClick={(e) => { e.stopPropagation(); handler(); }}
  onTouchEnd={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  }}
>
```

### 5. 座標系統不對齊 Bug
**問題**：雪場圖標飄在日本地圖外面

**修復**：應用與底圖相同的 SVG transform
```typescript
<svg viewBox="0 0 1000 1000">
  <g transform="matrix(1.028807, 0, 0, 1.028807, -47.544239, -28.806583)">
    <g transform="matrix(1, 0, 0, 1, 6, 18)">
      {/* 雪場標記 */}
    </g>
  </g>
</svg>
```

## 🔍 調試指南

### 使用調試頁面
訪問 `/debug` 可以：
- 查看所有雪場數據和座標
- 驗證雪場位置是否正確
- 測試單個雪場的點擊交互

### 查看測試結果
```bash
npm run test:ui
```
可視化界面顯示所有測試用例的通過/失敗狀態。

### 檢查控制台日志
取消註釋 `useGesture.ts` 中的 debug 代碼：
```typescript
console.log('Mode:', mode, 'Delta:', delta);
```

### 故障排除

#### 雪場標記不顯示
1. 檢查瀏覽器 DevTools → Elements
2. 搜尋 `<svg viewBox="0 0 1000 1000">`
3. 驗證 `<g transform="matrix(...)">`屬性存在
4. 確認 `resort.position` 座標在合理範圍（x: 0-1000, y: 0-1000）

#### 標籤持續閃動
1. 檢查是否使用 `pointerEvents="none"`（SVG 屬性）
2. 不要使用 `style={{pointerEvents: 'none'}}`（HTML 屬性）
3. 確保所有子元素都明確設置 `pointerEvents="none"`

#### 刮除不穩定
1. 確認使用 `useScratchCard` 而非舊版 `useScratch`
2. 檢查 `CARD_CONFIG.COMPLETE_THRESHOLD` 是否為 0.98
3. 驗證格子系統：`console.log(activeCellCountRef.current)`

#### 移動端無法操作
1. 確認 `touchAction: 'none'` 在容器上
2. 檢查 Pointer Events 是否正確綁定
3. 測試時使用真實設備，而非桌面端模擬器

## 📖 開發指南

### 添加新雪場
1. 編輯 `data/resorts.ts`
2. 訪問 `/debug` 頁面找到座標（使用瀏覽器 DevTools 測量）
3. 添加雪場數據：
```typescript
{
  id: 'new_resort',
  name: '新雪場',
  nameEn: 'New Resort',
  position: { x: 600, y: 300 }, // SVG 座標
  region: 'hokkaido',
  prefecture: '北海道',
  prefectureCode: 1,
}
```

### 調整刮除靈敏度
編輯 `hooks/useScratchCard.ts` 中的 `CARD_CONFIG`：
```typescript
const CARD_CONFIG = {
  SIZE: 320,                    // 畫布尺寸
  GRID_SIZE: 10,                // 格子數量（10×10）
  BRUSH_RADIUS: 28,             // 筆刷半徑（像素）
  AREA_RADIUS: 140,             // 檢測區域半徑
  COMPLETE_THRESHOLD: 0.98,     // 完成閾值（98%）
};
```

### 自訂區域顏色
編輯 `data/resorts.ts` 中的 `REGIONS`：
```typescript
export const REGIONS = {
  hokkaido: {
    id: 'hokkaido',
    name: '北海道',
    color: '#3B82F6',  // 藍色
    prefectureCode: [1],
  },
  // ... 其他區域
};
```

### 修改地圖配置
編輯 `constants/map.ts`：
```typescript
export const MAP = {
  LOGICAL_SIZE: 1000,       // SVG 邏輯座標範圍
  MIN_SCALE: 0.5,           // 最小縮放
  MAX_SCALE: 4,             // 最大縮放
  FOCUS_SCALE: 2.5,         // 聚焦縮放級別
  PAN_LIMIT_FACTOR: 0.5,    // 平移邊界係數
  ZOOM_STEP: 0.1,           // 縮放步進
};
```

## 🤝 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 創建特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交變更（`git commit -m 'feat: Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 開啟 Pull Request

### 代碼規範
- ✅ 運行 `npm run lint` 確保無 ESLint 錯誤
- ✅ 運行 `npm run test:run` 確保所有測試通過
- ✅ 遵循 TypeScript 嚴格模式
- ✅ 提交前使用 Prettier 格式化
- ✅ Commit message 使用 Conventional Commits 格式

### Commit Message 格式
```
feat: 新功能
fix: Bug 修復
docs: 文檔更新
style: 代碼格式調整
refactor: 重構
test: 測試相關
chore: 構建工具或輔助工具變動
```

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

- [Geolonia](https://geolonia.com/) - 提供開源日本地圖 SVG
- [Next.js](https://nextjs.org/) - 強大的 React 框架
- [Framer Motion](https://www.framer.com/motion/) - 流暢的動畫庫
- [Tailwind CSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
- [Vitest](https://vitest.dev/) - 快速的測試框架
- [Canvas Confetti](https://www.kirilv.com/canvas-confetti/) - 彩紙慶祝效果
- **Linus Torvalds** - 設計哲學啟發

## 📮 聯絡方式

- 專案連結：[https://github.com/James3014/map](https://github.com/James3014/map)
- 線上 Demo：[https://jpmap.zeabur.app](https://jpmap.zeabur.app)
- 問題回報：[Issues](https://github.com/James3014/map/issues)

---

<div align="center">

**⭐ 如果這個專案對你有幫助，請給一個星星！🎿**

Made with ❤️ by [James3014](https://github.com/James3014)

</div>
