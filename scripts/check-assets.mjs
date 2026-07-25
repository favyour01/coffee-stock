const base = process.argv[2] || "http://127.0.0.1:4173";
const html = await (await fetch(`${base}/`)).text();
console.log("HTML length:", html.length);
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
for (const asset of assets) {
  const res = await fetch(`${base}${asset}`);
  console.log(`${asset} -> ${res.status} ${res.headers.get("content-type")}`);
}
