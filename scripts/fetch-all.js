import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');
const SCRIPTS_DIR = __dirname;

const SOURCE_SCRIPTS = [
  'fetch-github.js',
  'fetch-producthunt.js',
  'fetch-hackernews.js',
];

const SOURCE_KEYS = ['github', 'productHunt', 'hackerNews'];

main();

function main() {
  console.log('=== fetch-all: Starting daily data fetch ===\n');

  // 1. Run all source scripts
  for (const script of SOURCE_SCRIPTS) {
    console.log(`\n--- Running ${script} ---`);
    const result = spawnSync('node', [path.join(SCRIPTS_DIR, script)], {
      stdio: 'inherit',
      timeout: 60000,
    });
    if (result.status !== 0) {
      console.warn(`fetch-all: ${script} exited with code ${result.status}`);
    }
  }

  // 2. Read temp files and merge
  console.log('\n--- Merging data ---');
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const merged = {
    date: dateStr,
    updatedAt: today.toISOString(),
    github: null,
    productHunt: null,
    hackerNews: null,
  };

  for (const key of SOURCE_KEYS) {
    const tempFile = path.join(DATA_DIR, `_${key}.json`);
    try {
      if (fs.existsSync(tempFile)) {
        const content = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
        // Only include if it has actual data
        const items = content.repos || content.posts || content.stories || [];
        if (items.length > 0) {
          merged[key] = content;
          console.log(`  ${key}: ${items.length} items`);
        } else {
          console.log(`  ${key}: empty (skipped)`);
        }
      } else {
        console.log(`  ${key}: no data file found`);
      }
    } catch (err) {
      console.warn(`  ${key}: error reading temp file:`, err.message);
    }
  }

  // 3. Write daily file
  const dailyFile = path.join(DATA_DIR, `${dateStr}.json`);
  fs.writeFileSync(dailyFile, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nWrote ${dailyFile}`);

  // 4. Update index.json
  const indexFile = path.join(DATA_DIR, 'index.json');
  let existingDates = [];
  try {
    if (fs.existsSync(indexFile)) {
      const existing = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
      existingDates = existing.dates || [];
    }
  } catch {
    console.warn('Could not read existing index.json, starting fresh');
  }

  const dateSet = new Set([...existingDates, dateStr]);
  const sortedDates = [...dateSet].sort().reverse(); // newest first

  const index = {
    dates: sortedDates,
    latest: dateStr,
  };

  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Updated ${indexFile} (${sortedDates.length} dates)`);

  // 5. Clean up temp files
  for (const key of SOURCE_KEYS) {
    const tempFile = path.join(DATA_DIR, `_${key}.json`);
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
        console.log(`Cleaned up ${tempFile}`);
      }
    } catch (err) {
      console.warn(`Failed to clean up ${tempFile}:`, err.message);
    }
  }

  console.log('\n=== fetch-all: Done ===');
}
