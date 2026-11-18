/* eslint-disable @next/next/no-img-element -- decorative photo and SVG icon */
import type { Milestone } from '@/types/timeline';

/** Timeline milestone card (homepage timeline and About › Our journey).
 *  "is-active" (photo + navy state) is toggled by the parent's scroll/hover logic. */
export function MilestoneCard({ m }: { m: Milestone }) {
  return (
    <li className="milestone" data-tone="dark">
      <div className="m-bg" aria-hidden="true">
        {m.image && <img src={m.image} alt="" loading="lazy" />}
      </div>
      <span className="m-icon-wrap">
        <img className="m-icon" src={m.icon} alt="" width={32} height={32} />
      </span>
      <div className="m-text">
        <p className="m-year">{m.year}</p>
        <p className="m-title">{m.title}</p>
        {m.description && <p className="m-desc">{m.description}</p>}
      </div>
    </li>
  );
}
