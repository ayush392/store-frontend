import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import type { RecentTrans, Transactions } from '../shared/types';

const getImageUrl = (url: string, view: 'list' | 'thumbnail' | 'zoom') => {
  const optionsMap = {
    list: 'w_72,h_72,c_fill,f_auto,q_auto',
    thumbnail: 'w_96,h_96,c_fill,f_auto,q_auto',
    zoom: 'w_1200,c_limit,dpr_auto,f_auto,q_auto'
  };

  const options = optionsMap[view];

  return url.replace('/upload/', `/upload/${options}/`);
};

type Props = {
  transaction: Transactions | RecentTrans;
};

export const TransactionImageViewer = ({ transaction }: Props) => {
  const images = transaction.images ?? [];
  const count = images.length;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  // While open: lock page scroll, move focus into the viewer, close on Escape,
  // step with the arrow keys, and give focus back to the thumbnail on close.
  useEffect(() => {
    if (!viewerOpen) return;

    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewerRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewerOpen(false);
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(count - 1, i + 1));
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [viewerOpen, count]);

  if (count === 0) return null;

  const openViewer = (i: number) => {
    setIndex(i);
    setViewerOpen(true);
  };

  const prev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setIndex((i) => Math.min(count - 1, i + 1));
  };

  const navButton =
    'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white active:bg-black/70 disabled:opacity-30';

  return (
    <>
      {/* THUMBNAILS (LIST VIEW) */}
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((img, i) => (
          <button
            key={img.publicId ?? i}
            type="button"
            onClick={() => openViewer(i)}
            aria-label={`View bill ${i + 1} of ${count}`}
            className="rounded-md active:scale-95"
          >
            <img
              src={getImageUrl(img.url, 'list')}
              alt=""
              loading="lazy"
              className="h-12 w-12 rounded-md border border-line object-cover"
            />
          </button>
        ))}
      </div>

      {/* FULLSCREEN VIEWER */}
      {viewerOpen && (
        <div
          ref={viewerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Bill viewer"
          tabIndex={-1}
          className="fixed inset-0 z-60 flex flex-col bg-black/90 text-white outline-none backdrop-blur-md"
        >
          {/* TOP BAR */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1 pl-4 pr-2 pt-[calc(0.25rem+env(safe-area-inset-top))]">
            <div className="text-sm" aria-live="polite">
              {index + 1} / {count}
            </div>
            <button
              type="button"
              onClick={() => setViewerOpen(false)}
              aria-label="Close viewer"
              className="flex h-11 w-11 items-center justify-center rounded-full active:bg-white/10"
            >
              <FiX size={24} aria-hidden="true" />
            </button>
          </div>

          {/* IMAGE AREA */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous bill"
              className={`${navButton} left-2`}
            >
              <FiChevronLeft size={24} aria-hidden="true" />
            </button>

            <img
              src={getImageUrl(images[index].url, 'zoom')}
              className="max-h-full max-w-full select-none object-contain"
              alt={`Bill ${index + 1} of ${count}`}
            />

            <button
              type="button"
              onClick={next}
              disabled={index === count - 1}
              aria-label="Next bill"
              className={`${navButton} right-2`}
            >
              <FiChevronRight size={24} aria-hidden="true" />
            </button>
          </div>

          {/* THUMB STRIP */}
          <div className="flex justify-center border-t border-white/10 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
            <div className="flex gap-3 pb-2">
              {images.map((img, i) => (
                <button
                  key={img.publicId ?? i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show bill ${i + 1}`}
                  aria-current={i === index}
                  className={`relative shrink-0 overflow-hidden rounded-xl border transition-all duration-200 ${
                    i === index
                      ? 'scale-105 border-white'
                      : 'border-white/20 opacity-60'
                  }`}
                >
                  <img
                    src={getImageUrl(img.url, 'thumbnail')}
                    alt=""
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
