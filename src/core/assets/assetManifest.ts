import type { ManifestResponse } from '@/types';

export async function fetchManifest(): Promise<ManifestResponse> {
  try {
    const res = await fetch('/api/drum-sets');
    if (!res.ok) throw new Error(`Manifest API returned ${res.status}`);
    const data = (await res.json()) as ManifestResponse;
    if (data && Object.keys(data).length > 0) {
      return data;
    }
    throw new Error('Manifest is empty');
  } catch (e) {
    throw new Error(
      `Failed to load drum sets from manifest: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  }
}

export function getRatioManifest(
  manifest: ManifestResponse,
  drumSetId: string,
  ratioKey: string
): { background: string; notes: Record<string, { R?: string; L?: string }> } | null {
  const drumSet = manifest[drumSetId];
  if (!drumSet) return null;
  const ratio = drumSet[ratioKey];
  if (!ratio) return null;
  return ratio;
}
