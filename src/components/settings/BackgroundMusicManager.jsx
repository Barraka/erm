import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Pencil, Trash2, Check, X, Plus, Music } from "lucide-react";
import {
  getAllSoundEffects,
  deleteSoundEffect,
  updateSoundEffectName,
  filterMusicTracks,
} from "../../utils/soundEffectsDB";
import BackgroundMusicUploader from "./BackgroundMusicUploader";

export default function BackgroundMusicManager({ onChange, refreshKey }) {
  const [tracks, setTracks] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState("");

  // Track previous blob URLs to properly revoke them when tracks change
  const prevUrlsRef = useRef(new Map());

  useEffect(() => {
    loadTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Memoize blob URLs to prevent re-creation on every render
  const trackUrls = useMemo(() => {
    const newUrls = new Map();
    tracks.forEach((t) => {
      if (t.blob instanceof Blob) {
        // Reuse existing URL if the blob is the same (by name as key)
        const existingUrl = prevUrlsRef.current.get(t.name);
        if (existingUrl) {
          newUrls.set(t.name, existingUrl);
        } else {
          newUrls.set(t.name, URL.createObjectURL(t.blob));
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
  }, [tracks]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      prevUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      prevUrlsRef.current.clear();
    };
  }, []);

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
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Music size={18} style={{ color: 'var(--color-accent-primary)' }} />
          <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Pistes Musicales d'Ambiance
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
          {tracks.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
              Aucune piste enregistrée.
            </p>
          ) : (
            <ul className="space-y-2">
              {tracks.map(({ name }) => (
                <li
                  key={name}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-light)'
                  }}
                >
                  <div className="flex-grow min-w-0">
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
                      <span
                        className="font-medium text-sm truncate block"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {name}
                      </span>
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

                    <audio controls src={trackUrls.get(name)} className="h-8 rounded" />

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
            {!showUploader ? (
              <button
                onClick={() => setShowUploader(true)}
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
                Ajouter une piste
              </button>
            ) : (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-light)'
                }}
              >
                <BackgroundMusicUploader onAdded={handleAdded} />
                <div className="mt-3">
                  <button
                    onClick={() => setShowUploader(false)}
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
