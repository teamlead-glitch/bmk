'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A panel that opens with its CSS entry animation and fades out before it
 *  hides (the design's show() helper). Returns whether it is mounted/visible:
 *  while open, and after closing until the fade-out ends.
 *  No state is set during render: React can drop such an update when a lower-priority
 *  render follows (the search panel opened, then hid itself again a frame later). */
export function usePanel(ref: RefObject<HTMLElement | null>, open: boolean) {
  // true once the last close (fade-out) has finished
  const [faded, setFaded] = useState(!open);

  useEffect(() => {
    const el = ref.current;
    if (open) {
      setFaded(false); // eslint-disable-line react-hooks/set-state-in-effect -- arms the fade-out for the next close
      return;
    }
    if (!el || reduced()) {
      setFaded(true); // no animation: hide now
      return;
    }
    el.getAnimations().forEach((a) => a.cancel());
    const a = el.animate({ opacity: [1, 0], transform: ['none', 'translateY(-8px)'] }, { duration: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
    a.onfinish = () => setFaded(true);
    return () => a.cancel();
  }, [open, ref]);

  return open || !faded;
}

/** Close when another navbar panel (or the enquiry popup) opens. */
export function usePanelGroup(name: string, isOpen: boolean, close: () => void) {
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    if (isOpen) document.dispatchEvent(new CustomEvent('bmk:panel', { detail: name }));
  }, [isOpen, name]);
  useEffect(() => {
    const onPanel = (e: Event) => (e as CustomEvent).detail !== name && closeRef.current();
    document.addEventListener('bmk:panel', onPanel);
    return () => document.removeEventListener('bmk:panel', onPanel);
  }, [name]);
}
