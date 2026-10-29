import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function BottomSheet({ title, children, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [visible, setVisible] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);
  const closing = useRef(false);

  const lastMoveTime = useRef(0);
  const lastY = useRef(0);

  // Lock background scroll and trigger the slide-in transition.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => setVisible(true), 0);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = original;
    };
  }, []);

  // Move focus into the sheet and give it back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus({ preventScroll: true });
    return () => {
      if (opener && document.contains(opener)) opener.focus();
    };
  }, []);

  const closeSheet = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (sheetRef.current) sheetRef.current.style.transform = '';
    setVisible(false);
    setTimeout(onClose, 200); // wait for the slide-out animation
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSheet();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeSheet]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches[0]) return;
    dragging.current = true;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging.current || !e.touches[0]) return;

    const now = Date.now();
    const y = e.touches[0].clientY;
    let delta = y - startY.current;

    if (delta < 0) return;
    if (contentRef.current && contentRef.current.scrollTop > 0) return;

    delta *= 0.4; // resistance
    currentY.current = delta;

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }

    lastMoveTime.current = now;
    lastY.current = y;
  };

  const onTouchEnd = () => {
    dragging.current = false;
    const timeDiff = Date.now() - lastMoveTime.current;
    const velocity =
      timeDiff > 0 ? (lastY.current - startY.current) / timeDiff : 0;

    if (currentY.current > 120 || velocity > 0.5) {
      closeSheet();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50"
      onClick={closeSheet}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`flex max-h-[85dvh] w-full flex-col rounded-t-2xl bg-surface shadow-lg outline-none transition-transform duration-150 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div
          aria-hidden="true"
          className="mx-auto my-2 h-1.5 w-12 rounded-full bg-line-strong/40"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pl-4 pr-2 pb-1">
          <h2 id={titleId} className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-fg-secondary active:bg-surface-muted"
          >
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
