import { useState, useEffect } from "react";
import FilePicker from "./../FilePicker";
import { getAsset, saveAsset } from "../../utils/soundEffectsDB";
import { useToast } from "../ToastProvider";

const MAX_FILE_SIZE_MB = 10;
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

    // Validate image file type
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
    <div className="flex items-center gap-4 justify-between bg-sky-100 p-4 rounded-md w-full">
      <label className="font-semibold whitespace-nowrap">Fond d'Écran:</label>

      <FilePicker
        label={isLoading ? "Chargement..." : "Choisir un fichier"}
        accept="image/*"
        onFileSelected={handleFileSelected}
        disabled={isLoading}
      />

      <p className="text-sm text-gray-800 flex-grow">
        {isLoading ? "Chargement..." : (fileName || "Aucun fichier sélectionné")}
      </p>

      <button
        onClick={handleRemove}
        disabled={isLoading || !fileName}
        className="px-4 py-2 bg-stone-400 text-white font-semibold rounded hover:bg-stone-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Retirer
      </button>
    </div>
  );
}
