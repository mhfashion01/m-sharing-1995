import { useAppStore } from '@/store/appStore';
import { Music, Loader2 } from 'lucide-react';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { fetchManifest } from '@/core/assets/assetManifest';

export function DrumSetSelector() {
  const {
    manifest, manifestError, isLoadingManifest,
    selectedDrumSet, setManifest, setManifestError, setIsLoadingManifest,
    setSelectedDrumSet,
  } = useAppStore();

  const retry = async () => {
    setManifestError(null);
    setIsLoadingManifest(true);
    try {
      const m = await fetchManifest();
      setManifest(m);
    } catch (e) {
      setManifestError(e instanceof Error ? e.message : 'Failed to load drum sets');
    } finally {
      setIsLoadingManifest(false);
    }
  };

  const drumSetIds = manifest ? Object.keys(manifest) : [];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Music size={14} /> Drum Set
      </label>

      {isLoadingManifest && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
          <Loader2 size={16} className="animate-spin" /> Loading drum sets...
        </div>
      )}

      {manifestError && !isLoadingManifest && (
        <ErrorBanner message={manifestError} onRetry={retry} />
      )}

      {!manifestError && drumSetIds.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {drumSetIds.map((id) => (
            <button
              key={id}
              onClick={() => setSelectedDrumSet(id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                selectedDrumSet === id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
              }`}
            >
              <div className={`w-8 h-8 rounded-md shrink-0 ${
                selectedDrumSet === id ? 'bg-blue-500/30' : 'bg-slate-700/50'
              }`} />
              <span className={`text-sm ${selectedDrumSet === id ? 'text-white' : 'text-slate-300'}`}>
                {id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
