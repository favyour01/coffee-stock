import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:4173";
const browser = await chromium.launch();
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push(`PAGE: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
});

await page.goto(base, { waitUntil: "networkidle", timeout: 15000 });
await page.waitForTimeout(2000);

const rootHtml = await page.locator("#root").innerHTML();
const url = page.url();
const title = await page.title();

console.log("URL:", url);
console.log("Title:", title);
console.log("Root HTML length:", rootHtml.length);
console.log("Root preview:", rootHtml.slice(0, 300));
console.log("Errors:", errors.length ? errors.join("\n") : "(none)");

await browser.close();
process.exit(errors.length || rootHtml.length < 10 ? 1 : 0);
