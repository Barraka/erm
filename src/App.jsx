import { useState, useEffect, useRef } from "react";
import TimerDisplay from "./components/TimerDisplay";
import SecondaryScreen from "./components/SecondaryScreen";
import SettingsModal from "./components/SettingsModal";
import cogIcon from './assets/cog.png';
import ManageHints from "./components/ManageHints";
import ManageScreen from "./components/ManageScreen";
import hintSoundDefault from "./assets/hint.mp3";
import { getAllSoundEffects, getHints, saveHints, getAsset, saveAsset } from './utils/soundEffectsDB';
import SoundEffectPlayer from "./components/SoundEffectPlayer";
import useTimer from "./hooks/useTimer";
import { defaultHints } from "./utils/helperFile";
import BackgroundMusicPlayer from "./components/BackgroundMusicPlayer";


function App() {
  const [inputValue, setInputValue] = useState("");
  const [hint, setHint] = useState("");
  const [playerWindow, setPlayerWindow] = useState(null);
  const containerRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
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

  const {
    time,
    realTime,
    resetTimer,
    seconds,
    setSeconds,
    isRunning,
    setIsRunning,
  } = useTimer(60 * 60);

  const handleAddTime = (delta) => {
    setSeconds((prev) => Math.max(0, prev + delta));
  };

  const [predefinedHints, setPredefinedHints] = useState([]);

  useEffect(() => {
    async function loadInitialData() {
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

      const musicTracks = effects.filter(e => e.type === 'music');
      setBackgroundTracks(musicTracks);
      if (musicTracks.length > 0) {
        defaultTrackRef.current = musicTracks[0];
      }

      const storedThreshold = await getAsset("endingTrackThreshold");
      if (storedThreshold != null) {
        setEndingThreshold(storedThreshold);
      }
    }

    loadInitialData();
  }, []);

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
    setCurrentTrackURL(null);
    setActiveTrackKey(null);
  };

  const openPlayerWindow = () => {
    const win = window.open("", "PlayerScreen", "width=800,height=600");
    if (!win) return;

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

  const closePlayerWindow = () => {
    if (playerWindow && !playerWindow.closed) {
      playerWindow.close();
      setPlayerWindow(null);
      containerRef.current = null;
    }
  };

  const handleEndingTrackChange = async (value) => {
    setEndingTrack(value);
    await saveAsset("endingTrack", value);
  };

  const handleEndingThresholdChange = async (value) => {
    setEndingThreshold(value);
    await saveAsset("endingTrackThreshold", value);
  };

  return (
    <div className="p-8 bg-slate-600 min-h-screen">
      <div className="flex items-center justify-between bg-slate-400 p-4 rounded-md mb-6">
        <h1 className="text-3xl font-bold text-center tracking-wide text-slate-50 w-full">
          Escape Room Manager
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          className="ml-4 p-2 hover:rotate-180  transition bg-slate-800 rounded-full"
          title="Paramètres"
        >
          <img src={cogIcon} alt="Settings" className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onBackgroundChange={handleBackgroundChange}
          onSoundChange={handleSoundChange}
          onBackgroundMusicChange={handleBackgroundMusicChange}
          onSoundEffectsUpdate={async () => {
            const effects = await getAllSoundEffects();
            setSoundEffects(effects);
            setBackgroundTracks(effects.filter(e => e.type === "music"));
            setSoundRefreshKey(prev => prev + 1);
          }}
          refreshKey={soundRefreshKey}
          endingThreshold={endingThreshold}
          onEndingThresholdChange={handleEndingThresholdChange}
          onEndingTrackChange={handleEndingTrackChange}
        />
      )}

      <ManageScreen
        playerWindow={playerWindow}
        openPlayerWindow={openPlayerWindow}
        closePlayerWindow={closePlayerWindow}
      />

      <TimerDisplay
        time={time}
        realTime={realTime}
        onStart={() => {
          setIsRunning(true);
          if (backgroundTracks.length > 0 && !activeTrackKey) {
            playTrack(backgroundTracks[0]);
          }
        }}
        onPause={() => {
          setIsRunning(false);
        }}
        onReset={() => {
          setIsRunning(false);
          setSeconds(60 * 60);
          resetTimer();  
          stopTrack();
        }}
        onAddTime={handleAddTime}
      />

      <BackgroundMusicPlayer
        tracks={backgroundTracks}
        activeTrackKey={activeTrackKey}
        onPause={pauseTrack}
        onStop={stopTrack}
        currentAudioRef={backgroundAudioRef}
        isSessionRunning={isRunning}
      />

      <SoundEffectPlayer soundEffects={soundEffects.filter(s => s.type !== "music")} />

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
      />

      {playerWindow && containerRef.current && (
        <SecondaryScreen
          container={containerRef.current}
          hint={hint}
          time={time}
          backgroundImage={backgroundImage}
        />
      )}
    </div>
  );
}

export default App;
