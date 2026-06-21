import { useEffect, useState } from 'react';
import type { RecentTrans, Transactions } from '../shared/types';
import { FiX } from 'react-icons/fi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!viewerOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [viewerOpen]);

  if (images.length === 0) return null;

  const openViewer = (i: number) => {
    setIndex(i);
    setViewerOpen(true);
  };

  const prev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    setIndex((i) => Math.min(images.length - 1, i + 1));
  };

  return (
    <>
      {/* THUMBNAILS (LIST VIEW) */}
      <div className="flex gap-2 mt-2 flex-wrap">
        {images.map((img, i) => (
          <button
            key={img.publicId ?? i}
            onClick={() => openViewer(i)}
            className="active:scale-95 transition"
          >
            <img
              src={getImageUrl(img.url, 'list')}
              alt={`bill-${i + 1}`}
              loading="lazy"
              className="w-12 h-12 rounded-md object-cover border border-gray-200"
            />
          </button>
        ))}
      </div>

      {/* FULLSCREEN VIEWER */}
      {viewerOpen && (
        <div className="fixed left-0 right-0 top-[64px] bottom-[64px] z-[100] flex flex-col bg-black/60 backdrop-blur-md text-white">
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="w-6" />
            <div className="text-sm opacity-80">
              {index + 1} / {images.length}
            </div>
            <button onClick={() => setViewerOpen(false)} className="text-2xl">
              <FiX />
            </button>
          </div>

          {/* IMAGE AREA */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <button
              onClick={prev}
              disabled={index === 0}
              className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white disabled:opacity-20"
            >
              <HiChevronLeft size={24} />
            </button>

            <img
              src={getImageUrl(images[index].url, 'zoom')}
              className="max-h-full max-w-full object-contain select-none"
              alt=""
            />

            <button
              onClick={next}
              disabled={index === images.length - 1}
              className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white disabled:opacity-20"
            >
              <HiChevronRight size={24} />
            </button>
          </div>

          {/* THUMB STRIP */}
          <div className="h-24 px-3 py-3 border-t border-white/10 flex justify-center">
            <div className="flex gap-3 pb-2">
              {images.map((img, i) => (
                <button
                  key={img.publicId ?? i}
                  onClick={() => setIndex(i)}
                  className={`relative shrink-0 rounded-xl overflow-hidden border transition-all duration-200 ${
                    i === index
                      ? 'border-white scale-105'
                      : 'border-white/20 opacity-60'
                  }`}
                >
                  <img
                    src={getImageUrl(img.url, 'thumbnail')}
                    className="w-16 h-16 object-cover"
                  />

                  {i === index && (
                    <div className="absolute inset-0 ring-2 ring-white/60 rounded-xl" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
