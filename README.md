# Sky Tools AIO

Sky Tools AIO is a lightweight toolkit for the SkyKid community. The app is built with Vue 3 + TypeScript + Vite and is optimized for the web.

## Key features
- **QR Height**: drag and drop a QR image, paste a link, or scan with the camera to extract `scale`/`height`, simulate Sky Kid height, and tweak values manually.
- **Sky Check Scam**: quick link to the community anti-scam site (`https://skycheckscam.com/`).
- **Sky Auto Piano (PC)**: link to the repo that auto-plays piano from sheet files (`https://github.com/HerokeyVN/Sky-Auto-Piano`).
- **Sheet TXT -> Image**: coming soon.

## Local development
- Requirements: Node.js 18+ and pnpm.
- Install deps: `pnpm install`
- Run dev server: `pnpm dev`
- Production build: `pnpm build`
- Preview build: `pnpm preview`

## Notable folders
- `src/views/landingPage` – landing page layout and tool list.
- `src/views/measuringHeightTool` – height tool screen with viewmodel plus QR decoding/math logic.
- `src/components` – shared UI components (header, footer, card, scanner, inputs, etc.).
- `src/i18n` – localization keys (vi/en) and related hooks.
- `src/services/toolService.ts` – tool list and metadata.
