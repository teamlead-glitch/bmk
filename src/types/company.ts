export interface Country {
  id: string;
  name: string;
  short: string;
  city: string;
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

/** Visuals for a country (About › companies): icon, city photo */
export interface CountryVisual {
  icon: string;
  photo: string;
  /** object-position for the photo */
  pos: string;
}

/** A country with its visuals and companies (About › companies; static until it moves to group-locations) */
export interface Location extends Country, CountryVisual {
  companies: Entity[];
}

/** A group company in a location (CMS: GET /v1/group-locations › group_companies) */
export interface GroupCompany {
  id: string;
  name: string;
  /** Category, e.g. "Global logistics" (tag, homepage card) */
  kind: string;
  /** Short description, else the description as plain text (shortened) */
  summary: string;
  /** May span several lines */
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  /** "Get directions": the admin's link, else a Google Maps search for the address */
  directions: string | null;
  /** Google Maps embed URL (https://www.google.com/maps/embed?…), else no map */
  mapEmbed: string | null;
}

/** A group location (CMS: GET /v1/group-locations): homepage Global Footprint pin + card,
 *  Contact › Our offices tab */
export interface GroupLocation {
  id: string;
  /** City, e.g. "Dubai" (card label, tab, pin tooltip) */
  city: string;
  /** Country name (homepage card heading) */
  country: string;
  /** ISO code, lower case ("ae"): Contact ?country= */
  countryCode: string;
  /** Pin position in % of the 1200×620 map frame; null: no pin on the homepage map */
  position: { x: number; y: number } | null;
  icon: string | null;
  /** "View Details": Contact › Our offices on this location */
  href: string;
  companies: GroupCompany[];
}

/** A location with a map pin (homepage Global Footprint; companies slimmed to what the card shows) */
export type PinnedLocation = Omit<GroupLocation, 'position' | 'companies'> & {
  position: { x: number; y: number };
  companies: Pick<GroupCompany, 'id' | 'name' | 'kind'>[];
};
