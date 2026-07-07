import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.resolve(DATA_DIR, '_github.json');

main().catch(err => {
  console.error('fetch-github: Fatal error:', err.message);
  process.exit(1);
});

async function main() {
  console.log('fetch-github: Fetching GitHub Trending...');
  const response = await fetch('https://github.com/trending?since=daily', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TrendingDIY/1.0)',
      'Accept': 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trending: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const repos = [];

  $('article.Box-row').each((index, element) => {
    try {
      const $el = $(element);

      const titleEl = $el.find('h2.h3 a');
      const href = titleEl.attr('href')?.replace(/^\//, '') || '';
      const textParts = titleEl.text().trim().split(/\s+/);
      const fullName = textParts.filter(t => t !== '/').join('/');

      const [author, name] = fullName.split('/');
      const description = $el.find('p.col-9').text().trim();

      const langEl = $el.find('[itemprop="programmingLanguage"]');
      const language = langEl.text().trim() || null;
      const languageColor = langEl.length
        ? langEl.prev('span.repo-language-color').attr('style')?.match(/background-color:\s*(#[^;]+)/)?.[1] || null
        : null;

      const starLinks = $el.find('a[href*="/stargazers"]');
      const totalStarsText = starLinks.length ? starLinks.first().text().trim() : '0';

      const todayStarEl = $el.find('.float-sm-right, .d-inline-block.float-sm-right');
      const starsTodayText = todayStarEl.length
        ? todayStarEl.text().trim().replace(',', '')
        : '0';

      const forkLinks = $el.find('a[href*="/forks"]');
      const forksText = forkLinks.length ? forkLinks.first().text().trim() : '0';

      const builtBy = [];
      $el.find('.avatar-user').each((_, avatar) => {
        const $avatar = $(avatar);
        const username = $avatar.attr('alt')?.replace('@', '') || '';
        const avatarUrl = $avatar.attr('src') || '';
        if (username) {
          builtBy.push({ username, avatar: avatarUrl.replace('?s=', '?s=40&') });
        }
      });

      repos.push({
        rank: index + 1,
        author,
        name,
        fullName,
        url: `https://github.com/${fullName}`,
        description,
        language,
        languageColor,
        starsToday: parseCount(starsTodayText),
        totalStars: parseCount(totalStarsText),
        forks: parseCount(forksText),
        builtBy,
      });
    } catch (err) {
      console.error(`fetch-github: Failed to parse repo #${index + 1}:`, err.message);
    }
  });

  const data = {
    updatedAt: new Date().toISOString(),
    repos,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`fetch-github: Saved ${repos.length} repos to ${OUTPUT_FILE}`);
}

function parseCount(text) {
  const cleaned = text.replace(/[,\s]/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}
