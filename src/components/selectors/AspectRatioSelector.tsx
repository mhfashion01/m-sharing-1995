import { useAppStore } from '@/store/appStore';
import { ASPECT_RATIOS } from '@/types';
import { Ratio } from 'lucide-react';

export function AspectRatioSelector() {
  const { aspectRatio, setAspectRatio } = useAppStore();

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Ratio size={14} /> Aspect Ratio
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ASPECT_RATIOS.map((a) => (
          <button
            key={a.value}
            onClick={() => setAspectRatio(a.value)}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${
              aspectRatio === a.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className={`border-2 ${aspectRatio === a.value ? 'border-blue-400' : 'border-slate-500'} ${
              a.value === '16:9' ? 'w-7 h-4' : a.value === '9:16' ? 'w-4 h-7' : 'w-5 h-5'
            } rounded-sm`} />
            <span className={`text-xs ${aspectRatio === a.value ? 'text-white' : 'text-slate-400'}`}>{a.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
