// Page sizes and limits shared by the server pages, /api/list/[kind]/ and the client lists.

/** CMS listings (All products, category and brand pages): products per page */
export const LISTING_PAGE_SIZE = 12;

/** Highest page number a listing URL or /api/list/products/ accepts */
export const MAX_LISTING_PAGES = 100;

/** Search results per "Load more" step: 3 columns × 3 rows, as in the design */
export const SEARCH_PAGE_SIZE = 9;

/** Shortest query the CMS search accepts (GET /v1/search answers 422 below it) */
export const MIN_SEARCH_LENGTH = 2;

/** Products the navbar search panel lists (the rest: "See all N results") */
export const SEARCH_PANEL_PRODUCTS = 5;
