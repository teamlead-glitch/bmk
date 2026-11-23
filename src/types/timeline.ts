/* ---------- Timeline: homepage "Our Journey" and About › Our journey ---------- */

/** One timeline event, from GET /v1/timeline-events */
export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  /** The icon uploaded in the admin, else a local SVG (default icon when nothing is uploaded) */
  icon: string;
  /** Background photo shown on the active card */
  image: string | null;
}
