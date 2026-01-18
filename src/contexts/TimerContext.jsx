import { createContext, useContext, useCallback, useState, useRef } from "react";
import useTimer from "../hooks/useTimer";

const TimerContext = createContext(null);

export function TimerProvider({ children, initialSeconds = 60 * 60 }) {
  const [roomDuration, setRoomDuration] = useState(initialSeconds);
  const timer = useTimer(initialSeconds);

  // Use ref to track isRunning without causing callback recreation
  const isRunningRef = useRef(timer.isRunning);
  isRunningRef.current = timer.isRunning;

  const addTime = useCallback((delta) => {
    timer.setSeconds((prev) => Math.max(0, prev + delta));
  }, [timer.setSeconds]);

  const start = useCallback(() => {
    timer.setIsRunning(true);
  }, [timer.setIsRunning]);

  const pause = useCallback(() => {
    timer.setIsRunning(false);
  }, [timer.setIsRunning]);

  const reset = useCallback(() => {
    timer.setIsRunning(false);
    timer.setSeconds(roomDuration);
    timer.resetTimer();
  }, [timer.setIsRunning, timer.setSeconds, timer.resetTimer, roomDuration]);

  // Update room duration and reset timer to new duration
  // Uses ref to check isRunning to keep callback stable (no dependency on timer.isRunning)
  const updateRoomDuration = useCallback((newDuration) => {
    setRoomDuration(newDuration);
    // Only update current time if timer is not running
    if (!isRunningRef.current) {
      timer.setSeconds(newDuration);
    }
  }, [timer.setSeconds]);

  const value = {
    // State
    time: timer.time,
    realTime: timer.realTime,
    seconds: timer.seconds,
    isRunning: timer.isRunning,
    sessionActive: timer.sessionActive,
    roomDuration,
    // Actions
    addTime,
    start,
    pause,
    reset,
    setSeconds: timer.setSeconds,
    setIsRunning: timer.setIsRunning,
    updateRoomDuration,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerContext must be used within a TimerProvider");
  }
  return context;
}
