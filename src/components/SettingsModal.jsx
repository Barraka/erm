import { useState } from "react";
import { X, Monitor, Volume2, Clock } from "lucide-react";
import BackgroundImagePicker from "./settings/BackgroundImagePicker";
import HintSoundPicker from "./settings/HintSoundPicker";
import SoundEffectManager from "./settings/SoundEffectManager";
import BackgroundMusicManager from "./settings/BackgroundMusicManager";

export default function SettingsModal({
  onClose,
  onBackgroundChange,
  onSoundChange,
  onBackgroundMusicChange,
  onSoundEffectsUpdate,
  refreshKey,
  endingThreshold,
  onEndingThresholdChange,
  onEndingTrackChange,
  roomDuration,
  onRoomDurationChange,
}) {
  // Local state for the input (in minutes)
  const [durationInput, setDurationInput] = useState(Math.floor(roomDuration / 60));

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setDurationInput(value);

    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      onRoomDurationChange(minutes * 60);
    }
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex flex-col w-[85vw] max-w-4xl h-[80vh] rounded-2xl overflow-hidden fade-in"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border-light)'
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* --- Session settings --- */}
          <section
            className="rounded-xl p-5"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-light)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <Clock size={20} style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Session
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="roomDuration"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Durée de la salle
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="roomDuration"
                  type="number"
                  min={1}
                  max={180}
                  value={durationInput}
                  onChange={handleDurationChange}
                  className="input w-20 text-center"
                />
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  minutes
                </span>
              </div>
            </div>
          </section>

          {/* --- Ecran Télé (TV-related) --- */}
          <section
            className="rounded-xl p-5"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-light)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <Monitor size={20} style={{ color: 'var(--color-accent-primary)' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Ecran Télé
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <BackgroundImagePicker onChange={onBackgroundChange} />
              <HintSoundPicker onChange={onSoundChange} />
            </div>
          </section>

          {/* --- Musique d'ambiance & Effets Sonores --- */}
          <section
            className="rounded-xl p-5"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-light)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <Volume2 size={20} style={{ color: 'var(--color-warning)' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Sons
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <BackgroundMusicManager onChange={onSoundEffectsUpdate} refreshKey={refreshKey} />
              <SoundEffectManager onChange={onSoundEffectsUpdate} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border-light)'
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-primary px-6 py-2.5 text-base font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
