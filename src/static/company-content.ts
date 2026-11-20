import { cache } from 'react';
import { enquiryTypes, YEARS } from '@/static/data/company';

/* ---------- Company (homepage hero years, enquiry cards on Home, About and Contact) ---------- */

export const getCompany = cache(async () => ({ YEARS, enquiryTypes }));
