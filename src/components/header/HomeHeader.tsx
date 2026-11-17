'use client';

/* eslint-disable @next/next/no-img-element -- SVG logo */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { NavChevIcon } from '@/components/common/Icons';
import { CatalogueMenu } from '@/components/header/CatalogueMenu';
import { MegaMenu } from '@/components/header/MegaMenu';
import { SearchPanel } from '@/components/header/SearchPanel';
import { usePanel, usePanelGroup } from '@/components/header/usePanel';
import { getLenis, gsap, ScrollTrigger } from '@/lib/gsap';
import { href } from '@/lib/routes';
import type { NavData } from '@/types/catalogue';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Homepage navbar (design: index.html + src/modules/nav.js, overlays.js, search.js):
 *  glass pill, inline mobile menu animated with GSAP, hides on scroll down. */
export function HomeHeader({ nav }: { nav: NavData }) {
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [megaTop, setMegaTop] = useState<number>();
  const megaVisible = usePanel(megaRef, mega);
  const searchVisible = usePanel(searchRef, search);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const menuOpen = useRef(false);
  const menuTl = useRef<gsap.core.Timeline | null>(null);

  usePanelGroup('mega', mega, () => setMega(false));
  usePanelGroup('search', search, () => setSearch(false));
  usePanelGroup('menu', menu, () => setMenu(false));

  const openMega = () => {
    // Sits under the (taller-offset) homepage navbar
    setMegaTop((navRef.current?.getBoundingClientRect().bottom ?? 80) + 16);
    setMega(true);
  };

  // ── Mobile menu: one paused timeline; play() opens, reverse() closes ──
  useEffect(() => {
    const toggle = toggleRef.current!;
    const menuEl = menuRef.current!;
    const [barTop, barBottom] = toggle.querySelectorAll('.menu-bar');
    const ctx = gsap.context(() => {
      menuTl.current = gsap
        .timeline({ paused: true, defaults: { duration: 0.6, ease: 'expo.out', easeReverse: 'power3.out' } as gsap.TweenVars })
        .to(backdropRef.current, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to(menuEl, { height: 'auto', duration: 0.7, ease: 'expo.inOut', easeReverse: 'power3.inOut' } as gsap.TweenVars, 0)
        .to(barTop, { y: 5.5, rotate: 45, duration: 0.45, ease: 'power3.inOut', easeReverse: 'power3.inOut' } as gsap.TweenVars, 0)
        .to(barBottom, { y: -5.5, rotate: -45, duration: 0.45, ease: 'power3.inOut', easeReverse: 'power3.inOut' } as gsap.TweenVars, 0)
        .fromTo(menuEl.querySelector('.menu-rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.18)
        .fromTo(menuEl.querySelectorAll('.menu-item'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.045 }, 0.22);
    });
    const mq = matchMedia('(min-width: 1024px)');
    const onMq = (e: MediaQueryListEvent) => e.matches && setMenu(false);
    mq.addEventListener('change', onMq);
    return () => (mq.removeEventListener('change', onMq), ctx.revert());
  }, []);

  useEffect(() => {
    const tl = menuTl.current;
    const menuEl = menuRef.current!;
    if (!tl || menu === menuOpen.current) return;
    menuOpen.current = menu;
    menuEl.inert = !menu;
    if (menu) {
      getLenis()?.stop();
      tl.timeScale(reducedMotion() ? 100 : 1).play();
      menuEl.querySelector('a')?.focus({ preventScroll: true });
    } else {
      getLenis()?.start();
      tl.timeScale(reducedMotion() ? 100 : 1.7).reverse();
    }
  }, [menu]);

  // Escape, outside clicks, closing the mega menu when the navbar slides away
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMega(false);
      setSearch(false);
      if (menuOpen.current) {
        setMenu(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest('#mega, #mega-toggle')) setMega(false);
      if (!t.closest('#search-panel, #nav')) setSearch(false);
    };
    const onScroll = () => (navRef.current?.getBoundingClientRect().bottom ?? 1) < 0 && setMega(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    addEventListener('scroll', onScroll, { passive: true });
    return () => (document.removeEventListener('keydown', onKey), document.removeEventListener('click', onClick), removeEventListener('scroll', onScroll));
  }, []);

  // Hide on scroll down, reveal on scroll up; firmer glass once past the hero
  useEffect(() => {
    const navEl = navRef.current!;
    let hidden = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        navEl.classList.toggle('bg-white/85', y > 80);
        navEl.classList.toggle('shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]', y > 80);
        const shouldHide = self.direction === 1 && y > window.innerHeight * 0.6 && !menuOpen.current;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          gsap.to(navEl, { yPercent: hidden ? -160 : 0, duration: 0.6, ease: hidden ? 'power3.in' : 'expo.out', overwrite: true });
        }
      },
    });
    return () => st.kill();
  }, []);

  // In-page anchors (#top, #contact…): smooth-scroll with Lenis, close the menu first
  const onAnchor = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const id = e.currentTarget.getAttribute('href') || '';
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -24, duration: 1.4 });
    else target.scrollIntoView();
  };

  return (
    <>
      <header
        ref={navRef}
        id="nav"
        className="fixed top-4 left-1/2 z-50 w-[min(928px,calc(100%-32px))] -translate-x-1/2 rounded-lg bg-white/60 py-2 pr-2 pl-4 backdrop-blur-[16px] transition-[background-color,box-shadow] duration-500 md:top-10"
      >
        <nav className="flex items-center justify-between" aria-label="Primary">
          <a href="#top" onClick={onAnchor} className="block h-12 w-[92px] shrink-0" aria-label="BMK Group home">
            <img src="/assets/logo/bmk.svg" alt="BMK" width={92} height={48} className="size-full" />
          </a>
          <ul className="hidden items-center gap-5 text-sm leading-5 text-black lg:flex">
            <li>
              <a className="nav-link font-bold" href="#top" onClick={onAnchor} aria-current="page">
                Home
              </a>
            </li>
            <li>
              <Link className="nav-link" href={href('/about')}>
                About Us
              </Link>
            </li>
            <li>
              <button
                type="button"
                id="mega-toggle"
                className="nav-link inline-flex items-center gap-1.5"
                aria-expanded={mega}
                aria-controls="mega"
                onClick={() => (mega ? setMega(false) : openMega())}
                onPointerEnter={(e) => e.pointerType === 'mouse' && (clearTimeout(timer.current), (timer.current = setTimeout(openMega, 160)))}
                onPointerLeave={(e) =>
                  e.pointerType === 'mouse' && (clearTimeout(timer.current), (timer.current = setTimeout(() => megaRef.current?.matches(':hover') || setMega(false), 250)))
                }
              >
                Brands &amp; Products
                <NavChevIcon />
              </button>
            </li>
            <li>
              <Link className="nav-link" href={href('/faq')}>
                FAQ
              </Link>
            </li>
            <li>
              <Link className="nav-link" href={href('/contact')}>
                Contact Us
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="icon-btn size-12 hover:bg-ink/5"
              aria-label="Search products"
              aria-expanded={search}
              aria-controls="search-panel"
              onClick={(e) => {
                e.stopPropagation();
                setMenu(false);
                setSearch((o) => !o);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className="btn btn-dark" data-enquire="">
              Enquiry <Arrow />
            </button>
            <button
              ref={toggleRef}
              id="menu-toggle"
              type="button"
              className="icon-btn size-12 bg-ink/5 lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              onClick={() => setMenu((o) => !o)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className="menu-bar absolute top-0 left-0 h-px w-full bg-ink" />
                <span className="menu-bar absolute bottom-0 left-0 h-px w-full bg-ink" />
              </span>
            </button>
          </div>
        </nav>
        <div ref={menuRef} id="mobile-menu" className="h-0 overflow-hidden lg:hidden" inert>
          <div className="menu-rule mx-1 mt-3 h-px origin-left bg-ink/10" />
          <ul
            className="flex max-h-[calc(100svh-120px)] flex-col overflow-y-auto overscroll-contain px-1 pt-2 pb-3 text-[22px] leading-tight tracking-[-0.02em]"
            data-lenis-prevent
            onClick={(e) => (e.target as Element).closest('a:not([href^="#"])') && setMenu(false)}
          >
            <li className="menu-item">
              <a className="block py-2.5 font-semibold" href="#top" onClick={onAnchor}>
                Home
              </a>
            </li>
            <li className="menu-item">
              <Link className="block py-2.5" href={href('/about')}>
                About Us
              </Link>
            </li>
            <li className="menu-item">
              <CatalogueMenu nav={nav} compact />
            </li>
            <li className="menu-item">
              <Link className="block py-2.5" href={href('/faq')}>
                FAQ
              </Link>
            </li>
            <li className="menu-item">
              <Link className="block py-2.5" href={href('/contact')}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </header>
      <div
        ref={backdropRef}
        id="menu-backdrop"
        className={`fixed inset-0 z-40 bg-ink/25 opacity-0 backdrop-blur-[3px] lg:hidden ${menu ? '' : 'pointer-events-none'}`}
        aria-hidden="true"
        onClick={() => setMenu(false)}
      />

      <MegaMenu
        ref={megaRef}
        nav={nav}
        className={megaVisible ? '' : 'hidden'}
        style={{ top: megaTop }}
        onPointerEnter={() => clearTimeout(timer.current)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && (timer.current = setTimeout(() => setMega(false), 250))}
        onNavigate={() => setMega(false)}
      />
      <SearchPanel ref={searchRef} groups={nav.groups} open={search} onClose={() => setSearch(false)} className={`search-panel ${searchVisible ? '' : 'hidden'}`} />
    </>
  );
}
