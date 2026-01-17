import { useEffect, useState } from "react";
import {
  getAllSoundEffects,
  deleteSoundEffect,
  updateSoundEffectName,
  setEndRoleByName,
  filterSoundEffects,
} from "../../utils/soundEffectsDB";
import arrowImg from "../../assets/arrow.png";
import editImg from "../../assets/edit.png";
import delImg from "../../assets/delete.png";
import checkImg from "../../assets/check.png";
import lossImg from "../../assets/loss.png";
import winImg from "../../assets/win.png";
import SoundEffectPicker from "./SoundEffectPicker";


export default function SoundEffectManager({ onChange }) {
  const [effects, setEffects] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState("");

  // New: role selection for the *next* added SFX
  const [pendingRole, setPendingRole] = useState("none");
  const [preAddNames, setPreAddNames] = useState([]);

  useEffect(() => {
    loadEffects();
  }, []);

  const loadEffects = async () => {
    const list = await getAllSoundEffects();
    setEffects(filterSoundEffects(list));
  };

  const handleDelete = async (name) => {
    await deleteSoundEffect(name);
    await loadEffects();
    onChange && onChange();
    setConfirmingDelete(null);
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
    await loadEffects();
    onChange && onChange();
    setEditingName(null);
  };

  const openPicker = () => {
    setPreAddNames(effects.map((e) => e.name));
    setPendingRole("none");
    setShowPicker(true);
  };

  const handleAdded = async (maybeName) => {
    await loadEffects();
    let addedName = maybeName;
    if (!addedName) {
      const list = await getAllSoundEffects();
      const afterNames = filterSoundEffects(list).map((e) => e.name);
      const diff = afterNames.filter((n) => !preAddNames.includes(n));
      addedName = diff[0];
    }
    if (pendingRole !== "none" && addedName) {
      await setEndRoleByName(pendingRole, addedName);
      await loadEffects();
      onChange && onChange();
    }
    setShowPicker(false);
    setPendingRole("none");
    setPreAddNames([]);
  };

  const roleBadge = (role) =>
    role === "victory" ? (
      <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">
        <img
          src={winImg}
          alt="winImg"
          title="winImg"
          className="w-6 h-6  rounded-sm"
          />
      </span>
    ) : role === "defeat" ? (
      <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700">
        <img
          src={lossImg}
          alt="lossImg"
          title="lossImg"
          className="w-6 h-6 rounded-sm "
          />
      </span>
    ) : null;

  return (
    <div className="bg-sky-100 p-4 rounded-md w-full hover:outline hover:outline-2 hover:outline-sky-500 transition-[outline] ease-in-out">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold mb-2">Effets Sonores Actuels</h3>
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
          {effects.length === 0 ? (
            <p className="text-gray-600 italic">Aucun effet sonore enregistré.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {effects.map(({ name, blob, role }) => (
                <li
                  key={name}
                  className="grid items-center bg-white p-2 rounded shadow gap-2 [grid-template-columns:1fr_auto_auto]"
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
                    {roleBadge(role)}
                  </div>

                  {/* Col 2: Edit / Confirm button */}
                  <div className="flex items-center justify-center">
                    {editingName === name ? (
                      <button
                        onClick={() => handleConfirmRename(name)}
                        className="text-green-600 hover:text-green-800 text-xl"
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

          {/* Bottom: Add new SFX */}
          <div className="mt-4 space-y-2">
            {!showPicker ? (
              <button
                onClick={openPicker}
                className="px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                + Ajouter un effet
              </button>
            ) : (
              <div className="mt-2 rounded border border-slate-300 bg-white p-3">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-slate-700">Rôle (optionnel):</span>
                  <button
                    onClick={() => setPendingRole("none")}
                    className={`px-2 py-1 text-xs rounded border ${
                      pendingRole === "none" ? "bg-slate-200" : "bg-white"
                    }`}
                  >
                    Aucun
                  </button>
                  <button
                    onClick={() => setPendingRole("victory")}
                    className={`px-2 py-1 text-xs rounded border ${
                      pendingRole === "victory"
                        ? "bg-emerald-100 border-emerald-400"
                        : "bg-white"
                    }`}
                  >
                    <img
                      src={winImg}
                      alt="winImg"
                      title="winImg"
                      className="w-6 h-6 rounded-sm  "
                      />
                  </button>
                  <button
                    onClick={() => setPendingRole("defeat")}
                    className={`px-2 py-1 text-xs rounded border ${
                      pendingRole === "defeat"
                        ? "bg-rose-100 border-rose-400"
                        : "bg-white"
                    }`}
                  >
                    <img
                      src={lossImg}
                      alt="lossImg"
                      title="lossImg"
                      className="w-6 h-6 rounded-sm "
                      />
                  </button>
                </div>

                <SoundEffectPicker onAdded={handleAdded} />

                <div className="mt-2">
                  <button
                    onClick={() => {
                      setShowPicker(false);
                      setPendingRole("none");
                    }}
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
