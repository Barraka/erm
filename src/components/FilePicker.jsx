// Shared Reusable File Picker Component
import { useRef } from "react";

export default function FilePicker({
  label = "Choisir un fichier",
  accept = "*/*",
  onFileSelected,
  className = "cursor-pointer",
}) {
  const inputRef = useRef(null);

  return (
    <label className={`relative cursor-pointer ${className}`}>
      <span className="inline-block px-4 py-2 bg-sky-400 text-white font-semibold rounded hover:bg-sky-600 transition cursor-pointer">
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelected(file);
        }}
        className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer"
      />
    </label>
  );
}
