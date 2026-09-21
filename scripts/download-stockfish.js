import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET_DIR = path.resolve(__dirname, "../public/stockfish");
const TARGET_FILE = path.join(TARGET_DIR, "stockfish-18-single.wasm");

const DOWNLOAD_URL =
  process.env.STOCKFISH_WASM_URL ||
  "https://github.com/airlanggapangestu/Chess-Mate/releases/download/v1.0-assets/stockfish-18-single.wasm";

const MIN_SIZE = 50 * 1024 * 1024; // 50 MB sanity check

function log(msg) {
  console.log(`[stockfish] ${msg}`);
}

function ensureDir() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
}

function alreadyDownloaded() {
  if (!fs.existsSync(TARGET_FILE)) return false;
  const stats = fs.statSync(TARGET_FILE);
  if (stats.size < MIN_SIZE) {
    log("Existing file too small — re-downloading");
    fs.unlinkSync(TARGET_FILE);
    return false;
  }
  log(
    `Already exists (${(stats.size / 1024 / 1024).toFixed(1)} MB) — skipping`,
  );
  return true;
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error("Too many redirects"));

    https
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          download(res.headers.location, dest, redirects + 1)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        const total = parseInt(res.headers["content-length"] || "0", 10);
        let downloaded = 0;
        let lastLog = 0;

        const file = fs.createWriteStream(dest);

        res.on("data", (chunk) => {
          downloaded += chunk.length;
          const now = Date.now();
          if (now - lastLog > 800) {
            const mb = (downloaded / 1024 / 1024).toFixed(1);
            const pct = total ? ((downloaded / total) * 100).toFixed(0) : "?";
            log(`${mb} MB (${pct}%)`);
            lastLog = now;
          }
        });

        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      })
      .on("error", reject);
  });
}

async function main() {
  ensureDir();
  if (alreadyDownloaded()) return;

  log(`Downloading from ${DOWNLOAD_URL}`);
  try {
    await download(DOWNLOAD_URL, TARGET_FILE);
    log("Done.");
  } catch (err) {
    console.error(`[stockfish] Failed: ${err.message}`);
    console.error("[stockfish] App will still run, Stockfish may not work.");
    process.exit(0);
  }
}

main();
