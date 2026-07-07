import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.resolve(DATA_DIR, '_hackernews.json');
const HN_BASE = 'https://hacker-news.firebaseio.com/v0';
const MAX_STORIES = 30;

main().catch(err => {
  console.error('fetch-hackernews: Fatal error:', err.message);
  process.exit(1);
});

async function main() {
  console.log('fetch-hackernews: Fetching Hacker News top stories...');

  // Get top story IDs
  const idsRes = await fetch(`${HN_BASE}/topstories.json`);
  if (!idsRes.ok) {
    throw new Error(`Failed to fetch top stories: ${idsRes.status}`);
  }
  const allIds = await idsRes.json();
  const topIds = allIds.slice(0, MAX_STORIES);

  console.log(`fetch-hackernews: Fetching details for ${topIds.length} stories...`);

  const stories = [];
  for (let i = 0; i < topIds.length; i++) {
    try {
      const res = await fetch(`${HN_BASE}/item/${topIds[i]}.json`);
      if (!res.ok) {
        console.warn(`fetch-hackernews: Failed to fetch story ${topIds[i]}: HTTP ${res.status}`);
        continue;
      }
      const item = await res.json();
      if (!item || item.type !== 'story') continue;

      stories.push({
        rank: i + 1,
        title: item.title || '',
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        score: item.score || 0,
        comments: item.descendants || 0,
        author: item.by || 'unknown',
      });
    } catch (err) {
      console.warn(`fetch-hackernews: Error fetching story ${topIds[i]}:`, err.message);
    }
  }

  const data = {
    updatedAt: new Date().toISOString(),
    stories,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`fetch-hackernews: Saved ${stories.length} stories to ${OUTPUT_FILE}`);
}
