/**
 * Newsletter email HTML. Used by the send action AND the admin preview, so
 * what editors see is exactly what subscribers receive.
 *
 * Table layout + inline styles for email-client compatibility. Fonts fall back
 * to Georgia / system sans because web fonts are unreliable in email.
 */

const C = {
  paper: '#F2EEE5',
  sheet: '#FAF8F3',
  ink: '#1A1714',
  ink2: '#3A352F',
  ink3: '#6F675D',
  rule: '#D8D0C1',
  clay: '#A63D24',
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, monospace";

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export interface CampaignEmailInput {
  subject: string;
  previewText?: string | null;
  /** Plain text; blank lines separate paragraphs. */
  content: string;
  siteUrl: string;
  /** Per-recipient unsubscribe link. Omit in previews. */
  unsubscribeUrl?: string;
}

export function renderCampaignEmail({ subject, previewText, content, siteUrl, unsubscribeUrl }: CampaignEmailInput): string {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 18px 0;font-family:${SERIF};font-size:17px;line-height:1.65;color:${C.ink2};">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`
    )
    .join('');

  const unsub = unsubscribeUrl
    ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:${C.ink3};text-decoration:underline;">Unsubscribe</a>`
    : `<span style="color:${C.ink3};text-decoration:underline;">Unsubscribe</span>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
${previewText ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.sheet};">
        <tr>
          <td style="padding:28px 36px 0 36px;">
            <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;font-family:${SERIF};font-size:24px;letter-spacing:-0.4px;color:${C.ink};">Saudi <em>Future</em> Tech</a>
            <div style="border-top:2px solid ${C.ink};margin-top:16px;"></div>
            <div style="border-top:1px solid ${C.ink};margin-top:3px;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px 8px 36px;">
            <div style="font-family:${MONO};font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:${C.clay};">The Sunday Brief</div>
            <h1 style="margin:10px 0 0 0;font-family:${SERIF};font-size:28px;line-height:1.15;font-weight:normal;letter-spacing:-0.4px;color:${C.ink};">${escapeHtml(subject)}</h1>
            ${previewText ? `<p style="margin:12px 0 0 0;font-family:${SERIF};font-style:italic;font-size:17px;line-height:1.45;color:${C.ink3};">${escapeHtml(previewText)}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px 12px 36px;">
            <div style="border-top:1px solid ${C.rule};padding-top:24px;">${paragraphs}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 36px 32px 36px;">
            <a href="${escapeHtml(siteUrl)}" style="font-family:${SANS};font-size:14px;color:${C.ink};text-decoration:none;border-bottom:1px solid ${C.ink};">Read this week’s reporting &rarr;</a>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td style="padding:20px 36px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.ink3};">
            You’re receiving this because you subscribed to the Sunday Brief from Saudi Future Tech.<br>
            ${unsub} &middot; <a href="${escapeHtml(siteUrl)}/privacy" style="color:${C.ink3};text-decoration:underline;">Privacy</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
