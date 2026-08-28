# deepti.xyz redesign — decisions record (v3, 2026-08-28)

Single-page static site (index.html + assets/site.css + assets/site.js). No Jekyll —
`.nojekyll` present. Deployed on GitHub Pages, custom domain deepti.xyz.

## Philosophy (v3, per Deepti)

An AI researcher's page, not a designer's showreel. Visitors come to answer:
who is this, what has she published, is the work real. Clean and scannable in the
spirit of dhawal.xyz / waybarrios.com — the videos prove the work, the layout stays
out of the way.

## Structure

Sticky top nav (About · News · Publications · CV) with smooth scroll →
**About** (original al-folio bio text kept verbatim, portrait right) →
**News** (dated list; leads with DashCop's real-world adoption into VIOLA) →
**Publications** (each entry: video preview left, title/authors/venue/one-line
description/links right, BibTeX collapsed) → footer with contact links and the
Claude acknowledgment line.

Every publication carries an interactive preview in its left column, plus a
compact Problem / Approach / Result list (mono amber labels, 3 short lines):

- **RoadSocial** — four benchmark question chips over the UK close-pass clip;
  each reveals that video's real QA answer.
- **DashCop** — triple-riding / no-helmet toggle swapping live system output,
  with an e-ticket readout.
- **myEye2Wheeler** — "where did the rider look?" quiz: click the frame to place
  a guess, the recorded gaze point (40.5%, 58.2% of frame) reveals in red. The
  marker was inpainted out of the source frame; ground truth is the scooter
  rider ahead.

Dropped from v2: work bands, separate datasets section (dataset links live on
each publication), hero demo card.

## First screen + personal element

The About section owns the full viewport (`min-height: 100vh`, vertically
centred); nothing else is visible until you scroll. The nav is fixed and starts
hidden — it slides in only once the h1 leaves the viewport, which also reveals
the brand name, so "Deepti Rawat" is never on screen twice. A dashed scroll cue
("News & publications") sits at the bottom-left of the first screen and fades out
once scrolled.

**Rickshaw scroll indicator**: the auto-rickshaw rides down the dashed lane rail
at the left viewport edge, its position tracking scroll progress (rotated 90° to
nose downward). Replaces both the old fill-bar and the footer easter egg.
Rail + rider hide under 980px.

## Header

Circular 108px portrait beside the h1 (kills the heavy right-hand block). The nav
brand starts invisible and fades in only once the h1 scrolls out of view, so
"Deepti Rawat" never appears twice at once.

## Previews (all authors' own published material)

- **RoadSocial**: UK close-pass helmet-cam event cropped from the project-page
  carousel (carousel_trim2), with a real benchmark QA as the caption.
- **DashCop**: live system output — triple-riding detection clip from
  dash-cop.github.io. Caption marks it as system output.
- **myEye2Wheeler**: 9s gaze clip cut from the dataset's scene-camera video
  (local copy under /archive/.../myEye2Wheeler_dataset), player chrome cropped.

## Facts corrected in v3

- RideSafe-400 dataset: https://huggingface.co/datasets/DeepBug/RideSafe-400
- myEye2Wheeler dataset: https://india-data.org/dataset-details/f1b6a149-348c-49e7-bc6a-2d13509ced60
- DashCop adopted into VIOLA (https://inaix.iiit.ac.in/VIOLA/), INAI @ IIIT-H,
  deployed with Hyderabad Traffic Police — 6,000+ violations, 4,000+ e-challans,
  95% accuracy. LinkedIn post May 2026:
  https://www.linkedin.com/feed/update/urn:li:activity:7460978682426318849/
- RoadSocial is †equal-contribution co-first authorship — stated on the site.

## Visual system (v4 — "field notebook")

The page reads as a researcher's sketchbook of road scenes, marked up the way a
perception system marks them up. Hand-drawn framing, clean type.

**Palette — warm paper, pastel ink** (all WCAG-checked ≥4.5:1):

| Token | Light | Dark |
|---|---|---|
| `--paper` | `#FAF6EE` | `#151A1F` |
| `--card` | `#F3EDE1` | `#1D242B` |
| `--ink` | `#1E2A33` | `#EDE6D9` |
| `--ink-soft` | `#66737C` | `#9BA5AC` |
| `--marigold` (accent) | `#A34F0D` | `#F0A94C` |
| `--teal` (links) | `#2E6E68` | `#6FBDB2` |
| `--coral` | `#C2453F` | `#E88379` |

**Type**: Lexend (chosen for signage-grade legibility, and the face Deepti liked
on sarcastitva.me) plus Caveat for handwritten figure captions only, so the
sketchbook voice never touches running text.

**Type scale** (tokens in `:root`, rem-based so it honours the reader's browser
font size). Seven steps, no ad-hoc values anywhere:

| Token | rem | @16px | Used for |
|---|---|---|---|
| `--t-label` | 0.75 | 12 | uppercase labels, nav, pills, tooltips, scroll cue |
| `--t-sm` | 0.875 | 14 | chips, readouts, card links, footer, deployment note |
| `--t-meta` | 0.9375 | 15 | authors, tagline, news, Problem/Approach/Result text |
| `--t-body` | 1 | 16 | About paragraphs |
| `--t-title` | 1.125 | 18 | publication titles, nav brand |
| `--t-h2` | 1.625 | 26 | section headings |
| `--t-h1` | 2.125 | 34 | name |

Caveat is the one documented exception (1.0625rem), set a step up to compensate
optically for its small x-height.

**Weights**: three only. `--w-prose: 300` for running prose, `--w-ui: 400` for
interface text, `--w-strong: 500` for headings, titles, labels and emphasis. Only
these weights are requested from Google Fonts.

Tracking: negative on display sizes (-0.02em on h1, -0.01em on h2), positive
(0.1em) on uppercase labels, none on body.

**Sketch devices** — all CSS/SVG, no images:
- `.doodle` / `.doodle-soft` / frame radii: uneven border-radius values so every
  frame reads as an ink stroke rather than UI chrome.
- Hand-drawn squiggle underline beneath each section heading.
- Portrait sits in a plain hand-drawn frame (the 3D detection box + confidence
  tag was tried and cut — too gimmicky next to real system output).
- Hand-drawn car rides the dashed lane rail at the left edge, nose down, and
  **emits doodled smoke puffs while scrolling** (throttled: >40px scroll delta,
  max one per 260ms; suppressed under reduced-motion and below 1040px).
- Favicon: traffic light. (In the Claude artifact preview the tab icon comes
  from the artifact's own emoji, not this file.)

Videos: H.264 ≤1.7 MB, muted/loop/playsinline, posters, IntersectionObserver
play-on-scroll, reduced-motion → paused with controls.

## Links

Icon + label throughout: Scholar · GitHub · LinkedIn · Email · CV in the About
block (ink-coloured, 17px icons), and Project · arXiv · Dataset · Code · BibTeX
in each publication card's links strip (muted, 15px icons, so they read as
card furniture rather than competing with the title). The footer's duplicate
link row was removed — credit line only.

## Publication cards

Each paper is one card (`article.pub`) with clearly separated rows:

1. **Title row** — title + authors
2. **Venue row** — venue pill, plus a status pill where it applies
   (teal "Deployed in production" on DashCop, ghost "Equal contribution" on
   RoadSocial)
3. **Problem / Approach / Result row** — plus the VIOLA deployment callout
4. **Links strip** — full-card-width sunk band that closes the card

Rows are divided by dashed hairlines; the card carries marigold **corner
brackets** (top-left / bottom-right) so each publication reads as something the
detector has boxed. Order on the page: Publications, then News. Equal
contribution is noted inline in the author line, not as a pill.

Zebra-crossing section dividers were tried and removed — they crowded the
headings. Sections are separated by whitespace and the squiggle underline alone.

RoadSocial's preview clip is the CCTV red-light event from the project page
carousel (two scooters stopped, cars driving through) with that video's four real
benchmark QA pairs.

## Maintenance

- New paper → copy a `.pub` block, add a News line.
- HTTPS: GitHub Pages cert for deepti.xyz was serving *.github.io — check
  repo Settings → Pages → custom domain + "Enforce HTTPS".
