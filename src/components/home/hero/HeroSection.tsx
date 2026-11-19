/* eslint-disable @next/next/no-img-element -- decorative SVGs and CMS images */
import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { HeroMotion } from '@/components/home/hero/HeroMotion';
import { HeroSlider } from '@/components/home/hero/HeroSlider';
import { HeroYouTube } from '@/components/home/hero/HeroYouTube';
import { href } from '@/lib/routes';
import type { HeroSlide, HomeBanner } from '@/types/home';

// White gradient that pulls up from the bottom as the hero scrolls out (Figma node 41:18061)
const FADE =
  'linear-gradient(to bottom, rgb(255 255 255 / 0.000) 0.0%, rgb(255 255 255 / 0.004) 5.7%, rgb(255 255 255 / 0.023) 11.4%, rgb(255 255 255 / 0.062) 17.1%, rgb(255 255 255 / 0.122) 22.9%, rgb(255 255 255 / 0.201) 28.6%, rgb(255 255 255 / 0.298) 34.3%, rgb(255 255 255 / 0.406) 40.0%, rgb(255 255 255 / 0.522) 45.7%, rgb(255 255 255 / 0.639) 51.4%, rgb(255 255 255 / 0.750) 57.1%, rgb(255 255 255 / 0.849) 62.9%, rgb(255 255 255 / 0.929) 68.6%, rgb(255 255 255 / 0.981) 74.3%, rgb(255 255 255 / 1.000) 80.0%, #fff 100%)';

const TITLE = 'Connecting markets with the technology of tomorrow.';
const BADGE = 'Global technology distribution';
const COPY =
  'BMK Group brings global technology brands closer to businesses through trusted sourcing, international distribution and a forward-looking approach to product development.';

/** Background chosen in the CMS (home-banner setting): uploaded video, YouTube or image slides */
function HeroMedia({ banner }: { banner: HomeBanner }) {
  if (banner.kind === 'video') {
    return <video className="size-full object-cover" src={banner.src} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />;
  }
  if (banner.kind === 'youtube') return <HeroYouTube id={banner.id} />;
  if (banner.kind === 'slides') {
    return banner.slides.map((s, i) => (
      <div key={s.id} className={`hero-slide absolute inset-0 ${i === 0 ? 'is-active' : ''}`} data-slide={i} aria-hidden={i > 0 || undefined}>
        <picture className="block size-full">
          {s.mobile && <source media="(max-width: 767px)" srcSet={s.mobile.src} />}
          <img src={s.image.src} alt={s.image.alt} className="size-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" />
        </picture>
      </div>
    ));
  }
  return null;
}

/** "Partner With Us": the scroll timeline turns it dark as the white fade rises */
function PartnerButton() {
  return (
    <a href="#contact" className="hero-partner btn btn-outline-light" data-anchor-scroll>
      Partner With Us <Arrow tone="white" />
    </a>
  );
}

/** Headline, copy and CTAs. Slides bring their own; the first slide's title is the page H1. */
function HeroText({ slide, index, active }: { slide?: HeroSlide; index: number; active: boolean }) {
  const Title = index === 0 ? 'h1' : 'p';
  const copy = slide ? slide.tagline : COPY;
  return (
    <div
      className={`hero-text flex flex-col items-start gap-5 [grid-area:1/1] sm:gap-6 ${active ? 'is-active' : ''}`}
      data-slide={slide ? index : undefined}
      aria-hidden={active ? undefined : true}
      inert={!active}
    >
      <Title className="hero-title t-hero">{slide ? slide.title : TITLE}</Title>
      {copy && <p className="hero-copy t-body max-w-[690px] tracking-normal">{copy}</p>}
      {/* z-20: buttons sit above the rising white fade */}
      <div className="hero-ctas relative z-20 flex flex-wrap gap-3 sm:gap-5">
        {!slide?.button ? (
          <Link href={href('/products')} className="btn btn-dark">
            Explore Our Products <Arrow />
          </Link>
        ) : slide.button.external ? (
          <a href={slide.button.href} className="btn btn-dark" target="_blank" rel="noopener">
            {slide.button.text} <Arrow />
          </a>
        ) : (
          <Link href={slide.button.href} className="btn btn-dark">
            {slide.button.text} <Arrow />
          </Link>
        )}
        <PartnerButton />
      </div>
    </div>
  );
}

/** Hero: CMS background (video, YouTube or image slides), headline, CTAs and the years card. */
export function HeroSection({ years, banner }: { years: number; banner: HomeBanner }) {
  const slides = banner.kind === 'slides' ? banner.slides : null;
  return (
    <section
      id="top"
      className="hero relative h-svh min-h-[540px] overflow-hidden bg-ink text-white max-lg:h-auto max-lg:min-h-svh"
      aria-label="Introduction"
      aria-roledescription={slides && slides.length > 1 ? 'carousel' : undefined}
    >
      <div className="hero-media absolute inset-0 overflow-hidden" aria-hidden={banner.kind === 'slides' ? undefined : true}>
        <HeroMedia banner={banner} />
      </div>
      <div className="hero-shade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 to-transparent md:from-black/15" />

      {/* decorative brand mark (Figma: Logo 538×538, 10% opacity) */}
      <div className="hero-mark pointer-events-none absolute top-[48%] left-[78%] hidden aspect-square w-[min(33.6vw,538px)] opacity-10 md:block" aria-hidden="true">
        <img src="/assets/patterns/hero-mark.svg" alt="" className="absolute inset-y-0 right-[8.58%] left-[10.42%] size-auto h-full" />
      </div>

      <div className="hero-content relative flex h-full flex-col justify-end pb-[clamp(32px,9.6vh,88px)] max-lg:min-h-svh max-lg:pt-28" style={{ paddingInline: 'clamp(20px, 6.25vw, 100px)' }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[760px] flex-col items-start gap-5 sm:gap-6">
            <p className="hero-badge inline-flex items-center gap-2 rounded-[20px] px-3 py-1 text-xs leading-5 tracking-[1px] uppercase backdrop-blur-[16px]">
              <img src="/assets/icons/badge-globe.svg" alt="" width={16} height={16} className="size-4" />
              {/* Each slide's subtitle (HeroSlider shows the current one), else the default text */}
              {slides
                ? slides.map((s, i) => (
                    <span key={s.id} className="hero-badge-text" data-slide={i} hidden={i > 0}>
                      {s.subtitle || BADGE}
                    </span>
                  ))
                : BADGE}
            </p>
            {/* Slide texts share one grid cell, so the block keeps the tallest slide's height */}
            <div className="grid w-full">
              {slides ? slides.map((s, i) => <HeroText key={s.id} slide={s} index={i} active={i === 0} />) : <HeroText index={0} active />}
            </div>
            {slides && slides.length > 1 && (
              <div className="hero-dots relative z-20 flex gap-2" role="group" aria-label="Choose slide">
                {slides.map((s, i) => (
                  <button key={s.id} type="button" className="hero-dot" data-slide-to={i} aria-label={`Slide ${i + 1} of ${slides.length}`} aria-current={i === 0 || undefined} />
                ))}
              </div>
            )}
          </div>

          <div className="hero-stat flex w-full max-w-[280px] flex-col gap-4 rounded-xl bg-white/30 backdrop-blur-[16px]">
            <div className="px-4 pt-2">
              <div className="flex items-start justify-between border-b border-[#aaa] pb-3">
                <div className="flex h-6 items-center gap-1" role="img" aria-label="Rated 5 out of 5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <img key={i} src="/assets/icons/star.svg" alt="" className="size-4" width={16} height={16} />
                  ))}
                </div>
                <img src="/assets/icons/verified.svg" alt="Verified" className="size-6" width={24} height={24} />
              </div>
            </div>
            <div className="flex items-center gap-5 px-4 pb-4">
              <p className="text-4xl leading-10 font-semibold">
                <span className="hero-count" data-count={years}>
                  {years}
                </span>
              </p>
              <p className="text-base leading-5 font-medium">
                Years of
                <br />
                Experience &amp; Trust
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-out fade: hands the hero off to About with no blank screen */}
      <div className="hero-fade pointer-events-none absolute inset-x-0 -bottom-1 h-[calc(34%+4px)] translate-y-full" style={{ background: FADE }} aria-hidden="true" />
      <HeroMotion />
      {slides && slides.length > 1 && <HeroSlider count={slides.length} />}
    </section>
  );
}
