import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the ChangeLab home and outcome catalogue", async () => {
  const home = await render("/");
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type") ?? "", /^text\/html\b/i);
  const homeHtml = await home.text();
  assert.match(homeHtml, /ChangeLab/);
  assert.match(homeHtml, /Start Energy Stores/);
  assert.match(homeHtml, /Heat Transfer Lab/);
  assert.match(homeHtml, /Energy Vault/);
  assert.match(homeHtml, /og-change-lab\.png/);

  const catalogue = await render("/play");
  assert.equal(catalogue.status, 200);
  const catalogueHtml = await catalogue.text();
  assert.match(catalogueHtml, /7\.1\.1/);
  assert.match(catalogueHtml, /7\.1\.2/);
  assert.match(catalogueHtml, /six evidence-led missions/);
});

test("server-renders the Energy Stores mission interface", async () => {
  const response = await render("/play/7-1-2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Energy Stores/);
  assert.match(html, /Storm Station 08/);
  assert.match(html, /Hear Mr\. Cisneros/);
  assert.match(html, /Mission brief/);
  assert.match(html, /Evidence lenses/);
  assert.doesNotMatch(html, />Vin</);
});

test("all six approved mission narrations and generated artwork are packaged", async () => {
  const assets = [
    "mr-cisneros-energy-kinetic.mp3",
    "mr-cisneros-energy-gravitational.mp3",
    "mr-cisneros-energy-elastic.mp3",
    "mr-cisneros-energy-thermal.mp3",
    "mr-cisneros-energy-chemical.mp3",
    "mr-cisneros-energy-vault.mp3",
  ];
  await Promise.all(assets.map((name) => access(new URL(`../public/audio/${name}`, import.meta.url))));
  await access(new URL("../public/og-change-lab.png", import.meta.url));

  const component = await readFile(new URL("../app/components/EnergyVault.tsx", import.meta.url), "utf8");
  for (const name of assets) assert.match(component, new RegExp(name.replaceAll(".", "\\.")));
});
