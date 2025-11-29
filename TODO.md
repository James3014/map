# 🗺️ 日本雪場刮刮樂 - 開發待辦事項 (Phase 1 MVP)

## 🚀 專案初始化 (Project Setup)
- [ ] **初始化 Next.js 專案**
    - 使用 `create-next-app` 建立專案 (TypeScript, TailwindCSS, ESLint)。
    - 清理預設樣板代碼。
- [ ] **配置設計系統 (Design System)**
    - [ ] 設定 Tailwind 顏色變數 (深色背景、金屬質感、螢光強調色)。
    - [ ] 引入字體 (Inter / Noto Sans JP)。
    - [ ] 安裝必要輕量套件 (`clsx`, `tailwind-merge`, `canvas-confetti` for 粒子特效)。

## 🗺️ 核心地圖開發 (Core Map)
- [ ] **準備地圖素材**
    - [ ] 尋找或繪製高品質日本地圖 SVG (需分層清楚：北海道、本州等)。
    - [ ] 優化 SVG 結構 (移除垃圾代碼，確保路徑清晰)。
- [ ] **建立數據結構 (`data/resorts.ts`)**
    - [ ] 定義 `Resort` 介面 (ID, Name, Region, Coordinates)。
    - [ ] 填入首批測試數據 (二世谷、白馬、越後湯澤等熱門點)。
- [ ] **開發地圖組件 (`MapComponent`)**
    - [ ] 渲染 SVG 地圖。
    - [ ] 實作縮放與平移 (Pan & Zoom) 功能 (確保操作手感)。
    - [ ] 將 `Resort` 數據映射為地圖上的互動熱點 (Hotspots)。

## 🎮 互動與狀態 (Interaction & State)
- [ ] **狀態管理**
    - [ ] 實作 `useLocalStorage` Hook 存取使用者紀錄 (`visitedResortIds`)。
- [ ] **刮刮樂互動實作**
    - [ ] 點擊熱點 -> 更新狀態。
    - [ ] **視覺回饋 (美感關鍵)**:
        - [ ] 未解鎖樣式 (低調金屬灰)。
        - [ ] 解鎖動畫 (CSS Transition + Glow Effect)。
        - [ ] 觸發 `canvas-confetti` 粒子慶祝特效。

## 🎨 UI 優化與細節 (Polish)
- [ ] **主介面佈局**
    - [ ] 標題與統計數據面板 (Glassmorphism 玻璃擬態)。
    - [ ] 搜尋/列表側邊欄 (可選)。
- [ ] **響應式調整** (Mobile First)。

---
**備註**: 
- 優先確保地圖操作順滑，不卡頓。
- 視覺風格對標高級深色模式 App。
