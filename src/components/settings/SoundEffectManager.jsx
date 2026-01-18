import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Pencil, Trash2, Check, X, Plus, Sparkles, Trophy, Skull } from "lucide-react";
import {
  getAllSoundEffects,
  deleteSoundEffect,
  updateSoundEffectName,
  setEndRoleByName,
  filterSoundEffects,
} from "../../utils/soundEffectsDB";
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

  // Track previous blob URLs to properly revoke them when effects change
  const prevUrlsRef = useRef(new Map());

  useEffect(() => {
    loadEffects();
  }, []);

  // Memoize blob URLs to prevent re-creation on every render
  const effectUrls = useMemo(() => {
    const newUrls = new Map();
    effects.forEach((e) => {
      if (e.blob instanceof Blob) {
        // Reuse existing URL if the blob is the same (by name as key)
        const existingUrl = prevUrlsRef.current.get(e.name);
        if (existingUrl) {
          newUrls.set(e.name, existingUrl);
        } else {
          newUrls.set(e.name, URL.createObjectURL(e.blob));
        }
      }
    });

    // Revoke old URLs that are no longer in use
    prevUrlsRef.current.forEach((url, name) => {
      if (!newUrls.has(name)) {
        URL.revokeObjectURL(url);
      }
    });
    prevUrlsRef.current = newUrls;

    return newUrls;
  }, [effects]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      prevUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      prevUrlsRef.current.clear();
    };
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

  const IconButton = ({ onClick, icon: Icon, variant = "default", title, disabled = false }) => {
    const colors = {
      default: { bg: 'var(--color-bg-elevated)', hover: 'var(--color-accent-primary)', color: 'var(--color-text-secondary)' },
      success: { bg: 'var(--color-success)', hover: 'var(--color-success-hover)', color: 'white' },
      danger: { bg: 'var(--color-danger)', hover: 'var(--color-danger-hover)', color: 'white' },
    };
    const c = colors[variant];

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="p-1.5 rounded-lg transition-all duration-150"
        style={{ backgroundColor: c.bg, color: c.color, opacity: disabled ? 0.5 : 1 }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = c.hover;
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = c.bg;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Icon size={16} />
      </button>
    );
  };

  const roleBadge = (role) =>
    role === "victory" ? (
      <span
        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-medium"
        style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'var(--color-success)' }}
      >
        <Trophy size={12} />
      </span>
    ) : role === "defeat" ? (
      <span
        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-medium"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }}
      >
        <Skull size={12} />
      </span>
    ) : null;

  return (
    <div
      className="p-4 rounded-xl w-full transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-light)'
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer rounded-lg p-2 -m-2 transition-all duration-200 hover:bg-[var(--color-bg-elevated)]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: 'var(--color-warning)' }} />
          <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Effets Sonores
          </h3>
        </div>
        <ChevronRight
          size={20}
          className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "rotate-0"}`}
          style={{ color: 'var(--color-text-muted)' }}
        />
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 fade-in">
          {effects.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
              Aucun effet sonore enregistré.
            </p>
          ) : (
            <ul className="space-y-2">
              {effects.map(({ name, role }) => (
                <li
                  key={name}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-light)'
                  }}
                >
                  <div className="flex-grow min-w-0 flex items-center">
                    {editingName === name ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="input w-full text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmRename(name);
                          if (e.key === "Escape") setEditingName(null);
                        }}
                      />
                    ) : (
                      <>
                        <span
                          className="font-medium text-sm truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {name}
                        </span>
                        {roleBadge(role)}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingName === name ? (
                      <>
                        <IconButton onClick={() => handleConfirmRename(name)} icon={Check} variant="success" title="Confirmer" />
                        <IconButton onClick={() => setEditingName(null)} icon={X} variant="default" title="Annuler" />
                      </>
                    ) : (
                      <IconButton onClick={() => handleRename(name)} icon={Pencil} variant="default" title="Renommer" />
                    )}

                    <audio controls src={effectUrls.get(name)} className="h-8 rounded" />

                    {confirmingDelete === name ? (
                      <>
                        <IconButton onClick={() => handleDelete(name)} icon={Check} variant="danger" title="Confirmer" />
                        <IconButton onClick={() => setConfirmingDelete(null)} icon={X} variant="default" title="Annuler" />
                      </>
                    ) : (
                      <IconButton onClick={() => setConfirmingDelete(name)} icon={Trash2} variant="default" title="Supprimer" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2">
            {!showPicker ? (
              <button
                onClick={openPicker}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-success-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-success)';
                }}
              >
                <Plus size={16} />
                Ajouter un effet
              </button>
            ) : (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-light)'
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Rôle:</span>
                  <button
                    onClick={() => setPendingRole("none")}
                    className="px-3 py-1.5 text-xs rounded-lg transition-all duration-150"
                    style={{
                      backgroundColor: pendingRole === "none" ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
                      color: pendingRole === "none" ? 'white' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border-light)'
                    }}
                  >
                    Aucun
                  </button>
                  <button
                    onClick={() => setPendingRole("victory")}
                    className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-all duration-150"
                    style={{
                      backgroundColor: pendingRole === "victory" ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-bg-tertiary)',
                      color: pendingRole === "victory" ? 'var(--color-success)' : 'var(--color-text-secondary)',
                      border: `1px solid ${pendingRole === "victory" ? 'var(--color-success)' : 'var(--color-border-light)'}`
                    }}
                  >
                    <Trophy size={14} />
                    Victoire
                  </button>
                  <button
                    onClick={() => setPendingRole("defeat")}
                    className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-all duration-150"
                    style={{
                      backgroundColor: pendingRole === "defeat" ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-bg-tertiary)',
                      color: pendingRole === "defeat" ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                      border: `1px solid ${pendingRole === "defeat" ? 'var(--color-danger)' : 'var(--color-border-light)'}`
                    }}
                  >
                    <Skull size={14} />
                    Défaite
                  </button>
                </div>

                <SoundEffectPicker onAdded={handleAdded} />

                <div className="mt-3">
                  <button
                    onClick={() => {
                      setShowPicker(false);
                      setPendingRole("none");
                    }}
                    className="btn btn-ghost px-4 py-2 text-sm rounded-lg"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
