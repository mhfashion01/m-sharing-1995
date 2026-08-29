export type AspectRatio = '16:9' | '9:16' | '1:1';
export type TimingDisplay = 'quarter' | 'eighth' | 'sixteenth';
export type VideoFormat = 'mp4' | 'webm';
export type Hand = 'R' | 'L';

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  ratioKey: string;
  width: number;
  height: number;
}

export interface TimingDisplayOption {
  value: TimingDisplay;
  label: string;
  subdivisions: number;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '16:9', label: '16:9 Landscape', ratioKey: '16x9', width: 1280, height: 720 },
  { value: '9:16', label: '9:16 Portrait', ratioKey: '9x16', width: 720, height: 1280 },
  { value: '1:1', label: '1:1 Square', ratioKey: '1x1', width: 720, height: 720 },
];

export const TIMING_DISPLAYS: TimingDisplayOption[] = [
  { value: 'quarter', label: 'Quarter Notes', subdivisions: 1 },
  { value: 'eighth', label: 'Eighth Notes', subdivisions: 2 },
  { value: 'sixteenth', label: 'Sixteenth Notes', subdivisions: 4 },
];

export interface ParsedMidiNote {
  noteNumber: number;
  time: number;
  duration: number;
  velocity: number;
}

export interface ParsedMidi {
  name: string;
  notes: ParsedMidiNote[];
  duration: number;
  tempo: number;
  timeSignature: number[];
  ppq: number;
}

export interface TimelineEvent {
  noteNumber: number;
  time: number;
  duration: number;
  velocity: number;
  hand: Hand;
  hasAsset: boolean;
}

export interface AnimationTimeline {
  events: TimelineEvent[];
  skippedCount: number;
  duration: number;
}

export interface NoteAssets {
  R?: string;
  L?: string;
}

export interface RatioManifest {
  background: string;
  notes: Record<string, NoteAssets>;
}

export type DrumSetManifest = Record<string, RatioManifest>;

export type ManifestResponse = Record<string, DrumSetManifest>;

export interface LoadedAssets {
  background: CanvasImageSource;
  notes: Map<string, CanvasImageSource>;
  isPlaceholder: boolean;
}

export interface TimingConfig {
  bpm: number;
  timeSignature: number[];
  timingDisplay: TimingDisplay;
}

export interface RenderResult {
  url: string;
  format: VideoFormat;
  size: number;
  duration: number;
}

export const MAX_MIDI_SIZE = 2 * 1024 * 1024;
export const VISIBLE_DURATION = 0.120;
export const RENDER_FPS = 30;
