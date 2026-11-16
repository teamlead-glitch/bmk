import { PresenceMap } from '@/components/home/PresenceMap';
import type { Location } from '@/types/company';

/** Group presence: dotted world map with a pin per country and a location card. */
export function PresenceSection({ locations, defaultLocation }: { locations: Location[]; defaultLocation: string }) {
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
            BMK Group Presence
          </h2>
          <p className="t-body mt-3 tracking-normal" data-reveal="up">
            Eight registered companies and business entities across six countries, from the Middle East to Southeast Asia and Africa. Select a country to see the BMK
            companies there.
          </p>
        </div>
      </div>
      <PresenceMap locations={locations} defaultLocation={defaultLocation} />
    </section>
  );
}
