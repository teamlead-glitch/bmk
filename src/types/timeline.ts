/* ---------- Timeline: homepage "Our Journey" and About › Our journey ---------- */

/** One timeline event, from GET /v1/timeline-events */
export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  /** Local SVG path for the CMS icon key (default icon when the key is unknown) */
  icon: string;
  /** Background photo shown on the active card */
  image: string | null;
}
