export interface Contact {
  company: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

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

export interface Milestone {
  year: string;
  title: string;
  points: string[];
}

export interface EnquiryType {
  type: string;
  title: string;
  text: string;
}

export interface FaqTopic {
  id: string;
  name: string;
}

export interface Faq {
  topic: string;
  q: string;
  a: string[];
  list?: string[];
}

export interface CoreValue {
  name: string;
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

export interface MilestoneVisual {
  icon: string;
  img: string;
  short: string;
}
