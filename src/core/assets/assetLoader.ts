import type { LoadedAssets, RatioManifest } from '@/types';

export async function loadAssets(ratioManifest: RatioManifest | null): Promise<LoadedAssets> {
  if (!ratioManifest) {
    return { background: createPlaceholderCanvas(1280, 720), notes: new Map(), isPlaceholder: true };
  }

  const notes = new Map<string, CanvasImageSource>();
  const background = await loadImage(ratioManifest.background);

  for (const [noteKey, noteAssets] of Object.entries(ratioManifest.notes)) {
    if (noteAssets.R) {
      try {
        const img = await loadImage(noteAssets.R);
        notes.set(`${noteKey}-R`, img);
      } catch (e) {
        console.warn(`Failed to load R asset for note ${noteKey}`, e);
      }
    }
    if (noteAssets.L) {
      try {
        const img = await loadImage(noteAssets.L);
        notes.set(`${noteKey}-L`, img);
      } catch (e) {
        console.warn(`Failed to load L asset for note ${noteKey}`, e);
      }
    }
  }

  return { background, notes, isPlaceholder: false };
}

function loadImage(src: string): Promise<CanvasImageSource> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function createPlaceholderCanvas(width: number, height: number): CanvasImageSource {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
