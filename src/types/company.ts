export interface Country {
  id: string;
  name: string;
  short: string;
  city: string;
  region: string;
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  country: string;
  name: string;
  kind: string;
  retail?: boolean;
  city: string;
  role: string;
  mandate?: string;
  products?: string;
  address: string;
  phone: string | null;
  email: string | null;
}

export interface EnquiryType {
  type: string;
  title: string;
  text: string;
}

/** Visuals for a country: map pin position (% of the 1200×620 map), icon, city photo */
export interface CountryVisual {
  x: number;
  y: number;
  icon: string;
  photo: string;
  /** object-position for the photo */
  pos: string;
}

/** A homepage presence-map pin: country + visuals + its companies */
export interface Location extends Country, CountryVisual {
  companies: Entity[];
  href: string;
}

/** A homepage Global Footprint location (CMS: GET /v1/group-locations): a map pin + its companies */
export interface PresenceLocation {
  id: string;
  /** City, e.g. "Dubai" (card label, pin tooltip) */
  city: string;
  /** Country name (card heading) */
  country: string;
  /** Pin position in % of the 1200×620 map frame */
  x: number;
  y: number;
  icon: string | null;
  /** "View Details": the Contact page on this country (?country=ae) */
  href: string;
  companies: { id: string; name: string; kind: string }[];
}
