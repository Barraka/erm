import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Music, Volume2 } from "lucide-react";
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

  // Track previous blob URLs to properly revoke them when tracks change
  const prevUrlsRef = useRef(new Set());

  // Keep local activeKey in sync with prop (so auto-started track becomes active)
  useEffect(() => {
    setActiveKey(activeTrackKey || null);
  }, [activeTrackKey]);

  // Build { key -> { name, blob, _url } } for local plays
  // Properly manage blob URL lifecycle to prevent memory leaks
  const trackMap = useMemo(() => {
    const m = new Map();
    const newUrls = new Set();

    tracks.forEach((t) => {
      if (t.blob instanceof Blob) {
        const url = URL.createObjectURL(t.blob);
        m.set(t.key, { ...t, _url: url });
        newUrls.add(url);
      }
    });

    // Revoke old URLs that are no longer in use
    prevUrlsRef.current.forEach((oldUrl) => {
      if (!newUrls.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
      }
    });
    prevUrlsRef.current = newUrls;

    return m;
  }, [tracks]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      prevUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      prevUrlsRef.current.clear();
    };
  }, []);

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

    // If audio exists and we're resuming the same track, just play (don't change src)
    const currentKey = activeKey || activeTrackKey;
    if (a && a.src && key === currentKey) {
      try {
        await a.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn("Play failed:", e);
      }
      return;
    }

    // Different track or no audio - create/update the audio element
    if (!a) {
      a = new Audio();
      currentAudioRef.current = a;
    }

    a.src = item._url;
    a.loop = true;
    a.volume = volume;
    a.addEventListener("loadedmetadata", () => {
      setDuration(Number.isNaN(a.duration) ? 0 : a.duration);
    }, { once: true });

    try {
      await a.play();
      setActiveKey(key);
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
    <div className="card mt-6 w-full p-4 transition-all duration-200">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer rounded-lg p-2 -m-2 transition-all duration-200 hover:bg-[var(--color-bg-tertiary)]"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <Music size={20} style={{ color: 'var(--color-accent-primary)' }} />
          </div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Musique d'Ambiance
          </h3>
          {!isExpanded && (
            <div className="flex items-center gap-2 text-sm ml-2" style={{ color: 'var(--color-text-secondary)' }}>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isPlaying ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                title={isPlaying ? "Lecture en cours" : "En pause / arrêtée"}
              />
              <span>
                {currentName}
                {duration ? ` • ${formatTime(progress)} / ${formatTime(duration)}` : ""}
              </span>
            </div>
          )}
        </div>
        <div
          className="p-2 rounded-lg transition-all duration-200"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "rotate-0"}`}
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </div>
      </div>

      {/* Expanded list of per-track players */}
      {isExpanded && (
        <div className="mt-4 w-full space-y-3 fade-in">
          {tracks.length === 0 && (
            <div className="text-sm p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
              Aucune piste ajoutée pour cette salle.
            </div>
          )}

          {tracks.map(({ key, name }) => {
            const isActive = key === resolvedActiveKey;
            return (
              <div
                key={key}
                className="w-full rounded-xl p-4 transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                  border: `1px solid ${isActive ? 'var(--color-accent-primary)' : 'var(--color-border-light)'}`,
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-medium min-w-40" style={{ color: 'var(--color-text-primary)' }}>
                    {name}
                  </div>

                  <Controls
                    onPlay={() => handlePlayKey(key)}
                    onPause={() => handlePauseKey(key)}
                    onStop={() => handleStopKey(key)}
                    canPause={isActive && !!currentAudioRef.current}
                    canStop={isActive && !!currentAudioRef.current}
                  />

                  <div className="ml-auto text-sm tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {isActive ? (
                      <>
                        {formatTime(progress)} / {formatTime(duration)}
                        <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>
                          (-{formatTime((duration || 0) - (progress || 0))})
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>--:-- / --:--</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={isActive ? (duration || 0) : 0}
                    step={0.1}
                    value={isActive ? Math.min(progress, duration || 0) : 0}
                    onChange={(e) => isActive && handleSeekActive(e.target.value)}
                    disabled={!isActive || Number.isNaN(duration)}
                    className="w-full volume-slider"
                  />
                </div>

                {/* Volume control */}
                {isActive && (
                  <div className="mt-3 flex items-center gap-3">
                    <Volume2 size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => handleVolumeChange(e.target.value)}
                      className="w-32 volume-slider"
                    />
                    <span className="text-sm w-12" style={{ color: 'var(--color-text-muted)' }}>
                      {Math.round(volume * 100)}%
                    </span>
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
