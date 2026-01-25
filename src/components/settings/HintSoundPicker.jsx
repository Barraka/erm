import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import FilePicker from "./../FilePicker";
import { getAsset, saveAsset } from "../../utils/soundEffectsDB";

export default function HintSoundPicker({ onChange }) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    async function loadName() {
      const stored = await getAsset("hintSoundName");
      if (stored) setFileName(stored);
    }
    loadName();
  }, []);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl w-full"
      style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-light)'
      }}
    >
      <div className="flex items-center gap-2">
        <Bell size={18} style={{ color: 'var(--color-text-muted)' }} />
        <label className="font-medium whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
          Son Indice:
        </label>
      </div>

      <FilePicker
        label="Choisir"
        accept="audio/*"
        onFileSelected={(file) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result;
            await saveAsset("hintSound", base64);
            await saveAsset("hintSoundName", file.name);
            onChange(base64);
            setFileName(file.name);
          };
          reader.readAsDataURL(file);
        }}
      />

      <p
        className="text-sm flex-grow truncate"
        style={{ color: fileName ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
      >
        {fileName || "Aucun fichier sélectionné"}
      </p>

      <button
        onClick={async () => {
          await saveAsset("hintSound", null);
          await saveAsset("hintSoundName", null);
          onChange(null);
          setFileName("");
        }}
        disabled={!fileName}
        className="p-2 rounded-lg transition-all duration-200 flex items-center gap-1"
        style={{
          backgroundColor: fileName ? 'var(--color-danger)' : 'var(--color-bg-elevated)',
          color: 'white',
          opacity: !fileName ? 0.5 : 1,
          cursor: !fileName ? 'not-allowed' : 'pointer'
        }}
        title="Retirer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
