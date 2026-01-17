import { useState, useEffect, useRef } from "react";

export default function useTimer(initialSeconds = 60 * 60) {
  // Main (adjustable) countdown
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // Secondary "real" timer: count-up from 0 (ignores Pause)
  const [sessionActive, setSessionActive] = useState(false);
  const [realSeconds, setRealSeconds] = useState(0); // <-- count-up from 0

  const mainIntervalRef = useRef(null);
  const realIntervalRef = useRef(null);
  const prevIsRunningRef = useRef(false);

  // Main countdown: only when isRunning
  useEffect(() => {
    if (isRunning) {
      if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
      mainIntervalRef.current = setInterval(() => {
        setSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (mainIntervalRef.current) {
        clearInterval(mainIntervalRef.current);
        mainIntervalRef.current = null;
      }
    }
    return () => {
      if (mainIntervalRef.current) {
        clearInterval(mainIntervalRef.current);
        mainIntervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Real timer: increments every second while sessionActive
  useEffect(() => {
    if (sessionActive) {
      if (realIntervalRef.current) clearInterval(realIntervalRef.current);
      realIntervalRef.current = setInterval(() => {
        setRealSeconds(prev => prev + 1); // <-- increment, no cap
      }, 1000);
    } else {
      if (realIntervalRef.current) {
        clearInterval(realIntervalRef.current);
        realIntervalRef.current = null;
      }
    }
    return () => {
      if (realIntervalRef.current) {
        clearInterval(realIntervalRef.current);
        realIntervalRef.current = null;
      }
    };
  }, [sessionActive]);

  // First time Start is pressed, activate the real timer (keeps active across pauses)
  useEffect(() => {
    const wasRunning = prevIsRunningRef.current;
    if (!wasRunning && isRunning) setSessionActive(true);
    prevIsRunningRef.current = isRunning;
  }, [isRunning]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const resetTimer = () => {
    // Stop intervals immediately
    if (mainIntervalRef.current) {
      clearInterval(mainIntervalRef.current);
      mainIntervalRef.current = null;
    }
    if (realIntervalRef.current) {
      clearInterval(realIntervalRef.current);
      realIntervalRef.current = null;
    }

    // Reset flags & values
    setIsRunning(false);
    setSessionActive(false);
    prevIsRunningRef.current = false;

    setSeconds(initialSeconds); // main countdown back to 60:00
    setRealSeconds(0);          // real timer back to 0:00
  };

  return {
    // formatted
    time: formatTime(seconds),
    realTime: formatTime(realSeconds),

    // raw values if needed
    seconds,
    realSeconds,

    // controls
    setSeconds,   // used by +/- buttons for main timer only
    isRunning,
    setIsRunning, // Start/Pause for main timer
    resetTimer,   // resets both
  };
}
