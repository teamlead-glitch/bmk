'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Arrow } from '@/components/common/Arrow';
import { CloseIcon } from '@/components/common/Icons';
import { Stage } from '@/components/common/Stage';
import type { TemplateId } from '@/types/catalogue';

/** Main image, thumbnails and the full-screen lightbox (arrow keys, Escape). */
export function ProductGallery({ name, glyph, images, sources }: { name: string; glyph: TemplateId; images: string[]; sources: string[] }) {
  const [img, setImg] = useState(0);
  const [box, setBox] = useState<number | null>(null);
  const many = images.length > 1;

  const step = useCallback((d: number) => setBox((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);
  const close = useCallback(() => {
    setBox((i) => {
      if (i !== null) setImg(i);
      return null;
    });
  }, []);

  useEffect(() => {
    if (box === null) return;
    document.body.classList.add('no-scroll');
    const key = (e: KeyboardEvent) => (e.key === 'Escape' ? close() : e.key === 'ArrowRight' ? step(1) : e.key === 'ArrowLeft' ? step(-1) : 0);
    addEventListener('keydown', key);
    return () => (removeEventListener('keydown', key), document.body.classList.remove('no-scroll'));
  }, [box, close, step]);

  return (
    <div>
      <button type="button" className="block w-full cursor-zoom-in" onClick={() => setBox(img)} aria-label="Open full-screen gallery">
        <Stage name={name} glyph={glyph} label={images[img]} src={sources[img]} className="!rounded-3xl" eager={img === 0} />
      </button>
      {many && (
        <ul className="mt-3 grid grid-cols-6 gap-2" aria-label="Images">
          {images.map((im, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setImg(i)}
                aria-label={`Show image ${i + 1}${im ? `: ${im}` : ""}`}
                aria-pressed={i === img}
                className={`block w-full rounded-xl ring-2 ring-offset-2 transition ${i === img ? 'ring-navy' : 'ring-transparent hover:ring-line'}`}
              >
                <Stage name={name} glyph={glyph} ratio="1 / 1" src={sources[i]} className="!rounded-xl [&_svg]:!w-[58%]" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {box !== null &&
        createPortal(
          <div className="fixed inset-0 z-[85] flex flex-col bg-ink/95 text-white" role="dialog" aria-modal="true" aria-label={`${name} gallery`}>
            <div className="flex items-center justify-between p-5">
              <p className="text-sm">
                {box + 1} / {images.length} · {name}
              </p>
              <button type="button" onClick={close} className="icon-btn bg-white/10 hover:bg-white/20" aria-label="Close gallery">
                <CloseIcon />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4 sm:px-20">
              <div className="w-full max-w-5xl">
                <Stage name={name} glyph={glyph} label={images[box]} src={sources[box]} className="!rounded-2xl" />
              </div>
              {many && (
                <>
                  <button type="button" onClick={() => step(-1)} className="icon-btn absolute left-3 size-12 bg-white/10 hover:bg-white/20 sm:left-6" aria-label="Previous image">
                    <span className="rotate-180">
                      <Arrow tone="white" />
                    </span>
                  </button>
                  <button type="button" onClick={() => step(1)} className="icon-btn absolute right-3 size-12 bg-white/10 hover:bg-white/20 sm:right-6" aria-label="Next image">
                    <Arrow tone="white" />
                  </button>
                </>
              )}
            </div>
            <div className="flex justify-center gap-2 p-5">
              {images.map((_, k) => (
                <button key={k} type="button" onClick={() => setBox(k)} className={`h-1.5 w-8 rounded-full transition-colors ${k === box ? '!bg-accent' : 'bg-white/25'}`} aria-label={`Image ${k + 1}`} />
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
