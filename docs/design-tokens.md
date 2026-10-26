# Singular Capital design tokens

This system reads the supplied `Singular Capital Luxury Real Estate Homepage-2.png` as the visual source of truth. The screenshot does not reveal exact font files or source measurements; the values below are considered reproductions, checked against the provided real page content and responsive layouts.

## Brand palette

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#101211` | Main canvas and image overlay |
| `--surface` | `#191b18` | Warm raised bands and contact panel |
| `--surface-2` | `#20221e` | Nested surfaces |
| `--ivory` | `#eeeae2` | Primary text and display type |
| `--muted` | `#b8b9b1` | Supporting copy |
| `--gold` | `#c5a57c` | Brand highlight, links and controls |
| `--gold-line` | `rgba(197,165,124,.32)` | Warm section rules |
| `--white-line` | `rgba(238,234,226,.14)` | Quiet dividers |

Flat-color contrast ratios against the page canvas were calculated from the token values: ivory 15.67:1, muted 9.50:1, and gold 8.10:1. Image-backed text relies on the dark overlays; visual inspection does not replace testing against each possible photo crop.

## Type

- Display serif: self-hosted Cormorant Garamond, regular and italic, `--serif`; hero 56–92px, section titles 38–58px, card titles 24–30px.
- Supporting sans: self-hosted Manrope variable, `--sans`; body 16px / 1.7, supporting paragraphs 13–17px / 1.6–1.8.
- Eyebrows: Manrope 10px, 600 weight, uppercase, `.24em` tracking.
- Navigation: Manrope 11px, 500 weight, uppercase, `.17em` tracking, 44px minimum height.
- Inputs and primary controls: at least 48px high.

Cormorant Garamond and Manrope are self-hosted with their SIL Open Font Licenses. The site makes no runtime font requests. UI glyphs use the local Lucide SVG sprite; select and checked-box marks use local Lucide SVG assets with license notices under `assets/icons/`. The supplied `logo.svg` remains the brand mark.

## Composition and spacing

- Main content: 1440px maximum. Gutters: `clamp(20px, 5.5vw, 96px)`.
- Header: 104px desktop, 78px compact; on the home hero it sits over a fine translucent rule and dark image wash.
- Hero: `min(680px, 82svh)` desktop and up to `94svh` on mobile (`88svh` on very narrow screens); the text block is limited to 760px.
- Home services: explanatory column around 235–280px with an adjacent horizontally scrollable photo gallery; snap points preserve one complete card at a time.
- Editorial home sections alternate an image/text split and a two-column mandate passage instead of repeating boxed cards.
- Cards: 212–252px wide, image-led; the six local atlas panels are scaled proportionally and cropped vertically.
- Long-form copy: 790px reading column; privacy/legal pages gain a compact table of contents on wide layouts.
- Mobile menu button and navigation links retain 44px minimum touch height. Service gallery scrolls with touch and keyboard focus; previous/next controls appear when JavaScript runs.
- Motion respects `prefers-reduced-motion`.

## Asset direction

`assets/hero.jpg` and `assets/services.jpg` are locally stored generated architectural visuals guided by the reference composition. They provide atmosphere and do not represent a Singular Capital property, listing or completed transaction. `logo.svg` is the supplied brand mark.
