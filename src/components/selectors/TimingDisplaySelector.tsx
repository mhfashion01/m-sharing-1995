import { useAppStore } from '@/store/appStore';
import { TIMING_DISPLAYS } from '@/types';
import { Clock } from 'lucide-react';

export function TimingDisplaySelector() {
  const { timingDisplay, setTimingDisplay } = useAppStore();

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Clock size={14} /> Timing Display
      </label>
      <div className="grid grid-cols-3 gap-2">
        {TIMING_DISPLAYS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTimingDisplay(t.value)}
            className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
              timingDisplay === t.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {t.label.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
