const assert = require("node:assert/strict");
const test = require("node:test");
const { createApp } = require("../src/server");

async function withServer(testContext, handler) {
  const app = createApp();
  const server = app.listen(0, "127.0.0.1");
  testContext.after(() => {
    server.close();
  });

  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return handler(baseUrl);
}

test("GET /tracker serves tracker landing page", async (t) => {
  await withServer(t, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/tracker`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);

    const html = await response.text();
    assert.match(html, /Private Preview & Design Partner Tracker/);
  });
});

test("GET /api/tracker/bootstrap returns seeded tracker data", async (t) => {
  await withServer(t, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/tracker/bootstrap`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/json/);

    const payload = await response.json();
    assert.ok(Array.isArray(payload.customers));
    assert.ok(Array.isArray(payload.nominations));
    assert.ok(Array.isArray(payload.partnerships));
    assert.ok(Array.isArray(payload.interactions));
    assert.ok(payload.dashboard);
    assert.ok(payload.nominations.length > 0);
    assert.ok(payload.partnerships.length > 0);
  });
});
