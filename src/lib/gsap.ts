'use client';

// GSAP with the plugins the design uses, registered once (browser only).
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  gsap.defaults({ ease: 'expo.out', duration: 1 });
}

export { gsap, ScrollTrigger, SplitText, Flip };

/* ---------- Lenis instance of the homepage (shared with its navbar) ---------- */
type LenisLike = { stop: () => void; start: () => void; scrollTo: (target: Element, opts?: Record<string, unknown>) => void };
let lenis: LenisLike | null = null;
export const setLenis = (l: LenisLike | null) => (lenis = l);
export const getLenis = () => lenis;
