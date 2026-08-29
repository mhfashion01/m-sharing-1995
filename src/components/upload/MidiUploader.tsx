import { useRef, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { parseMidi, MidiParseError } from '@/core/midi/parseMidi';
import { Upload, FileMusic, X, Loader2 } from 'lucide-react';
import { ErrorBanner } from '@/components/shared/ErrorBanner';

export function MidiUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    midiFile, midiData, parseError, isParsing,
    setMidiFile, setMidiData, setParseError, setIsParsing, resetMidi,
  } = useAppStore();

  const handleFile = async (file: File) => {
    setMidiFile(file);
    setIsParsing(true);
    try {
      const data = await parseMidi(file);
      setMidiData(data);
    } catch (e) {
      const msg = e instanceof MidiParseError
        ? e.message
        : `Failed to parse MIDI file: ${e instanceof Error ? e.message : 'Unknown error'}`;
      setParseError(msg);
      setMidiFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".mid,.midi"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {midiData ? (
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <FileMusic size={20} className="text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{midiData.name}</p>
            <p className="text-xs text-slate-500">
              {midiData.notes.length} notes · {Math.round(midiData.tempo)} BPM · {midiData.duration.toFixed(1)}s
            </p>
          </div>
          <button
            onClick={resetMidi}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg transition-colors group ${
            isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500'
          }`}
        >
          {isParsing ? (
            <Loader2 size={24} className="text-blue-400 animate-spin" />
          ) : (
            <Upload size={24} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          )}
          <span className="text-sm text-slate-400 group-hover:text-slate-300">
            {isParsing ? 'Parsing...' : 'Click or drag a .mid / .midi file'}
          </span>
          <span className="text-xs text-slate-600">Max 2 MB</span>
        </button>
      )}

      {parseError && <ErrorBanner message={parseError} onDismiss={() => setParseError(null)} />}
    </div>
  );
}
