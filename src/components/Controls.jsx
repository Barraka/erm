import playIcon from "../assets/play.png";
import pauseIcon from "../assets/pause.png";
import stopIcon from "../assets/stop.png";

export default function Controls({
  onPlay,
  onPause,
  onStop,
  canPause = true,
  canStop = true,
  size = "md",
  className = "",
  titles = { play: "Lire", pause: "Pause", stop: "Stop" },
}) {
  // Size presets for consistent button + icon sizing
  const sizes = {
    sm: { btn: "px-2 py-1", img: "w-4 h-4" },
    md: { btn: "px-3 py-2", img: "w-5 h-5" },
    lg: { btn: "px-4 py-3", img: "w-6 h-6" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onPlay}
        className={`${s.btn} rounded bg-green-400 text-white hover:bg-green-600`}
        title={titles.play}
        aria-label={titles.play}
      >
        <img src={playIcon} alt={titles.play} className={s.img} />
      </button>

      <button
        onClick={onPause}
        disabled={!canPause}
        className={`${s.btn} rounded text-white ${
          canPause ? "bg-yellow-300 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"
        }`}
        title={titles.pause}
        aria-label={titles.pause}
      >
        <img src={pauseIcon} alt={titles.pause} className={s.img} />
      </button>

      <button
        onClick={onStop}
        disabled={!canStop}
        className={`${s.btn} rounded text-white ${
          canStop ? "bg-red-300 hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"
        }`}
        title={titles.stop}
        aria-label={titles.stop}
      >
        <img src={stopIcon} alt={titles.stop} className={s.img} />
      </button>
    </div>
  );
}
