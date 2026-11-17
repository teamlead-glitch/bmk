// Page sizes and limits shared by the server pages, /api/products/ and the client lists.

/** CMS listings (All products, category and brand pages): products per page */
export const LISTING_PAGE_SIZE = 12;

/** Highest page number a listing URL or /api/products/ accepts */
export const MAX_LISTING_PAGES = 100;

/** Search results (static catalogue) per "Load more" step: 3 columns × 3 rows, as in the design */
export const SEARCH_PAGE_SIZE = 9;
