# 日本雪場刮刮樂 - Linus式重構計畫

> "Good taste is about seeing the big picture and finding the simple solution."

---

## 🎯 重構目標

將 826 行的 `JapanMap.tsx` 怪物組件，重構為清晰、簡潔、可維護的架構。

**核心原則：**
1. **數據結構優先** - 清晰的數據關係比聰明的算法更重要
2. **消除特殊情況** - 通過設計消除 if/else 分支
3. **單一職責** - 每個組件/函數只做一件事
4. **零破壞性** - 保持對外 API 和用戶體驗不變

---

## 📊 當前問題總結

| 問題 | 嚴重性 | 位置 |
|------|--------|------|
| 826行怪物組件 | 🔴 CRITICAL | `components/JapanMap.tsx` |
| 200行手勢控制邏輯 | 🔴 CRITICAL | `JapanMap.tsx:252-450` |
| Magic Numbers 滿天飛 | 🔴 HIGH | 整個文件 |
| 9個獨立的 useRef | 🟡 MEDIUM | `JapanMap.tsx:26-38` |
| 坐標轉換邏輯重複 | 🟡 MEDIUM | 至少3處 |
| useEffect 依賴不清晰 | 🟡 MEDIUM | 3個大型 useEffect |

**總分：18/50（不及格）**

---

## 📁 目標目錄結構

```
web-app/
├── components/
│   └── map/                    # 地圖相關組件
│       ├── JapanMap.tsx        # 主組件 (< 150行)
│       ├── MapCanvas.tsx       # SVG地圖層
│       ├── ScratchCanvas.tsx   # Canvas刮除層
│       ├── ResortMarkers.tsx   # 雪場標記
│       ├── FocusHint.tsx       # 聚焦提示動畫
│       └── ZoomControls.tsx    # 縮放控制按鈕
├── hooks/
│   ├── useGesture.ts           # 手勢控制 Hook
│   ├── useMapTransform.ts      # 地圖變換 Hook
│   ├── useScratch.ts           # 刮除檢測 Hook
│   └── useLocalStorage.ts      # (已存在)
├── types/
│   ├── map.ts                  # 地圖相關類型
│   └── gestures.ts             # 手勢相關類型
├── constants/
│   ├── map.ts                  # 地圖常量 (尺寸、縮放等)
│   ├── gestures.ts             # 手勢常量 (閾值等)
│   └── animations.ts           # 動畫常量
└── utils/
    └── coordinates.ts          # 坐標轉換工具
```

---

## 🚀 Phase 1: 建立數據結構基礎

> "Bad programmers worry about the code. Good programmers worry about data structures."

### 1.1 創建類型定義 (types/map.ts)

**目標：** 統一所有數據結構，消除隱式類型

**文件內容：**
```typescript
// types/map.ts
export interface Point {
  x: number;
  y: number;
}

export interface Transform {
  scale: number;
  x: number;
  y: number;
}

export interface MapState {
  transform: Transform;
  focusedResort: Resort | null;
  scratchProgress: number;
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}
```

**驗收標準：**
- ✅ 所有類型都有明確定義
- ✅ 消除 `{ x: number; y: number }` 內聯類型
- ✅ 使用 enum 替代字符串字面量

---

### 1.2 創建常量文件

**目標：** 消除所有 Magic Numbers

**文件內容：**

```typescript
// constants/map.ts
export const MAP = {
  LOGICAL_SIZE: 1000,
  BRUSH_SIZE: 80,
  SCRATCH_DETECTION_RADIUS: 150,
  SCRATCH_COMPLETE_THRESHOLD: 400,
  AUTO_ZOOM_SCALE: 2.5,
  AUTO_ZOOM_DURATION: 800,
  PAN_LIMIT_FACTOR: 0.8,
  MIN_SCALE: 0.5,
  MAX_SCALE: 4,
} as const;

// constants/gestures.ts
export const GESTURE = {
  TOUCH_SLOP: 10,           // 觸控滑動判定閾值
  PINCH_THRESHOLD: 30,      // 捏合手勢判定閾值
  PAN_THRESHOLD: 5,         // 平移手勢判定閾值
} as const;

// constants/animations.ts
export const ANIMATION = {
  ZOOM_DURATION: 800,
  RESET_DURATION: 500,
  CONFETTI_DELAY: 2500,
  HINT_TIMEOUT: 10000,
} as const;
```

**驗收標準：**
- ✅ 代碼中不再出現硬編碼數字
- ✅ 所有常量集中管理，易於調整

---

### 1.3 創建坐標轉換工具

**目標：** 消除重複的坐標計算邏輯

**文件內容：**

```typescript
// utils/coordinates.ts
import { Point } from '@/types/map';
import { MAP } from '@/constants/map';

export class CoordinateTransform {
  private readonly logicalSize: number;

  constructor(logicalSize: number = MAP.LOGICAL_SIZE) {
    this.logicalSize = logicalSize;
  }

  /**
   * 將屏幕坐標轉換為邏輯坐標 (0-1000)
   */
  screenToLogical(screenPoint: Point, rect: DOMRect): Point {
    return {
      x: ((screenPoint.x - rect.left) / rect.width) * this.logicalSize,
      y: ((screenPoint.y - rect.top) / rect.height) * this.logicalSize,
    };
  }

  /**
   * 將邏輯坐標轉換為屏幕坐標
   */
  logicalToScreen(logicalPoint: Point, rect: DOMRect): Point {
    return {
      x: (logicalPoint.x / this.logicalSize) * rect.width + rect.left,
      y: (logicalPoint.y / this.logicalSize) * rect.height + rect.top,
    };
  }

  /**
   * 計算兩點之間的距離
   */
  distance(p1: Point, p2: Point): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
}
```

**驗收標準：**
- ✅ 坐標轉換邏輯只在一個地方
- ✅ 所有組件複用此工具
- ✅ 單元測試覆蓋所有方法

---

## 🔧 Phase 2: 提取業務邏輯

> "If you need more than 3 levels of indentation, you're screwed."

### 2.1 提取手勢控制 Hook

**目標：** 200行手勢邏輯獨立成 Hook

**文件：** `hooks/useGesture.ts`

**接口設計：**
```typescript
interface UseGestureOptions {
  onScratch?: (point: Point) => void;
  onPan?: (delta: Point) => void;
  onZoom?: (scale: number, center: Point) => void;
  disabled?: boolean;
}

export function useGesture(
  containerRef: RefObject<HTMLElement>,
  options: UseGestureOptions
) {
  // 內部狀態機
  const [mode, setMode] = useState<GestureMode>(GestureMode.IDLE);

  // 返回當前手勢狀態
  return { mode };
}
```

**驗收標準：**
- ✅ 手勢邏輯從 JapanMap.tsx 中完全移除
- ✅ 支援 touch 和 mouse 事件
- ✅ 清晰的狀態機管理

---

### 2.2 提取地圖變換 Hook

**目標：** 統一管理 transform 狀態

**文件：** `hooks/useMapTransform.ts`

**接口設計：**
```typescript
export function useMapTransform(containerRef: RefObject<HTMLElement>) {
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const applyTransform = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.style.transform =
      `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
  }, [transform]);

  const focusOnResort = useCallback((resort: Resort) => {
    // 自動縮放並居中
  }, []);

  const reset = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  return { transform, focusOnResort, reset, applyTransform };
}
```

**驗收標準：**
- ✅ transform 邏輯完全獨立
- ✅ 提供清晰的 API
- ✅ 包含邊界檢查

---

### 2.3 提取刮除邏輯 Hook

**目標：** Canvas 刮除邏輯獨立

**文件：** `hooks/useScratch.ts`

**接口設計：**
```typescript
export function useScratch(
  canvasRef: RefObject<HTMLCanvasElement>,
  focusedResort: Resort | null,
  onComplete: (resortId: string) => void
) {
  const [progress, setProgress] = useState(0);

  const scratch = useCallback((point: Point) => {
    // 刮除邏輯
    // 進度檢測
    // 完成回調
  }, [focusedResort, progress]);

  const reset = useCallback(() => {
    setProgress(0);
    // 重繪 Canvas
  }, []);

  return { scratch, progress, reset };
}
```

**驗收標準：**
- ✅ Canvas 操作邏輯獨立
- ✅ 進度追蹤清晰
- ✅ 筆刷效果可配置

---

## 🧩 Phase 3: 組件拆分

> "Functions should do one thing. They should do it well. They should do it only."

### 3.1 提取 ScratchCanvas 組件

**目標：** 獨立的 Canvas 刮除層

**文件：** `components/map/ScratchCanvas.tsx`

**預期行數：** ~80 行

**職責：**
- Canvas 渲染
- 刮除效果繪製
- 使用 `useScratch` hook

---

### 3.2 提取 ResortMarkers 組件

**目標：** 雪場標記獨立渲染

**文件：** `components/map/ResortMarkers.tsx`

**預期行數：** ~100 行

**職責：**
- 渲染所有雪場標記
- Hover 和 Click 事件處理
- 訪問狀態顯示

---

### 3.3 提取 FocusHint 組件

**目標：** 聚焦提示動畫獨立

**文件：** `components/map/FocusHint.tsx`

**預期行數：** ~60 行

**職責：**
- 顯示刮除提示
- 脈衝動畫
- 使用 framer-motion

---

### 3.4 重構主組件 JapanMap.tsx

**目標：** 減少到 < 150 行，只負責組合

**預期結構：**
```tsx
export function JapanMap({ visitedResortIds, onResortClick, resorts }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedResort, setFocusedResort] = useState<Resort | null>(null);

  // 使用自定義 Hooks
  const { transform, focusOnResort, reset } = useMapTransform(containerRef);
  const { scratch, progress } = useScratch(canvasRef, focusedResort, onResortClick);
  const { mode } = useGesture(containerRef, {
    onScratch: scratch,
    onPan: (delta) => { /* ... */ },
    onZoom: (scale, center) => { /* ... */ },
  });

  return (
    <div ref={containerRef} className="...">
      <JapanBaseMap getRegionColor={getRegionColor} />

      {focusedResort && (
        <>
          <RewardPassport resort={focusedResort} />
          <ScratchCanvas
            ref={canvasRef}
            focusedResort={focusedResort}
            progress={progress}
            onScratch={scratch}
          />
          <FocusHint resort={focusedResort} />
        </>
      )}

      <ResortMarkers
        resorts={resorts}
        visitedResortIds={visitedResortIds}
        focusedResort={focusedResort}
        onResortClick={focusOnResort}
      />

      <button onClick={reset}>重置視角</button>
    </div>
  );
}
```

**驗收標準：**
- ✅ 主組件 < 150 行
- ✅ 邏輯清晰，職責單一
- ✅ 易於理解和維護

---

## 🎨 Phase 4: 狀態管理優化（可選）

> "Keep it simple. Don't over-engineer."

### 4.1 引入 useReducer

**只有在 useState 數量 > 5 時才考慮！**

**當前狀態：**
- `focusedResort` - useState
- `transform` - useMapTransform hook 內部管理
- `scratchProgress` - useScratch hook 內部管理
- `gestureMode` - useGesture hook 內部管理

**結論：不需要 useReducer！各個 Hook 已經管理好自己的狀態。**

---

## ✅ 驗收標準

### 功能驗收
- [ ] 所有手勢操作正常 (pan/zoom/scratch)
- [ ] localStorage 數據向後兼容
- [ ] 移動端觸控體驗流暢
- [ ] Confetti 動畫正常觸發
- [ ] 重置視角功能正常

### 代碼質量驗收
- [ ] 主組件 < 150 行
- [ ] 所有子組件 < 100 行
- [ ] 無 Magic Numbers
- [ ] 類型安全 100%
- [ ] 無重複代碼

### 性能驗收
- [ ] 首次渲染時間 < 500ms
- [ ] 手勢響應延遲 < 16ms
- [ ] 無明顯卡頓

---

## 📝 執行順序

**嚴格按照以下順序執行：**

1. ✅ Phase 1.1 → 1.2 → 1.3 (基礎設施)
2. ✅ Phase 2.1 → 2.2 → 2.3 (業務邏輯)
3. ✅ Phase 3.1 → 3.2 → 3.3 → 3.4 (組件拆分)
4. ✅ 全面測試
5. (可選) Phase 4.1 (狀態管理優化)

**每完成一個 Phase，立即測試功能是否正常！**

---

## 🚨 風險控制

### 高風險區域
1. **手勢控制重寫** - 最複雜，最容易出錯
   - 對策：先寫單元測試，再重構

2. **坐標轉換** - 可能導致位置錯誤
   - 對策：保留原有邏輯作為參考，逐步替換

3. **Canvas 重繪** - 性能敏感
   - 對策：使用 `requestAnimationFrame`，避免頻繁重繪

### 回滾策略
- 每個 Phase 完成後，提交 Git commit
- 如果出現問題，立即回滾到上一個穩定版本
- 不要一次性重構所有內容

---

## 🎯 最終目標

**從這樣：**
```
JapanMap.tsx - 826 行怪物
├── 9 個 useRef
├── 4 個 useState
├── 3 個巨大 useEffect
├── 200 行手勢邏輯
└── Magic Numbers 滿天飛
```

**變成這樣：**
```
components/map/
├── JapanMap.tsx (120 行) - 組合層
├── ScratchCanvas.tsx (80 行) - 刮除層
├── ResortMarkers.tsx (100 行) - 標記層
├── FocusHint.tsx (60 行) - 提示層
└── ZoomControls.tsx (40 行) - 控制層

hooks/
├── useGesture.ts (150 行) - 手勢控制
├── useMapTransform.ts (80 行) - 變換管理
└── useScratch.ts (100 行) - 刮除邏輯

types/ + constants/ + utils/ - 清晰的基礎設施
```

**代碼行數：從 826 行 → ~730 行（分散在 12 個文件）**
**可維護性：從 2/10 → 8/10**
**符合 Linus 原則：從 ❌ → ✅**

---

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci
> "Good taste is about making the right decision." - Linus Torvalds

**準備好開始了嗎？從 Phase 1.1 開始！**
