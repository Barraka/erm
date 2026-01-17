import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";

function PlayerContent({ time, hint, backgroundImage }) {
  const [animKey, setAnimKey] = useState(0);
  const prevHintRef = useRef(hint);

  // Increment animKey whenever the hint text *value* changes (including same length etc.)
  useEffect(() => {
    if (prevHintRef.current !== hint) {
      setAnimKey((k) => k + 1);
      prevHintRef.current = hint;
    }
  }, [hint]);

  return (
    <div
      className="flex flex-col justify-start items-stretch h-screen w-screen text-center px-4"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Timer */}
      <div className="flex items-center justify-center h-1/3 p-12 text-center">
        <h1 className="text-6xl font-bold rounded-md px-10 py-4 bg-sky-100/90 backdrop-blur">
          {time}
        </h1>
      </div>

      {/* Hint with animations */}
      <div className="h-2/3 w-full flex items-center justify-center relative">
        {/* Subtle 1s glow pulse every time the hint changes */}
        <AnimatePresence>
          {hint && (
            <motion.div
              key={`pulse-${animKey}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute w-[82%] h-[48%] bg-sky-300/20 rounded-2xl blur-md"
              style={{ pointerEvents: "none" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {hint ? (
            <motion.div
              key={`hint-${animKey}`}  // ensures re-mount on any hint change
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.6 }}
              className="bg-sky-200/95 rounded-2xl px-8 py-10 text-6xl w-[80%] shadow-2xl backdrop-blur"
            >
              <p className="m-0 leading-snug">{hint}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SecondaryScreen({ container, hint, time, backgroundImage, onWindowClosed }) {
  const rootRef = useRef(null);

  // Create/unmount the portal root
  useEffect(() => {
    if (container && !rootRef.current) {
      rootRef.current = ReactDOM.createRoot(container);
    }
    return () => {
      if (rootRef.current) {
        try {
          rootRef.current.unmount();
        } catch (e) {
          // Window may already be closed, ignore unmount errors
        }
        rootRef.current = null;
      }
    };
  }, [container]);

  // Monitor if the secondary window is closed externally
  useEffect(() => {
    if (!container) return;

    const ownerWindow = container.ownerDocument?.defaultView;
    if (!ownerWindow) return;

    const checkInterval = setInterval(() => {
      if (ownerWindow.closed) {
        clearInterval(checkInterval);
        if (rootRef.current) {
          rootRef.current = null;
        }
        onWindowClosed?.();
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [container, onWindowClosed]);

  // Render whenever inputs change, but check if window is still valid
  useEffect(() => {
    if (!rootRef.current) return;

    // Check if the container's window is still open
    const ownerWindow = container?.ownerDocument?.defaultView;
    if (ownerWindow?.closed) {
      rootRef.current = null;
      return;
    }

    try {
      rootRef.current.render(
        <PlayerContent hint={hint} time={time} backgroundImage={backgroundImage} />
      );
    } catch (e) {
      // Window may have been closed, ignore render errors
      console.warn("SecondaryScreen render failed:", e);
    }
  }, [container, hint, time, backgroundImage]);

  return null;
}
