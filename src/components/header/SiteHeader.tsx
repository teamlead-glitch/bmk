'use client';

/* eslint-disable @next/next/no-img-element -- SVG logo */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { ChevIcon, CloseIcon, SearchIcon } from '@/components/common/Icons';
import { CatalogueMenu } from '@/components/header/CatalogueMenu';
import { MegaMenu } from '@/components/header/MegaMenu';
import { SearchPanel } from '@/components/header/SearchPanel';
import { usePanel, usePanelGroup } from '@/components/header/usePanel';
import { HOME, href } from '@/lib/routes';
import type { NavData } from '@/types/catalogue';

/** Which navbar item is current for a path */
function navKey(pathname: string) {
  const page = pathname.split('/')[1] || '';
  if (['about', 'faq', 'contact'].includes(page)) return page;
  if (['products', 'search', 'category', 'brand', 'product'].includes(page)) return 'catalogue';
  return '';
}

/** Navbar, mega menu, search panel and full-screen mobile menu for every page
 *  except the homepage (which has its own navbar, HomeHeader). */
export function SiteHeader({ nav }: { nav: NavData }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = navKey(pathname);

  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const megaVisible = usePanel(megaRef, mega);
  const searchVisible = usePanel(searchRef, search);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeAll = useCallback(() => (setMega(false), setSearch(false), setDrawer(false)), []);
  usePanelGroup('mega', mega, () => setMega(false));
  usePanelGroup('search', search, () => setSearch(false));
  usePanelGroup('drawer', drawer, () => setDrawer(false));

  // A new page closes everything (adjusting state during render, not in an effect)
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMega(false);
    setSearch(false);
    setDrawer(false);
  }
  // The product page uses a lighter glass navbar (body[data-page] in globals.css)
  useEffect(() => {
    document.body.dataset.page = pathname.split('/')[1] || 'home';
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawer);
  }, [drawer]);

  // Escape closes everything; a press outside the navbar closes the panels
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAll();
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('#nav, #mega, #search-panel')) return;
      setMega(false);
      setSearch(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => (document.removeEventListener('keydown', onKey), document.removeEventListener('pointerdown', onDown));
  }, [closeAll]);

  // Hide on scroll down, reveal on scroll up (homepage behaviour); firmer glass once scrolled
  const panelsOpen = useRef(false);
  useEffect(() => {
    panelsOpen.current = mega || search;
  }, [mega, search]);
  useEffect(() => {
    const navEl = document.getElementById('nav');
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (y < 120 || panelsOpen.current) document.body.classList.remove('nav-hidden');
      else if (Math.abs(y - lastY) > 6) document.body.classList.toggle('nav-hidden', y > lastY);
      navEl?.classList.toggle('!bg-white/95', y > 40);
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => (removeEventListener('scroll', onScroll), document.body.classList.remove('nav-hidden'));
  }, []);

  const navLink = (key: string, to: string, label: string) => (
    <li>
      <Link className={`nav-link ${current === key ? 'font-bold' : ''}`} aria-current={current === key ? 'page' : undefined} href={to}>
        {label}
      </Link>
    </li>
  );

  return (
    <>
      <header
        id="nav"
        className="site-nav fixed top-4 left-1/2 z-50 w-[min(1040px,calc(100%-32px))] -translate-x-1/2 rounded-lg bg-white/80 py-2 pr-2 pl-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] backdrop-blur-[16px] md:top-6"
      >
        <nav className="flex items-center justify-between gap-4" aria-label="Primary">
          <Link href={HOME} className="block h-12 w-[92px] shrink-0" aria-label="BMK Group home">
            <img src="/assets/logo/bmk.svg" alt="BMK" width={92} height={48} className="size-full" />
          </Link>
          <ul className="hidden items-center gap-5 text-sm leading-5 text-black lg:flex">
            <li>
              <Link className="nav-link" href={HOME}>
                Home
              </Link>
            </li>
            {navLink('about', href('/about'), 'About Us')}
            <li>
              <button
                type="button"
                id="mega-toggle"
                className={`nav-link inline-flex items-center gap-1.5 ${current === 'catalogue' ? 'font-bold' : ''}`}
                aria-current={current === 'catalogue' ? 'page' : undefined}
                aria-expanded={mega}
                aria-controls="mega"
                onClick={() => setMega((o) => !o)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && (clearTimeout(hoverTimer.current), (hoverTimer.current = setTimeout(() => setMega(true), 160)))}
                onPointerLeave={() => clearTimeout(hoverTimer.current)}
              >
                Brands &amp; Products <ChevIcon />
              </button>
            </li>
            {navLink('faq', href('/faq'), 'FAQ')}
            {navLink('contact', href('/contact'), 'Contact Us')}
          </ul>
          <div className="flex items-center gap-2">
            <button type="button" id="search-toggle" className="icon-btn size-12 hover:bg-ink/5" aria-label="Search products" aria-expanded={search} onClick={() => setSearch((o) => !o)}>
              <SearchIcon />
            </button>
            <button type="button" className="btn btn-dark hidden sm:inline-flex" data-enquire="">
              Enquiry <Arrow />
            </button>
            <button type="button" id="menu-toggle" className="icon-btn size-12 bg-ink/5 lg:hidden" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className="absolute top-0 left-0 h-px w-full bg-ink" />
                <span className="absolute bottom-0 left-0 h-px w-full bg-ink" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <MegaMenu
        ref={megaRef}
        nav={nav}
        className={`top-[96px] md:top-[104px] ${megaVisible ? '' : 'hidden'}`}
        onPointerEnter={() => clearTimeout(hoverTimer.current)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && (hoverTimer.current = setTimeout(() => setMega(false), 250))}
        onNavigate={closeAll}
      />

      <SearchPanel
        ref={searchRef}
        categories={nav.categories}
        open={search}
        onClose={() => setSearch(false)}
        className={`fixed top-[96px] left-1/2 z-40 w-[min(1040px,calc(100%-32px))] -translate-x-1/2 rounded-2xl bg-white p-6 shadow-[0_40px_80px_-30px_rgba(18,18,18,0.45)] md:top-[104px] md:p-8 ${searchVisible ? '' : 'hidden'}`}
      />

      <div
        id="drawer"
        className={`fixed inset-0 z-[60] bg-white lg:hidden ${drawer ? '' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => (e.target as Element).closest('a') && closeAll()}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <img src="/assets/logo/bmk.svg" alt="BMK" className="h-10" />
          <button type="button" className="icon-btn size-12 bg-ink/5" onClick={() => setDrawer(false)} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>
        <div className="h-[calc(100svh-5rem-88px)] overflow-y-auto px-5">
          <form
            role="search"
            className="mb-4 flex items-center gap-2 rounded-full border border-ink/15 px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              const q = String(new FormData(e.currentTarget).get('q') || '').trim();
              if (!q) return;
              closeAll();
              router.push(href('/search', { q }));
            }}
          >
            <SearchIcon />
            <input name="q" type="search" placeholder="Search products" className="min-w-0 flex-1 bg-transparent outline-none" aria-label="Search products" />
          </form>
          <nav className="text-[22px] leading-tight tracking-[-0.02em]" aria-label="Mobile">
            <Link className="block border-b border-line py-4" href={HOME}>
              Home
            </Link>
            <Link className="block border-b border-line py-4" href={href('/about')}>
              About Us
            </Link>
            <CatalogueMenu nav={nav} open />
            <Link className="block border-b border-line py-4" href={href('/faq')}>
              FAQ
            </Link>
            <Link className="block border-b border-line py-4" href={href('/contact')}>
              Contact Us
            </Link>
          </nav>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-line bg-white p-5">
          <button type="button" className="btn btn-dark w-full" data-enquire="">
            Make an enquiry <Arrow />
          </button>
        </div>
      </div>
    </>
  );
}
