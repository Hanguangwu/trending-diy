import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.resolve(DATA_DIR, '_producthunt.json');

main().catch(err => {
  console.error('fetch-producthunt: Fatal error:', err.message);
  process.exit(1);
});

async function main() {
  console.log('fetch-producthunt: Fetching Product Hunt...');
  const response = await fetch('https://www.producthunt.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Product Hunt: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const posts = [];

  // Try multiple selector strategies in order
  let postElements = $('[data-test="post-card"]');
  if (!postElements.length) postElements = $('[data-testid="post-item"]');
  if (!postElements.length) postElements = $('a[href^="/posts/"]').parent();
  if (!postElements.length) {
    // Last resort: look for any link with /posts/ in href and try to extract
    const links = $('a[href^="/posts/"]');
    if (links.length) {
      // Wrap each link to get its context
      links.each((_, el) => {
        const $link = $(el);
        extractPost($, $link, posts);
      });
      // If we got some posts this way, keep them
      if (posts.length > 0) {
        const data = { updatedAt: new Date().toISOString(), posts };
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`fetch-producthunt: Saved ${posts.length} posts (fallback method)`);
        return;
      }
    }
    console.warn('fetch-producthunt: Could not find post elements on the page');
    // Write empty result
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), posts: [] }), 'utf-8');
    return;
  }

  postElements.each((index, element) => {
    try {
      const $el = $(element);
      extractPost($, $el, posts);
    } catch (err) {
      console.error(`fetch-producthunt: Failed to parse post #${index + 1}:`, err.message);
    }
  });

  const data = {
    updatedAt: new Date().toISOString(),
    posts,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`fetch-producthunt: Saved ${posts.length} posts to ${OUTPUT_FILE}`);
}

function extractPost($, $el, posts) {
  // Product name - try multiple selectors
  let name = '';
  let $nameEl = $el.find('h2, h3, [class*="title"], [class*="name"]').first();
  if ($nameEl.length) {
    name = $nameEl.text().trim();
  }
  if (!name) {
    const $link = $el.is('a') ? $el : $el.find('a[href^="/posts/"]').first();
    name = $link.text().trim();
    if (!name) {
      name = $link.attr('title') || $link.attr('aria-label') || '';
    }
  }
  if (!name) return; // Skip if we can't find a name

  // URL
  let url = '';
  const $link = $el.is('a[href^="/posts/"]') ? $el : $el.find('a[href^="/posts/"]').first();
  if ($link.length) {
    const href = $link.attr('href');
    if (href) url = `https://www.producthunt.com${href}`;
  }

  // Tagline / description
  let tagline = '';
  const $tagline = $el.find('p, [class*="tagline"], [class*="desc"]').first();
  if ($tagline.length) {
    tagline = $tagline.text().trim();
  }

  // Votes
  let votes = 0;
  const $votes = $el.find('[class*="vote"], [class*="upvote"], [data-test="vote"]').first();
  if ($votes.length) {
    votes = parseInt($votes.text().trim().replace(/,/g, ''), 10) || 0;
  }

  // Comments
  let comments = 0;
  const $comments = $el.find('[class*="comment"]').first();
  if ($comments.length) {
    comments = parseInt($comments.text().trim().replace(/,/g, ''), 10) || 0;
  }

  // Thumbnail
  let thumbnail = null;
  const $img = $el.find('img[src]').first();
  if ($img.length) {
    const src = $img.attr('src');
    if (src && !src.includes('logo') && !src.includes('avatar')) {
      thumbnail = src;
    }
  }

  // Makers
  const makers = [];
  $el.find('a[href*="producthunt.com/@"], a[href*="/@"], [class*="maker"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.startsWith('@')) {
      makers.push(text.replace('@', ''));
    }
  });

  posts.push({
    rank: posts.length + 1,
    name,
    tagline: tagline || null,
    url: url || null,
    votes,
    comments,
    thumbnail,
    makers: [...new Set(makers)],
  });
}
