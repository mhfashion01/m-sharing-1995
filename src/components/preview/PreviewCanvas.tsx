import { useEffect, useRef } from 'react';
import { useAppStore, buildTimingConfig } from '@/store/appStore';
import { PreviewEngine } from '@/core/render/PreviewEngine';
import { ASPECT_RATIOS } from '@/types';
import { PlaybackControls } from './PlaybackControls';
import { TimelineScrubber } from './TimelineScrubber';

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PreviewEngine | null>(null);

  const {
    midiData, loadedAssets, timeline, timingDisplay, aspectRatio,
    isPlaying, setIsPlaying, setCurrentTime,
  } = useAppStore();

  const ar = ASPECT_RATIOS.find((a) => a.value === aspectRatio)!;
  const { width, height } = ar;

  useEffect(() => {
    if (!canvasRef.current || !midiData || !loadedAssets || !timeline) return;

    const timingConfig = buildTimingConfig(midiData, timingDisplay);
    const engine = new PreviewEngine(
      canvasRef.current,
      width, height,
      loadedAssets,
      timeline,
      timingConfig,
      (t) => setCurrentTime(t),
      () => setIsPlaying(false),
    );
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [midiData, loadedAssets, timeline, width, height]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !midiData || !loadedAssets || !timeline) return;
    const timingConfig = buildTimingConfig(midiData, timingDisplay);
    engine.update(loadedAssets, timeline, timingConfig, width, height);
  }, [timingDisplay, aspectRatio, width, height, midiData, loadedAssets, timeline]);

  const handlePlayPause = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.pause();
    engine.seek(0);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (time: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.seek(time);
  };

  if (!midiData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-slate-900/50 rounded-xl border border-slate-700/50">
        <p className="text-slate-500 text-sm">Upload a MIDI file to see the preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full bg-black rounded-xl overflow-hidden border border-slate-700/50">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ aspectRatio: `${width} / ${height}` }}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PlaybackControls onPlayPause={handlePlayPause} onReset={handleReset} />
        <TimelineScrubber onSeek={handleSeek} />
      </div>
    </div>
  );
}
