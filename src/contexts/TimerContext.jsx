import { createContext, useContext, useCallback } from "react";
import useTimer from "../hooks/useTimer";

const TimerContext = createContext(null);

export function TimerProvider({ children, initialSeconds = 60 * 60 }) {
  const timer = useTimer(initialSeconds);

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
    timer.setSeconds(initialSeconds);
    timer.resetTimer();
  }, [timer.setIsRunning, timer.setSeconds, timer.resetTimer, initialSeconds]);

  const value = {
    // State
    time: timer.time,
    realTime: timer.realTime,
    seconds: timer.seconds,
    isRunning: timer.isRunning,
    // Actions
    addTime,
    start,
    pause,
    reset,
    setSeconds: timer.setSeconds,
    setIsRunning: timer.setIsRunning,
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
