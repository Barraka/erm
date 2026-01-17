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
import { defaultHints, playAudio } from "./utils/helperFile";
import BackgroundMusicManager from "./components/BackgroundMusicManager";
import BackgroundMusicPlayer from "./components/BackgroundMusicPlayer";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [hint, setHint] = useState("...");
  const [playerWindow, setPlayerWindow] = useState(null);
  const containerRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const backgroundAudioRef = useRef(null);
  const [soundEffects, setSoundEffects] = useState([]);
  const [backgroundTracks, setBackgroundTracks] = useState([]);
  const [currentTrackURL, setCurrentTrackURL] = useState(null);
  const [hintSound, setHintSound] = useState(null);
  const [soundRefreshKey, setSoundRefreshKey] = useState(0);
  const defaultTrackRef = useRef(null); //to be able to play the track when the timer starts
  const [endingTrack, setEndingTrack] = useState(null);
  const [endingThreshold, setEndingThreshold] = useState(300); // default: 5 minutes




  const {
    time,
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
      // Hints
      const stored = await getHints();
      if (stored.length > 0) {
        setPredefinedHints(stored);
      } else {
        setPredefinedHints(defaultHints);
        await saveHints(defaultHints);
      }

      // Background image and hint sound
      const bg = await getAsset('backgroundImage');
      const sound = await getAsset('hintSound');
      if (bg) setBackgroundImage(bg);
      if (sound) setHintSound(sound);

      // Load all sound effects
      const effects = await getAllSoundEffects();
      setSoundEffects(effects);

      // Filter music tracks
      const musicTracks = effects.filter(e => e.type === 'music');
      setBackgroundTracks(musicTracks);

      // Store default track in ref
      if (musicTracks.length > 0) {
        defaultTrackRef.current = musicTracks[0];
      }
      // Ending track
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

  const handleBackgroundChange = async (value) => {
    setBackgroundImage(value);
    await saveAsset('backgroundImage', value);
  };

  const handleSoundChange = async (value) => {
    setHintSound(value);
    await saveAsset('hintSound', value);
  };

  const handleBackgroundMusicChange = async (value) => {
    setBackgroundMusic(value);
    await saveAsset('backgroundMusic', value);
  };

  const playTrack = (trackOrUrl) => {
  if (backgroundAudioRef.current) {
    backgroundAudioRef.current.pause();
  }

  let src = trackOrUrl;
  if (typeof trackOrUrl === "object" && trackOrUrl instanceof Blob) {
    src = URL.createObjectURL(trackOrUrl);
  }

  const audio = new Audio(src);
  audio.loop = true;
  audio.play().catch(err => console.warn("Audio play failed:", err));
  backgroundAudioRef.current = audio;
  setCurrentTrackURL(src);
};


  const pauseTrack = () => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
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
    <div className="p-8">
      <div className="flex items-center justify-between bg-sky-200 p-4 rounded-md mb-6">
        <h1 className="text-3xl font-bold text-center tracking-wide text-gray-800 w-full">
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
            setSoundRefreshKey(prev => prev + 1); // trigger refresh inside modal too
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
        onStart={() => {
          setIsRunning(true);

          // Use first track if no current music manually selected
          if (backgroundTracks.length > 0 && !currentTrackURL) {
            const firstTrack = backgroundTracks[0];
            playTrack(firstTrack.blob);
            console.log("track playing");
          }
          else console.log("no tracks");
          
        }}

        onPause={() => {
          setIsRunning(false);
        }}
        onReset={() => {
          setIsRunning(false);
          setSeconds(60 * 60);
          if (backgroundAudioRef.current) {
            backgroundAudioRef.current.pause();
            backgroundAudioRef.current.currentTime = 0;
            backgroundAudioRef.current = null;
            setCurrentTrackURL(null);
          }
        }}
        onAddTime={handleAddTime}
      />

      <BackgroundMusicPlayer tracks={backgroundTracks} />

      <SoundEffectPlayer soundEffects={soundEffects.filter(s => s.type !== "music")} />


      <ManageHints
        inputValue={inputValue}
        setInputValue={setInputValue}
        hint={hint}
        setHint={setHint}
        predefinedHints={predefinedHints}
        updateHints={updateHints}
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
