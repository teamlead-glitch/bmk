/* eslint-disable @next/next/no-img-element -- decorative SVGs */
import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { HeroMotion } from '@/components/home/HeroMotion';
import { href } from '@/lib/routes';

// White gradient that pulls up from the bottom as the video ends (Figma node 41:18061)
const FADE =
  'linear-gradient(to bottom, rgb(255 255 255 / 0.000) 0.0%, rgb(255 255 255 / 0.004) 5.7%, rgb(255 255 255 / 0.023) 11.4%, rgb(255 255 255 / 0.062) 17.1%, rgb(255 255 255 / 0.122) 22.9%, rgb(255 255 255 / 0.201) 28.6%, rgb(255 255 255 / 0.298) 34.3%, rgb(255 255 255 / 0.406) 40.0%, rgb(255 255 255 / 0.522) 45.7%, rgb(255 255 255 / 0.639) 51.4%, rgb(255 255 255 / 0.750) 57.1%, rgb(255 255 255 / 0.849) 62.9%, rgb(255 255 255 / 0.929) 68.6%, rgb(255 255 255 / 0.981) 74.3%, rgb(255 255 255 / 1.000) 80.0%, #fff 100%)';

/** Hero: scroll-scrubbed video (HeroMotion), headline, CTAs and the years card. */
export function HeroSection({ years }: { years: number }) {
  return (
    <section id="top" className="hero relative h-svh min-h-[540px] overflow-hidden bg-ink text-white max-lg:h-auto max-lg:min-h-svh" aria-label="Introduction">
      <video
        className="hero-video absolute inset-0 size-full object-cover"
        data-src="/video/hero-1080.mp4"
        data-src-mobile="/video/hero-720.mp4"
        poster="/video/hero-poster.jpg"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
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
              Global technology distribution
            </p>
            <h1 className="hero-title t-hero">Connecting markets with the technology of&nbsp;tomorrow.</h1>
            <p className="hero-copy t-body max-w-[690px] tracking-normal">
              BMK Group brings global technology brands closer to businesses through trusted sourcing, international distribution and a forward-looking approach to product
              development.
            </p>
            {/* z-20: buttons sit above the rising white fade */}
            <div className="hero-ctas relative z-20 flex flex-wrap gap-3 sm:gap-5">
              <Link href={href('/products')} className="btn btn-dark">
                Explore Our Products <Arrow />
              </Link>
              <a href="#contact" className="hero-partner btn btn-outline-light" data-anchor-scroll>
                Partner With Us <Arrow tone="white" />
              </a>
            </div>
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
    </section>
  );
}
