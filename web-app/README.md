# DIY Ski - Japan Ski Resort Map

一个互动式日本滑雪场地图应用，支持触控手势、刮刮乐动画和访问记录追踪。

## 🎯 功能特性

- **互动地图**: 单指平移、双指缩放浏览 40+ 日本滑雪场
- **刮刮乐体验**: 点击雪场触发刮除动画，解锁雪场信息
- **访问追踪**: localStorage 保存已访问雪场，脉冲光环标记
- **移动端优化**: 流畅的触控手势，scale-aware 边界限制
- **类型安全**: 完整的 TypeScript 类型定义

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 运行测试（watch 模式）
npm run test:ui
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

手机端访问：`http://192.168.1.101:3000` (替换为你的本地 IP)

## ☁️ 部署到 Vercel（含 Preview URL）

### 後台介面（推薦）
1. Vercel > New Project > Import Git Repository，選擇此 repo。
2. 設定 **Root Directory** 為 `web-app`。
3. Install Command: `npm ci`；Build Command: `npm run build`；Output Directory: `.next`（預設即可）。
4. Deploy 完成後：
   - Production URL：主分支自動部署。
   - Preview URL：每個分支/PR push 都自動產生，手機直接開啟測試。

### CLI（不想等 commit）
```bash
cd web-app
npm ci               # 首次安裝
npx vercel           # 依提示選 Scope/Project，得到臨時預覽 URL
# 之後可：
npx vercel --prebuilt  # 先本機 npm run build，再上傳產物（更快）
npx vercel --prod      # 直接部署到 Production
```

### 需要設定的環境變數
本專案目前無後端依賴，也沒有必填環境變數；保持預設即可。

## 📁 项目结构

```
web-app/
├── app/
│   ├── page.tsx              # 主页面
│   └── test-hooks/           # Hooks 测试页面（开发工具）
├── components/
│   ├── JapanMap.tsx          # 地图主组件 (142 行)
│   ├── ResortMarkers.tsx     # 雪场标记
│   ├── ScratchCanvas.tsx     # 刮除层
│   └── FocusHint.tsx         # 聚焦提示
├── hooks/
│   ├── useGesture.ts         # 手势控制 Hook (✅ 4 tests)
│   ├── useMapTransform.ts    # 地图变换 Hook (✅ 5 tests)
│   └── useScratch.ts         # 刮除逻辑 Hook (✅ 6 tests)
├── utils/
│   └── coordinates.ts        # 坐标转换工具 (✅ 12 tests)
├── types/
│   ├── map.ts               # 地图相关类型
│   └── gestures.ts          # 手势相关类型
├── constants/
│   ├── map.ts               # 地图常量配置
│   └── gestures.ts          # 手势常量配置
└── data/
    └── resorts.ts           # 雪场数据
```

## 🧪 测试

### 单元测试
```bash
npm run test:run    # 运行所有测试
npm run test        # watch 模式
npm run test:ui     # 可视化界面
```

**测试覆盖**: 27 个单元测试覆盖核心逻辑
- ✅ 12 tests - 坐标转换
- ✅ 4 tests - 手势识别
- ✅ 5 tests - 地图变换
- ✅ 6 tests - 刮除逻辑

### 集成测试
访问 [http://localhost:3000/test-hooks](http://localhost:3000/test-hooks) 进行交互测试。

详见 [app/test-hooks/README.md](app/test-hooks/README.md)

## 🏗️ 架构设计

本项目遵循 **Linus Torvalds 的设计原则**：

### 1. Good Taste
- ✅ 零 magic numbers（所有数值都在 constants/ 中定义）
- ✅ 清晰的数据结构（Transform, GestureMode, Point）
- ✅ 类型安全（完整 TypeScript 覆盖）

### 2. Separation of Concerns
- **Hooks**: 业务逻辑（手势、变换、刮除）
- **Components**: 展示逻辑（标记、Canvas、提示）
- **Utils**: 纯函数（坐标转换）
- **Constants**: 配置数据

### 3. Data Structures over Algorithms
```typescript
interface Transform {
  scale: number;  // 缩放级别
  x: number;      // X 轴偏移
  y: number;      // Y 轴偏移
}

enum GestureMode {
  IDLE = 'idle',
  PAN = 'pan',
  ZOOM = 'zoom',
  SCRATCH = 'scratch',
}
```

## 📊 重构成果

本项目经过系统性重构，代码质量显著提升：

| 指标 | 重构前 | 重构后 | 改善 |
|------|--------|--------|------|
| 主组件行数 | 826 | 142 | **-82.8%** |
| Magic Numbers | 50+ | 0 | **-100%** |
| useRef 数量 | 9 | 2 | **-77.8%** |
| 单元测试 | 0 | 27 | **+100%** |

详见 [REFACTOR_SUMMARY.md](REFACTOR_SUMMARY.md)

## 🐛 已修复的 Bug

### High Zoom Level Pan Limit Bug
**问题**: 在 3.0x+ 缩放时无法拖动地图

**修复**: 实现 scale-aware boundary limits
```typescript
// Before
const limitX = rect.width * PAN_LIMIT_FACTOR; // ❌ 固定边界

// After
const limitX = rect.width * PAN_LIMIT_FACTOR * scale; // ✅ 动态边界
```

## 📱 移动端优化

- **低阈值**: `TOUCH_SLOP: 8px` 快速响应
- **禁用默认手势**: `touchAction: 'none'`
- **精准坐标**: 统一的 logical-screen 转换
- **缩放感知边界**: 高缩放级别可拖动更远

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **语言**: TypeScript
- **UI**: Tailwind CSS
- **动画**: Framer Motion
- **测试**: Vitest + Testing Library
- **特效**: canvas-confetti

## 📝 开发指南

### 添加新雪场
编辑 `data/resorts.ts`:
```typescript
{
  id: 'new_resort',
  name: '新雪场',
  position: { x: 500, y: 500 },
  region: 'hokkaido',
  // ...
}
```

### 调整手势参数
编辑 `constants/gestures.ts`:
```typescript
export const GESTURE = {
  TOUCH_SLOP: 8,        // 触摸滑动阈值
  PINCH_THRESHOLD: 25,  // 缩放手势阈值
  // ...
};
```

### 修改地图配置
编辑 `constants/map.ts`:
```typescript
export const MAP = {
  MIN_SCALE: 0.5,       // 最小缩放
  MAX_SCALE: 4,         // 最大缩放
  AUTO_ZOOM_SCALE: 2.5, // 自动聚焦缩放
  // ...
};
```

## 🔍 调试技巧

### 使用测试页面
访问 `/test-hooks` 可以：
- 查看实时的 transform 状态（scale, x, y）
- 观察手势模式切换（idle/pan/zoom/scratch）
- 隔离测试单个 Hook 的功能

### 查看控制台日志
取消注释 `useGesture.ts` 中的 debug 代码：
```typescript
console.log('Mode:', mode, 'Delta:', delta);
```

## 🚢 部署

### Vercel（推荐）
```bash
npm run build
vercel deploy
```

### 其他平台
```bash
npm run build
npm run start
```

## 📄 许可证

MIT

## 🙏 致谢

本项目的重构遵循 **Linus Torvalds** 的设计哲学：

> "Talk is cheap. Show me the code." - Linus Torvalds

感谢 Linus 对软件工程原则的深刻洞见。
