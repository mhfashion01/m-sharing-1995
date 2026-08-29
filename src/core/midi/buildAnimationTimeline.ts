import type { AnimationTimeline, ParsedMidi, TimelineEvent, Hand, NoteAssets, RatioManifest } from '@/types';

export function buildAnimationTimeline(
  midi: ParsedMidi,
  ratioManifest: RatioManifest | null
): AnimationTimeline {
  const lastHand = new Map<number, Hand>();
  const events: TimelineEvent[] = [];
  let skippedCount = 0;

  for (const note of midi.notes) {
    const noteKey = String(note.noteNumber);

    const hasAsset = ratioManifest
      ? !!(ratioManifest.notes[noteKey]?.R || ratioManifest.notes[noteKey]?.L)
      : false;

    if (ratioManifest && !hasAsset) {
      skippedCount++;
      events.push({
        noteNumber: note.noteNumber,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
        hand: 'R',
        hasAsset: false,
      });
      continue;
    }

    const prev = lastHand.get(note.noteNumber);
    const hand: Hand = prev === undefined ? 'R' : prev === 'R' ? 'L' : 'R';
    lastHand.set(note.noteNumber, hand);

    if (ratioManifest) {
      const noteAssets: NoteAssets | undefined = ratioManifest.notes[noteKey];
      const handAsset = noteAssets?.[hand];
      if (!handAsset) {
        const altHand = hand === 'R' ? 'L' : 'R';
        const altAsset = noteAssets?.[altHand];
        if (!altAsset) {
          skippedCount++;
          events.push({
            noteNumber: note.noteNumber,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            hand,
            hasAsset: false,
          });
          continue;
        }
      }
    }

    events.push({
      noteNumber: note.noteNumber,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity,
      hand,
      hasAsset: true,
    });
  }

  return { events, skippedCount, duration: midi.duration };
}
