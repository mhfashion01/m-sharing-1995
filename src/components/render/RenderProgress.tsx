import { useAppStore, buildTimingConfig } from '@/store/appStore';
import { isWebCodecsSupported, renderFinalVideo } from '@/core/render/FinalRenderEngine';
import { ASPECT_RATIOS } from '@/types';
import { Download, Film, Loader2, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { useEffect, useState } from 'react';

export function RenderProgress() {
  const {
    midiData, loadedAssets, timeline, timingDisplay, aspectRatio,
    isRendering, renderProgress, renderResult, renderError,
    setIsRendering, setRenderProgress, setRenderResult, setRenderError,
  } = useAppStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  const webCodecs = isWebCodecsSupported();
  const canRender = midiData && loadedAssets && timeline && !isRendering;

  const handleRender = async () => {
    if (!midiData || !loadedAssets || !timeline) return;
    setIsRendering(true);
    setRenderResult(null);
    setRenderError(null);
    setRenderProgress(0);

    try {
      const ar = ASPECT_RATIOS.find((a) => a.value === aspectRatio)!;

      const result = await renderFinalVideo(
        ar.width, ar.height,
        loadedAssets, timeline,
        buildTimingConfig(midiData, timingDisplay),
        setRenderProgress,
      );
      setRenderResult(result);
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : 'Render failed');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="space-y-3">
      {!webCodecs && (
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>Your browser doesn't support WebCodecs — using compatibility mode (WebM, real-time render duration).</span>
        </div>
      )}

      {isMobile && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
          <Smartphone size={14} className="shrink-0 mt-0.5" />
          <span>Video rendering performs best on desktop. It will work here but may be slower.</span>
        </div>
      )}

      <button
        onClick={handleRender}
        disabled={!canRender}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
      >
        {isRendering ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Rendering... {Math.round(renderProgress * 100)}%
          </>
        ) : (
          <>
            <Film size={18} />
            Generate Video
          </>
        )}
      </button>

      {isRendering && (
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-150"
            style={{ width: `${renderProgress * 100}%` }}
          />
        </div>
      )}

      {renderError && (
        <ErrorBanner
          message={renderError}
          onDismiss={() => setRenderError(null)}
        />
      )}

      {renderResult && (
        <div className="space-y-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Video ready!</span>
          </div>
          <video
            src={renderResult.url}
            controls
            className="w-full rounded-lg border border-slate-700/50"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{renderResult.format.toUpperCase()} · {(renderResult.size / 1048576).toFixed(1)} MB</span>
          </div>
          <a
            href={renderResult.url}
            download={`drum-${Date.now()}.${renderResult.format}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={18} />
            Download {renderResult.format.toUpperCase()}
          </a>
        </div>
      )}
    </div>
  );
}
