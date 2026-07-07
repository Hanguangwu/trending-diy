import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, '..', 'public', 'trending.json');
const OUTPUT_FILE = path.resolve(__dirname, 'email-body.html');

main();

function main() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const { date, repos, updatedAt } = JSON.parse(raw);

  const rows = repos
    .map(
      r => `
    <tr>
      <td style="padding:8px 12px;text-align:center;font-size:14px;color:#888;width:40px;vertical-align:top;">#${r.rank}</td>
      <td style="padding:8px 12px;">
        <a href="${r.url}" style="color:#0969da;font-weight:600;text-decoration:none;font-size:15px;">${escapeHtml(r.fullName)}</a>
        ${r.description ? `<p style="margin:4px 0 0;font-size:13px;color:#656d76;">${escapeHtml(r.description)}</p>` : ''}
        <div style="margin-top:6px;font-size:12px;color:#656d76;">
          ${r.language ? `<span style="margin-right:12px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${r.languageColor || '#888'};vertical-align:middle;margin-right:3px;"></span>${escapeHtml(r.language)}</span>` : ''}
          <span style="margin-right:12px;">⭐ ${r.starsToday.toLocaleString()} today</span>
          <span style="margin-right:12px;">⭐ ${r.totalStars.toLocaleString()}</span>
          <span>🍴 ${r.forks.toLocaleString()}</span>
        </div>
      </td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;margin:0;padding:0;background:#f6f8fa;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #d0d7de;">
      <tr>
        <td style="padding:24px 32px;background:#24292f;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">GitHub Trending Daily</h1>
          <p style="margin:4px 0 0;color:#8b949e;font-size:14px;">${date} · Updated at ${new Date(updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr style="background:#f6f8fa;">
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#656d76;font-weight:600;text-transform:uppercase;width:40px;">#</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#656d76;font-weight:600;text-transform:uppercase;">Repository</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px;text-align:center;font-size:12px;color:#656d76;border-top:1px solid #d0d7de;">
          <p style="margin:0;">Powered by <strong>trending-diy</strong></p>
        </td>
      </tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
  console.log(`Email body written to ${OUTPUT_FILE}`);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
