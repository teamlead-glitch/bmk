export interface EnquiryType {
  type: string;
  title: string;
  text: string;
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
  /** Marker position (CMS coordinates); null when missing or invalid */
  geo: { lat: number; lng: number } | null;
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
  /** Real-world position (About globe); null: not on the globe */
  geo: { lat: number; lng: number } | null;
  icon: string | null;
  /** Icon alt text from the admin ('' when none) */
  iconAlt: string;
  /** City photo (About › Our companies card) */
  photo: string | null;
  /** Background alt text from the admin ('' when none) */
  photoAlt: string;
  /** "View Details": Contact › Our offices on this location */
  href: string;
  companies: GroupCompany[];
}

/** A location with a map pin (homepage Global Footprint; companies slimmed to what the card shows) */
export type PinnedLocation = Omit<GroupLocation, 'position' | 'companies'> & {
  position: { x: number; y: number };
  companies: Pick<GroupCompany, 'id' | 'name' | 'kind'>[];
};

/** A pin on the About › Who we are globe. `side` keeps neighbouring tags apart. */
export interface GlobePlace {
  id: string;
  label: string;
  lat: number;
  lon: number;
  side?: 'left' | 'right';
}
