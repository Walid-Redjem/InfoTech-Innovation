"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { useLocale } from "next-intl";

interface Props {
  label: string;
  hint?: string;
  accept?: string;
  folder?: string;
  onUpload: (url: string) => void;
  onClear?: () => void;
  required?: boolean;
  error?: boolean;
}

export default function FileUpload({ label, hint, accept = ".pdf,.jpg,.jpeg,.png", folder = "registrations", onUpload, onClear, required, error }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const ar = locale === "ar";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset!);
      formData.append("folder", folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUpload(data.secure_url);
      setUploaded(true);
    } catch {
      setFileName("");
      setUploaded(false);
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setUploaded(false);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div>
      <label className="block text-sm font-medium text-mauve mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {uploaded ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-turquoise bg-turquoise/5">
          <CheckCircle2 className="w-5 h-5 text-turquoise shrink-0" />
          <span className="text-sm text-gray-600 truncate flex-1">{fileName}</span>
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          error ? "border-red-400 bg-red-50" : "border-lilac-dark bg-lilac/30 hover:border-mauve hover:bg-lilac/50"
        }`}>
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
          {uploading
            ? <Loader2 className="w-5 h-5 text-mauve animate-spin shrink-0" />
            : <Upload className="w-5 h-5 text-mauve shrink-0" />
          }
          <div>
            <span className="text-sm text-gray-600 block">
              {uploading
                ? (ar ? "جارٍ الرفع..." : "Uploading...")
                : (ar ? "انقر للرفع" : "Click to upload")}
            </span>
            {hint && !uploading && <span className="text-xs text-gray-400">{hint}</span>}
          </div>
        </label>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{ar ? "مطلوب" : "Required"}</p>}
    </div>
  );
}
