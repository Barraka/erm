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
      className="flex flex-col justify-start items-stretch h-screen w-screen text-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: backgroundImage ? undefined : '#0f172a',
        fontFamily: "'Roboto', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Timer - sleek glass morphism design */}
      <div className="flex items-center justify-center h-1/3 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.15)',
            padding: '1.5rem 3rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: '700',
              color: '#f8fafc',
              textShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            {time}
          </h1>
        </motion.div>
      </div>

      {/* Hint with sleek animations */}
      <div className="h-2/3 w-full flex items-center justify-center relative px-8">
        {/* Glow effect when hint changes */}
        <AnimatePresence>
          {hint && (
            <motion.div
              key={`glow-${animKey}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.6, scale: 1.02 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                width: '85%',
                height: '55%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.15) 100%)',
                borderRadius: '2rem',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {hint ? (
            <motion.div
              key={`hint-${animKey}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '2rem',
                padding: 'clamp(2rem, 4vw, 3rem) clamp(2rem, 5vw, 4rem)',
                width: '85%',
                maxWidth: '1200px',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 60px rgba(59, 130, 246, 0.1)',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  fontWeight: '500',
                  color: '#f1f5f9',
                  lineHeight: '1.4',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                {hint}
              </p>
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
