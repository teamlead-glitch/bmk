/* ---------- CMS RICH TEXT (server only) ---------- */
// Rich text from the CMS (FAQ answers, descriptions, CMS pages) is rendered with
// dangerouslySetInnerHTML, so it is cleaned here first: only an allow-list of tags is kept,
// every attribute is dropped except the few rebuilt below (checked link/media URLs, text
// alignment), and script-like blocks are removed whole.

const ALLOWED_TAGS = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'a']);
const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi;
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function linkTag(href: string): string {
  const external = /^https?:/i.test(href);
  return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>`;
}

/* CMS pages (admin "Pages" editor): headings, media and the editor's other formatting */
const HEADING_TAGS = new Set(['h2', 'h3', 'h4']);
const PAGE_TAGS = new Set([
  ...HEADING_TAGS,
  's', 'strike', 'del', 'sub', 'sup', 'blockquote', 'hr', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'img', 'video', 'source', 'iframe',
]);
/** The page title is the only H1 (SEO rule): h1 becomes h2; h5/h6 become h4 */
const RENAME: Record<string, string> = { h1: 'h2', h5: 'h4', h6: 'h4' };
/** Editor alignment (style="text-align: center") kept as a class on these */
const ALIGNABLE = new Set(['p', 'h2', 'h3', 'h4', 'li', 'blockquote', 'figure']);
const DROP_WITH_CONTENT_PAGE = /<(script|style|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi;

function attr(attrs: string, name: string): string {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
  return (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim();
}
const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Image/video URL: http(s) (upgraded to https: the site is https), protocol-relative or a site path */
function mediaSrc(raw: string, { dataImage = false } = {}): string | null {
  const v = raw.replace(/&amp;/g, '&');
  if (dataImage && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(v)) return v.replace(/\s/g, '');
  if (/[<>"'\s]/.test(v)) return null;
  if (/^\/\//.test(v)) return `https:${v}`;
  if (/^https?:\/\//i.test(v)) return v.replace(/^http:/i, 'https:');
  if (/^\/(?!\/)/.test(v)) return v;
  return null;
}

/** Video embeds the editor makes: YouTube (served from youtube-nocookie) and Vimeo players only */
function embedSrc(raw: string): string | null {
  const v = mediaSrc(raw);
  if (!v) return null;
  const yt = v.match(/^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,20})(\?[\w=&%.-]*)?$/i);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}${yt[2] ?? ''}`;
  const vimeo = v.match(/^https:\/\/player\.vimeo\.com\/video\/(\d+)(\?[\w=&%.-]*)?$/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}${vimeo[2] ?? ''}`;
  return null;
}

/** The rebuilt opening tag of a CMS page tag, or '' to drop it */
function pageTag(tag: string, attrs: string): string {
  const size = (n: string) => (/^\d{1,4}$/.test(attr(attrs, n)) ? ` ${n}="${attr(attrs, n)}"` : '');
  switch (tag) {
    case 'img': {
      const src = mediaSrc(attr(attrs, 'src'), { dataImage: true });
      return src ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(attr(attrs, 'alt'))}"${size('width')}${size('height')} loading="lazy" decoding="async">` : '';
    }
    case 'video': {
      const src = mediaSrc(attr(attrs, 'src'));
      const poster = mediaSrc(attr(attrs, 'poster'));
      return `<video${src ? ` src="${escapeAttr(src)}"` : ''}${poster ? ` poster="${escapeAttr(poster)}"` : ''} controls playsinline preload="metadata">`;
    }
    case 'source': {
      const src = mediaSrc(attr(attrs, 'src'));
      const type = attr(attrs, 'type').toLowerCase();
      return src ? `<source src="${escapeAttr(src)}"${/^video\/(mp4|webm|ogg)$/.test(type) ? ` type="${type}"` : ''}>` : '';
    }
    case 'iframe': {
      const src = embedSrc(attr(attrs, 'src'));
      return src
        ? `<iframe src="${escapeAttr(src)}" title="Embedded video" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin">`
        : '';
    }
    default: {
      const align = ALIGNABLE.has(tag) && attrs.match(/text-align\s*:\s*(center|right|justify)/i)?.[1].toLowerCase();
      return `<${tag}${align ? ` class="ta-${align}"` : ''}>`;
    }
  }
}

const VOID_TAGS = new Set(['br', 'hr', 'img', 'source']);

/** Embeds that are not YouTube/Vimeo go whole (no orphan closing tag left behind) */
const dropBadEmbeds = (html: string) => html.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe\s*>/gi, (whole, attrs: string) => (embedSrc(attr(attrs, 'src')) ? whole : ''));

/** The editor can put a picture or video inside a heading: move it out, above the heading,
 *  so the heading stays text (the page's table of contents uses heading text only) */
const MEDIA_IN_HEADING = /<img\b[^>]*>|<video\b[^>]*>[\s\S]*?<\/video>|<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi;
const liftMedia = (html: string) =>
  html.replace(/<(h[2-4])\b([^>]*)>([\s\S]*?)<\/\1>/g, (whole, tag: string, attrs: string, inner: string) => {
    const media = inner.match(MEDIA_IN_HEADING);
    if (!media) return whole;
    const rest = inner.replace(MEDIA_IN_HEADING, '').trim();
    return `${media.map((m) => `<p>${m}</p>`).join('')}${rest ? `<${tag}${attrs}>${rest}</${tag}>` : ''}`;
  });

/** Keeps paragraphs, lists, emphasis and safe links; everything else becomes plain text.
 *  `headings`: also keep h2-h4. `page`: a CMS page (implies headings): also h1 (as h2),
 *  images, uploaded videos, YouTube/Vimeo embeds, quotes, tables and text alignment. */
export function cleanHtml(html: string, { headings = false, page = false }: { headings?: boolean; page?: boolean } = {}): string {
  const allowed = (tag: string) => ALLOWED_TAGS.has(tag) || ((headings || page) && HEADING_TAGS.has(tag)) || (page && PAGE_TAGS.has(tag));
  const stripped = html.replace(/<!--[\s\S]*?-->/g, '').replace(page ? DROP_WITH_CONTENT_PAGE : DROP_WITH_CONTENT, '');
  const cleaned = (page ? dropBadEmbeds(stripped) : stripped)
    .replace(/<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>/gi, (_, close: string, name: string, attrs: string) => {
      let tag = name.toLowerCase();
      if (page) tag = RENAME[tag] ?? tag;
      if (!allowed(tag)) return '';
      if (close) return VOID_TAGS.has(tag) ? '' : `</${tag}>`;
      if (tag === 'a') {
        const href = attr(attrs, 'href');
        return SAFE_HREF.test(href) && !/[<>"']/.test(href) ? linkTag(href) : '<a>';
      }
      return page ? pageTag(tag, attrs) : `<${tag}>`;
    })
    .replace(/<(?![a-z/])/gi, '&lt;') // stray "<" left by broken markup
    .trim();
  return page ? liftMedia(cleaned) : cleaned;
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
