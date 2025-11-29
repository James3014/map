# 日本雪場刮刮樂 - 模組一：Linus 式實作計畫 (含美學修正)

## 0. 核心思考 (Linus's Core Thinking)

> "Bad programmers worry about the code. Good programmers worry about data structures."
> "Good taste is about seeing the big picture."

之前的計畫太過花俏。我們不需要 Pixi.js，不需要複雜的後端。
**核心問題是：如何用最簡單的數據結構表達「日本地圖」與「使用者足跡」的關係？**
同時，**簡潔的代碼是極致美感的基礎**。一個卡頓、載入慢的「炫酷」網站是沒有品味的。我們要的是**流暢、優雅、頂級的視覺體驗**。

## 1. 數據結構優先 (Data Structures First)

我們不需要複雜的關聯式資料庫。我們只需要兩個核心結構：

### A. 靜態地圖數據 (The World)
這是一個唯讀的常量檔案 (Constant)。
```typescript
// data/resorts.ts
interface Resort {
  id: string;        // 唯一標識，例如 "niseko_grand_hirafu"
  name: string;      // 顯示名稱
  region: RegionId;  // 所屬區域 enum
  coordinates: [number, number]; // SVG 上的相對座標 (0-100%)
}

// 這是靜態的，永遠不會變，不需要資料庫
const RESORTS: Record<string, Resort> = { ... };
```

### B. 使用者狀態 (The User State)
使用者的進度只是一個簡單的 **Set**。
```typescript
// 這是唯一的動態數據
type UserProgress = {
  visitedResortIds: string[]; // 或者 Set<string>
}
```

## 2. 極致美學與互動 (Aesthetics & "Good Taste")

Linus 的「好品味」同樣適用於 UI：**消除邊界情況，讓一切看起來自然。**

*   **視覺風格 (Visual Style)**:
    *   **Premium Dark Mode**: 使用深邃的藍黑色調 (Midnight Blue) 作為基底，而非純黑。配合微弱的漸層光暈，營造「雪夜」的高級感。
    *   **Glassmorphism**: UI 面板採用磨砂玻璃效果，讓地圖背景若隱若現，增加層次感。
    *   **Typography**: 使用 Inter 或現代無襯線字體，強調留白與呼吸感。

*   **地圖互動 (Map Interaction)**:
    *   **SVG 藝術**: 地圖本身必須是藝術品。未探索區域使用低對比度的金屬質感 (Silver/Grey)，已探索區域使用高飽和度的活力色彩 (Vibrant Colors)。
    *   **流暢過渡**: 所有的狀態變化 (變色、顯示資訊) 必須有 CSS `transition`。拒絕生硬的切換。
    *   **微互動 (Micro-interactions)**: 滑鼠懸停時的輕微放大、點擊時的漣漪效果。這些不需要重型 JS 庫，CSS 加上一點點 JS 就能做到極致。

## 3. 消除複雜度 (Complexity Removal)

### ❌ 之前的過度設計 (Over-engineering)
- **Canvas / Pixi.js**: 為了做「刮除特效」引入幾 MB 的函式庫？**垃圾**。
- **Supabase Auth (Day 1)**: 在使用者還沒覺得好玩之前就要求登入？**阻礙**。

### ✅ Linus 式簡化 (The Simple Way)
- **SVG 地圖**: 日本地圖就是一個 SVG。
- **CSS Class 切換**: 
  - 未去過：`<path class="fill-gray-700 stroke-gray-600" />` (深色金屬質感)
  - 去過：`<path class="fill-cyan-400 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-700" />` (發光的冰藍色)
- **互動**: 點擊即「刮開」。特效用簡單的 CSS Animation 或輕量級粒子 (Canvas Confetti) 點綴即可。
- **儲存**: `localStorage`。直到使用者想分享或換裝置，才需要雲端。

## 4. 實作路線圖 (Pragmatic Roadmap)

### Phase 1: The "It Just Works" & "Looks Beautiful" Version (MVP)
**目標**：一個純前端、無後端、基於 LocalStorage 的網頁，但**視覺必須驚艷**。

1.  **初始化 Next.js 專案**:
    - 配置 TailwindCSS。
    - 定義 Design Tokens (Colors, Shadows, Blur)。
2.  **構建靜態數據 (`data/resorts.ts`)**:
    - 定義好北海道、長野等主要區域的雪場座標。
3.  **實作地圖組件 (`MapComponent`)**:
    - 繪製或尋找高品質的日本 SVG 地圖。
    - 實現平滑的縮放 (Zoom/Pan) 功能，確保操作手感極佳。
4.  **狀態管理與視覺回饋**:
    - 點擊 -> 狀態更新 -> CSS 發光特效 -> 播放精緻的粒子慶祝。

---
**Linus 的結論**:
美感不需要複雜的代碼。相反，**代碼越簡單，瀏覽器渲染越快，動畫越流暢，體驗就越高級**。我們用最乾淨的 HTML/CSS 結構來承載最頂級的設計。

**是否同意執行這個計畫？**
