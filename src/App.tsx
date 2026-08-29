import { useEffect, useRef } from 'react';
import { useAppStore, buildTimingConfig } from '@/store/appStore';
import { fetchManifest, getRatioManifest } from '@/core/assets/assetManifest';
import { loadAssets } from '@/core/assets/assetLoader';
import { buildAnimationTimeline } from '@/core/midi/buildAnimationTimeline';
import { ASPECT_RATIOS } from '@/types';
import { MidiUploader } from '@/components/upload/MidiUploader';
import { DrumSetSelector } from '@/components/selectors/DrumSetSelector';
import { TimingDisplaySelector } from '@/components/selectors/TimingDisplaySelector';
import { AspectRatioSelector } from '@/components/selectors/AspectRatioSelector';
import { PreviewCanvas } from '@/components/preview/PreviewCanvas';
import { RenderProgress } from '@/components/render/RenderProgress';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Drum, Zap, Clock, Music, Ratio, Film, Upload, Eye } from 'lucide-react';

function StepIndicator({ step, label, icon, active, done }: {
  step: number; label: string; icon: React.ReactNode; active: boolean; done: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
      active ? 'bg-blue-600 text-white' : done ? 'bg-green-500/15 text-green-400' : 'bg-slate-800/50 text-slate-500'
    }`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
        active ? 'bg-white/20' : done ? 'bg-green-500/30' : 'bg-slate-700'
      }`}>{step}</span>
      <span className="hidden sm:inline">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </div>
  );
}

function App() {
  const store = useAppStore();
  const {
    midiData, manifest, selectedDrumSet, aspectRatio, timingDisplay,
    isLoadingManifest, manifestError,
    setManifest, setManifestError, setIsLoadingManifest,
    timeline, loadedAssets, isLoadingAssets, assetsError, skippedNotesWarning,
    setTimeline, setLoadedAssets, setIsLoadingAssets, setAssetsError, setSkippedNotesWarning,
  } = store;

  const currentRatioKey = ASPECT_RATIOS.find((a) => a.value === aspectRatio)!.ratioKey;
  const lastAssetKeyRef = useRef<string>('');

  // Load manifest on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoadingManifest(true);
    fetchManifest()
      .then((m) => { if (!cancelled) { setManifest(m); } })
      .catch((e) => { if (!cancelled) setManifestError(e instanceof Error ? e.message : 'Failed to load'); })
      .finally(() => { if (!cancelled) setIsLoadingManifest(false); });
    return () => { cancelled = true; };
  }, [setManifest, setManifestError, setIsLoadingManifest]);

  // Load assets + build timeline when drum set / ratio / midi changes
  useEffect(() => {
    if (!midiData) return;

    const drumSetId = selectedDrumSet;
    const ratioKey = currentRatioKey;
    const assetKey = `${drumSetId}/${ratioKey}`;

    if (assetKey === lastAssetKeyRef.current && timeline) return;
    lastAssetKeyRef.current = assetKey;

    let cancelled = false;
    setIsLoadingAssets(true);
    setAssetsError(null);

    const ratioManifest = (manifest && drumSetId)
      ? getRatioManifest(manifest, drumSetId, ratioKey)
      : null;

    loadAssets(ratioManifest)
      .then((assets) => {
        if (cancelled) return;
        setLoadedAssets(assets);

        if (ratioManifest && !assets.isPlaceholder) {
          const tl = buildAnimationTimeline(midiData, ratioManifest);
          setTimeline(tl);
          setSkippedNotesWarning(
            tl.skippedCount > 0
              ? `${tl.skippedCount} note${tl.skippedCount > 1 ? 's' : ''} had no matching asset and were skipped.`
              : null
          );
        } else {
          const tl = buildAnimationTimeline(midiData, null);
          setTimeline(tl);
          setSkippedNotesWarning(null);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setAssetsError(e instanceof Error ? e.message : 'Failed to load assets');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAssets(false);
      });

    return () => { cancelled = true; };
  }, [midiData, selectedDrumSet, aspectRatio, manifest, currentRatioKey]);

  // Rebuild timeline when timing display changes (timing doesn't affect timeline, just config)
  // Timeline is built once per midi+drumset; timing display is applied at render time.

  const hasMidi = !!midiData;
  const hasDrumSet = !!selectedDrumSet;
  const step: number = hasMidi ? (hasDrumSet ? 5 : 2) : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Drum size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">Drum MIDI Video Studio</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Convert drum MIDI into animated performance video</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-full">
              <Zap size={12} className="text-cyan-400" />
              Client-side
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <StepIndicator step={1} label="Upload" icon={<Upload size={12} />} active={step === 1} done={hasMidi} />
          <StepIndicator step={2} label="Drum Set" icon={<Music size={12} />} active={step === 2} done={hasDrumSet} />
          <StepIndicator step={3} label="Timing" icon={<Clock size={12} />} active={step === 3} done={hasMidi} />
          <StepIndicator step={4} label="Ratio" icon={<Ratio size={12} />} active={step === 4} done={hasMidi} />
          <StepIndicator step={5} label="Preview" icon={<Eye size={12} />} active={step === 5} done={hasMidi} />
          <StepIndicator step={6} label="Generate" icon={<Film size={12} />} active={step === 6} done={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6">
          {/* Left: Controls */}
          <aside className="space-y-4">
            <section className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <MidiUploader />
            </section>
            {hasMidi && (
              <>
                <section className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                  <DrumSetSelector />
                </section>
                <section className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 space-y-5">
                  <TimingDisplaySelector />
                  <AspectRatioSelector />
                </section>
              </>
            )}
          </aside>

          {/* Center: Preview */}
          <section className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">Preview</h2>
              {isLoadingAssets && <span className="text-xs text-slate-500">Loading assets...</span>}
            </div>
            {assetsError && (
              <div className="mb-3">
                <ErrorBanner message={assetsError} onDismiss={() => setAssetsError(null)} />
              </div>
            )}
            {skippedNotesWarning && (
              <div className="mb-3">
                <ErrorBanner message={skippedNotesWarning} variant="warning" onDismiss={() => setSkippedNotesWarning(null)} />
              </div>
            )}
            <PreviewCanvas />
          </section>

          {/* Right: Export */}
          <aside className="space-y-4">
            {hasMidi && (
              <section className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">Export</h2>
                <RenderProgress />
              </section>
            )}
            <section className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">How it works</h2>
              <ol className="space-y-2 text-xs text-slate-500">
                <li>1. Upload a drum MIDI file</li>
                <li>2. Pick a drum set from R2</li>
                <li>3. Choose timing display</li>
                <li>4. Choose aspect ratio</li>
                <li>5. Preview the animation</li>
                <li>6. Generate & download video</li>
              </ol>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-800/50 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-600">
          Drum MIDI Video Studio · WebCodecs + Canvas2D · Cloudflare Pages + R2
        </div>
      </footer>
    </div>
  );
}

export default App;
