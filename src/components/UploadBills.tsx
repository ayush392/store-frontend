import { FiPlus, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';

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
        <label className="block text-sm font-medium text-gray-700">
          Bills / Receipts
        </label>

        {bills.length > 0 && (
          <span className="text-xs text-gray-500">{bills.length} attached</span>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200"
          >
            <img
              src={bill.preview}
              alt="Receipt"
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => removeBill(bill.id)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm border border-gray-200 active:scale-95 transition"
            >
              <FiX className="h-3.5 w-3.5 text-gray-800" />
            </button>
          </div>
        ))}

        {bills.length < 3 && (
          <label className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  addBills(e.target.files);
                }
                e.target.value = '';
              }}
            />

            <FiPlus className="h-7 w-7 text-gray-500" />
          </label>
        )}
      </div>
    </div>
  );
};
