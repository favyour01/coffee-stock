import { readFileSync, existsSync } from "fs";
import { join } from "path";

const publicDir = join(process.cwd(), "public");
const indexPath = join(publicDir, "index.html");

if (!existsSync(indexPath)) {
  console.error("❌ public/index.html tidak ada. Jalankan: bun run build");
  process.exit(1);
}

const html = readFileSync(indexPath, "utf8");
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);

let ok = true;
for (const asset of assets) {
  const filePath = join(publicDir, asset.slice(1));
  if (!existsSync(filePath)) {
    console.error(`❌ MISSING: ${asset}`);
    ok = false;
  } else {
    console.log(`✓ ${asset}`);
  }
}

if (!ok) {
  console.error("\n❌ Build tidak lengkap! Hapus public/assets/* lalu build ulang.");
  process.exit(1);
}

console.log("\n✅ Build OK — semua asset cocok dengan index.html");
