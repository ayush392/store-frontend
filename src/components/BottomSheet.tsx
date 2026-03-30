import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function BottomSheet({ title, children, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  const lastMoveTime = useRef(0);
  const lastY = useRef(0);

  // Lock background scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => setMounted(true), 0); // trigger CSS transition on mount
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const closeSheet = () => {
    if (!sheetRef.current) return;

    sheetRef.current.classList.add('translate-y-full');
    sheetRef.current.classList.remove('translate-y-0');
    setTimeout(onClose, 200); // wait for animation
  };

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
      className="fixed inset-0 z-50 flex items-end bg-black/50 pb-18"
      onClick={closeSheet}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`bg-white w-full max-h-dvh rounded-t-2xl shadow-xl flex flex-col transition-transform duration-150 ease-out ${
          mounted ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="px-4 pb-3 border-b border-gray-400 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button
            onClick={closeSheet}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
