import BackgroundImagePicker from "./settings/BackgroundImagePicker";
import HintSoundPicker from "./settings/HintSoundPicker";
import SoundEffectManager from "./settings/SoundEffectManager";
import BackgroundMusicManager from "./settings/BackgroundMusicManager";
import closeImg from "../assets/close.png";

export default function SettingsModal({
  onClose,
  onBackgroundChange,
  onSoundChange,
  onBackgroundMusicChange,     // kept for compatibility if you use it elsewhere
  onSoundEffectsUpdate,
  refreshKey,
  endingThreshold,
  onEndingThresholdChange,
  onEndingTrackChange,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 text-teal-900">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[80vw] max-w-4xl h-[70vh] relative flex flex-col items-center gap-4 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 text-2xl hover:bg-teal-200 rounded-sm"
        >
          <img
            src={closeImg}
            alt="closeImg"
            title="closeImg"
            className="w-6 h-6 cursor-pointer hover:bg-sky-400 bg-sky-100 rounded-sm"
            />
        </button>

        <h2 className="text-xl font-bold mb-4">Configuration</h2>

        {/* --- Ecran Télé (TV-related) --- */}
        <section className="w-full border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 text-center">Ecran Télé</h3>

          <div className="flex flex-col gap-2">
            <div className="rounded-md p-3 shadow-sm">
              <BackgroundImagePicker onChange={onBackgroundChange} />
            </div>
            <div className="rounded-md p-3 shadow-sm">
              <HintSoundPicker onChange={onSoundChange} />
            </div>
          </div>
        </section>

        {/* --- Musique d'ambiance & Effets Sonores (now self-contained) --- */}
        <section className="w-full border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 text-center">Sons</h3>

          <div className="flex flex-col gap-2">
            <div className="rounded-md p-3 shadow-sm">
              <BackgroundMusicManager onChange={onSoundEffectsUpdate} refreshKey={refreshKey} />
            </div>
            <div className="rounded-md p-3 shadow-sm">
              <SoundEffectManager onChange={onSoundEffectsUpdate} />
            </div>
          </div>

        
        

        </section>
        

        <button
          onClick={onClose}
          className="inline-block px-4 py-2 bg-sky-400 text-white font-semibold rounded hover:bg-sky-600 transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
