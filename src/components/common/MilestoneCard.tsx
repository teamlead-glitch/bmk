/* eslint-disable @next/next/no-img-element -- decorative photo and SVG icon */
import type { Milestone } from '@/types/timeline';

/** Timeline milestone card (homepage timeline and About › Our journey).
 *  "is-active" (photo + navy state) is toggled by the parent's scroll/hover logic. */
export function MilestoneCard({ m }: { m: Milestone }) {
  // A JPG/WEBP upload has no transparency: the card's tint filter (globals.css, which turns a
  // transparent SVG/PNG black or white) would turn it into a solid square, so it is switched off
  // here and the icon is shown as uploaded, in a round crop
  const opaque = /\.(jpe?g|webp)(\?|$)/i.test(m.icon);
  return (
    <li className="milestone" data-tone="dark">
      <div className="m-bg" aria-hidden="true">
        {m.image && <img src={m.image} alt="" loading="lazy" />}
      </div>
      {/* shrink-0: a long title/description never squeezes the icon circle */}
      <span className="m-icon-wrap shrink-0">
        <img
          className="m-icon"
          src={m.icon}
          alt=""
          width={32}
          height={32}
          style={opaque ? { filter: 'none', borderRadius: '9999px', objectFit: 'contain' } : undefined}
        />
      </span>
      <div className="m-text">
        <p className="m-year">{m.year}</p>
        <p className="m-title">{m.title}</p>
        {m.description && <p className="m-desc">{m.description}</p>}
      </div>
    </li>
  );
}
