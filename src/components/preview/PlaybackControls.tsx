import { Play, Pause, SkipBack } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface PlaybackControlsProps {
  onPlayPause: () => void;
  onReset: () => void;
}

export function PlaybackControls({ onPlayPause, onReset }: PlaybackControlsProps) {
  const { isPlaying, midiData, currentTime } = useAppStore();
  const atEnd = midiData != null && currentTime >= midiData.duration;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPlayPause}
        disabled={!midiData}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        {isPlaying ? 'Pause' : atEnd ? 'Replay' : 'Play'}
      </button>
      <button
        onClick={onReset}
        disabled={!midiData}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        <SkipBack size={16} />
        Reset
      </button>
    </div>
  );
}
