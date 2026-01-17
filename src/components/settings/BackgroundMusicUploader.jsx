import { useState } from "react";
import FilePicker from "./../FilePicker";
import { saveSoundEffect } from "../../utils/soundEffectsDB";
import { useToast } from "../ToastProvider";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function BackgroundMusicUploader({ onAdded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileSelected = (selected) => {
    if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
      showToast(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      return;
    }
    setFile(selected);
  };

  return (
    <div className="bg-sky-100 p-4 rounded-md w-full flex flex-col gap-2">
      <label className="font-semibold">Ajout Musique d'Ambiance:</label>

      <div className="flex gap-4 items-center">
        <FilePicker
          label="Choisir un son"
          accept="audio/*"
          onFileSelected={handleFileSelected}
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la piste"
          className="border p-2 rounded w-64"
        />
      </div>

      {file && (
        <p className="text-sm text-gray-500 italic">
          Fichier sélectionné: {file.name}
        </p>
      )}

      <button
        disabled={isLoading}
        onClick={async () => {
          if (!file || !name.trim()) {
            showToast("Aucun fichier sélectionné", "error");
            return;
          }
          if (!name.trim()) {
            showToast("Veuillez enter un nom de piste", "error");
            return;
          }

          setIsLoading(true);
          try {
            await saveSoundEffect(name.trim(), file, "music");
            showToast("Piste enregistrée", "success");
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
        className="mt-2 px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enregistrement..." : "Valider"}
      </button>
    </div>
  );
}
