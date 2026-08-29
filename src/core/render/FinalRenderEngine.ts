import type { AnimationTimeline, LoadedAssets, RenderResult, TimingConfig, VideoFormat } from '@/types';
import { RENDER_FPS } from '@/types';
import { encodeWithWebCodecs } from './encoders/webCodecsEncoder';
import { encodeWithMediaRecorder } from './encoders/mediaRecorderFallback';

export function isWebCodecsSupported(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
}

export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined';
}

export async function renderFinalVideo(
  width: number,
  height: number,
  assets: LoadedAssets,
  timeline: AnimationTimeline,
  timingConfig: TimingConfig,
  onProgress: (p: number) => void
): Promise<RenderResult> {
  if (isWebCodecsSupported()) {
    try {
      const result = await encodeWithWebCodecs(width, height, assets, timeline, timingConfig, onProgress);
      return { url: result.url, format: 'mp4', size: result.size, duration: timeline.duration };
    } catch (e) {
      console.warn('WebCodecs encoding failed, falling back to MediaRecorder', e);
    }
  }

  if (isMediaRecorderSupported()) {
    const canvas = document.createElement('canvas');
    const result = await encodeWithMediaRecorder(
      canvas, width, height, assets, timeline, timingConfig, onProgress
    );
    const format: VideoFormat = 'webm';
    return { url: result.url, format, size: result.size, duration: timeline.duration };
  }

  throw new Error('Your browser does not support video encoding (neither WebCodecs nor MediaRecorder is available).');
}

export { RENDER_FPS };
