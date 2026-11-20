import { PresenceMap } from '@/components/home/presence/PresenceMap';
import type { GroupLocation, PinnedLocation } from '@/types/company';

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** Group presence: dotted world map with a pin per location and a location card (CMS: group-locations).
 *  Only locations with a map position are shown; none -> no section. */
export function PresenceSection({ locations: all }: { locations: GroupLocation[] }) {
  // Client component: only what the map and card show (no addresses, maps or contact details)
  const locations: PinnedLocation[] = all.flatMap(({ position, companies, ...l }) =>
    position ? [{ ...l, position, companies: companies.map(({ id, name, kind }) => ({ id, name, kind })) }] : [],
  );
  if (!locations.length) return null;
  const n = new Set(all.map((l) => l.country)).size;
  const countries = `${WORDS[n] ?? n} ${n === 1 ? 'country' : 'countries'}`;
  return (
    <section
      id="presence"
      className="relative overflow-hidden bg-fog pt-[clamp(72px,7.5vw,120px)] pb-[clamp(72px,10.75vw,172px)] xl:pt-[clamp(40px,min(7.5vw,7vh),120px)] xl:pb-[clamp(48px,min(10.75vw,9vh),172px)]"
      aria-labelledby="presence-title"
    >
      {/* Heading: in flow on small screens; overlaps the map bottom-left on xl (Figma Frame 39) */}
      <div className="shell relative z-10 xl:absolute xl:bottom-[clamp(72px,7.5vw,120px)] xl:left-0 xl:w-auto xl:max-w-none">
        <div className="max-w-[360px]">
          <h2 id="presence-title" className="t-display" data-split>
            Global Footprint
          </h2>
          <p className="t-body mt-3 tracking-normal" data-reveal="up">
            Operating entities and distribution hubs across {countries} spanning the Middle East, Asia, and Africa. Select a location to view our regional offices.
          </p>
        </div>
      </div>
      <PresenceMap locations={locations} />
    </section>
  );
}
