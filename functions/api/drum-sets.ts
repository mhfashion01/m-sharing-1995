interface Env {
  DRUM_ASSETS: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const bucket = context.env.DRUM_ASSETS;
    if (!bucket) {
      return new Response(
        JSON.stringify({ error: 'R2 binding not configured. Set DRUM_ASSETS binding in wrangler.toml.' }),
        { status: 503, headers: corsHeaders }
      );
    }

    const cdnBaseUrl = (context.env as Record<string, string>).VITE_ASSET_CDN_BASE_URL || '';

    const manifest: Record<string, Record<string, {
      background: string;
      notes: Record<string, { R?: string; L?: string }>;
    }>> = {};

    let cursor: string | undefined = undefined;
    let listed: R2Objects;

    do {
      listed = await bucket.list({ prefix: 'drums/', cursor });
      cursor = listed.truncated ? listed.cursor : undefined;

      for (const obj of listed.objects) {
        const key = obj.key;
        const parts = key.split('/');
        // Expected: drums/{DrumSetName}/{ratio}/{filename}
        if (parts.length < 4) continue;

        const drumSetName = parts[1];
        const ratio = parts[2];
        const filename = parts[3];

        if (!drumSetName || !ratio || !filename) continue;

        if (!manifest[drumSetName]) {
          manifest[drumSetName] = {};
        }
        if (!manifest[drumSetName][ratio]) {
          manifest[drumSetName][ratio] = { background: '', notes: {} };
        }

        const entry = manifest[drumSetName][ratio];
        const publicUrl = cdnBaseUrl ? `${cdnBaseUrl}/${key}` : key;

        if (filename === 'Drum.png') {
          entry.background = publicUrl;
        } else {
          const match = filename.match(/^([RL])(\d+)\.png$/i);
          if (match) {
            const hand = match[1].toUpperCase();
            const noteNumber = match[2];
            if (!entry.notes[noteNumber]) {
              entry.notes[noteNumber] = {};
            }
            entry.notes[noteNumber][hand] = publicUrl;
          }
        }
      }
    } while (cursor);

    return new Response(JSON.stringify(manifest), { headers: corsHeaders });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Failed to enumerate R2 objects.' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
