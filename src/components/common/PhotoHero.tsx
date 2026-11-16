/* eslint-disable @next/next/no-img-element -- hero photography */
import type { CSSProperties, ReactNode } from 'react';
import { Crumbs } from '@/components/common/Crumbs';

/** Photo page hero (About, FAQ, Contact): image + dark overlay, crumbs, title, intro. */
export function PhotoHero({
  trail,
  title,
  sub,
  image,
  position = 'center',
  imageClass = '',
  overlay = 'linear-gradient(90deg,rgb(0 0 0/.6) 0%,rgb(0 0 0/.25) 60%,rgb(0 0 0/.05) 100%)',
  className = 'pb-[clamp(48px,5vw,80px)]',
  titleClass = 'max-w-4xl',
  children,
}: {
  trail: [string, string?][];
  title: string;
  sub: string;
  image: string;
  position?: string;
  imageClass?: string;
  overlay?: string;
  className?: string;
  titleClass?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`photo-hero pt-[clamp(128px,11vw,176px)] ${className}`} style={{ '--hero-overlay': overlay } as CSSProperties}>
      <img className={`photo-hero-img ${imageClass}`} src={image} alt="" fetchPriority="high" style={{ objectPosition: position }} />
      <div className="shell">
        <Crumbs items={trail} light />
        <h1 className={`t-display mt-6 ${titleClass}`}>{title}</h1>
        <p className="t-body mt-3 max-w-2xl text-mist">{sub}</p>
        {children}
      </div>
    </section>
  );
}
