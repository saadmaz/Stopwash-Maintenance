// Run: node test/index.test.mjs
import assert from "node:assert/strict";
import worker from "../src/index.js";

const H = "X-Stopwash-Fallback";
const html = { Accept: "text/html" };
let passed = 0;
async function t(name, fn) {
  await fn();
  passed++;
  console.log("ok -", name);
}
const stubFetch = (impl) => {
  globalThis.fetch = impl;
};

await t("typo host gets the 503 maintenance page", async () => {
  const r = await worker.fetch(new Request("https://zz-typo-123.stopwash.lk/x", { headers: html }));
  assert.equal(r.status, 503);
  assert.equal(r.headers.get(H), "unknown-host");
  assert.equal(r.headers.get("Retry-After"), "300");
  assert.equal(r.headers.get("Cache-Control"), "no-store");
  assert.equal(r.headers.get("X-Robots-Tag"), "noindex");
  assert.match(await r.text(), /Sorry, we're under maintenance/);
});

await t("JSON / API request gets a JSON 503", async () => {
  const r = await worker.fetch(
    new Request("https://api-typo.stopwash.lk/v1", {
      method: "POST",
      headers: { Accept: "application/json" },
    }),
  );
  assert.equal(r.status, 503);
  assert.match(r.headers.get("Content-Type"), /application\/json/);
  assert.equal((await r.json()).error, "maintenance");
});

await t("HEAD gets a 503 with no body", async () => {
  const r = await worker.fetch(new Request("https://nope.stopwash.lk/", { method: "HEAD" }));
  assert.equal(r.status, 503);
  assert.equal(await r.text(), "");
});

await t("www.stopwash.lk 301s to stopwash.lk, keeping path and query", async () => {
  const r = await worker.fetch(new Request("http://www.stopwash.lk/a/b?c=1", { headers: html }));
  assert.equal(r.status, 301);
  assert.equal(r.headers.get("Location"), "https://stopwash.lk/a/b?c=1");
});

for (const app of ["pos", "accounts", "euro", "hr"]) {
  await t(`${app}.stopwash.lk passes through when the origin is up`, async () => {
    stubFetch(async () => new Response("app ok", { status: 200 }));
    const r = await worker.fetch(new Request(`https://${app}.stopwash.lk/`, { headers: html }));
    assert.equal(r.status, 200);
    assert.equal(await r.text(), "app ok");
  });
}

await t("origin 404 is passed through unchanged", async () => {
  stubFetch(async () => new Response("nf", { status: 404 }));
  const r = await worker.fetch(new Request("https://pos.stopwash.lk/missing", { headers: html }));
  assert.equal(r.status, 404);
});

await t("origin 522 shows maintenance", async () => {
  stubFetch(async () => new Response("cf", { status: 522 }));
  const r = await worker.fetch(new Request("https://pos.stopwash.lk/", { headers: html }));
  assert.equal(r.status, 503);
  assert.equal(r.headers.get(H), "origin-522");
});

await t("origin throwing shows maintenance", async () => {
  stubFetch(async () => {
    throw new TypeError("network");
  });
  const r = await worker.fetch(new Request("https://pos.stopwash.lk/", { headers: html }));
  assert.equal(r.status, 503);
  assert.equal(r.headers.get(H), "origin-unreachable");
});

await t("origin timeout shows maintenance", async () => {
  stubFetch(async () => {
    const e = new Error("t");
    e.name = "TimeoutError";
    throw e;
  });
  const r = await worker.fetch(new Request("https://pos.stopwash.lk/", { headers: html }));
  assert.equal(r.headers.get(H), "origin-timeout");
});

console.log(`\n${passed} passed`);
