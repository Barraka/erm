import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Sparkles, Volume2, Trophy, Skull } from "lucide-react";
import Controls from "./Controls";

export default function SoundEffectPlayer({
  effects: effectsProp = [],
  activeEffectKey,           // optional: for header summary if parent auto-triggers an SFX
  onPause,                   // optional callback when effect is paused
  onStop,                    // optional callback when effect is stopped
}) {
  const effects = Array.isArray(effectsProp) ? effectsProp : [];

  const [isExpanded, setIsExpanded] = useState(false);

  // Track previous blob URLs to properly revoke them when effects change
  const prevUrlsRef = useRef(new Set());

  // Build { key -> { name, blob, _url } } for effects
  // Properly manage blob URL lifecycle to prevent memory leaks
  const effectMap = useMemo(() => {
    const m = new Map();
    const newUrls = new Set();

    for (const e of effects) {
      if (!e) continue;
      let url = e._url;

      if (!url) {
        if (typeof e.blob === "string") {
          url = e.blob; // Already a URL string
        } else if (e.blob instanceof Blob) {
          url = URL.createObjectURL(e.blob);
          newUrls.add(url);
        }
      } else if (url.startsWith("blob:")) {
        newUrls.add(url);
      }

      m.set(e.key, { ...e, _url: url });
    }

    // Revoke old blob URLs that are no longer in use
    prevUrlsRef.current.forEach((oldUrl) => {
      if (!newUrls.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
      }
    });
    prevUrlsRef.current = newUrls;

    return m;
  }, [effects]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      prevUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      prevUrlsRef.current.clear();
    };
  }, []);

  const instancesRef = useRef(new Map());
  const [rowState, setRowState] = useState(new Map());
  const [volume, setVolume] = useState(1);

  const latestFor = (key) => {
    const list = instancesRef.current.get(key) || [];
    const alive = list.filter((a) => a && !a.ended);
    if (alive.length !== list.length) instancesRef.current.set(key, alive);
    return alive[alive.length - 1] || null;
  };

  useEffect(() => {
    let rafId;
    const tick = () => {
      setRowState((prev) => {
        let hasChanges = false;
        const next = new Map(prev);

        for (const eff of effects) {
          if (!eff) continue;
          const key = eff.key;
          const inst = latestFor(key);
          const prevState = prev.get(key);

          let newState;
          if (inst && !Number.isNaN(inst.duration)) {
            newState = {
              progress: inst.currentTime || 0,
              duration: inst.duration || 0,
              isPlaying: !inst.paused && !inst.ended,
              hasAny: true,
            };
          } else {
            newState = {
              progress: 0,
              duration: prevState?.duration || 0,
              isPlaying: false,
              hasAny: (instancesRef.current.get(key) || []).length > 0,
            };
          }

          // Only update if values actually changed
          if (!prevState ||
              Math.abs(prevState.progress - newState.progress) > 0.05 ||
              prevState.duration !== newState.duration ||
              prevState.isPlaying !== newState.isPlaying ||
              prevState.hasAny !== newState.hasAny) {
            next.set(key, newState);
            hasChanges = true;
          }
        }

        return hasChanges ? next : prev;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effects.length]);

  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handlePlayKey = async (key) => {
    const item = effectMap.get(key);
    if (!item || !item._url) return;

    // Check if there's an existing paused instance to resume
    const existingInst = latestFor(key);
    if (existingInst && existingInst.paused && !existingInst.ended) {
      try {
        await existingInst.play();
        setRowState((prev) => {
          const next = new Map(prev);
          const cur = next.get(key) || { progress: 0, duration: 0, isPlaying: false, hasAny: false };
          next.set(key, { ...cur, isPlaying: true });
          return next;
        });
      } catch (e) {
        console.warn("SFX resume failed:", e);
      }
      return;
    }

    const a = new Audio(item._url);
    a.loop = false;
    a.volume = volume;

    a.addEventListener(
      "loadedmetadata",
      () => {
        setRowState((prev) => {
          const next = new Map(prev);
          const cur = next.get(key) || { progress: 0, duration: 0, isPlaying: false, hasAny: false };
          next.set(key, { ...cur, duration: Number.isNaN(a.duration) ? 0 : a.duration });
          return next;
        });
      },
      { once: true }
    );

    a.addEventListener("ended", () => {
      setRowState((prev) => {
        const next = new Map(prev);
        const cur = next.get(key);
        if (cur) next.set(key, { ...cur, isPlaying: false });
        return next;
      });
    });

    const list = instancesRef.current.get(key) || [];
    list.push(a);
    instancesRef.current.set(key, list);

    try {
      await a.play();
      setRowState((prev) => {
        const next = new Map(prev);
        const cur = next.get(key) || { progress: 0, duration: 0, isPlaying: false, hasAny: false };
        next.set(key, { ...cur, isPlaying: true, hasAny: true });
        return next;
      });
    } catch (e) {
      console.warn("SFX play failed:", e);
    }
  };

  const handlePauseKey = (key) => {
    const inst = latestFor(key);
    if (!inst) return;
    inst.pause();
    onPause && onPause(key);
    setRowState((prev) => {
      const next = new Map(prev);
      const cur = next.get(key);
      if (cur) next.set(key, { ...cur, isPlaying: false });
      return next;
    });
  };

  const handleStopKey = (key) => {
    const inst = latestFor(key);
    if (!inst) return;
    inst.pause();
    inst.currentTime = 0;
    onStop && onStop(key);
    setRowState((prev) => {
      const next = new Map(prev);
      const cur = next.get(key);
      if (cur) next.set(key, { ...cur, isPlaying: false, progress: 0 });
      return next;
    });
  };

  const handleSeekActive = (key, val) => {
    const inst = latestFor(key);
    if (!inst || Number.isNaN(inst.duration)) return;
    inst.currentTime = Number(val);
    setRowState((prev) => {
      const next = new Map(prev);
      const cur = next.get(key);
      if (cur) next.set(key, { ...cur, progress: inst.currentTime });
      return next;
    });
  };

  const handleVolumeChange = (val) => {
    const newVolume = Number(val);
    setVolume(newVolume);
    // Apply to all active sound effect instances
    instancesRef.current.forEach((list) => {
      list.forEach((audio) => {
        if (audio && !audio.ended) {
          audio.volume = newVolume;
        }
      });
    });
  };

  // Role badge renderer with Lucide icons
  const roleBadge = (role) =>
    role === "victory" ? (
      <span
        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-medium"
        style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'var(--color-success)' }}
      >
        <Trophy size={12} />
        Victoire
      </span>
    ) : role === "defeat" ? (
      <span
        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-medium"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }}
      >
        <Skull size={12} />
        Défaite
      </span>
    ) : null;

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
            <Sparkles size={20} style={{ color: 'var(--color-warning)' }} />
          </div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Effets Sonores
          </h3>
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

      {/* Expanded list */}
      {isExpanded && (
        <div className="mt-4 w-full space-y-3 fade-in">
          {/* Global volume control for all effects */}
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', borderBottom: `1px solid var(--color-border-light)` }}
          >
            <Volume2 size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Volume global</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-32 volume-slider"
            />
            <span className="text-sm w-12" style={{ color: 'var(--color-text-muted)' }}>{Math.round(volume * 100)}%</span>
          </div>

          {effects.length === 0 && (
            <div className="text-sm p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
              Aucun effet ajouté.
            </div>
          )}

          {effects.map?.(({ key, name, role }) => {
            const st =
              rowState.get(key) || { progress: 0, duration: 0, isPlaying: false, hasAny: false };
            const canControl = !!latestFor(key);
            return (
              <div
                key={key}
                className="w-full rounded-xl p-4 transition-all duration-200"
                style={{
                  backgroundColor: st.isPlaying ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                  border: `1px solid ${st.isPlaying ? 'var(--color-accent-primary)' : 'var(--color-border-light)'}`,
                  boxShadow: st.isPlaying ? 'var(--shadow-glow)' : 'none'
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-medium min-w-40 flex items-center gap-1" style={{ color: 'var(--color-text-primary)' }}>
                    {name}
                    {roleBadge(role)}
                  </div>

                  <Controls
                    onPlay={() => handlePlayKey(key)}
                    onPause={() => handlePauseKey(key)}
                    onStop={() => handleStopKey(key)}
                  />

                  <div className="ml-auto text-sm tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {canControl && st.duration > 0 ? (
                      <>
                        {formatTime(st.progress)} / {formatTime(st.duration)}
                        <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>
                          (-{formatTime((st.duration || 0) - (st.progress || 0))})
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
                    max={canControl ? st.duration || 0 : 0}
                    step={0.05}
                    value={canControl ? Math.min(st.progress, st.duration || 0) : 0}
                    onChange={(e) => canControl && handleSeekActive(key, e.target.value)}
                    disabled={!canControl || Number.isNaN(st.duration)}
                    className="w-full volume-slider"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
