// Site-wide display settings (candidates for CMS "site settings").

/** Mega menu design. The design reference has two and the client has not chosen
 *  yet (README: "Mega menu design switch"): "categories" (default) or "brands"
 *  (brands-only list with a picture). Set NEXT_PUBLIC_MEGA_MENU=brands to switch. */
export const MEGA_MENU_DESIGN: 'categories' | 'brands' = process.env.NEXT_PUBLIC_MEGA_MENU === 'brands' ? 'brands' : 'categories';
