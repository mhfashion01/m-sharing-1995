import { useAppStore } from '@/store/appStore';

interface TimelineScrubberProps {
  onSeek: (time: number) => void;
}

export function TimelineScrubber({ onSeek }: TimelineScrubberProps) {
  const { midiData, currentTime } = useAppStore();

  if (!midiData) return null;

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={0}
        max={midiData.duration}
        step={0.01}
        value={Math.min(currentTime, midiData.duration)}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="text-xs text-slate-400 font-mono tabular-nums w-24 text-right shrink-0">
        {formatTime(currentTime)} / {formatTime(midiData.duration)}
      </span>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
