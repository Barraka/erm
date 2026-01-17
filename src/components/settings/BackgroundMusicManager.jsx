import { useEffect, useState } from "react";
import {
  getAllSoundEffects,
  deleteSoundEffect,
  updateSoundEffectName,
  filterMusicTracks,
} from "../../utils/soundEffectsDB";
import arrowImg from "../../assets/arrow.png";
import editImg from "../../assets/edit.png"; // your local edit icon
import delImg from "../../assets/delete.png";
import checkImg from "../../assets/check.png";
import BackgroundMusicUploader from "./BackgroundMusicUploader";

export default function BackgroundMusicManager({ onChange, refreshKey }) {
  const [tracks, setTracks] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const loadTracks = async () => {
    const list = await getAllSoundEffects();
    setTracks(filterMusicTracks(list));
  };

  const handleDelete = async (name) => {
    await deleteSoundEffect(name);
    await loadTracks();
    onChange && onChange();
    setConfirmingDelete(null);
  };

  const handleAdded = async () => {
    await loadTracks();
    onChange && onChange();
    setShowUploader(false);
  };

  const handleRename = (name) => {
    setEditingName(name);
    setNewName(name);
  };

  const handleConfirmRename = async (oldName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingName(null);
      return;
    }
    await updateSoundEffectName(oldName, trimmed);
    await loadTracks();
    onChange && onChange();
    setEditingName(null);
  };

  return (
    <div className="bg-sky-100 p-4 rounded-md w-full hover:outline hover:outline-2 hover:outline-sky-500 transition-[outline] ease-in-out">
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <h3 className="font-semibold mb-2">Pistes Musicales d'Ambiance</h3>
        <img
          src={arrowImg}
          alt="toggle"
          className={`w-8 h-8 transition-transform duration-300 bg-slate-400 rounded-full m-2 ${
            isExpanded ? "rotate-90" : "rotate-0"
          }`}
        />
      </div>

      {isExpanded && (
        <>
          {/* Track list */}
          {tracks.length === 0 ? (
            <p className="text-gray-600 italic mt-2">Aucune piste enregistrée.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {tracks.map(({ name, blob }) => (
                <li
                  key={name}
                  className="grid items-center bg-white p-2 rounded shadow
                             gap-2
                             [grid-template-columns:1fr_auto_auto]"
                >
                  {/* Col 1: Name / Rename input */}
                  <div className="min-w-0">
                    {editingName === name ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 w-full"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmRename(name);
                          if (e.key === "Escape") setEditingName(null);
                        }}
                      />
                    ) : (
                      <span className="font-medium truncate inline-block max-w-[28rem]">
                        {name}
                      </span>
                    )}
                  </div>

                  {/* Col 2: Edit / Confirm (fixed column → aligned) */}
                  <div className="flex items-center justify-center">
                    {editingName === name ? (
                      <button
                        onClick={() => handleConfirmRename(name)}
                        className="text-green-600 hover:text-green-800 text-xl "
                        title="Confirmer"
                      >
                        <img
                        src={checkImg}
                        alt="Check"
                        title="Check"
                        // onClick={() => setConfirmingDelete(name)}
                        className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                        />
                      </button>
                    ) : (
                      <img
                        src={editImg}
                        alt="Modifier"
                        title="Renommer"
                        onClick={() => handleRename(name)}
                        className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                      />
                    )}
                  </div>

                  {/* Col 3: Controls */}
                  <div className="flex items-center justify-end gap-2">
                    <audio controls src={URL.createObjectURL(blob)} className="h-8" />
                    {confirmingDelete === name ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(name)}
                          className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-700"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirmingDelete(null)}
                          className="px-2 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(name)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                        title="Supprimer"
                      >
                        <img
                        src={delImg}
                        alt="Delete"
                        title="Delete"
                        className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                        />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Bottom: Add / Uploader */}
          <div className="mt-4">
            {!showUploader ? (
              <button
                onClick={() => setShowUploader(true)}
                className="px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                + Ajouter une piste
              </button>
            ) : (
              <div className="rounded border border-slate-300 bg-white p-3">
                <BackgroundMusicUploader onAdded={handleAdded} />
                <div className="mt-2">
                  <button
                    onClick={() => setShowUploader(false)}
                    className="px-3 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
