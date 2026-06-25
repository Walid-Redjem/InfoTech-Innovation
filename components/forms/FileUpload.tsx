"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle2, X } from "lucide-react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const ar = locale === "ar";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setFileName(file.name);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset!);
      formData.append("folder", folder);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            onUpload(data.secure_url);
            setUploaded(true);
            setProgress(100);
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
        xhr.send(formData);
      });
    } catch {
      setFileName("");
      setUploaded(false);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setUploaded(false);
    setFileName("");
    setProgress(0);
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
        <label className={`flex flex-col gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          error ? "border-red-400 bg-red-50" : "border-lilac-dark bg-lilac/30 hover:border-mauve hover:bg-lilac/50"
        }`}>
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
          <div className="flex items-center gap-3">
            <Upload className={`w-5 h-5 shrink-0 ${uploading ? "text-mauve animate-pulse" : "text-mauve"}`} />
            <div>
              <span className="text-sm text-gray-600 block">
                {uploading
                  ? `${ar ? "جارٍ الرفع" : "Uploading"} ${progress}%`
                  : (ar ? "انقر للرفع" : "Click to upload")}
              </span>
              {hint && !uploading && <span className="text-xs text-gray-400">{hint}</span>}
            </div>
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="h-1.5 bg-lilac-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #8B2FC9, #00BFFF)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{ar ? "مطلوب" : "Required"}</p>}
    </div>
  );
}
