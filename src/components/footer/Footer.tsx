/* eslint-disable @next/next/no-img-element -- SVG logo and icons */
import Link from 'next/link';
import { Fragment } from 'react';
import { FooterTagline } from '@/components/footer/FooterTagline';
import { telHref } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import type { NavCategory } from '@/types/catalogue';
import type { Contact } from '@/types/contact';

const LEGAL_LINKS: [string, string][] = [
  ['/privacy', 'Privacy Policy'],
  ['/cookies', 'Cookie Policy'],
  ['/terms', 'Terms & Conditions'],
];

export function Footer({ categories, contact }: { categories: NavCategory[]; contact: Contact }) {
  return (
    <footer className="bg-black text-white">
      <div className="shell grid gap-10 py-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="flex flex-col gap-5">
          <img src="/assets/logo/bmk-white.svg" alt="BMK Group" width={92} height={48} className="h-12 w-[92px]" />
          <p className="text-[15px] leading-[25px] text-white/40">Driving global technology distribution, trusted brand partnerships, and original consumer electronics innovation since 2002.</p>
        </div>
        <nav className="flex flex-col gap-5 text-[15px]" aria-label="Quick links">
          <p className="leading-5 font-bold">Quick links</p>
          <ul className="flex flex-col gap-1.5 leading-6">
            <li>
              <Link className="footer-link" href={HOME}>
                Home
              </Link>
            </li>
            <li>
              <Link className="footer-link" href={href('/about')}>
                About Us
              </Link>
            </li>
            <li>
              <Link className="footer-link" href={href('/products')}>
                Brands &amp; Products
              </Link>
            </li>
            <li>
              <Link className="footer-link" href={href('/faq')}>
                FAQ
              </Link>
            </li>
            <li>
              <Link className="footer-link" href={href('/contact')}>
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="flex flex-col gap-5 text-[15px]" aria-label="Categories">
          <p className="leading-5 font-bold">Categories</p>
          <ul className="flex flex-col gap-1.5 leading-6">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link className="footer-link" href={href(`/category/${c.slug}`)}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-5 text-[15px]">
          <p className="leading-5 font-bold">CONTACT</p>
          {/* Contact details from the CMS (settings/contact); empty fields are left out */}
          <address className="flex flex-col gap-1.5 leading-6 not-italic">
            {contact.address.length > 0 && (
              <p className="flex gap-2">
                <img src="/assets/icons/location.svg" alt="" className="size-6 shrink-0" width={24} height={24} />
                <span>
                  {contact.address.map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </span>
              </p>
            )}
            {contact.phone && (
              <a className="footer-link flex gap-2" href={telHref(contact.phone)}>
                <img src="/assets/icons/call.svg" alt="" className="size-6 shrink-0" width={24} height={24} />
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a className="footer-link flex gap-2" href={`mailto:${contact.email}`}>
                <img src="/assets/icons/email.svg" alt="" className="size-6 shrink-0" width={24} height={24} />
                {contact.email}
              </a>
            )}
          </address>
          {contact.social.length > 0 && (
            <ul className="flex gap-6 pl-8">
              {contact.social.map((s) => (
                <li key={s.id}>
                  <a href={s.href} className="social" aria-label={`${s.label} (opens in a new tab)`} target="_blank" rel="noopener">
                    <img src={`/assets/icons/${s.id}.svg`} alt="" width={20} height={20} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="@container overflow-x-clip bg-gradient-to-b from-black to-navy to-90% py-12">
        <FooterTagline />
      </div>

      <div className="bg-navy">
        <div className="shell flex flex-col gap-4 py-10 text-[13px] leading-5 text-white/40 md:h-32 md:flex-row md:items-center md:justify-between md:py-0">
          <p>
            © BMK Group. All Rights Reserved. Website made by{' '}
            <a
              href="https://phitany.com/"
              target="_blank"
              rel="noopener"
              className="underline decoration-white/30 underline-offset-4 transition-colors duration-300 hover:text-white hover:decoration-white"
            >
              Phitany
            </a>
          </p>
          <ul className="flex flex-wrap gap-5">
            {LEGAL_LINKS.map(([p, n]) => (
              <li key={p}>
                <Link className="hover:text-white" href={href(p)}>
                  {n}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
