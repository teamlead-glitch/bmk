import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { EnquiryProvider } from '@/components/enquiry/EnquiryProvider';
import { GtmPageView } from '@/components/common/GtmPageView';
import { GTM_ID, SEO_CONFIG } from '@/constants/config';
import { getSiteUrl } from '@/lib/site-url';

// Design font: Plus Jakarta Sans (variable), self-hosted by next/font
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-jakarta' });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SEO_CONFIG.DEFAULT_TITLE, template: `%s | ${SEO_CONFIG.SITE_NAME}` },
  description: SEO_CONFIG.DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: SEO_CONFIG.SITE_NAME,
    title: SEO_CONFIG.DEFAULT_TITLE,
    description: SEO_CONFIG.SHARE_DESCRIPTION,
    images: [{ url: SEO_CONFIG.DEFAULT_SHARE_IMAGE, width: 1200, height: 630, alt: SEO_CONFIG.SHARE_IMAGE_ALT }],
  },
  twitter: { card: 'summary_large_image', images: [SEO_CONFIG.DEFAULT_SHARE_IMAGE] },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

// Hide GSAP-animated elements before first paint, only when motion is allowed
const MOTION_FLAG = "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // js-motion is added before hydration by the inline script
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        {GTM_ID && (
          <>
            <noscript>
              <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
            </noscript>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <GtmPageView />
          </>
        )}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <EnquiryProvider>{children}</EnquiryProvider>
      </body>
    </html>
  );
}
