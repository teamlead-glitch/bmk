'use client';

import { useEffect, useRef } from 'react';

/* The 404 wall: rows of alternating 4s and 0s that shuffle like a sliding puzzle.
   The whole wall drops one row, then neighbouring rows slide one digit in opposite
   directions, each move with a springy overshoot. The pattern repeats every two
   rows and every two digits, so offsets wrap back silently. */
const MOVE = 650; // ms per move
const PAUSE = 450; // ms between moves

export function NotFoundWall() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rows: HTMLElement[] = [];
    let ty = 0;
    let tx: number[] = [];
    let timer = 0;
    let rw = 0;
    let alive = true;
    let vertical = true;

    const paint = (animate: boolean) => {
      const t = animate ? `transform ${MOVE}ms var(--nf-ease)` : 'none';
      track.style.transition = t;
      track.style.transform = `translateY(calc(${ty} * var(--nf-row)))`;
      rows.forEach((r, i) => {
        r.style.transition = t;
        r.style.transform = `translateX(calc(${tx[i]} * var(--nf-cell)))`;
      });
    };

    const build = () => {
      const wall = track.parentElement!;
      const fs = parseFloat(getComputedStyle(wall).fontSize);
      const cell = fs * 0.7;
      const rowH = fs * 0.85;
      const cols = Math.ceil(wall.clientWidth / cell) + 6; // spare digits for sideways moves
      const count = Math.ceil(wall.clientHeight / rowH) + 3; // spare rows above for the drop
      track.innerHTML = Array.from(
        { length: count },
        (_, r) => `<div class="nf-row">${Array.from({ length: cols }, (_, c) => `<span>${(r + c) % 2 ? '0' : '4'}</span>`).join('')}</div>`,
      ).join('');
      // Line up roughly like the Figma frame: a digit straddles the left edge, the top row is cropped
      track.style.left = `${-cell * 2.6}px`;
      track.style.top = `${-rowH * 2.3}px`;
      rows = [...track.children] as HTMLElement[];
      ty = 0;
      tx = rows.map(() => 0);
      paint(false);
    };

    // After a move, fold offsets of two steps back to zero; the wall looks identical
    const settle = () => {
      let snap = false;
      if (ty >= 2) {
        ty -= 2;
        snap = true;
      }
      tx = tx.map((x) => (Math.abs(x) >= 2 ? ((snap = true), x - Math.sign(x) * 2) : x));
      if (snap) paint(false);
    };

    const step = () => {
      if (!alive) return;
      if (vertical) ty += 1;
      else tx = tx.map((x, i) => x + (i % 2 ? 1 : -1));
      vertical = !vertical;
      paint(true);
      timer = window.setTimeout(() => {
        settle();
        timer = window.setTimeout(step, PAUSE);
      }, MOVE + 20);
    };

    build();
    const onResize = () => {
      clearTimeout(rw);
      rw = window.setTimeout(build, 150);
    };
    addEventListener('resize', onResize);
    if (!still) timer = window.setTimeout(step, 600);
    return () => {
      alive = false;
      clearTimeout(timer);
      clearTimeout(rw);
      removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="nf-grid" aria-hidden="true">
      <div ref={trackRef} className="nf-track" />
    </div>
  );
}
