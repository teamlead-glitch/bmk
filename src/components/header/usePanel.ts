'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A panel that opens with its CSS entry animation and fades out before it
 *  hides (the design's show() helper). Returns whether it is mounted/visible. */
export function usePanel(ref: RefObject<HTMLElement | null>, open: boolean) {
  const [visible, setVisible] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);

  // Opening shows the panel straight away; with reduced motion closing hides it
  // straight away too (adjusting state during render, not in an effect)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setVisible(true);
    else if (reduced()) setVisible(false);
  }

  useEffect(() => {
    const el = ref.current;
    if (open || !el || reduced()) return;
    el.getAnimations().forEach((a) => a.cancel());
    const a = el.animate({ opacity: [1, 0], transform: ['none', 'translateY(-8px)'] }, { duration: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
    a.onfinish = () => setVisible(false);
    return () => a.cancel();
  }, [open, ref]);

  return visible;
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
