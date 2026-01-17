import { useEffect, useMemo, useState } from "react";
import arrowImg from "../assets/arrow.png";
import Controls from "./Controls";

export default function BackgroundMusicPlayer({
  tracks,
  activeTrackKey,          // <- from App.jsx when room auto-starts
  onPause,
  onStop,
  currentAudioRef,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeKey, setActiveKey] = useState(activeTrackKey || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Keep local activeKey in sync with prop (so auto-started track becomes active)
  useEffect(() => {
    setActiveKey(activeTrackKey || null);
  }, [activeTrackKey]);

  // Build { key -> { name, blob, _url } } for local plays
  const trackMap = useMemo(() => {
    const m = new Map();
    tracks.forEach((t) => m.set(t.key, { ...t, _url: URL.createObjectURL(t.blob) }));
    return m;
  }, [tracks]);

  useEffect(() => {
    return () => {
      trackMap.forEach(({ _url }) => URL.revokeObjectURL(_url));
    };
  }, [trackMap]);

  // Just read state from the shared audio element; do NOT try to deduce which track by URL
  useEffect(() => {
    let rafId;
    const tick = () => {
      const a = currentAudioRef?.current;
      if (a && !Number.isNaN(a.duration)) {
        setProgress(a.currentTime || 0);
        setDuration(a.duration || 0);
        setIsPlaying(!a.paused);
      } else {
        setIsPlaying(false);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [currentAudioRef]);

  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Controls --------------------------------------------------------------

  const handlePlayKey = async (key) => {
    const item = trackMap.get(key);
    if (!item) return;

    let a = currentAudioRef.current;
    if (!a) {
      a = new Audio();
      currentAudioRef.current = a;
    }

    if (!a.src || a.src !== item._url) {
      a.src = item._url;
      a.loop = true;
      a.volume = volume;
      a.addEventListener("loadedmetadata", () => {
        setDuration(Number.isNaN(a.duration) ? 0 : a.duration);
      }, { once: true });
    }

    try {
      await a.play();
      setActiveKey(key);         // local state (App will continue using shared ref)
      setIsPlaying(true);
    } catch (e) {
      console.warn("Play failed:", e);
    }
  };

  const handlePauseKey = (key) => {
    if (key !== (activeKey || activeTrackKey)) return;
    const a = currentAudioRef.current;
    if (a) a.pause();
    setIsPlaying(false);
    onPause && onPause();
  };

  const handleStopKey = (key) => {
    if (key !== (activeKey || activeTrackKey)) return;
    const a = currentAudioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    onStop && onStop();
  };

  const handleSeekActive = (val) => {
    const a = currentAudioRef.current;
    if (!a || Number.isNaN(a.duration)) return;
    a.currentTime = Number(val);
    setProgress(a.currentTime);
  };

  const handleVolumeChange = (val) => {
    const newVolume = Number(val);
    setVolume(newVolume);
    const a = currentAudioRef.current;
    if (a) a.volume = newVolume;
  };

  const resolvedActiveKey = activeKey || activeTrackKey || null;
  const currentName =
    resolvedActiveKey ? tracks.find(t => t.key === resolvedActiveKey)?.name
    : (tracks[0]?.name ?? "Aucune piste");

  return (
    <div
      className={`mt-6 w-full ${isExpanded ? "" : "inline-block"} bg-slate-200 text-teal-800 text-xl hover:outline-teal-500 p-4 rounded-md hover:outline hover:outline-4 ease-in transition-all`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold ">Musique d'Ambiance</h3>
          {!isExpanded && (
  <div className="flex items-center gap-2 text-sm ">
    <span
      className={`inline-block w-3 h-3 rounded-full ${
        isPlaying ? "bg-green-500" : "bg-gray-400"
      }`}
      title={isPlaying ? "Lecture en cours" : "En pause / arrêtée"}
    ></span>
    <span>
      {currentName}
      {duration ? ` • ${formatTime(progress)} / ${formatTime(duration)}` : ""}
    </span>
  </div>
)}

        </div>
        <img
          src={arrowImg}
          alt="toggle"
          className={`w-8 h-8 transition-transform duration-300 bg-slate-400 rounded-full m-2 ${isExpanded ? "rotate-90" : "rotate-0"}`}
        />
      </div>

      {/* Expanded list of per-track players */}
      {isExpanded && (
        <div className="mt-4 w-full space-y-4">
          {tracks.length === 0 && (
            <div className="text-sm text-gray-600">Aucune piste ajoutée pour cette salle.</div>
          )}

          {tracks.map(({ key, name }) => {
            const isActive = key === resolvedActiveKey;
            return (
              <div
                key={key}
                className={`w-full rounded-lg p-3 border ${isActive ? "border-indigo-500 bg-white" : "border-slate-300 bg-slate-50"}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-medium min-w-40">{name}</div>

                  {/* Controls */}
                  
                  <Controls
                    onPlay={() => handlePlayKey(key)}
                    onPause={() => handlePauseKey(key)}
                    onStop={() => handleStopKey(key)}
                    canPause={isActive && !!currentAudioRef.current}
                    canStop={isActive && !!currentAudioRef.current}
                  />


                  <div className="ml-auto text-sm text-gray-700">
                    {isActive ? (
                      <>
                        {formatTime(progress)} / {formatTime(duration)}
                        <span className="ml-2 text-gray-500">
                          (-{formatTime((duration || 0) - (progress || 0))})
                        </span>
                      </>
                    ) : (
                      <>--:-- / --:--</>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={isActive ? (duration || 0) : 0}
                    step={0.1}
                    value={isActive ? Math.min(progress, duration || 0) : 0}
                    onChange={(e) => isActive && handleSeekActive(e.target.value)}
                    disabled={!isActive || Number.isNaN(duration)}
                    className="w-full"
                  />
                </div>

                {/* Volume control */}
                {isActive && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-16">Volume</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => handleVolumeChange(e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-600 w-12">{Math.round(volume * 100)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
