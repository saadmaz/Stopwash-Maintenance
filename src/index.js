/**
 * STOPWASH maintenance fallback.
 *
 * Runs on the route *.stopwash.lk/*. stopwash.lk is a custom domain of stopwash-website and never reaches
 * this Worker. www.stopwash.lk does match the route, so it is redirected to stopwash.lk here.
 *
 * - Known Zircon apps (pos, accounts, euro, hr): the request goes to the origin unchanged. If the origin
 *   can't be reached or returns a Cloudflare/gateway error, browsers get the maintenance page instead.
 * - Any other subdomain (typos, retired names): the maintenance page.
 */

const ORIGIN_HOSTS = new Set([
  "pos.stopwash.lk",
  "accounts.stopwash.lk",
  "euro.stopwash.lk",
  "hr.stopwash.lk",
]);

// Gateway errors plus Cloudflare's 52x/530 "origin unreachable" family.
const DOWN_STATUSES = new Set([502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 527, 530]);

const ORIGIN_TIMEOUT_MS = 25_000;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // The *.stopwash.lk route also matches www, ahead of its custom domain. Send it to the main site,
    // as stopwash-website itself does.
    if (host === "www.stopwash.lk") {
      url.hostname = "stopwash.lk";
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (!ORIGIN_HOSTS.has(host)) {
      return maintenance(request, { reason: "unknown-host" });
    }

    try {
      const response = await fetch(request, { signal: AbortSignal.timeout(ORIGIN_TIMEOUT_MS) });
      if (!DOWN_STATUSES.has(response.status)) return response;
      return maintenance(request, { reason: `origin-${response.status}` });
    } catch (err) {
      return maintenance(request, { reason: err?.name === "TimeoutError" ? "origin-timeout" : "origin-unreachable" });
    }
  },
};

function maintenance(request, { reason }) {
  const headers = {
    "Retry-After": "300",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
    "X-Stopwash-Fallback": reason,
  };

  // API and asset requests get a small JSON body so apps can show their own message.
  const accept = request.headers.get("Accept") || "";
  const isRead = request.method === "GET" || request.method === "HEAD";
  const wantsHtml = isRead && (accept.includes("text/html") || !accept.includes("application/json"));
  if (!wantsHtml) {
    return new Response(JSON.stringify({ error: "maintenance", message: "This service is temporarily unavailable." }), {
      status: 503,
      headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return new Response(request.method === "HEAD" ? null : PAGE, {
    status: 503,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Under maintenance | STOPWASH</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23B2E04C'/%3E%3Ctext x='32' y='43' text-anchor='middle' font-family='Arial Black,Arial,sans-serif' font-weight='900' font-size='30' letter-spacing='-2' fill='%23050A12'%3ESW%3C/text%3E%3C/svg%3E">
<style>
  :root { --navy:#0b1728; --ink:#050a12; --lime:#b2e04c; --paper:#f5f6f2; --muted:#b4bcc8; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    background: radial-gradient(1200px 600px at 50% -10%, #13253d 0%, var(--navy) 45%, var(--ink) 100%);
    color: var(--paper);
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: grid; place-items: center; padding: 24px 16px;
  }
  main { width: 100%; max-width: 560px; text-align: center; }
  .logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 22px; letter-spacing: -0.02em; }
  .mark { width: 34px; height: 34px; border-radius: 9px; background: var(--lime); color: var(--ink); display: grid; place-items: center; font-size: 13px; font-weight: 900; }
  .logo b { color: var(--lime); font-weight: 800; }
  .icon { margin: 48px auto 28px; width: 76px; height: 76px; border-radius: 50%; background: rgb(178 224 76 / 0.12); display: grid; place-items: center; }
  .icon svg { width: 36px; height: 36px; stroke: var(--lime); }
  h1 { font-size: clamp(28px, 6vw, 40px); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 14px; }
  p { color: var(--muted); margin: 0 auto 10px; max-width: 46ch; }
  .si { font-size: 15px; }
  .actions { margin-top: 32px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  a.btn { display: inline-block; padding: 12px 22px; border-radius: 999px; font-weight: 700; text-decoration: none; }
  a.primary { background: var(--lime); color: var(--ink); }
  a.ghost { border: 1px solid rgb(245 246 242 / 0.25); color: var(--paper); }
  a.btn:focus-visible { outline: 3px solid var(--paper); outline-offset: 3px; }
  footer { margin-top: 48px; font-size: 13px; color: rgb(180 188 200 / 0.6); }
</style>
</head>
<body>
<main>
  <div class="logo"><span class="mark">SW</span><span>STOP<b>WASH</b></span></div>
  <div class="icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  </div>
  <h1>Sorry, we're under maintenance</h1>
  <p>This page is temporarily unavailable while we carry out some work. Please check back in a few minutes.</p>
  <p class="si" lang="si">කණගාටුයි, නඩත්තු කටයුතු සඳහා මෙම පිටුව තාවකාලිකව ලබා ගත නොහැක. මඳ වේලාවකින් නැවත උත්සාහ කරන්න.</p>
  <div class="actions">
    <a class="btn primary" href="javascript:location.reload()">Try again</a>
    <a class="btn ghost" href="https://stopwash.lk">Go to stopwash.lk</a>
  </div>
  <footer>&copy; STOPWASH</footer>
</main>
</body>
</html>`;
