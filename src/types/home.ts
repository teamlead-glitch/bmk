/** Homepage hero background, from the CMS setting GET /v1/settings/home-banner. */
export type HomeBanner =
  /** Uploaded file, played muted on a loop */
  | { kind: 'video'; src: string }
  /** YouTube link, embedded muted on a loop */
  | { kind: 'youtube'; id: string }
  /** Image slides, each with its own title, tagline and button */
  | { kind: 'slides'; slides: HeroSlide[] }
  /** Setting empty or unusable: the hero text on its dark background */
  | { kind: 'none' };

export interface HeroSlide {
  id: string;
  title: string;
  /** Badge text above the title (else the default badge) */
  subtitle?: string;
  tagline?: string;
  button?: { text: string; href: string; external: boolean };
  image: { src: string; alt: string };
  mobile?: { src: string; alt: string };
}

/** Homepage "About BMK Group", from the CMS setting GET /v1/settings/about/home. */
export interface HomeAbout {
  title: string;
  /** Cleaned rich text (cleanHtml) */
  html: string;
  button: { text: string; href: string; external: boolean } | null;
  image: { src: string; alt: string } | null;
}
