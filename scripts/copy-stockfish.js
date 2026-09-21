import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../node_modules/stockfish");
const DEST = path.resolve(__dirname, "../public/stockfish");

function log(msg) {
  console.log(`[stockfish] ${msg}`);
}

function walk(dir, prefix = "") {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const result = [];
  for (const entry of entries) {
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(path.join(dir, entry.name), rel));
    } else {
      result.push(rel);
    }
  }
  return result;
}

function main() {
  log(`Source: ${SRC}`);
  log(`Target: ${DEST}`);

  if (!fs.existsSync(SRC)) {
    log("ERROR: node_modules/stockfish not found. Run npm install first.");
    process.exit(0);
  }

  const files = walk(SRC);
  log(`Found ${files.length} file(s) in package:`);
  for (const f of files) {
    const size = (fs.statSync(path.join(SRC, f)).size / 1024).toFixed(1);
    log(`  - ${f} (${size} KB)`);
  }

  if (!fs.existsSync(DEST)) {
    fs.mkdirSync(DEST, { recursive: true });
    log(`Created directory: ${DEST}`);
  }

  let count = 0;
  for (const rel of files) {
    const base = path.basename(rel);
    if (base.endsWith(".wasm") || base.endsWith(".js")) {
      const src = path.join(SRC, rel);
      const dest = path.join(DEST, base);
      fs.copyFileSync(src, dest);
      const size = (fs.statSync(dest).size / 1024 / 1024).toFixed(2);
      log(`Copied ${base} (${size} MB)`);
      count++;
    }
  }

  log(`Done. Copied ${count} file(s).`);
}

main();
