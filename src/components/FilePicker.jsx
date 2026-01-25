import { useRef } from "react";
import { Upload } from "lucide-react";

export default function FilePicker({
  label = "Choisir un fichier",
  accept = "*/*",
  onFileSelected,
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);

  return (
    <label
      className={`relative cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-accent-primary)',
          color: 'white',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Upload size={14} />
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
        className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer"
      />
    </label>
  );
}
