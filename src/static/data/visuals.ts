// What only the visual design needs on top of the company content: map pin
// positions, city icons and photos, milestone icons and photos, globe places.
import type { CountryVisual, MilestoneVisual } from '@/types/company';

/** `photo` is used on About › Our companies. The panel covers one half of the
 *  card, so `pos` (object-position) keeps each photo's landmark in the open half. */
export const countryVisual: Record<string, CountryVisual> = {
  uae: { x: 60.42, y: 47.1, icon: '/assets/icons/loc-dubai.svg', photo: '/assets/images/city-dubai.webp', pos: '45% center' },
  india: { x: 68.0, y: 59.2, icon: '/assets/icons/loc-kochi.svg', photo: '/assets/images/city-kochi.webp', pos: '75% center' },
  singapore: { x: 77.33, y: 62.74, icon: '/assets/icons/loc-singapore.svg', photo: '/assets/images/city-singapore.webp', pos: '35% center' },
  malaysia: { x: 75.7, y: 60.16, icon: '/assets/icons/petronas.svg', photo: '/assets/images/city-petaling-jaya.webp', pos: '65% center' },
  zambia: { x: 54.75, y: 72.7, icon: '/assets/icons/loc-lusaka.svg', photo: '/assets/images/city-lusaka.webp', pos: '30% center' },
  drc: { x: 51.1, y: 65.4, icon: '/assets/icons/loc-kinshasa.svg', photo: '/assets/images/city-kinshasa.webp', pos: '75% center' },
};

export const DEFAULT_LOCATION = 'uae';

/** Timeline: icon and photo per milestone, plus the short card line. */
export const milestoneVisual: Record<string, MilestoneVisual> = {
  2002: { icon: 'milestone-2005', img: 'milestone-2018', short: 'Founded as Island Valley Electronics LLC in Dubai, trading consumer electronics.' },
  2004: { icon: 'milestone-camera', img: 'milestone-2005', short: 'Wholesale and retail expand into digital imaging and cameras.' },
  2010: { icon: 'milestone-2012', img: 'milestone-2012', short: 'BMK GULF FZE in JAFZA and BMK Electronics in Singapore.' },
  2013: { icon: 'milestone-2022', img: 'milestone-2008', short: 'Flagship brand SEEKEN launches in Singapore with the ST100 tablet.' },
  2018: { icon: 'milestone-2015', img: 'milestone-pan-africa', short: 'Official Fujifilm and Nikon distribution in the DRC and Zambia.' },
  2022: { icon: 'milestone-watch', img: 'milestone-wearables', short: 'SEEKEN moves into premium smartwatches and advanced audio.' },
  2023: { icon: 'milestone-home', img: 'milestone-team', short: 'BMK acquires home appliance brand TEAM Appliances.' },
  Present: { icon: 'milestone-store', img: 'milestone-2022', short: 'BMK International and Bhome Appliances in Kerala; six markets.' },
};

/** About › Who we are globe: city coordinates. `side` keeps neighbouring tags apart. */
export interface GlobePlace {
  id: string;
  label: string;
  lat: number;
  lon: number;
  side?: 'left' | 'right';
}
export const globePlaces: GlobePlace[] = [
  { id: 'uae', label: 'Dubai, UAE', lat: 25.2, lon: 55.27 },
  { id: 'india', label: 'Kochi, India', lat: 9.93, lon: 76.27 },
  { id: 'malaysia', label: 'Petaling Jaya, Malaysia', lat: 3.11, lon: 101.61, side: 'left' },
  { id: 'singapore', label: 'Singapore', lat: 1.35, lon: 103.82, side: 'right' },
  { id: 'drc', label: 'Kinshasa, DR Congo', lat: -4.32, lon: 15.31, side: 'left' },
  { id: 'zambia', label: 'Lusaka, Zambia', lat: -15.39, lon: 28.32, side: 'right' },
];

/** Homepage enquiry block / About + Contact enquiry block: one photo per type */
export const enquiryImages = ['enquiry-distribution', 'enquiry-dealership', 'enquiry-retail', 'enquiry-general'];

/** Popular searches (search panel, empty search results) */
export const POPULAR_SEARCHES = ['X-T5', 'Nikon Z8', 'NIKKOR', 'instax'];
