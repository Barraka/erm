import { useState, useEffect, useRef, useCallback } from "react";
import { Settings } from "lucide-react";
import TimerDisplay from "./components/TimerDisplay";
import SecondaryScreen from "./components/SecondaryScreen";
import SettingsModal from "./components/SettingsModal";
import ManageHints from "./components/ManageHints";
import ManageScreen from "./components/ManageScreen";
import EndSessionModal from "./components/EndSessionModal";
import hintSoundDefault from "./assets/hint.mp3";
import { getAllSoundEffects, getHints, saveHints, getAsset, saveAsset, filterMusicTracks, filterSoundEffects, saveSession } from './utils/soundEffectsDB';
import SoundEffectPlayer from "./components/SoundEffectPlayer";
import { defaultHints } from "./utils/helperFile";
import BackgroundMusicPlayer from "./components/BackgroundMusicPlayer";
import { TimerProvider, useTimerContext } from "./contexts/TimerContext";
import { useToast } from "./components/ToastProvider";


function AppContent() {
  const { time, seconds, isRunning, roomDuration, updateRoomDuration, reset } = useTimerContext();
  const { showToast } = useToast();

  const [inputValue, setInputValue] = useState("");
  const [hint, setHint] = useState("");
  const [playerWindow, setPlayerWindow] = useState(null);
  const containerRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [hintsGivenCount, setHintsGivenCount] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const backgroundAudioRef = useRef(null);
  const [soundEffects, setSoundEffects] = useState([]);
  const [backgroundTracks, setBackgroundTracks] = useState([]);
  const [currentTrackURL, setCurrentTrackURL] = useState(null);
  const [activeTrackKey, setActiveTrackKey] = useState(null);
  const [hintSound, setHintSound] = useState(null);
  const [soundRefreshKey, setSoundRefreshKey] = useState(0);
  const defaultTrackRef = useRef(null);
  const [endingTrack, setEndingTrack] = useState(null);
  const [endingThreshold, setEndingThreshold] = useState(300);

  const [predefinedHints, setPredefinedHints] = useState([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const stored = await getHints();
        if (stored.length > 0) {
          setPredefinedHints(stored);
        } else {
          setPredefinedHints(defaultHints);
          await saveHints(defaultHints);
        }

        const bg = await getAsset('backgroundImage');
        const sound = await getAsset('hintSound');
        if (bg) setBackgroundImage(bg);
        if (sound) setHintSound(sound);

        const effects = await getAllSoundEffects();
        setSoundEffects(effects);

        const musicTracks = filterMusicTracks(effects);
        setBackgroundTracks(musicTracks);
        if (musicTracks.length > 0) {
          defaultTrackRef.current = musicTracks[0];
        }

        const storedThreshold = await getAsset("endingTrackThreshold");
        if (storedThreshold != null) {
          setEndingThreshold(storedThreshold);
        }

        const storedRoomDuration = await getAsset("roomDuration");
        if (storedRoomDuration != null) {
          updateRoomDuration(storedRoomDuration);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        showToast("Erreur de chargement des données. Utilisation des valeurs par défaut.", "error");
        setPredefinedHints(defaultHints);
      }
    }

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast, updateRoomDuration]);

  const updateHints = async (index, value) => {
    const newHints = [...predefinedHints];
    newHints[index] = value;
    setInputValue(value);
    setHint(value);
    setPredefinedHints(newHints);
    await saveHints(newHints);
  };

  const deleteHint = async (index) => {
    const newHints = predefinedHints.filter((_, i) => i !== index);
    setPredefinedHints(newHints);
    await saveHints(newHints);
  };

  const handleBackgroundChange = async (value) => {
    setBackgroundImage(value);
    await saveAsset('backgroundImage', value);
  };

  const handleSoundChange = async (value) => {
    setHintSound(value);
    await saveAsset('hintSound', value);
  };

  const handleBackgroundMusicChange = async (value) => {
    await saveAsset('backgroundMusic', value);
  };

  const playTrack = (track) => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }

    // Revoke previous blob URL to prevent memory leak
    if (currentTrackURL) {
      URL.revokeObjectURL(currentTrackURL);
    }

    const src = URL.createObjectURL(track.blob);
    const audio = new Audio(src);
    audio.loop = true;
    audio.play().catch(err => console.warn("Audio play failed:", err));
    backgroundAudioRef.current = audio;

    setCurrentTrackURL(src);
    setActiveTrackKey(track.key);
  };

  const pauseTrack = () => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
  };

  const stopTrack = () => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
      backgroundAudioRef.current.currentTime = 0;
      backgroundAudioRef.current = null;
    }
    // Revoke blob URL to prevent memory leak
    if (currentTrackURL) {
      URL.revokeObjectURL(currentTrackURL);
    }
    setCurrentTrackURL(null);
    setActiveTrackKey(null);
  };

  const openPlayerWindow = () => {
    const win = window.open("", "PlayerScreen", "width=800,height=600");
    if (!win) {
      showToast("Pop-up bloqué. Veuillez autoriser les pop-ups pour utiliser l'écran secondaire.", "error");
      return;
    }

    win.document.title = "Escape Room Screen";
    win.document.body.style.backgroundColor = "white";
    win.document.body.style.margin = "0";
    win.document.body.style.height = "100vh";
    win.document.body.style.display = "flex";
    win.document.body.style.flexDirection = "column";
    win.document.body.style.justifyContent = "center";
    win.document.body.style.alignItems = "center";
    win.document.body.style.fontFamily = "sans-serif";

    const container = win.document.createElement("div");
    win.document.body.appendChild(container);
    containerRef.current = container;

    const mainCssLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .find(link => link.href.includes('.css'));

    if (mainCssLink) {
      const styleLink = document.createElement("link");
      styleLink.rel = "stylesheet";
      styleLink.href = mainCssLink.href;
      win.document.head.appendChild(styleLink);
    }
    document.querySelectorAll('style').forEach((style) => {
      win.document.head.appendChild(style.cloneNode(true));
    });

    setPlayerWindow(win);
  };

  const closePlayerWindow = useCallback(() => {
    if (playerWindow && !playerWindow.closed) {
      playerWindow.close();
    }
    setPlayerWindow(null);
    containerRef.current = null;
  }, [playerWindow]);

  // Called when the secondary window is closed externally (user clicks X)
  const handleSecondaryWindowClosed = useCallback(() => {
    setPlayerWindow(null);
    containerRef.current = null;
  }, []);

  const handleEndingTrackChange = async (value) => {
    setEndingTrack(value);
    await saveAsset("endingTrack", value);
  };

  const handleEndingThresholdChange = async (value) => {
    setEndingThreshold(value);
    await saveAsset("endingTrackThreshold", value);
  };

  const handleRoomDurationChange = async (value) => {
    updateRoomDuration(value);
    await saveAsset("roomDuration", value);
  };

  // Callback for TimerDisplay - start music when timer starts
  const handleTimerStart = () => {
    if (backgroundTracks.length > 0 && !activeTrackKey) {
      playTrack(backgroundTracks[0]);
    }
  };

  // Show end session modal
  const handleEndSession = () => {
    setShowEndSessionModal(true);
  };

  // Handle session end with result
  const handleSessionEnd = async (result) => {
    try {
      await saveSession({
        result,
        roomDuration,
        timeRemaining: seconds,
        hintsGiven: hintsGivenCount,
      });
      showToast(result === 'victory' ? 'Victoire enregistrée !' : 'Défaite enregistrée.', 'success');
    } catch (error) {
      console.error('Failed to save session:', error);
      showToast('Erreur lors de l\'enregistrement de la session.', 'error');
    }
    // Reset the timer and state
    reset();
    stopTrack();
    setHintsGivenCount(0);
    setHint("");
    setShowEndSessionModal(false);
  };

  // Cancel end session (don't save)
  const handleCancelEndSession = () => {
    reset();
    stopTrack();
    setHintsGivenCount(0);
    setHint("");
    setShowEndSessionModal(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <header className="card flex items-center justify-between p-4 mb-6 fade-in">
        <div className="flex-1" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
          Escape Room Manager
        </h1>
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl transition-all duration-200 hover:rotate-90"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Paramètres"
            aria-label="Ouvrir les paramètres"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onBackgroundChange={handleBackgroundChange}
          onSoundChange={handleSoundChange}
          onBackgroundMusicChange={handleBackgroundMusicChange}
          onSoundEffectsUpdate={async () => {
            const effects = await getAllSoundEffects();
            setSoundEffects(effects);
            setBackgroundTracks(filterMusicTracks(effects));
            setSoundRefreshKey(prev => prev + 1);
          }}
          refreshKey={soundRefreshKey}
          endingThreshold={endingThreshold}
          onEndingThresholdChange={handleEndingThresholdChange}
          onEndingTrackChange={handleEndingTrackChange}
          roomDuration={roomDuration}
          onRoomDurationChange={handleRoomDurationChange}
        />
      )}

      {showEndSessionModal && (
        <EndSessionModal
          onVictory={() => handleSessionEnd('victory')}
          onDefeat={() => handleSessionEnd('defeat')}
          onCancel={handleCancelEndSession}
          onDismiss={() => setShowEndSessionModal(false)}
        />
      )}

      <ManageScreen
        playerWindow={playerWindow}
        openPlayerWindow={openPlayerWindow}
        closePlayerWindow={closePlayerWindow}
      />

      <TimerDisplay
        onStart={handleTimerStart}
        onEndSession={handleEndSession}
      />

      <BackgroundMusicPlayer
        tracks={backgroundTracks}
        activeTrackKey={activeTrackKey}
        onPause={pauseTrack}
        onStop={stopTrack}
        currentAudioRef={backgroundAudioRef}
        isSessionRunning={isRunning}
      />

      <SoundEffectPlayer effects={filterSoundEffects(soundEffects)} />

      <ManageHints
        inputValue={inputValue}
        setInputValue={setInputValue}
        hint={hint}
        setHint={setHint}
        predefinedHints={predefinedHints}
        updateHints={updateHints}
        deleteHint={deleteHint}
        hintSound={hintSound}
        defaultSound={hintSoundDefault}
        onHintSent={() => setHintsGivenCount(prev => prev + 1)}
      />

      {playerWindow && containerRef.current && (
        <SecondaryScreen
          container={containerRef.current}
          hint={hint}
          time={time}
          backgroundImage={backgroundImage}
          onWindowClosed={handleSecondaryWindowClosed}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <TimerProvider initialSeconds={60 * 60}>
      <AppContent />
    </TimerProvider>
  );
}

export default App;
