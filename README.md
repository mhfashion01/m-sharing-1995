# Drum MIDI Video Studio

Convert a drum MIDI file into an animated drum performance video — entirely in the browser. Upload a `.mid`/`.midi` file, select a drum set and visual options, preview the animation on canvas, then render and download an MP4 (or WebM on unsupported browsers).

## Features

- **Client-side MIDI parsing** with `@tonejs/midi` — the MIDI file never leaves the browser
- **R/L hand alternation** per MIDI note number, computed once into a deterministic timeline shared by preview and final render
- **R2-powered drum sets** — drum set PNG assets are discovered dynamically via a manifest API; no drum set names are hardcoded
- **Canvas2D rendering** — a single `renderFrame()` function is used by both the live preview and the final video encoder, so output never diverges
- **WebCodecs + mp4-muxer** for MP4 encoding, with automatic **MediaRecorder fallback** (WebM) for unsupported browsers
- **Timing display overlay** (quarter / eighth / sixteenth notes) computed from the MIDI's BPM and time signature

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand for state management
- `@tonejs/midi` for MIDI parsing
- `mp4-muxer` for MP4 muxing
- WebCodecs API (`VideoEncoder`) for video encoding
- MediaRecorder API as fallback
- Cloudflare Pages + Pages Functions + R2

## Getting Started

### Prerequisites

- Node.js 18+
- A Cloudflare account with an R2 bucket

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and set the CDN base URL:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_ASSET_CDN_BASE_URL` | Public URL where your R2 bucket assets are served (e.g. `https://assets.yourapp.com`) |

### Develop

```bash
npm run dev
```

### Build

```bash
npm run build
```

## R2 Asset Folder Convention

Upload PNG assets to your R2 bucket using this structure:

```
drums/
  {DrumSetName}/
    {ratio}/           ← "16x9", "9x16", or "1x1"
      Drum.png          ← full-canvas background image
      R{noteNumber}.png ← right-hand animation frame for MIDI note number
      L{noteNumber}.png ← left-hand animation frame for MIDI note number
```

Examples:
```
drums/Drum1/16x9/Drum.png
drums/Drum1/16x9/R38.png     ← right hand, snare (MIDI note 38)
drums/Drum1/16x9/L38.png     ← left hand, snare
drums/Drum1/16x9/R42.png     ← right hand, closed hi-hat
drums/Drum1/9x16/Drum.png
drums/Drum1/9x16/R38.png
...
```

- `R` = right hand animation, `L` = left hand animation
- The number is the MIDI note number (e.g. `R38.png` = MIDI note 38)
- Not every note number needs both R and L — the app gracefully skips notes without matching assets
- The manifest API discovers what's actually present; nothing is hardcoded

## Manifest API

The Pages Function at `functions/api/drum-sets.ts` enumerates all R2 objects under `drums/` and returns:

```json
{
  "Drum1": {
    "16x9": {
      "background": "https://pub-4bc6761180de4a7aaeda5301bad616e5.r2.dev/drums/Drum1/16x9/Drum.png",
      "notes": {
        "38": { "R": "https://...", "L": "https://..." },
        "42": { "R": "https://..." }
      }
    },
    "9x16": { ... },
    "1x1": { ... }
  }
}
```

The response is cached for 5 minutes via `Cache-Control`. PNG files are served directly from the R2 public CDN URL — they are not proxied through the function.

## Cloudflare Deployment

### 1. Create an R2 bucket

```bash
wrangler r2 bucket create drum-assets
```

### 2. Upload assets to R2

Upload your PNG files following the folder convention above. You can use the R2 dashboard, `wrangler r2 object put`, or `rclone`.

### 3. Enable public access to the R2 bucket

In the Cloudflare dashboard, enable public access on the bucket (or connect a custom domain). Set the resulting URL as `VITE_ASSET_CDN_BASE_URL`.

### 4. Deploy to Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments. Ensure the `DRUM_ASSETS` R2 binding is configured in your Pages project settings.

### wrangler.toml

The `wrangler.toml` file defines the R2 binding:

```toml
name = "drum-midi-video-studio"
compatibility_date = "2024-09-01"
pages_build_output_dir = "dist"

[[r2_buckets]]
binding = "DRUM_ASSETS"
bucket_name = "drum-assets"
```

## R/L Hand Alternation Logic

The core value of this app. For each MIDI note number, the app tracks which hand (R or L) was last used **independently**. When a new note event for that note number arrives:

1. If no prior state exists for this note number → first hit = **R**
2. Otherwise → alternate from the last hand used for **that specific note number**

This means MIDI note 38's R/L state is completely independent from note 42's state. The timeline is built once after parsing, so preview and final render always use identical data.

## Browser Support

- **WebCodecs (MP4)**: Chrome 94+, Edge 94+, and other Chromium browsers
- **MediaRecorder fallback (WebM)**: Firefox, Safari, and other browsers without WebCodecs
- The app automatically detects support and falls back silently, informing the user via a UI note

## Security

- No R2 access keys or secrets in client-side code — the manifest function uses an R2 binding
- MIDI files are parsed 100% client-side and never uploaded
- File type and MIDI header signature validation before parsing
- Max upload size enforced (2 MB)
