import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { haptics } from '../shared/utils/haptics';

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

const CLOSE_MS = 220;

/** Native-style bottom sheet: slides up, drag the handle/header down to dismiss. */
export function BottomSheet({ title, children, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const closing = useRef(false);

  const startY = useRef(0);
  const startTime = useRef(0);
  const offset = useRef(0);
  const dragging = useRef(false);

  const setSheetTransform = (value: string, animate: boolean) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animate ? `transform ${CLOSE_MS}ms var(--ease-native)` : 'none';
    el.style.transform = value;
  };

  const closeSheet = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    haptics.light();
    setVisible(false);
    setSheetTransform('translateY(100%)', true);
    setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  // Enter animation, scroll lock and Escape to close
  useEffect(() => {
    haptics.light();
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      setVisible(true);
      setSheetTransform('translateY(0)', true);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = original;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSheet]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    // Let the content scroll normally unless it's already at the top
    if (contentRef.current?.contains(e.target as Node) && contentRef.current.scrollTop > 0) return;
    dragging.current = true;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    offset.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!dragging.current || !touch) return;
    const delta = touch.clientY - startY.current;
    // Rubber-band resistance when pulling up, 1:1 when pulling down
    offset.current = delta > 0 ? delta : delta * 0.2;
    setSheetTransform(`translateY(${offset.current}px)`, false);
  };

  const onTouchEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const elapsed = Math.max(1, Date.now() - startTime.current);
    const velocity = offset.current / elapsed; // px per ms

    if (offset.current > 120 || (offset.current > 30 && velocity > 0.5)) {
      closeSheet();
    } else {
      setSheetTransform('translateY(0)', true);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" role="presentation">
      {/* Backdrop */}
      <div
        onClick={closeSheet}
        aria-hidden="true"
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{ transform: 'translateY(100%)' }}
        className="relative mx-auto flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-white pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(15,23,42,0.18)]"
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-2.5 pb-1.5">
          <div className="h-1.5 w-10 rounded-full bg-slate-300" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
          <button
            onClick={closeSheet}
            type="button"
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
          >
            <FiX size={18} />
          </button>
        </div>

        <div ref={contentRef} className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
