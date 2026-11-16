/* eslint-disable @next/next/no-img-element -- art-directed photo with GSAP parallax */
import { Arrow } from '@/components/common/Arrow';

/** About BMK Group: clip-reveal photo + intro copy. */
export function AboutSection({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <section id="about" className="section-y bg-white" aria-labelledby="about-title">
      <div className="shell grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16 xl:grid-cols-[520px_520px] xl:gap-[120px]">
        <figure className="about-media relative aspect-[520/504] overflow-hidden rounded-xl lg:aspect-auto lg:min-h-[504px]" data-reveal="clip">
          <img
            src="/assets/images/about.webp"
            alt="Hands interacting with a glowing digital globe network"
            className="absolute inset-0 size-full object-cover object-[66%_50%]"
            loading="lazy"
            data-parallax-img
          />
        </figure>
        <div className="flex flex-col items-start gap-6">
          <span className="chip border-line text-ink" data-reveal="up">
            About BMK Group
          </span>
          <div className="flex flex-col gap-3">
            <h2 id="about-title" className="t-display" data-split>
              {heading}
            </h2>
            <div className="t-body space-y-6" data-reveal="up">
              {paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <a href="#history" className="btn btn-navy" data-reveal="up">
            Discover Our Story <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
