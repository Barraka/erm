import { createContext, useContext, useState } from "react";
import closeImg from "../assets/close.png";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 space-y-3 z-50">

        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`relative pr-10 pl-4 py-2 rounded shadow text-white transition-all duration-500 ease-in-out opacity-100 transform animate-slidein ${
  type === "success"
    ? "bg-green-600"
    : type === "error"
    ? "bg-red-600"
    : "bg-gray-700"
}`}

          >
            <span>{message}</span>
            <button
                onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== id))
                }
                className="absolute top-1.5 right-2 text-white text-sm hover:text-gray-300"
                title="Fermer"
            >
                <img
                  src={closeImg}
                  alt="closeImg"
                  title="closeImg"
                  className="w-5 h-5 cursor-pointer hover:bg-sky-400 bg-sky-100 rounded-full"
                  />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
