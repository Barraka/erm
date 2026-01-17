import addIcon from '../assets/add.png';
import minusIcon from '../assets/minus.png'; // note spelling if intentional

export default function TimerDisplay({ time, realTime, onStart, onPause, onReset, onAddTime }) {
  const [minutes, seconds] = time.split(":").map(Number);

  return (
    <div className="text-center my-8">
      <div className="inline-flex justify-center items-center gap-8 text-6xl font-bold tracking-widest bg-slate-400 text-slate-50 px-6 py-4 rounded-xl shadow-md mx-auto">
        {/* Minutes block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddTime(-60)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={minusIcon} alt="minus" className="w-4 h-4" />
            </button>

            <span>{minutes.toString().padStart(2, "0")}</span>
            <button
              onClick={() => onAddTime(60)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={addIcon} alt="add" className="w-4 h-4" />
            </button>
          </div>
          <span className="text-lg mt-1">min</span>
        </div>

        <div className="text-6xl">:</div>

        {/* Seconds block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddTime(-10)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={minusIcon} alt="minus" className="w-4 h-4" />
            </button>
            <span>{seconds.toString().padStart(2, "0")}</span>
            <button
              onClick={() => onAddTime(10)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={addIcon} alt="add" className="w-4 h-4" />
            </button>
          </div>
          <span className="text-lg mt-1">sec</span>
        </div>
      </div>

      {/* 👇 Secondary "real" timer (added) */}
      <p className="text-lg  mt-2 text-slate-50">
        {realTime}
      </p>

      {/* Control buttons (unchanged) */}
      <div className="mt-6 space-x-2">
        <button onClick={onStart} className="bg-green-500 text-white px-5 py-2 rounded shadow hover:bg-green-600">
          Start
        </button>
        <button onClick={onPause} className="bg-yellow-500 text-white px-5 py-2 rounded shadow hover:bg-yellow-600">
          Pause
        </button>
        <button onClick={onReset} className="bg-red-500 text-white px-5 py-2 rounded shadow hover:bg-red-600">
          Reset
        </button>
      </div>
    </div>
  );
}
