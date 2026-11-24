import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/adri0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "assets", "report");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const base = "http://127.0.0.1:8123";

async function capture(name, hash, tabName) {
  await page.goto(`${base}/#${hash}`, { waitUntil: "networkidle" });
  if (tabName) await page.getByRole("tab", { name: tabName, exact: true }).click();
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false });
}

await capture("01-portada", "inicio");
await capture("02-emprendimiento", "emprendimiento");
await capture("03-tributarias", "tributarias", "Caso de IVA");
await capture("04-nomina", "remuneraciones", "Trabajadores");
await capture("05-liquidacion", "liquidacion", "Caso y paz y salvo");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/#inicio`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(output, "06-movil.png"), fullPage: false });

await browser.close();
console.log(`Captured dashboard screenshots in ${output}`);
