import { useState, useEffect } from "react";

export default function Timer() {
  const [time, setTime] = useState(60 * 60); // 60 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = () => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="text-center my-4">
      <h2 className="text-4xl font-bold">{formatTime()}</h2>
      <div className="mt-2 space-x-2">
        <button onClick={() => setIsRunning(true)} className="bg-green-500 text-white px-4 py-1 rounded">Start</button>
        <button onClick={() => setIsRunning(false)} className="bg-yellow-500 text-white px-4 py-1 rounded">Pause</button>
        <button onClick={() => { setIsRunning(false); setTime(60 * 60); }} className="bg-red-500 text-white px-4 py-1 rounded">Reset</button>
      </div>
    </div>
  );
}
