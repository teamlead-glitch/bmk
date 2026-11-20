/* eslint-disable @next/next/no-img-element -- map preview and pin */
import { MailIcon, PhoneIcon, PinIcon } from '@/components/common/Icons';


/** Office type tag (the company category from the CMS) */
export function KindTag({ e }: { e: { kind: string } }) {
  return <span className="co-tag">{e.kind}</span>;
}

const Tbc = () => <span className="text-muted/70 italic">To be confirmed</span>;

/** Address, phone and email rows for a company. */
export function ContactRows({ e, light = false }: { e: { address: string; phone: string | null; email: string | null }; light?: boolean }) {
  const ic = `mt-0.5 shrink-0 ${light ? 'text-white/60' : 'text-navy'}`;
  return (
    <dl className="grid gap-2.5 text-[15px] leading-6">
      <div className="flex gap-3">
        <dt className={ic} aria-label="Address">
          <PinIcon />
        </dt>
        {/* CMS addresses can span several lines */}
        <dd className="whitespace-pre-line">{e.address || <Tbc />}</dd>
      </div>
      <div className="flex gap-3">
        <dt className={ic} aria-label="Phone">
          <PhoneIcon />
        </dt>
        <dd>
          {e.phone ? (
            <a className="hover:text-accent" href={`tel:${e.phone.replace(/\s/g, '')}`}>
              {e.phone}
            </a>
          ) : (
            <Tbc />
          )}
        </dd>
      </div>
      <div className="flex gap-3">
        <dt className={ic} aria-label="Email">
          <MailIcon />
        </dt>
        <dd>
          {e.email ? (
            <a className="hover:text-accent" href={`mailto:${e.email}`}>
              {e.email}
            </a>
          ) : (
            <Tbc />
          )}
        </dd>
      </div>
    </dl>
  );
}

/** Google Map stand-in: dotted field with a navy pin per office (embed to come). */
export function MapPlaceholder({ label, className = '', pins = 1 }: { label: string; className?: string; pins?: number }) {
  return (
    <div className={`map-ph ${className}`} role="img" aria-label={`Map of ${label} (Google Map to come)`}>
      <span className="flex gap-10">
        {Array.from({ length: pins }, (_, i) => (
          <span key={i} className="map-ph-pin" />
        ))}
      </span>
      <span className="map-ph-label">Google Map · {label}</span>
    </div>
  );
}

/** Office map: the company's Google Maps embed (CMS map_embed_url), else the design's map preview with a pin. */
export function OfficeMap({ label, embed = null, className = '' }: { label: string; embed?: string | null; className?: string }) {
  if (embed) {
    return (
      <div className={`relative aspect-[672/370] overflow-hidden rounded-2xl bg-mist ${className}`}>
        <iframe src={embed} title={`Map: ${label}`} className="absolute inset-0 size-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    );
  }
  return (
    <div className={`relative aspect-[672/370] overflow-hidden rounded-2xl bg-mist ${className}`} role="img" aria-label={`Map of ${label} (Google Map to come)`}>
      <img src="/assets/images/map-placeholder.webp" alt="" className="size-full object-cover" loading="lazy" />
      <img src="/assets/icons/map-pin-orange.svg" alt="" width={32} height={42} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full drop-shadow-md" />
      <span className="map-ph-label">Map preview · {label}</span>
    </div>
  );
}
