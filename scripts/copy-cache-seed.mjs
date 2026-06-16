import { copyFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const srcDir = join(root, "data");
const destDir = join(root, "public", "cached-data");

if (!existsSync(srcDir)) {
  console.warn("data/ directory not found, skipping cache seed copy");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

const files = readdirSync(srcDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  copyFileSync(join(srcDir, file), join(destDir, file));
}

console.log(`Copied ${files.length} cache seed files to public/cached-data/`);
