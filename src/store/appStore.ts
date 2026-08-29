import { create } from 'zustand';
import type {
  AnimationTimeline,
  AspectRatio,
  DrumSetManifest,
  LoadedAssets,
  ManifestResponse,
  ParsedMidi,
  RenderResult,
  TimingDisplay,
  TimelineEvent,
  TimingConfig,
} from '@/types';

interface AppState {
  midiFile: File | null;
  midiData: ParsedMidi | null;
  parseError: string | null;
  isParsing: boolean;

  manifest: ManifestResponse | null;
  manifestError: string | null;
  isLoadingManifest: boolean;

  selectedDrumSet: string | null;
  timingDisplay: TimingDisplay;
  aspectRatio: AspectRatio;

  timeline: AnimationTimeline | null;
  loadedAssets: LoadedAssets | null;
  isLoadingAssets: boolean;
  assetsError: string | null;
  skippedNotesWarning: string | null;

  isPlaying: boolean;
  currentTime: number;

  isRendering: boolean;
  renderProgress: number;
  renderResult: RenderResult | null;
  renderError: string | null;

  setMidiFile: (f: File | null) => void;
  setMidiData: (d: ParsedMidi | null) => void;
  setParseError: (e: string | null) => void;
  setIsParsing: (b: boolean) => void;

  setManifest: (m: ManifestResponse | null) => void;
  setManifestError: (e: string | null) => void;
  setIsLoadingManifest: (b: boolean) => void;

  setSelectedDrumSet: (id: string | null) => void;
  setTimingDisplay: (t: TimingDisplay) => void;
  setAspectRatio: (a: AspectRatio) => void;

  setTimeline: (t: AnimationTimeline | null) => void;
  setLoadedAssets: (a: LoadedAssets | null) => void;
  setIsLoadingAssets: (b: boolean) => void;
  setAssetsError: (e: string | null) => void;
  setSkippedNotesWarning: (w: string | null) => void;

  setIsPlaying: (b: boolean) => void;
  setCurrentTime: (t: number) => void;

  setIsRendering: (b: boolean) => void;
  setRenderProgress: (p: number) => void;
  setRenderResult: (r: RenderResult | null) => void;
  setRenderError: (e: string | null) => void;

  resetMidi: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  midiFile: null,
  midiData: null,
  parseError: null,
  isParsing: false,

  manifest: null,
  manifestError: null,
  isLoadingManifest: false,

  selectedDrumSet: null,
  timingDisplay: 'sixteenth',
  aspectRatio: '16:9',

  timeline: null,
  loadedAssets: null,
  isLoadingAssets: false,
  assetsError: null,
  skippedNotesWarning: null,

  isPlaying: false,
  currentTime: 0,

  isRendering: false,
  renderProgress: 0,
  renderResult: null,
  renderError: null,

  setMidiFile: (f) => set({ midiFile: f, parseError: null }),
  setMidiData: (d) => set({ midiData: d, currentTime: 0, isPlaying: false }),
  setParseError: (e) => set({ parseError: e }),
  setIsParsing: (b) => set({ isParsing: b }),

  setManifest: (m) => set({ manifest: m, selectedDrumSet: m ? Object.keys(m)[0] ?? null : null }),
  setManifestError: (e) => set({ manifestError: e }),
  setIsLoadingManifest: (b) => set({ isLoadingManifest: b }),

  setSelectedDrumSet: (id) => set({ selectedDrumSet: id }),
  setTimingDisplay: (t) => set({ timingDisplay: t }),
  setAspectRatio: (a) => set({ aspectRatio: a }),

  setTimeline: (t) => set({ timeline: t }),
  setLoadedAssets: (a) => set({ loadedAssets: a }),
  setIsLoadingAssets: (b) => set({ isLoadingAssets: b }),
  setAssetsError: (e) => set({ assetsError: e }),
  setSkippedNotesWarning: (w) => set({ skippedNotesWarning: w }),

  setIsPlaying: (b) => set({ isPlaying: b }),
  setCurrentTime: (t) => set({ currentTime: t }),

  setIsRendering: (b) => set({ isRendering: b }),
  setRenderProgress: (p) => set({ renderProgress: p }),
  setRenderResult: (r) => set({ renderResult: r }),
  setRenderError: (e) => set({ renderError: e }),

  resetMidi: () => set({
    midiFile: null, midiData: null, parseError: null,
    timeline: null, loadedAssets: null, assetsError: null,
    skippedNotesWarning: null, isPlaying: false, currentTime: 0,
    renderResult: null, renderError: null, renderProgress: 0,
  }),
}));

export function buildTimingConfig(
  midi: ParsedMidi,
  timingDisplay: TimingDisplay
): TimingConfig {
  return {
    bpm: midi.tempo,
    timeSignature: midi.timeSignature,
    timingDisplay,
  };
}
