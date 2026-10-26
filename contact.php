<?php
declare(strict_types=1);

// Contact form endpoint. Configure PHP's sendmail_path / SMTP relay on the host.
const CONTACT_RECIPIENT = 'singular.atx@gmail.com';
const CONTACT_SUBJECT = 'Website enquiry — Singular Capital';

session_name('singular_contact');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function respond(string $title, string $message, int $status = 200, bool $emailFallback = false): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    $safeTitle = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $emailFallback = $emailFallback || $status === 503;
    $fallback = $emailFallback ? '<p>Or email us at <a href="mailto:singular.atx@gmail.com">singular.atx@gmail.com</a>.</p>' : '';
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' . $safeTitle . ' | Singular Capital</title><link rel="stylesheet" href="assets/style.css"></head><body><header><a class="brand" href="index.html" aria-label="Singular Capital home"><img src="logo.svg" alt="" width="54" height="54"><span class="brand-name">SINGULAR<small>CAPITAL</small></span></a><nav><a href="about.html">About</a><a href="services.html">What We Do</a><a href="how-we-work.html">How We Work</a><a href="contact.html" aria-current="page">Contact</a></nav></header><main class="legal"><div class="eyebrow">Contact</div><h1>' . $safeTitle . '</h1><p class="lead" role="status" aria-live="polite">' . $safeMessage . '</p>' . $fallback . '<a class="btn primary" href="contact.html">Return to contact form</a></main></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond('Method not allowed', 'Please submit an enquiry using the contact form.', 405);
}

$now = time();
if (isset($_SESSION['last_submission']) && $now - (int) $_SESSION['last_submission'] < 60) {
    respond('Please wait before trying again', 'For security, please wait a minute before submitting another enquiry.', 429);
}

// Compare scheme, hostname and effective port so local and non-standard HTTPS ports work too.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$sourceUrl = $origin !== '' ? $origin : $referer;
if ($sourceUrl !== '') {
    $source = parse_url($sourceUrl);
    $invalidOriginShape = $origin !== '' && is_array($source) && (
        !in_array((string) ($source['path'] ?? ''), ['', '/'], true) ||
        isset($source['query']) || isset($source['fragment']) || isset($source['user']) || isset($source['pass'])
    );
    $requestHost = parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''));
    $requestScheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $requestPort = isset($requestHost['port']) ? (int) $requestHost['port'] : ($requestScheme === 'https' ? 443 : 80);
    $sourceScheme = strtolower((string) ($source['scheme'] ?? ''));
    $sourceHost = strtolower((string) ($source['host'] ?? ''));
    $sourcePort = isset($source['port']) ? (int) $source['port'] : ($sourceScheme === 'https' ? 443 : 80);
    if ($source === false || $invalidOriginShape || !in_array($sourceScheme, ['http', 'https'], true) ||
        $sourceScheme !== $requestScheme || $sourceHost === '' ||
        strtolower((string) ($requestHost['host'] ?? '')) !== $sourceHost || $sourcePort !== $requestPort) {
        respond('Form expired', 'Please return to the contact page and submit the form again.', 400);
    }
}

// Per-IP throttle uses only a one-way IP hash and a timestamp, stored outside the document root.
$rateDir = getenv('CONTACT_RATE_DIR') ?: (sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'singular-capital-contact-rate');
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!is_dir($rateDir) && !@mkdir($rateDir, 0700, true) && !is_dir($rateDir)) {
    error_log('Singular Capital contact form: rate-limit directory unavailable.');
    respond('Unable to send your enquiry', 'The form is temporarily unavailable. Please try again later.', 503);
}
$realRateDir = realpath($rateDir);
$documentRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
if ($realRateDir === false || ($documentRoot !== false && ($realRateDir === $documentRoot || str_starts_with($realRateDir, rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR)))) {
    error_log('Singular Capital contact form: rate-limit directory must be outside the document root.');
    respond('Unable to send your enquiry', 'The form is temporarily unavailable. Please try again later.', 503);
}
@chmod($realRateDir, 0700);
$ratePath = $realRateDir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.lock';
$rateFile = @fopen($ratePath, 'c+');
if ($rateFile === false || !flock($rateFile, LOCK_EX)) {
    if (is_resource($rateFile)) fclose($rateFile);
    error_log('Singular Capital contact form: rate-limit storage unavailable.');
    respond('Unable to send your enquiry', 'The form is temporarily unavailable. Please try again later.', 503);
}
// Opportunistically prune old hashed-IP records; pruning happens while serving normal traffic.
if (random_int(1, 100) === 1) {
    foreach (glob($realRateDir . DIRECTORY_SEPARATOR . '*.lock') ?: [] as $staleFile) {
        if ($staleFile !== $ratePath && @filemtime($staleFile) !== false && filemtime($staleFile) < time() - 86400) {
            @unlink($staleFile);
        }
    }
}
$lastAttempt = (int) trim((string) stream_get_contents($rateFile));
if ($lastAttempt > 0 && time() - $lastAttempt < 60) {
    flock($rateFile, LOCK_UN);
    fclose($rateFile);
    respond('Please wait before trying again', 'For security, please wait a minute before submitting another enquiry.', 429);
}
ftruncate($rateFile, 0);
rewind($rateFile);
fwrite($rateFile, (string) time());
fflush($rateFile);
flock($rateFile, LOCK_UN);
fclose($rateFile);

// Hidden field catches basic bots; its attempt is rate-limited just like other POSTs.
if (!empty($_POST['website'])) {
    respond('Thank you', 'Your enquiry has been received. We will review it and respond if a discussion is appropriate.');
}

$fields = ['name', 'company', 'country', 'email', 'enquiry', 'budget', 'message'];
$data = [];
foreach ($fields as $field) {
    $value = $_POST[$field] ?? '';
    if (!is_string($value)) {
        respond('Check your form', 'One or more fields contain invalid data. Please return to the form and try again.', 400);
    }
    $value = trim($value);
    if (strlen($value) > 5000 || preg_match('/[\r\n]/', $value) && in_array($field, ['email'], true)) {
        respond('Check your form', 'One or more fields are too long or invalid. Please return to the form and try again.', 400);
    }
    $data[$field] = $value;
}

$limits = ['name' => 120, 'company' => 160, 'country' => 120, 'email' => 254, 'enquiry' => 64, 'budget' => 120, 'message' => 4000];
foreach ($limits as $field => $limit) {
    if (strlen($data[$field]) > $limit) {
        respond('Check your form', 'One or more fields exceed the allowed length. Please return to the form and try again.', 400);
    }
}
$allowedEnquiries = [
    'Property acquisition', 'Property / project proposal', 'Project financing enquiry',
    'Capital or financing introduction', 'Professional partnership', 'Other',
];
if ($data['name'] === '' || $data['country'] === '' || $data['message'] === '' ||
    !filter_var($data['email'], FILTER_VALIDATE_EMAIL) ||
    !in_array($data['enquiry'], $allowedEnquiries, true) ||
    (!isset($_POST['privacy_ack']) || !is_string($_POST['privacy_ack']) || $_POST['privacy_ack'] !== 'on')) {
    respond('Check your form', 'Please complete the required fields, enter a valid email address, and accept the Privacy Policy notice.', 400);
}

$body = "A new website enquiry was submitted.\n\n";
$labels = ['name' => 'Full name', 'company' => 'Company', 'country' => 'Country / region', 'email' => 'Email', 'enquiry' => 'Type of enquiry', 'budget' => 'Indicative budget / project size', 'message' => 'Message'];
foreach ($labels as $field => $label) {
    $body .= $label . ":\n" . ($data[$field] !== '' ? $data[$field] : '(not provided)') . "\n\n";
}
$body .= 'Privacy notice accepted: Yes' . "\n";
// Sender must be explicitly configured and valid; never derive it from request headers.
$sender = getenv('CONTACT_FROM_EMAIL') ?: '';
if (!filter_var($sender, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $sender)) {
    error_log('Singular Capital contact form: CONTACT_FROM_EMAIL is missing or invalid.');
    respond('Unable to send your enquiry', 'The form is temporarily unavailable. Please try again later.', 503);
}
$headers = [
    'From' => 'Singular Capital Website <' . $sender . '>',
    'Reply-To' => $data['email'],
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer' => 'PHP/' . PHP_VERSION,
];

// Recipient, subject and From are fixed; only a validated email is used in Reply-To.
$sent = mail(CONTACT_RECIPIENT, CONTACT_SUBJECT, $body, $headers);
if (!$sent) {
    error_log('Singular Capital contact form: mail transport returned failure.');
    respond('Unable to send your enquiry', 'The form could not send your message right now. Please try again later.', 503, true);
}

$_SESSION['last_submission'] = $now;
respond('Thank you', 'Your enquiry has been received. We will review it and respond if a discussion is appropriate.');
