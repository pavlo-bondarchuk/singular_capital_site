SINGULAR CAPITAL LLC — WEBSITE STARTER PACKAGE

Contents:
- Responsive static HTML site pages
- Legal draft pages: Terms, Privacy, Cookies, Disclaimer, Risk Disclosure
- Shared stylesheet

IMPORTANT BEFORE PUBLISHING:
1. This is a local website implementation, not a deployed website.
2. Have U.S. counsel review broker-dealer / securities, real estate brokerage, lending and transaction-based compensation issues in every relevant jurisdiction.
3. Confirm the exact legal name and registered-agent details against Texas records. The address supplied by the client is presented as registered-agent/correspondence address, not as a company office.
4. Add a real publication date, privacy request workflow, cookie consent if needed, and hosting/provider details.
5. Remove any service language that does not reflect the actual activity or authorization held.
6. The site currently has no analytics, third-party fonts or external image requests.

Preview locally with: php -S 127.0.0.1:8086
Open http://127.0.0.1:8086/ in a browser.
Design tokens and reference interpretation: docs/design-tokens.md.
Architectural photographs in assets/ are generated visual illustrations, not company listings.

CONTACT FORM SERVER SETUP:
- Deploy the site on a PHP 8+ host with HTTPS. The contact page posts to contact.php.
- Set CONTACT_FROM_EMAIL in the PHP server environment to a verified sender address authorized by the host's mail relay. The handler refuses delivery and returns HTTP 503 if the value is missing or invalid. Never populate it from request input.
- Configure the host's PHP mail transport (sendmail_path or an authenticated SMTP relay). The fixed recipient is singular.atx@gmail.com; the validated visitor email is used only as Reply-To. Configure SPF/DKIM for the selected sender domain and ensure the relay authorizes it.
- PHP sessions must be enabled. The endpoint validates required fields and enquiry types, rejects header injection and arrays, and includes a honeypot and a one-minute per-session/per-IP throttle. Per-IP records contain only a SHA-256 hash and timestamp, are stored in a directory outside the document root, and old records are pruned opportunistically after 24 hours.
- The default rate-limit directory is a private subdirectory of the system temporary directory. Ensure PHP can create/write it, or set CONTACT_RATE_DIR to a writable persistent directory outside the document root. File locking coordinates processes sharing that directory; separate hosts/containers do not share limits unless configured to use shared storage.
- Configure mailbox access and retention controls, then update the Privacy Policy with actual mail, hosting providers, and retention period before publication.
- Run tests/contact.sh for local verification. It uses stub mail transports and never sends real email.
