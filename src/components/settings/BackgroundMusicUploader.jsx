import { useState } from "react";
import FilePicker from "./../FilePicker";
import { saveSoundEffect } from "../../utils/soundEffectsDB";
import { useToast } from "../ToastProvider";

export default function BackgroundMusicUploader({ onAdded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const { showToast } = useToast();

  return (
    <div className="bg-sky-100 p-4 rounded-md w-full flex flex-col gap-2">
      <label className="font-semibold">Ajout Musique d'Ambiance:</label>

      <div className="flex gap-4 items-center">
        <FilePicker
          label="Choisir un son"
          accept="audio/*"
          onFileSelected={(selected) => setFile(selected)}
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
        onClick={async () => {
          if (!file || !name.trim()) {
            showToast("Aucun fichier sélectionné", "error");
            return;
          }
          if (!name.trim()) {
            showToast("Veuillez enter un nom de piste", "error");
            return;
          }

          try {
            await saveSoundEffect(name.trim(), file, "music");
            showToast("Piste enregistrée", "success");
            setFile(null);
            setName("");
            if (onAdded) onAdded();
          } catch (err) {
            console.error(err);
            showToast("Erreur lors de l'enregistrement", "error");
          }
        }}
        className="mt-2 px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
      >
        Valider
      </button>
    </div>
  );
}
