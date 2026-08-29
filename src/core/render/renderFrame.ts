import type { LoadedAssets, TimelineEvent, TimingConfig } from '@/types';
import { VISIBLE_DURATION } from '@/types';
import { drawTimingDisplay } from './timingDisplayRenderer';

export function renderFrame(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  timeSeconds: number,
  loadedAssets: LoadedAssets,
  timeline: TimelineEvent[],
  timingConfig: TimingConfig
): void {
  ctx.clearRect(0, 0, width, height);

  if (loadedAssets.isPlaceholder) {
    drawPlaceholderBackground(ctx, width, height, timeSeconds);
  } else {
    ctx.drawImage(loadedAssets.background, 0, 0, width, height);
  }

  for (const event of timeline) {
    if (!event.hasAsset) continue;
    if (timeSeconds < event.time) continue;
    if (timeSeconds >= event.time + VISIBLE_DURATION) continue;

    const assetKey = `${event.noteNumber}-${event.hand}`;
    const img = loadedAssets.notes.get(assetKey);
    if (!img) continue;

    ctx.globalAlpha = computeAlpha(event.time, timeSeconds);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  drawTimingDisplay(ctx, width, height, timeSeconds, timingConfig);
}

function computeAlpha(eventTime: number, currentTime: number): number {
  const elapsed = currentTime - eventTime;
  const progress = elapsed / VISIBLE_DURATION;
  if (progress < 0.15) return 1;
  return Math.max(0, 1 - (progress - 0.15) / 0.85);
}

function drawPlaceholderBackground(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  const grid = 40;
  const offset = (time * 20) % grid;
  for (let x = -grid + offset; x < width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('No drum set assets loaded — placeholder preview', width / 2, height / 2);
}
