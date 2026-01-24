import { useState, useEffect } from "react";
import { Image, X, Loader2 } from "lucide-react";
import FilePicker from "./../FilePicker";
import { getAsset, saveAsset } from "../../utils/soundEffectsDB";
import { useToast } from "../ToastProvider";

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function BackgroundImagePicker({ onChange }) {
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadName() {
      const stored = await getAsset("backgroundImageName");
      if (stored) setFileName(stored);
    }
    loadName();
  }, []);

  const handleFileSelected = (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      return;
    }

    if (!VALID_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      showToast("Format image invalide. Utilisez JPG, PNG, GIF ou WebP.", "error");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        await saveAsset("backgroundImage", base64);
        await saveAsset("backgroundImageName", file.name);
        onChange(base64);
        setFileName(file.name);
        showToast("Image enregistrée", "success");
      } catch (error) {
        console.error("Failed to save image:", error);
        showToast("Erreur lors de l'enregistrement", "error");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      showToast("Erreur lors de la lecture du fichier", "error");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await saveAsset("backgroundImage", null);
      await saveAsset("backgroundImageName", null);
      onChange(null);
      setFileName("");
    } catch (error) {
      console.error("Failed to remove image:", error);
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl w-full"
      style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-light)'
      }}
    >
      <div className="flex items-center gap-2">
        <Image size={18} style={{ color: 'var(--color-text-muted)' }} />
        <label className="font-medium whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
          Fond d'Écran:
        </label>
      </div>

      <FilePicker
        label={isLoading ? "Chargement..." : "Choisir"}
        accept="image/*"
        onFileSelected={handleFileSelected}
        disabled={isLoading}
      />

      <p
        className="text-sm flex-grow truncate"
        style={{ color: fileName ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Chargement...
          </span>
        ) : (
          fileName || "Aucun fichier sélectionné"
        )}
      </p>

      <button
        onClick={handleRemove}
        disabled={isLoading || !fileName}
        className="p-2 rounded-lg transition-all duration-200 flex items-center gap-1"
        style={{
          backgroundColor: fileName ? 'var(--color-danger)' : 'var(--color-bg-elevated)',
          color: 'white',
          opacity: isLoading || !fileName ? 0.5 : 1,
          cursor: isLoading || !fileName ? 'not-allowed' : 'pointer'
        }}
        title="Retirer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
