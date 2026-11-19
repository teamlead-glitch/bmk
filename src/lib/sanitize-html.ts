/* ---------- CMS RICH TEXT (server only) ---------- */
// Rich text from the CMS (FAQ answers) is rendered with dangerouslySetInnerHTML,
// so it is cleaned here first: only simple text tags are kept, every attribute is
// dropped except a safe href on links, and script-like blocks are removed whole.

const ALLOWED_TAGS = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'a']);
const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi;
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function linkTag(href: string): string {
  const external = /^https?:/i.test(href);
  return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>`;
}

const HEADING_TAGS = new Set(['h2', 'h3', 'h4']);

/** Keeps paragraphs, lists, emphasis and safe links; everything else becomes plain text.
 *  `headings`: also keep h2-h4 (CMS pages such as the legal pages). */
export function cleanHtml(html: string, { headings = false }: { headings?: boolean } = {}): string {
  const allowed = (tag: string) => ALLOWED_TAGS.has(tag) || (headings && HEADING_TAGS.has(tag));
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(DROP_WITH_CONTENT, '')
    .replace(/<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>/gi, (_, close: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!allowed(tag)) return '';
      if (close) return tag === 'br' ? '' : `</${tag}>`;
      if (tag !== 'a') return `<${tag}>`;
      const m = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
      const href = (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim();
      return SAFE_HREF.test(href) && !/[<>"']/.test(href) ? linkTag(href) : '<a>';
    })
    .replace(/<(?![a-z/])/gi, '&lt;') // stray "<" left by broken markup
    .trim();
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Plain text of a piece of markup (FAQ search, brand intros). */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
      }
      return ENTITIES[code.toLowerCase()] ?? whole;
    })
    .replace(/\s+/g, ' ')
    .trim();
}
