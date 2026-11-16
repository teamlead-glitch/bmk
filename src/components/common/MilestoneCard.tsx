/* eslint-disable @next/next/no-img-element -- decorative photo and SVG icon */
import { milestoneVisual } from '@/data/visuals';
import type { Milestone } from '@/types/company';

/** Timeline milestone card (homepage timeline and About › Our journey).
 *  "is-active" (photo + navy state) is toggled by the parent's scroll/hover logic. */
export function MilestoneCard({ m }: { m: Milestone }) {
  const v = milestoneVisual[m.year];
  return (
    <li className="milestone" data-tone="dark">
      <div className="m-bg" aria-hidden="true">
        {v?.img && <img src={`/assets/images/${v.img}.webp`} alt="" loading="lazy" />}
      </div>
      <span className="m-icon-wrap">
        <img className="m-icon" src={`/assets/icons/${v?.icon ?? 'milestone-store'}.svg`} alt="" width={32} height={32} />
      </span>
      <div className="m-text">
        <p className="m-year">{m.year}</p>
        <p className="m-title">{m.title}</p>
        <p className="m-desc">{v?.short || m.points[0]}</p>
      </div>
    </li>
  );
}
