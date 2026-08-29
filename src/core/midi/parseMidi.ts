import { Midi } from '@tonejs/midi';
import type { ParsedMidi, ParsedMidiNote } from '@/types';
import { MAX_MIDI_SIZE } from '@/types';

export class MidiParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MidiParseError';
  }
}

export function validateMidiFile(file: File): void {
  if (!file.name.match(/\.midi?$/i)) {
    throw new MidiParseError('File must have a .mid or .midi extension.');
  }
  if (file.size > MAX_MIDI_SIZE) {
    throw new MidiParseError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed size is ${MAX_MIDI_SIZE / 1024 / 1024} MB.`
    );
  }
  if (file.size === 0) {
    throw new MidiParseError('File is empty.');
  }
}

async function checkMThdHeader(buffer: ArrayBuffer): Promise<void> {
  const bytes = new Uint8Array(buffer, 0, 4);
  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (header !== 'MThd') {
    throw new MidiParseError(
      'Invalid MIDI file: missing "MThd" header signature. This file is not a valid MIDI file.'
    );
  }
}

export async function parseMidi(file: File): Promise<ParsedMidi> {
  validateMidiFile(file);

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new MidiParseError('Failed to read the file data.');
  }

  await checkMThdHeader(buffer);

  let midi: Midi;
  try {
    midi = new Midi(buffer);
  } catch (e) {
    throw new MidiParseError(
      `Failed to parse MIDI data: ${e instanceof Error ? e.message : 'Unknown error'}. The file may be corrupted.`
    );
  }

  const notes: ParsedMidiNote[] = [];
  for (const track of midi.tracks) {
    if (track.channel !== 9 && !track.instrument.percussion) continue;
    for (const note of track.notes) {
      notes.push({
        noteNumber: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
      });
    }
  }

  notes.sort((a, b) => a.time - b.time);

  if (notes.length === 0) {
    throw new MidiParseError(
      'No drum notes found. This MIDI file has no notes on channel 10 (the drum channel). Make sure you uploaded a drum MIDI file.'
    );
  }

  return {
    name: midi.name || file.name.replace(/\.midi?$/i, ''),
    notes,
    duration: midi.duration,
    tempo: midi.header.tempos[0]?.bpm ?? 120,
    timeSignature: midi.header.timeSignatures[0]?.timeSignature ?? [4, 4],
    ppq: midi.header.ppq,
  };
}
