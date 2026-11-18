/* eslint-disable @next/next/no-img-element -- art-directed photo with GSAP parallax */
import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import type { HomeAbout } from '@/types/home';

/** About BMK Group: clip-reveal photo + intro copy (CMS: settings/about/home). */
export function AboutSection({ about }: { about: HomeAbout | null }) {
  if (!about) return null;
  const { title, html, button, image } = about;
  return (
    <section id="about" className="section-y bg-white" aria-labelledby="about-title">
      <div className="shell grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16 xl:grid-cols-[520px_520px] xl:gap-[120px]">
        <figure className="about-media relative aspect-[520/504] overflow-hidden rounded-xl lg:aspect-auto lg:min-h-[504px]" data-reveal="clip">
          <img src={image?.src ?? '/assets/images/about.webp'} alt={image?.alt ?? ''} className="absolute inset-0 size-full object-cover object-[66%_50%]" loading="lazy" data-parallax-img />
        </figure>
        <div className="flex flex-col items-start gap-6">
          <span className="chip border-line text-ink" data-reveal="up">
            About BMK Group
          </span>
          <div className="flex flex-col gap-3">
            <h2 id="about-title" className="t-display" data-split>
              {title}
            </h2>
            <div className="t-body space-y-6" data-reveal="up" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          {button &&
            (button.external ? (
              <a href={button.href} className="btn btn-navy" target="_blank" rel="noopener" data-reveal="up">
                {button.text} <Arrow />
              </a>
            ) : (
              <Link href={button.href} className="btn btn-navy" data-reveal="up">
                {button.text} <Arrow />
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
