import { LegalPage, legalMetadata } from '@/components/legal/LegalPage';

// Content from the CMS: GET /v1/pages/{slug} (src/constants/legal.ts)
export const generateMetadata = () => legalMetadata('terms');

export default function Page() {
  return <LegalPage id="terms" />;
}
