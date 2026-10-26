SINGULAR CAPITAL — WEBSITE

The site preserves the supplied page content and applies the supplied Luxury Real Estate Homepage design reference. Design inventory and review: docs/design-tokens.md and docs/design-audit.md.

LOCAL PREVIEW
From the project folder, run:
  php -S 127.0.0.1:8086
Then open http://127.0.0.1:8086/ in a browser.

CONTACT FORM
- Deploy on PHP 8.1+ with HTTPS. The contact form posts to contact.php and the fixed recipient is singular.atx@gmail.com.
- Set CONTACT_FROM_EMAIL to a verified sender address authorized by the host's mail relay. The handler returns HTTP 503 when this value is missing or invalid; it never accepts sender or recipient addresses from the form.
- Configure PHP's mail transport (sendmail_path or an authenticated SMTP relay), plus SPF/DKIM for the chosen sender domain.
- PHP sessions must be enabled. The endpoint validates required fields and enquiry types, rejects malformed arrays and header injection, and uses a honeypot plus a one-minute per-session/per-IP throttle. The IP rate file stores a SHA-256 hash and timestamp outside the document root.
- The default rate-limit folder is in the system temporary directory and scoped to this installation. Set CONTACT_RATE_DIR to a writable persistent directory outside the document root when multiple processes need shared limits. Separate hosts need a shared filesystem to share rate-limit records.
- Update the Privacy and Cookie policies with the actual hosting and mail providers, retention periods and production configuration before launch.
- Run tests/contact.sh to test with a local stub mail transport. It does not send a real email.

ICONS AND FONTS
- UI icons use the local Lucide SVG sprite at assets/icons/lucide.svg. Select and checkbox marks use locally stored SVG assets in assets/icons/. Their upstream source and license notices are in that folder.
- Cormorant Garamond and Manrope fonts are self-hosted in assets/fonts/ with their SIL Open Font Licenses.
- The supplied logo.svg remains the brand mark. No external icon, font or tracking requests are needed at runtime.

The villa and property photographs in assets/ are generated illustrative imagery and do not represent company listings.
