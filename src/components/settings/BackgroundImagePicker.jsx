import { useState, useEffect } from "react";
import FilePicker from "./../FilePicker";
import { getAsset, saveAsset } from "../../utils/soundEffectsDB";

export default function BackgroundImagePicker({ onChange }) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    async function loadName() {
      const stored = await getAsset("backgroundImageName");
      if (stored) setFileName(stored);
    }
    loadName();
  }, []);

  return (
    <div className="flex items-center gap-4 justify-between bg-sky-100 p-4 rounded-md w-full">
      <label className="font-semibold whitespace-nowrap">Fond d'Écran:</label>

      <FilePicker
        label="Choisir un fichier"
        accept="image/*"
        onFileSelected={(file) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result;
            await saveAsset("backgroundImage", base64);
            await saveAsset("backgroundImageName", file.name);
            onChange(base64);
            setFileName(file.name);
          };
          reader.readAsDataURL(file);
        }}
      />

      <p className="text-sm text-gray-800 flex-grow">
        {fileName || "Aucun fichier sélectionné"}
      </p>

      <button
        onClick={async () => {
          await saveAsset("backgroundImage", null);
          await saveAsset("backgroundImageName", null);
          onChange(null);
          setFileName("");
        }}
        className="px-4 py-2 bg-stone-400 text-white font-semibold rounded hover:bg-stone-600 transition"
      >
        Retirer
      </button>
    </div>
  );
}
