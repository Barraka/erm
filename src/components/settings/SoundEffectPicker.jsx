import { useState } from "react";
import { Loader2 } from "lucide-react";
import FilePicker from "./../FilePicker";
import { saveSoundEffect } from "../../utils/soundEffectsDB";
import { useToast } from "../ToastProvider";

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const VALID_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm', 'audio/x-m4a'];

export default function SoundEffectPicker({ onAdded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileSelected = (selected) => {
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      showToast(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      return;
    }

    // Validate audio file type
    if (!VALID_AUDIO_TYPES.includes(selected.type) && !selected.type.startsWith('audio/')) {
      showToast("Format audio invalide. Utilisez MP3, WAV, OGG ou M4A.", "error");
      return;
    }

    setFile(selected);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <label
        className="font-medium text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Ajout Effet Sonore:
      </label>

      <div className="flex gap-3 items-center flex-wrap">
        <FilePicker
          label="Choisir un son"
          accept="audio/*"
          onFileSelected={handleFileSelected}
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'effet"
          className="input flex-1 min-w-[200px]"
        />
      </div>

      {file && (
        <p
          className="text-sm italic"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Fichier sélectionné: {file.name}
        </p>
      )}

      <button
        disabled={isLoading}
        onClick={async () => {
          if (!file) {
            showToast("Aucun fichier sélectionné", "error");
            return;
          }
          if (!name.trim()) {
            showToast("Saisir un nom de piste", "error");
            return;
          }

          setIsLoading(true);
          try {
            await saveSoundEffect(name.trim(), file);
            showToast("Son ajouté", "success");
            setFile(null);
            setName("");
            if (onAdded) onAdded();
          } catch (err) {
            console.error(err);
            showToast("Erreur lors de l'enregistrement", "error");
          } finally {
            setIsLoading(false);
          }
        }}
        className="mt-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          backgroundColor: isLoading ? 'var(--color-bg-elevated)' : 'var(--color-success)',
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--color-success-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--color-success)';
          }
        }}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? "Enregistrement..." : "Valider"}
      </button>
    </div>
  );
}
