# Design review

## Inventory and decisions

The design uses a single token set for deep charcoal, ivory copy, muted secondary copy, antique gold, subtle rules, Cormorant Garamond and Manrope. The supplied logo is retained; UI icons use the locally stored Lucide SVG sprite and select/checkbox SVGs with their license notices. The raster reference was used to set the actual palette and composition; generic sample colors, rounded SaaS cards and external runtime font links were not adopted.

The homepage separates the photographed hero, an explanatory services introduction and a horizontal six-card gallery. The gallery cards link to the matching service detail where the supplied page includes it. The remaining content uses a coastal image split, a quiet mandate text section and one contained conversation band. Interior pages share the palette and navigation while retaining the original body copy.

## Checks applied

- All page controls use shared palette variables; fine rules use two shared line tokens.
- Focus rings use the warm gold highlight and sit outside the control boundary.
- The mobile navigation button and form controls expose their expanded/required states through native button and form semantics.
- The gallery remains horizontally scrollable if scripting is unavailable; its controls are progressive enhancements.
- Desktop and narrow viewports should be checked for overflow, gallery card separation, keyboard order and contrast over imagery before release.
- Flat-color token contrast against `--ink`: ivory 15.67:1, muted 9.50:1, gold 8.10:1. Dark button text (`#141512` on `#c5a57c`) is 7.90:1. Photo overlays vary by image and crop, so this calculation does not claim AA conformance for every image-backed label.
- No automated or assistive-technology audit has been run; this is a design-system implementation review, not a formal WCAG conformance statement.

The review structure follows the inventory, token, accessibility and remediation sequence described by [skill.design's Design System Auditor](https://skill.design/skills/design-system-auditor) and uses its accessibility skill as a checklist reference, adapted to this brand.
