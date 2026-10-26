#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PHP=${PHP:-php}
TMP=$(mktemp -d)
PORT=${PORT:-18765}
PID=
cleanup() {
  if [ -n "$PID" ]; then kill "$PID" 2>/dev/null || true; wait "$PID" 2>/dev/null || true; fi
  rm -rf "$TMP"
}
trap cleanup EXIT INT TERM

cat > "$TMP/sendmail-ok" <<'MAIL'
#!/bin/sh
cat > "$CONTACT_CAPTURE"
exit 0
MAIL
cat > "$TMP/sendmail-fail" <<'MAIL'
#!/bin/sh
cat >/dev/null
exit 75
MAIL
chmod +x "$TMP/sendmail-ok" "$TMP/sendmail-fail"
start_server() {
  port=$1
  rate_dir=$2
  transport=$3
  sender=${4-website@example.test}
  if [ "$sender" = "-" ]; then
    env -u CONTACT_FROM_EMAIL CONTACT_RATE_DIR="$rate_dir" "$PHP" -d "sendmail_path=$transport" -S "127.0.0.1:$port" -t "$ROOT" >"$TMP/server-$port.log" 2>&1 &
  else
    CONTACT_FROM_EMAIL="$sender" CONTACT_RATE_DIR="$rate_dir" CONTACT_CAPTURE="$TMP/mail-$port.txt" "$PHP" -d "sendmail_path=$transport" -S "127.0.0.1:$port" -t "$ROOT" >"$TMP/server-$port.log" 2>&1 &
  fi
  PID=$!
  i=0
  until curl -sS "http://127.0.0.1:$port/contact.html" >/dev/null 2>&1; do
    i=$((i + 1)); [ "$i" -lt 40 ] || { cat "$TMP/server-$port.log"; exit 1; }
    sleep 0.1
  done
}
stop_server() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
  PID=
}
assert_code() {
  expected=$1; shift
  actual=$(curl -sS -o "$TMP/response" -w '%{http_code}' "$@")
  if [ "$actual" != "$expected" ]; then
    echo "Expected HTTP $expected, got $actual" >&2
    cat "$TMP/response" >&2
    exit 1
  fi
}
valid_post() {
  curl -sS -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack=on' "$1/contact.php"
}

start_server "$PORT" "$TMP/rate-one" "$TMP/sendmail-ok"
ORIGIN="http://127.0.0.1:$PORT"
BASE="$ORIGIN"
# Confirm the PHP session cookie is limited to the endpoint directory.
curl -sS -D "$TMP/cookie-headers" -o /dev/null "$BASE/contact.php"
grep -qi "^Set-Cookie: singular_contact=.*path=/;" "$TMP/cookie-headers"
# Same host and non-default port are accepted.
assert_code 200 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack=on' "$BASE/contact.php"
grep -q '^To: singular.atx@gmail.com' "$TMP/mail-$PORT.txt"
grep -q '^From: Singular Capital Website <website@example.test>' "$TMP/mail-$PORT.txt"
# A second submission from the same IP is rate limited even with a fresh cookie jar.
assert_code 429 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack=on' "$BASE/contact.php"
stop_server

# Isolated bucket: bad origins and malformed fields fail before mail delivery.
start_server "$PORT" "$TMP/rate-two" "$TMP/sendmail-ok"
assert_code 400 -H 'Origin: https://attacker.example' -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack=on' "$BASE/contact.php"
stop_server
start_server "$PORT" "$TMP/rate-three-a" "$TMP/sendmail-ok"
assert_code 400 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message[]=Hello&privacy_ack=on' "$BASE/contact.php"
stop_server
start_server "$PORT" "$TMP/rate-three-b" "$TMP/sendmail-ok"
assert_code 400 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack[]=on' "$BASE/contact.php"
stop_server
start_server "$PORT" "$TMP/rate-three-c" "$TMP/sendmail-ok"
assert_code 400 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=bad&enquiry=Other&message=Hello&privacy_ack=on' "$BASE/contact.php"
stop_server

# Honeypot succeeds silently and never invokes mail.
rm -f "$TMP/mail-$PORT.txt"
start_server "$PORT" "$TMP/rate-four" "$TMP/sendmail-ok"
assert_code 200 -H "Origin: $ORIGIN" -d 'website=bot' "$BASE/contact.php"
[ ! -f "$TMP/mail-$PORT.txt" ]
stop_server

# Missing sender configuration and mail transport failure both produce a safe 503.
start_server "$PORT" "$TMP/rate-five" "$TMP/sendmail-ok" -
assert_code 503 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack=on' "$BASE/contact.php"
grep -q 'mailto:singular.atx@gmail.com' "$TMP/response"
grep -q 'logo.svg' "$TMP/response"
stop_server
start_server "$PORT" "$TMP/rate-six" "$TMP/sendmail-fail"
assert_code 503 -H "Origin: $ORIGIN" -d 'name=Taylor&country=US&email=taylor%40example.com&enquiry=Other&message=Hello&privacy_ack=on' "$BASE/contact.php"
grep -q 'aria-current="page"' "$TMP/response"
stop_server

echo 'Contact handler checks passed (mail transport was stubbed; no real email sent).'
