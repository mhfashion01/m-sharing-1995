import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type { AnimationTimeline, LoadedAssets, TimingConfig } from '@/types';
import { RENDER_FPS } from '@/types';
import { renderFrame } from '../renderFrame';

export async function encodeWithWebCodecs(
  width: number,
  height: number,
  assets: LoadedAssets,
  timeline: AnimationTimeline,
  timingConfig: TimingConfig,
  onProgress: (p: number) => void
): Promise<{ url: string; size: number }> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  const totalFrames = Math.max(1, Math.ceil(timeline.duration * RENDER_FPS) + RENDER_FPS);
  const microsecPerFrame = 1_000_000 / RENDER_FPS;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height },
    fastStart: 'in-memory',
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error', e),
  });

  encoder.configure({
    codec: 'avc1.42E01F',
    width,
    height,
    bitrate: 5_000_000,
    framerate: RENDER_FPS,
  });

  for (let frame = 0; frame < totalFrames; frame++) {
    const timeSeconds = frame / RENDER_FPS;
    renderFrame(ctx, width, height, timeSeconds, assets, timeline.events, timingConfig);

    const keyFrame = frame % 60 === 0;
    const videoFrame = new VideoFrame(canvas, {
      timestamp: frame * microsecPerFrame,
      duration: microsecPerFrame,
    });
    encoder.encode(videoFrame, { keyFrame });
    videoFrame.close();

    if (encoder.encodeQueueSize > 10) {
      await waitForQueue(encoder);
    }

    if (frame % 5 === 0) onProgress(frame / totalFrames);
  }

  await encoder.flush();
  encoder.close();
  muxer.finalize();

  const { buffer } = muxer.target as ArrayBufferTarget;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  onProgress(1);
  return { url: URL.createObjectURL(blob), size: blob.size };
}

function waitForQueue(encoder: VideoEncoder): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (encoder.encodeQueueSize <= 5) resolve();
      else setTimeout(check, 5);
    };
    check();
  });
}
