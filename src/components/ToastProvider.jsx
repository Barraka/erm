import { createContext, useContext, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

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

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return {
          bg: 'var(--color-success)',
          icon: CheckCircle
        };
      case "error":
        return {
          bg: 'var(--color-danger)',
          icon: AlertCircle
        };
      default:
        return {
          bg: 'var(--color-bg-tertiary)',
          icon: Info
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 space-y-3 z-50">
        {toasts.map(({ id, message, type }) => {
          const styles = getToastStyles(type);
          const IconComponent = styles.icon;

          return (
            <div
              key={id}
              className="relative flex items-center gap-3 pr-10 pl-4 py-3 rounded-xl shadow-lg transition-all duration-300 ease-out slide-up"
              style={{
                backgroundColor: styles.bg,
                color: 'white',
                minWidth: '280px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <IconComponent size={18} />
              <span className="font-medium text-sm">{message}</span>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== id))
                }
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-lg transition-all duration-150"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
