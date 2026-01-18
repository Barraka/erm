import { Trophy, Skull, X } from "lucide-react";

export default function EndSessionModal({ onVictory, onDefeat, onCancel, onDismiss }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div
        className="relative flex flex-col w-[90vw] max-w-md rounded-2xl overflow-hidden fade-in"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border-light)'
          }}
        >
          <div className="w-8" /> {/* Spacer for centering */}
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Fin de Session
          </h2>
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Comment s'est terminée cette session ?
          </p>

          <div className="flex flex-col gap-3">
            {/* Victory button */}
            <button
              onClick={onVictory}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: 'var(--color-success)',
                border: '2px solid var(--color-success)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-success)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                e.currentTarget.style.color = 'var(--color-success)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Trophy size={24} />
              Victoire
            </button>

            {/* Defeat button */}
            <button
              onClick={onDefeat}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: 'var(--color-danger)',
                border: '2px solid var(--color-danger)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = 'var(--color-danger)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Skull size={24} />
              Défaite
            </button>

            {/* Don't save button */}
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium text-base transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              }}
            >
              <X size={20} />
              Ne pas enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
