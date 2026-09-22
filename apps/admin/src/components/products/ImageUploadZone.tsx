import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface UploadedImage {
  file: File;
  preview: string;
}

interface ImageUploadZoneProps {
  images: UploadedImage[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function ImageUploadZone({ images, onAdd, onRemove }: ImageUploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const validFiles: File[] = [];

      for (const file of acceptedFiles) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" is not a supported image format.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" exceeds the 2MB limit.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onAdd(validFiles);
      }
    },
    [onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message;
      if (msg) setError(msg);
    },
  });

  return (
    <div className="space-y-4">
      {/* Storage Warning Banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
        <strong>Storage Notice:</strong> Firebase Free Tier has a{" "}
        <strong>max 5GB total storage limit</strong>. Only upload essential images.
        Each file must be <strong>2MB or smaller</strong>.
      </div>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img src={img.preview} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive
            ? "border-black bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {isDragActive ? (
          <p className="text-sm font-medium text-black">Drop images here...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600">
              Drag & drop images here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP up to 2MB each</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
