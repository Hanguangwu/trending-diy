import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, '..', 'public', 'trending.json');

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

async function main() {
  console.log('Fetching GitHub Trending...');
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

      // Full repo name: "owner / repo"
      const titleEl = $el.find('h2.h3 a');
      const href = titleEl.attr('href')?.replace(/^\//, '') || '';
      const textParts = titleEl.text().trim().split(/\s+/);
      const fullName = textParts.filter(t => t !== '/').join('/');

      const [author, name] = fullName.split('/');

      // Description
      const description = $el.find('p.col-9').text().trim();

      // Language
      const langEl = $el.find('[itemprop="programmingLanguage"]');
      const language = langEl.text().trim() || null;
      const languageColor = langEl.length
        ? langEl.prev('span.repo-language-color').attr('style')?.match(/background-color:\s*(#[^;]+)/)?.[1] || null
        : null;

      // Stars
      const starLinks = $el.find('a[href*="/stargazers"]');
      const totalStarsText = starLinks.length ? starLinks.first().text().trim() : '0';

      // Stars today
      const todayStarEl = $el.find('.float-sm-right, .d-inline-block.float-sm-right');
      const starsTodayText = todayStarEl.length
        ? todayStarEl.text().trim().replace(',', '')
        : '0';

      // Forks
      const forkLinks = $el.find('a[href*="/forks"]');
      const forksText = forkLinks.length ? forkLinks.first().text().trim() : '0';

      // Built by
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
      console.error(`Failed to parse repo #${index + 1}:`, err.message);
    }
  });

  const now = new Date();
  const data = {
    date: now.toISOString().slice(0, 10),
    updatedAt: now.toISOString(),
    repos,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved ${repos.length} trending repos to ${DATA_FILE}`);
}

function parseCount(text) {
  const cleaned = text.replace(/[,\s]/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}
