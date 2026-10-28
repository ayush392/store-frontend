import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import type { RecentTrans, Transactions } from '../shared/types';
import { haptics } from '../shared/utils/haptics';

const getImageUrl = (url: string, view: 'list' | 'thumbnail' | 'zoom') => {
  const optionsMap = {
    list: 'w_96,h_96,c_fill,f_auto,q_auto',
    thumbnail: 'w_112,h_112,c_fill,f_auto,q_auto',
    zoom: 'w_1200,c_limit,dpr_auto,f_auto,q_auto'
  };
  return url.replace('/upload/', `/upload/${optionsMap[view]}/`);
};

type Props = {
  transaction: Transactions | RecentTrans;
};

/** Bill thumbnails + full-screen viewer (swipe left/right to page, swipe down to close). */
export const TransactionImageViewer = ({ transaction }: Props) => {
  const images = transaction.images ?? [];
  const [viewerOpen, setViewerOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<'x' | 'y' | null>(null);

  useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [viewerOpen]);

  if (images.length === 0) return null;

  const openViewer = (i: number) => {
    haptics.selection();
    setIndex(i);
    setDrag({ x: 0, y: 0, active: false });
    setViewerOpen(true);
  };

  const close = () => {
    haptics.light();
    setViewerOpen(false);
  };

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(images.length - 1, i));
    if (next !== index) haptics.selection();
    setIndex(next);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
    axis.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t || !touchStart.current) return;
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (!axis.current && Math.hypot(dx, dy) > 8) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis.current === 'x') setDrag({ x: dx, y: 0, active: true });
    if (axis.current === 'y' && dy > 0) setDrag({ x: 0, y: dy, active: true });
  };

  const onTouchEnd = () => {
    if (axis.current === 'x') {
      if (drag.x < -60) goTo(index + 1);
      else if (drag.x > 60) goTo(index - 1);
    } else if (axis.current === 'y' && drag.y > 110) {
      close();
    }
    touchStart.current = null;
    axis.current = null;
    setDrag({ x: 0, y: 0, active: false });
  };

  const isDragging = drag.active;
  const backdropOpacity = Math.max(0.4, 1 - drag.y / 400);

  return (
    <>
      {/* Thumbnails */}
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((img, i) => (
          <button
            key={img.publicId ?? i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openViewer(i);
            }}
            type="button"
            aria-label={`View bill ${i + 1} of ${images.length}`}
            className="transition select-none active:scale-90"
          >
            <img
              src={getImageUrl(img.url, 'list')}
              alt=""
              loading="lazy"
              className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200/80"
            />
          </button>
        ))}
      </div>

      {viewerOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bill images"
            className="fixed inset-0 z-[60] flex flex-col pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-white select-none animate-fade-in"
            style={{ background: `rgba(0,0,0,${0.95 * backdropOpacity})` }}
          >
            {/* Top bar */}
            <div className="flex h-12 items-center justify-between px-3">
              <div className="w-10" />
              <div className="text-[13px] font-semibold tabular-nums opacity-80">
                {index + 1} of {images.length}
              </div>
              <button
                onClick={close}
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition active:scale-90"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Swipeable image */}
            <div
              className="relative flex flex-1 touch-none items-center justify-center overflow-hidden px-2"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              <img
                key={index}
                src={getImageUrl(images[index].url, 'zoom')}
                className="max-h-full max-w-full rounded-lg object-contain"
                style={{
                  transform: `translate(${drag.x}px, ${drag.y}px) scale(${1 - drag.y / 1500})`,
                  transition: isDragging ? 'none' : 'transform 0.25s var(--ease-native)'
                }}
                alt={`Bill ${index + 1}`}
                draggable={false}
              />
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="no-scrollbar flex justify-center gap-2.5 overflow-x-auto px-4 pt-3">
                {images.map((img, i) => (
                  <button
                    key={img.publicId ?? i}
                    onClick={() => goTo(i)}
                    type="button"
                    aria-label={`Show bill ${i + 1}`}
                    aria-current={i === index}
                    className={`shrink-0 overflow-hidden rounded-xl ring-2 transition-all duration-150 ${
                      i === index ? 'scale-105 ring-white' : 'opacity-50 ring-transparent'
                    }`}
                  >
                    <img src={getImageUrl(img.url, 'thumbnail')} className="h-14 w-14 object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
