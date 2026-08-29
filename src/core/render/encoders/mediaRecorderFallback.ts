import type { AnimationTimeline, LoadedAssets, TimingConfig } from '@/types';
import { RENDER_FPS } from '@/types';
import { renderFrame } from '../renderFrame';

export async function encodeWithMediaRecorder(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  assets: LoadedAssets,
  timeline: AnimationTimeline,
  timingConfig: TimingConfig,
  onProgress: (p: number) => void
): Promise<{ url: string; size: number }> {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(RENDER_FPS);
  const mimeType = pickMime();
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start();

  const totalFrames = Math.max(1, Math.ceil(timeline.duration * RENDER_FPS) + RENDER_FPS);
  const frameInterval = 1000 / RENDER_FPS;

  for (let frame = 0; frame < totalFrames; frame++) {
    const timeSeconds = frame / RENDER_FPS;
    renderFrame(ctx, width, height, timeSeconds, assets, timeline.events, timingConfig);
    if (frame % 5 === 0) onProgress(frame / totalFrames);
    await sleep(frameInterval);
  }

  onProgress(1);
  recorder.stop();
  const blob = await done;
  return { url: URL.createObjectURL(blob), size: blob.size };
}

function pickMime(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return 'video/webm';
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
