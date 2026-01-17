import addIcon from '../assets/add.png';
import minusIcon from '../assets/minus.png';
import { useTimerContext } from '../contexts/TimerContext';

export default function TimerDisplay({ onStart, onReset }) {
  const { time, realTime, addTime, start, pause, reset } = useTimerContext();
  const [minutes, seconds] = time.split(":").map(Number);

  const handleStart = () => {
    start();
    onStart && onStart();
  };

  const handlePause = () => {
    pause();
  };

  const handleReset = () => {
    reset();
    onReset && onReset();
  };

  return (
    <div className="text-center my-8" role="timer" aria-label="Minuteur de la session">
      <div className="inline-flex justify-center items-center gap-8 text-6xl font-bold tracking-widest bg-slate-400 text-slate-50 px-6 py-4 rounded-xl shadow-md mx-auto">
        {/* Minutes block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => addTime(-60)}
              aria-label="Retirer 1 minute"
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={minusIcon} alt="" className="w-4 h-4" />
            </button>

            <span aria-label={`${minutes} minutes`}>{minutes.toString().padStart(2, "0")}</span>
            <button
              onClick={() => addTime(60)}
              aria-label="Ajouter 1 minute"
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={addIcon} alt="" className="w-4 h-4" />
            </button>
          </div>
          <span className="text-lg mt-1">min</span>
        </div>

        <div className="text-6xl" aria-hidden="true">:</div>

        {/* Seconds block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => addTime(-10)}
              aria-label="Retirer 10 secondes"
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={minusIcon} alt="" className="w-4 h-4" />
            </button>
            <span aria-label={`${seconds} secondes`}>{seconds.toString().padStart(2, "0")}</span>
            <button
              onClick={() => addTime(10)}
              aria-label="Ajouter 10 secondes"
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-sky-300 rounded-full shadow"
            >
              <img src={addIcon} alt="" className="w-4 h-4" />
            </button>
          </div>
          <span className="text-lg mt-1">sec</span>
        </div>
      </div>

      {/* Secondary "real" timer */}
      <p className="text-lg mt-2 text-slate-50" aria-label="Temps réel écoulé">
        {realTime}
      </p>

      {/* Control buttons */}
      <div className="mt-6 space-x-2" role="group" aria-label="Contrôles du minuteur">
        <button onClick={handleStart} aria-label="Démarrer le minuteur" className="bg-green-500 text-white px-5 py-2 rounded shadow hover:bg-green-600">
          Start
        </button>
        <button onClick={handlePause} aria-label="Mettre en pause le minuteur" className="bg-yellow-500 text-white px-5 py-2 rounded shadow hover:bg-yellow-600">
          Pause
        </button>
        <button onClick={handleReset} aria-label="Réinitialiser le minuteur" className="bg-red-500 text-white px-5 py-2 rounded shadow hover:bg-red-600">
          Reset
        </button>
      </div>
    </div>
  );
}
