import { cache } from 'react';
import { cmsLink, mediaUrl } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import type { HeroSlide, HomeBanner } from '@/types/home';

/* ---------- Homepage hero (CMS: GET /v1/settings/home-banner) ---------- */
// { data: { display_type: "video" | "image" | "video_url", video, video_url, slides: [...] } }
// The hero shows only what this setting says. Empty or unusable setting -> { kind: 'none' }
// (text on the dark background). CMS down -> CmsUnavailableError -> error.tsx.

const NO_BANNER: HomeBanner = { kind: 'none' };

type CmsImage = { url?: string | null; alt?: string | null } | null;
type CmsSlide = {
  id?: number | string;
  title?: string | null;
  subtitle?: string | null;
  tagline?: string | null;
  button?: { text?: string | null; url?: string | null } | null;
  images?: { web?: CmsImage; mobile?: CmsImage } | null;
};
type CmsHomeBanner = { display_type?: string; video?: string | null; video_url?: string | null; slides?: CmsSlide[] };

/** YouTube id from watch, youtu.be, embed and shorts links */
function youTubeId(url: unknown): string | null {
  const m = String(url ?? '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}

function toSlide(s: CmsSlide): HeroSlide | null {
  const src = mediaUrl(s.images?.web?.url);
  const title = String(s.title ?? '').trim();
  if (!src || !title) return null;
  const mobileSrc = mediaUrl(s.images?.mobile?.url);
  const link = cmsLink(s.button?.url);
  const text = String(s.button?.text ?? '').trim();
  return {
    id: String(s.id ?? src),
    title,
    subtitle: String(s.subtitle ?? '').trim() || undefined,
    tagline: String(s.tagline ?? '').trim() || undefined,
    button: link && text ? { text, ...link } : undefined,
    image: { src, alt: String(s.images?.web?.alt ?? '').trim() },
    mobile: mobileSrc ? { src: mobileSrc, alt: String(s.images?.mobile?.alt ?? '').trim() } : undefined,
  };
}

export const getHomeBanner = cache(async (): Promise<HomeBanner> => {
  const data = await serverGetData<CmsHomeBanner>('/v1/settings/home-banner');

  switch (data?.display_type) {
    case 'video': {
      const src = mediaUrl(data.video);
      if (src) return { kind: 'video', src };
      break;
    }
    case 'video_url': {
      const id = youTubeId(data.video_url);
      if (id) return { kind: 'youtube', id };
      const src = mediaUrl(data.video_url); // a direct .mp4 link also works
      if (src && /\.(mp4|webm)(\?|$)/i.test(src)) return { kind: 'video', src };
      break;
    }
    case 'image': {
      const slides = (data.slides ?? []).map(toSlide).filter((s): s is HeroSlide => !!s);
      if (slides.length) return { kind: 'slides', slides };
      break;
    }
  }
  console.warn(`[home-banner] empty or unusable setting "${data?.display_type ?? ''}": the hero has no background`);
  return NO_BANNER;
});
