# Singular Capital visual tokens

The tokens below are an implementation reading of `Singular Capital Luxury Real Estate Homepage-2.png`. Because the reference is a raster screenshot, typeface names and exact measurements cannot be recovered with certainty. Values are chosen to reproduce its proportions and atmosphere while fitting the supplied content.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#111211` | Page background and dark overlays |
| `--surface` | `#181917` | Form controls and raised content |
| `--paper` | `#e8e4dc` | Primary text and headings |
| `--muted` | `#b3b0a9` | Paragraphs and secondary information |
| `--accent` | `#c2a174` | Eyebrows, fine rules, links and actions |
| `--line` | `rgba(194, 161, 116, .24)` | Warm gold section and card rules |
| `--line-soft` | `rgba(232, 228, 220, .12)` | Subtle structural separators |

## Type

- Display: Georgia/Times New Roman, regular weight, tight tracking; 48–72px for the hero title, responsive to viewport.
- Section headings: Georgia/Times New Roman, regular, 32–44px.
- Body: Arial/Helvetica, 16px with 1.65 line height; muted warm gray.
- Navigation and labels: Arial/Helvetica, uppercase, 9–11px, tracked around .11–.16em.
- Eyebrows: uppercase gold, 11px, tracked .24em.

The screenshot uses a high-contrast editorial serif and a restrained sans serif. Georgia and Arial provide local system fallbacks without introducing external font requests.

## Layout and rhythm

- Desktop page gutters: 5.5vw, clamped between 22px and 92px.
- Main content width: 1440px; long legal copy width: 920px, paragraphs up to 790px.
- Header: about 100px desktop, with wordmark and logo separated visually by a gold hairline.
- Hero: up to 660px / 75vh, full-bleed image with a dark left-to-right overlay for legibility. The image atlas is scaled proportionally and cropped vertically in each card.
- Section spacing: 66–112px, responsive (hero uses 160px top padding on desktop); fine rules separate major bands.
- Service cards: six equal columns on wide screens, with cropped architectural photo panels and thin gold rules; collapses to two and then one column on smaller screens.
- Mobile: two-column card grid through 760px, single column through 480px; header and navigation wrap cleanly; nav links retain a 36px minimum touch area.

## Image direction

The reference pairs dark architecture at dusk with warm interior lighting, cool water and an unobstructed darker area behind the headline. `assets/hero.jpg` is intended to follow that composition. The property scene is visual ambience, not a factual claim about a Singular Capital listing or project.
