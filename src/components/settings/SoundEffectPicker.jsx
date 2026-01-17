import { useState } from "react";
import FilePicker from "./../FilePicker";
import { saveSoundEffect } from "../../utils/soundEffectsDB";
import { useToast } from "../ToastProvider";


export default function SoundEffectPicker({ onAdded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const { showToast } = useToast();

  return (
    <div className="bg-sky-100 p-4 rounded-md w-full flex flex-col gap-2">
      <label className="font-semibold">Ajout Effet Sonore:</label>

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
          placeholder="Nom de l'effet"
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
          if (!file) {
            showToast("Aucun fichier sélectionné", "error");

            return;
          }
          if (!name.trim()) {
            showToast("Saisir un nom de piste", "error");

            return;
          }

          try {
            await saveSoundEffect(name.trim(), file);
            showToast("Son ajouté", "success");
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
