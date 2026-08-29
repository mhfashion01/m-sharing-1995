import type { TimingConfig } from '@/types';

export function drawTimingDisplay(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  timeSeconds: number,
  config: TimingConfig
): void {
  const secondsPerBeat = 60 / config.bpm;
  const subdivisions = config.timingDisplay === 'quarter' ? 1 : config.timingDisplay === 'eighth' ? 2 : 4;
  const subInterval = secondsPerBeat / subdivisions;

  const barHeight = 28;
  const barY = 0;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, barY, width, barHeight);

  const visibleBeats = Math.ceil(width / 80);

  const currentBeatFloat = timeSeconds / subInterval;
  const startBeat = Math.floor(currentBeatFloat - visibleBeats / 2);
  const endBeat = Math.ceil(currentBeatFloat + visibleBeats / 2);

  for (let b = startBeat; b <= endBeat; b++) {
    const x = width / 2 + (b - currentBeatFloat) * 80;

    if (x < -20 || x > width + 20) continue;

    const isBeat = b % subdivisions === 0;
    const isBar = config.timeSignature[0] > 0 && b % (subdivisions * config.timeSignature[0]) === 0;

    if (isBar) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
    } else if (isBeat) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
    }

    ctx.beginPath();
    ctx.moveTo(x, barY);
    ctx.lineTo(x, barHeight);
    ctx.stroke();

    if (isBeat) {
      const beatInBar = (b / subdivisions) % config.timeSignature[0];
      ctx.fillStyle = beatInBar === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(beatInBar + 1), x, barHeight - 8);
    }
  }

  // Playhead indicator
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, barY);
  ctx.lineTo(width / 2, barHeight);
  ctx.stroke();

  ctx.fillStyle = 'rgba(96, 165, 250, 1)';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 5, barHeight);
  ctx.lineTo(width / 2 + 5, barHeight);
  ctx.lineTo(width / 2, barHeight - 6);
  ctx.closePath();
  ctx.fill();
}
