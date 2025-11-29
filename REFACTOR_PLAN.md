# 日本雪場刮刮樂 - 重構計劃

## Clean Code 分析結果

### 🔴 高優先級問題（影響功能和用戶體驗）

1. **觸控縮放邏輯混亂** ⚠️ CRITICAL
   - 問題：全局viewport、touchAction、JavaScript preventDefault層層疊加，邏輯不清晰
   - 影響：用戶無法正常使用縮放功能
   - 根因：缺乏明確的數據流設計
   - Linus原則違反：複雜的演算法補丁，而非簡潔的數據結構

2. **地圖顯示依賴過時的fetch邏輯**
   - 問題：JapanBaseMap組件和舊的innerHTML邏輯衝突
   - 狀態：已部分修復（移除了fetch），但結構仍不清晰
   - 根因：重構過程中遺留了兩套系統

3. **Canvas刮除事件綁定時機不確定**
   - 問題：useEffect依賴不完整，Canvas可能未正確綁定事件
   - 影響：刮除功能可能失效
   - 根因：React生命週期管理不當

### 🟡 中優先級問題（代碼質量）

4. **JapanMap.tsx職責過重**（違反Single Responsibility）
   - 700+行代碼
   - 混合了：地圖渲染、刮除邏輯、縮放控制、事件處理
   - 應拆分為：MapRenderer, ScratchLayer, ZoomController

5. **Magic Numbers散落各處**
   - 縮放倍率：`scale(2)`、`scale(3)`
   - 座標系統：`1000`、`viewBox="0 0 1000 1000"`
   - 刮除半徑：`30`、`40`
   - 應定義為常量或配置

6. **類型安全不足**
   - `sidebarRef`、`mainRef`等未正確定義類型
   - 事件處理函數類型不明確

### 🟢 低優先級問題（改進建議）

7. **資料夾結構可優化**
   - components混雜了業務邏輯和UI組件
   - 缺少`constants/`、`utils/`、`types/`目錄

8. **缺少測試**
   - 觸控事件邏輯複雜但無單元測試
   - 座標計算邏輯無驗證

---

## 漸進式重構清單

### ✅ Phase 1: 修復核心功能（緊急）

- [x] 1.1 統一觸控縮放策略 ✅ **已完成**
  - 方案：全局viewport禁止原生縮放 + 地圖區域自定義pinch-zoom
  - 實現：62行自定義pinch事件處理
  - 結果：簡潔、可預測、符合Linus原則

- [x] 1.2 驗證地圖顯示正常 ✅ **已完成**
  - 確認JapanBaseMap正確渲染
  - 移除所有遺留代碼 (svgRefs, isMapLoaded)

- [x] 1.3 測試並修復Canvas刮除 ✅ **已完成**
  - 添加useEffect依賴
  - 確保事件正確綁定

### ✅ Phase 2: 代碼結構重構

- [ ] 2.1 拆分JapanMap組件
  - 提取`<ScratchCanvas />`
  - 提取`<ZoomController />`
  - 提取`<FocusHint />`

- [ ] 2.2 創建constants文件
  - `MAP_CONSTANTS.ts`: viewBox, scale等
  - `SCRATCH_CONSTANTS.ts`: brush size等

- [ ] 2.3 統一類型定義
  - `types/map.ts`
  - `types/touch.ts`

### ✅ Phase 3: 改進架構

- [ ] 3.1 實現useReducer管理地圖狀態
  - focusedResort
  - zoom level
  - scratch progress

- [ ] 3.2 資料夾重組
  - `components/ui/` - 通用UI
  - `components/map/` - 地圖專用
  - `hooks/` - 自定義hooks
  - `constants/` - 常量
  - `utils/` - 工具函數

---

## 執行計劃

**當前狀態：** 正在修復Phase 1.1

**下一步：** 
1. 完成觸控縮放邏輯測試
2. 如果測試通過，標記1.1為完成
3. 繼續1.2

**測試檢查點：**
- [ ] 側邊欄：不能雙指縮放
- [ ] 地圖區域：可以雙指縮放
- [ ] 點擊雪場：程式自動縮放正常
- [ ] 刮除功能：手指滑動正常

---

## Linus原則應用

### 當前違反點：
1. **觸控邏輯**：用複雜的event listener補丁，而非清晰的狀態機
2. **組件結構**：700行大組件，而非小而專注的組件樹

### 改進方向：
1. 數據結構優先：創建`TouchZoneConfig`明確定義哪些區域allow zoom
2. 組件化：每個組件只做一件事
3. 單一數據源：地圖狀態用useReducer統一管理
