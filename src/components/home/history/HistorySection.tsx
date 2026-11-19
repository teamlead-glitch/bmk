/* eslint-disable @next/next/no-img-element -- decorative SVG marks */
import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { MilestoneCard } from '@/components/common/MilestoneCard';
import { TimelineMotion } from '@/components/home/history/TimelineMotion';
import { href } from '@/lib/routes';
import type { Milestone } from '@/types/timeline';

const MARKS = [
  { src: 'history-mark-1', cls: 'top-[-114px] left-[62%]' },
  { src: 'history-mark-2', cls: 'top-[-114px] left-[74.44%]' },
  { src: 'history-mark-2', cls: 'top-[-114px] left-[86.88%]' },
  { src: 'history-mark-2', cls: 'top-[137px] left-[80.81%]' },
];

/** Our Journey: pinned horizontal timeline on desktop, swipe on smaller screens. */
export function HistorySection({ milestones }: { milestones: Milestone[] }) {
  if (!milestones.length) return null;
  return (
    <section id="history" className="history relative overflow-hidden bg-mist" aria-labelledby="history-title">
      <div className="history-marks pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        {MARKS.map((m, i) => (
          <div key={i} className={`history-mark absolute aspect-square w-[min(20.4vw,326px)] opacity-30 ${m.cls}`}>
            <img src={`/assets/patterns/${m.src}.svg`} alt="" className="absolute inset-y-0 right-[8.58%] left-[10.42%] h-full" />
          </div>
        ))}
      </div>

      <div className="history-pin section-y relative flex flex-col justify-center lg:min-h-svh lg:!py-[clamp(32px,min(7.5vw,8vh),120px)]">
        <div className="shell flex flex-col gap-10 lg:gap-[clamp(20px,4.5vh,40px)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-[520px] flex-col items-start gap-6">
              <span className="chip border-line text-ink" data-reveal="up">
                Our Journey
              </span>
              <div className="flex flex-col gap-3">
                <h2 id="history-title" className="t-display" data-split>
                  From global trade to new possibilities.
                </h2>
                <p className="t-body" data-reveal="up">
                  Over two decades of international trade, strategic brand partnerships, and proprietary product innovation.
                </p>
              </div>
            </div>
            <Link href={href('/about', { section: 'journey' })} className="btn btn-navy self-start md:self-auto" data-reveal="up">
              Discover About Us <Arrow />
            </Link>
          </div>

          {/* progress (Figma Frame 48: 8px track, 160px orange thumb) */}
          <div className="relative h-2 overflow-hidden rounded-full bg-white/60" aria-hidden="true">
            <div className="history-thumb absolute inset-y-0 left-0 w-[min(160px,25%)] bg-accent will-change-transform" />
          </div>

          <div className="history-viewport -mx-[clamp(20px,7.5vw,120px)] overflow-x-auto px-[clamp(20px,7.5vw,120px)] [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            <ol className="history-track flex w-max gap-2 pb-6 will-change-transform">
              {milestones.map((m) => (
                <MilestoneCard key={m.id} m={m} />
              ))}
            </ol>
          </div>
        </div>
      </div>
      <TimelineMotion />
    </section>
  );
}
