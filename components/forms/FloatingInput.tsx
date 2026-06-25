"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Props {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  min?: string;
  max?: string;
  maxLength?: number;
}

export default function FloatingInput({ name, label, type = "text", value, onChange, error, errorMessage, required, min, max, maxLength }: Props) {
  const isValid = !error && value.trim().length > 0;

  return (
    <div className="relative">
      <input
        id={name} name={name} type={type} value={value} onChange={onChange}
        required={required} min={min} max={max} maxLength={maxLength}
        placeholder=" "
        className={`peer w-full px-4 pt-6 pb-2 rounded-xl border text-sm outline-none transition-all bg-white
          ${error
            ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
            : isValid
              ? "border-turquoise focus:border-turquoise focus:ring-2 focus:ring-turquoise/10"
              : "border-gray-200 focus:border-mauve focus:ring-2 focus:ring-mauve/10"
          } ${isValid ? "pe-10" : ""}`}
      />
      <label
        htmlFor={name}
        className={`absolute start-4 text-sm transition-all pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-semibold
          top-1.5 text-xs font-semibold
          ${error
            ? "text-red-400 peer-focus:text-red-400"
            : isValid
              ? "text-turquoise peer-focus:text-turquoise peer-placeholder-shown:text-gray-400"
              : "text-mauve peer-focus:text-mauve peer-placeholder-shown:text-gray-400"
          }`}
      >
        {label}{required && " *"}
      </label>

      {error && errorMessage && (
        <p className="text-xs text-red-500 mt-1 ms-1">{errorMessage}</p>
      )}

      <AnimatePresence>
        {isValid && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-turquoise" />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
