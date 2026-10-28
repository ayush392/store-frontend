import imageCompression from 'browser-image-compression';
import { useRef, useState } from 'react';
import { FiCamera, FiChevronRight, FiImage, FiPlus, FiX } from 'react-icons/fi';
import { notifyError } from '../lib/toast';
import { haptics } from '../shared/utils/haptics';
import { BottomSheet } from './BottomSheet';

export type BillFile = {
  id: string;
  preview: string;
  file: File;
};

type Props = {
  bills: BillFile[];
  setBills: React.Dispatch<React.SetStateAction<BillFile[]>>;
};

const MAX_BILLS = 3;

export const UploadBills = ({ bills, setBills }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const addBills = async (files: FileList) => {
    setIsCompressing(true);
    try {
      const remaining = MAX_BILLS - bills.length;
      const allowedFiles = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, remaining);
      if (allowedFiles.length === 0) return;

      const compressedBills = await Promise.all(
        allowedFiles.map(async (file) => {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 2000,
            initialQuality: 0.85,
            useWebWorker: true
          });

          return {
            id: crypto.randomUUID(),
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile)
          };
        })
      );

      setBills((prev) => [...prev, ...compressedBills]);
      haptics.success();
    } catch (err) {
      console.error('Image compression failed:', err);
      notifyError("Couldn't attach that image");
      haptics.error();
    } finally {
      setIsCompressing(false);
    }
  };

  const removeBill = (id: string) => {
    haptics.light();
    setBills((prev) => {
      const bill = prev.find((x) => x.id === id);
      if (bill) URL.revokeObjectURL(bill.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addBills(e.target.files);
    // Reset so the same file can be picked again
    e.target.value = '';
  };

  // Must call .click() synchronously inside the tap for iOS to open the picker
  const pick = (input: HTMLInputElement | null) => {
    haptics.selection();
    input?.click();
    setShowOptions(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="field-label">Bills / Receipts</span>
        <span className="mb-1.5 text-xs font-medium text-slate-400 tabular-nums">
          {bills.length}/{MAX_BILLS}
        </span>
      </div>

      {/* Hidden inputs — gallery vs camera */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200/80 animate-fade-in"
          >
            <img src={bill.preview} alt="Attached bill" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeBill(bill.id)}
              aria-label="Remove bill"
              className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition active:scale-90"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}

        {bills.length < MAX_BILLS && (
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setShowOptions(true);
            }}
            disabled={isCompressing}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition active:scale-95 active:bg-slate-100 disabled:opacity-60"
          >
            {isCompressing ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            ) : (
              <>
                <FiPlus size={22} />
                <span className="mt-1 text-[11px] font-semibold">Add bill</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Native-style action sheet for the image source */}
      {showOptions && (
        <BottomSheet title="Add bill" onClose={() => setShowOptions(false)}>
          <div className="card-list mb-2">
            <div className="list-divider">
              {[
                { label: 'Take photo', icon: FiCamera, tone: 'bg-blue-50 text-blue-600', input: cameraInputRef },
                { label: 'Choose from gallery', icon: FiImage, tone: 'bg-emerald-50 text-emerald-600', input: fileInputRef }
              ].map(({ label, icon: Icon, tone, input }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => pick(input.current)}
                  className="list-row flex w-full items-center gap-3 text-left"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={19} />
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-slate-800">{label}</span>
                  <FiChevronRight className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
