<div align="center">

# 🧵 SVG Pattern Loom

**One little motif. Endless possibility.**

![Vue](https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vuedotjs&logoColor=ffffff)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=for-the-badge&logo=typescript&logoColor=ffffff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=ffffff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=ffffff)
![License](https://img.shields.io/badge/License-MIT-a48750?style=for-the-badge)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

_Vue pattern studio with functional SVG motif renderers, straight and half-drop repeats, palette controls, and standalone SVG/JSON exports._

</div>

---

## ✨ Highlights

- **Four Original Motifs:** Switch between petals, orbits, woven threads, and garden sprigs.
- **Live Vector Canvas:** Adjust spacing, size, rotation, colors, and supported stroke weights using native SVG.
- **Complete Repeats:** Compare fabric and tile views; half-drop patterns include the full two-row repeat period and neighboring boundary copies.
- **Palette Book:** Start from warm terracotta, quiet coast, or after-hours colors, then edit each color.
- **Portable Artwork:** Export sized fabric SVG, a repeat tile SVG, or the complete validated recipe JSON.
- **Local Workspace:** Validated device-local persistence and imports that preserve current work on failure.
- **Project Identity:** Original favicon and social artwork, CodeSculptor attribution, and deterministic configuration stamps.

## 🧱 Project Structure

```text
public/
|-- favicon.svg                         # Original project favicon
|-- og.svg                              # Original social artwork
`-- sample-workspace.json               # Complete importable sample
src/
|-- components/
|   |-- AppDialog.vue                   # Native Teleport dialog and focus lifecycle
|   |-- AppIcon.vue                     # Inline SVG interface icons
|   `-- PatternCanvas.ts                # h() render function, functional motif renderers, and unique SVG IDs
|-- domain/
|   |-- pattern.ts                      # PL/1 recipes, shared motif geometry, repeat periods, and palettes
|   `-- export.ts                       # Escaped standalone SVG generator with recipe metadata
|-- services/
|   |-- draft.ts                        # Validated local recipe persistence
|   `-- files.ts                        # Downloads, cloning, and deterministic stamps
|-- App.vue                             # Workspace, editing, and data exchange
|-- base.css                            # Tailwind theme and native element defaults
|-- main.ts                             # Vue application entry
`-- style.css                           # Brand tokens and domain-specific styles
tests/
|-- e2e/
|   `-- pattern.spec.ts
`-- pattern.test.ts
index.html                              # English metadata and application mount
package.json                            # Local dependencies and npm commands
playwright.config.ts                    # Production browser workflows
vite.config.ts                          # Vue and Tailwind plugins
vercel.json                             # Explicit routes, cache, and headers
```

## 🛠️ Tech Stack

Vue 3, TypeScript 6, Vite 8, and Tailwind CSS 4. Locally bundled DM Sans and Bricolage Grotesque fonts. Prettier for formatting, Node's native test runner for domain/export checks, and Playwright for production browser workflows. Dependencies are installed inside this project; the application uses no backend service.

## 🎨 Tailwind Styling

The application uses Tailwind CSS 4 utilities directly in Vue templates for layout, spacing, typography, borders, colors, and visible states. Responsive and selector variants preserve the existing desktop and narrow-screen layouts. Utility names are complete source strings that Tailwind can detect during the Vite build.

`src/base.css` defines the font and spacing theme, maps project colors through `@theme inline`, and uses `@apply` for native element defaults. `src/style.css` holds the original brand tokens and any remaining domain-specific rules. Dynamic classes express Vue states, while explicit `data-ui` attributes identify elements used by descendant utilities or browser tests. Unused class names are removed. The spacing unit is `4px` to preserve the original pixel measurements independently of the root font size.

Functional SVG components retain their geometry; Tailwind styles the surrounding application and preview frame.

## 📦 Included Demo Data

`public/sample-workspace.json` is a complete importable PL/1 sample. Defaults also live in the domain module, so startup needs no sample fetch. Parsers reconstruct known fields and ignore unknown metadata.

An original four-petal motif in warm terracotta, a 100 px tile, 62% motif size, and a 200 px half-drop repeat period. Three palette presets and four motifs are bundled in the domain module.

## 🚀 Local Development

Requires Node.js 24 or later.

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally `http://localhost:5173`. To serve the production build:

```bash
npm run build
npm run preview
```

## ◈ Vue Implementation

`PatternCanvas.ts` is a Vue render-function component. A registry of four `FunctionalComponent` renderers produces native SVG VNodes with `h()`. Live rendering and the SVG exporter share the same geometry and repeat placements. `useId` gives each mounted canvas its own pattern ID, so the hero swatches and editor do not collide. Straight repeats use one tile row; half-drop repeats use two rows plus neighboring motif copies at tile boundaries.

Reference: [Vue render functions and functional components](https://vuejs.org/guide/extras/render-function.html).

## 💾 Local Drafts & Data Exchange

Valid edits save to localStorage. Invalid edits preserve the last valid saved workspace and preview, with an inline error; exports are disabled until the draft is valid. The storage key is `svg-pattern-loom:PL1`. Corrupted saved data falls back to the sample. Storage failures appear in the desktop header; export your work before clearing browser data or changing devices. There are no tracking or data-upload requests.

## ◈ Project Markers

Exports identify `vue-svg-pattern-loom`, CodeSculptor, and a deterministic `PL-XXXXXXXX` checksum. The same canonical workspace produces the same stamp. This is an identity aid, not a cryptographic signature or uniqueness guarantee. Original favicon and social artwork carry the project identity.

## 🔌 Extension Notes & Nuances

Spacing uses 48–200 px tiles; motif size uses 15–100%; rotations use integer degrees; line weight uses 1–12 px for orbits and sprigs. Filled petals and woven bars have no stroke. Artwork dimensions are integers from 48–2048 px. A half-drop repeat tile is twice the spacing in height.

Boundary copies preserve the repeat when geometry touches an edge. Preview guides never enter exports. SVG files include no linked images, remote fonts, or scripts. Their metadata contains the original recipe and provenance. Restore asks for confirmation. Imports replace the recipe only after validation.

The fabric viewport and tile viewport reserve the same area across modes; taller editor content scrolls inside its panel. SVG artwork remains editable in vector tools. Original social artwork is SVG; convert it to PNG for services that require a raster image.

Panels reserve space across selections, modes, and tabs; larger content scrolls inside them. The layout supports 320 px screens and reduced motion. Native dialogs manage modal focus and Escape. Original visual assets are SVG; convert social artwork to PNG for services requiring raster images.

## 🧪 Build & Checks

```bash
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Four domain/export tests cover repeat periods and boundary copies, all four motifs, metadata and escaping, import limits, and export dimensions. Four production browser workflows cover functional renderer updates, collision-free SVG IDs, persistence, actual SVG downloads, invalid input, and 320 px mode stability. Browser tests use the production build. Browser traces, reports, and build output are ignored by Git.

## 🌐 Pages & Vercel Deployment

- `/` — application workspace
- `/sample-workspace.json` — importable PL/1 fixture

Import this directory as the Vercel project root. The explicit configuration uses the Vite preset, `npm ci`, `npm run build`, and `dist`. The custom development command forwards `$PORT` to Vite with `--strictPort`.

- `/` serves the app; `/index.html` permanently redirects to `/`.
- Trailing slashes are removed; there is no catch-all rewrite.
- HTML, sample files, icons, and social artwork require revalidation.
- Content-hashed JS, CSS, and fonts in `/assets/` receive a one-year immutable cache policy.
- Responses include `X-Content-Type-Options: nosniff` and a referrer policy.
- Static files retain their original paths. Missing files do not fall back to HTML.

Vite preview does not emulate Vercel routing or headers. Schema validation and local route evaluation do not replace HTTP checks against an actual deployment.

## 📄 License

MIT License. See [LICENSE](./LICENSE).
