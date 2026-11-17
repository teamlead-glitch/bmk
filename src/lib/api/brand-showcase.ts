import { cache } from 'react';
import { getCmsBrands, getCmsCategories } from '@/lib/api/brands-categories';
import { isSlug, mediaUrl, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import { cleanHtml, htmlToText } from '@/lib/sanitize-html';
import type { BrandShowcase, OwnBrand, PartnerBrand } from '@/types/brand';

/* ---------- Brand showcase (CMS: GET /v1/brands, /v1/categories, /v1/settings/own-brands) ---------- */
// Homepage "Associated Brands" carousel (with category chips) and "Our Brands", and the About
// page's "Our brands". CMS down -> CmsUnavailableError -> error.tsx.

type CmsOwnBrand = {
  id?: number | string;
  title?: string | null;
  description?: string | null;
  logo?: { url?: string | null } | null;
  links?: { title?: string | null; url?: string | null }[] | null;
};

export const getBrandShowcase = cache(async (): Promise<BrandShowcase> => {
  const [brands, categories, ownList] = await Promise.all([getCmsBrands(), getCmsCategories(), serverGetData<CmsOwnBrand[]>('/v1/settings/own-brands')]);

  const partner: PartnerBrand[] = brands.flatMap((b) => {
    const slug = text(b.slug);
    const name = text(b.name);
    if (!isSlug(slug) || !name) return [];
    return [
      {
        slug,
        name,
        intro: htmlToText(cleanHtml(text(b.introduction))),
        logo: mediaUrl(b.logo?.url),
        categories: (b.categories ?? []).map((c) => text(c.slug)).filter(isSlug),
      },
    ];
  });

  const own: OwnBrand[] = (ownList ?? []).flatMap((b, i) => {
    const name = text(b.title);
    if (!name) return [];
    return [
      {
        id: String(b.id ?? i),
        name,
        intro: text(b.description),
        logo: mediaUrl(b.logo?.url),
        links: (b.links ?? []).flatMap((l) => {
          const url = mediaUrl(l.url);
          return url ? [{ title: text(l.title), url }] : [];
        }),
      },
    ];
  });

  // Chips only for categories a brand has, so no chip ever filters to nothing
  const used = new Set(partner.flatMap((b) => b.categories));
  const filters = [
    { id: 'all', label: 'All' },
    ...categories.flatMap((c) => {
      const id = text(c.slug);
      return used.has(id) && text(c.title) ? [{ id, label: text(c.title) }] : [];
    }),
  ];

  return { partner, own, filters };
});
