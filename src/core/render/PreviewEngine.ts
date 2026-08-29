import type { AnimationTimeline, LoadedAssets, TimingConfig } from '@/types';
import { renderFrame } from './renderFrame';

export class PreviewEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private currentTime = 0;
  private isPlaying = false;
  private onTimeUpdate: (t: number) => void;
  private onEnded: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    private width: number,
    private height: number,
    private assets: LoadedAssets,
    private timeline: AnimationTimeline,
    private timingConfig: TimingConfig,
    onTimeUpdate: (t: number) => void,
    onEnded: () => void
  ) {
    this.canvas = canvas;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d')!;
    this.onTimeUpdate = onTimeUpdate;
    this.onEnded = onEnded;
  }

  update(assets: LoadedAssets, timeline: AnimationTimeline, timingConfig: TimingConfig, width: number, height: number) {
    this.assets = assets;
    this.timeline = timeline;
    this.timingConfig = timingConfig;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.width = width;
      this.height = height;
    }
    this.drawCurrent();
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.currentTime >= this.timeline.duration) this.currentTime = 0;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  seek(time: number) {
    this.currentTime = Math.max(0, Math.min(time, this.timeline.duration));
    this.drawCurrent();
    this.onTimeUpdate(this.currentTime);
  }

  getCurrentTime() {
    return this.currentTime;
  }

  destroy() {
    this.pause();
  }

  private loop = () => {
    if (!this.isPlaying) return;
    const now = performance.now();
    const dt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.currentTime += dt;
    if (this.currentTime >= this.timeline.duration) {
      this.currentTime = this.timeline.duration;
      this.drawCurrent();
      this.onTimeUpdate(this.currentTime);
      this.isPlaying = false;
      this.onEnded();
      return;
    }

    this.drawCurrent();
    this.onTimeUpdate(this.currentTime);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private drawCurrent() {
    renderFrame(this.ctx, this.width, this.height, this.currentTime, this.assets, this.timeline.events, this.timingConfig);
  }
}
