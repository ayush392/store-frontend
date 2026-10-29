import { FiPlus, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import { notifyError } from '../lib/toast';

export type BillFile = {
  id: string;
  preview: string;
  file: File;
};

type Props = {
  bills: BillFile[];
  setBills: React.Dispatch<React.SetStateAction<BillFile[]>>;
};

export const UploadBills = ({ bills, setBills }: Props) => {
  const addBills = async (files: FileList) => {
    const allowedFiles = Array.from(files);
    try {
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
    } catch {
      notifyError("Couldn't add that photo. Please try another image.");
    }
  };

  const removeBill = (id: string) => {
    setBills((prev) => {
      const bill = prev.find((x) => x.id === id);

      if (bill) {
        URL.revokeObjectURL(bill.preview);
      }

      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-fg-secondary">
          Bills / Receipts
        </span>

        {bills.length > 0 && (
          <span className="text-xs text-fg-muted">{bills.length} attached</span>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {bills.map((bill, i) => (
          <div
            key={bill.id}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line"
          >
            <img
              src={bill.preview}
              alt={`Bill ${i + 1}`}
              className="h-full w-full object-cover"
            />

            {/* 44px tap area in the corner; the visible circle is smaller. */}
            <button
              type="button"
              onClick={() => removeBill(bill.id)}
              aria-label={`Remove bill ${i + 1}`}
              className="absolute right-0 top-0 flex h-11 w-11 items-start justify-end p-1.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface/90 shadow-sm">
                <FiX className="h-4 w-4 text-fg" aria-hidden="true" />
              </span>
            </button>
          </div>
        ))}

        {bills.length < 3 && (
          <label className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line-strong bg-surface-muted text-fg-secondary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus active:bg-line">
            <input
              type="file"
              multiple
              accept="image/*"
              aria-label="Add bill photo"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) {
                  addBills(e.target.files);
                }
                e.target.value = '';
              }}
            />

            <FiPlus className="h-7 w-7" aria-hidden="true" />
          </label>
        )}
      </div>
    </div>
  );
};
