/**
 * canvasDrawing - Canvas 繪圖工具函數
 *
 * 提取自 useScratchCard，用於刮刮卡畫布的繪製邏輯
 * 遵循 Linus 原則：簡潔、可測試、無副作用的純函數
 */

/**
 * 繪製金屬漸變背景
 *
 * @param ctx - Canvas 2D 繪圖上下文
 * @param center - 中心點座標
 * @param radius - 半徑
 * @param size - 畫布尺寸
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  size: number
): void {
  const gradient = ctx.createLinearGradient(
    center - radius,
    center - radius,
    center + radius,
    center + radius
  );
  gradient.addColorStop(0, '#C0C0C0');
  gradient.addColorStop(0.5, '#A8A8A8');
  gradient.addColorStop(1, '#C0C0C0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

/**
 * 繪製光澤效果
 *
 * @param ctx - Canvas 2D 繪圖上下文
 * @param center - 中心點座標
 * @param radius - 半徑
 * @param size - 畫布尺寸
 */
export function drawShimmer(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  size: number
): void {
  ctx.globalAlpha = 0.35;
  const shimmer = ctx.createRadialGradient(
    center - radius * 0.3,
    center - radius * 0.3,
    0,
    center,
    center,
    radius
  );
  shimmer.addColorStop(0, 'rgba(255,255,255,0.9)');
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 1;
}

/**
 * 添加紋理噪點
 *
 * @param ctx - Canvas 2D 繪圖上下文
 * @param size - 畫布尺寸
 */
export function addNoise(ctx: CanvasRenderingContext2D, size: number): void {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * 完整的畫布更新流程（繪製背景 + 光澤 + 噪點）
 *
 * @param ctx - Canvas 2D 繪圖上下文
 * @param size - 畫布尺寸
 * @param areaRadius - 刮除區域半徑
 * @param visited - 是否已訪問（已訪問則清空畫布）
 */
export function updateCanvas(
  ctx: CanvasRenderingContext2D,
  size: number,
  areaRadius: number,
  visited: boolean
): void {
  requestAnimationFrame(() => {
    const center = size / 2;

    // 繪製背景
    drawBackground(ctx, center, areaRadius, size);

    // 繪製光澤
    drawShimmer(ctx, center, areaRadius, size);

    // 添加噪點
    addNoise(ctx, size);

    // 如果已訪問，清空畫布
    if (visited) {
      ctx.clearRect(0, 0, size, size);
    }
  });
}
