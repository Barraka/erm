import { useRef, useState } from "react";
import { Plus, X, Check, Trash2, Pencil } from "lucide-react";

export default function HintList({ hints, onSelect, onUpdate, onDelete }) {
  const listRef = useRef(null);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newHintValue, setNewHintValue] = useState("");

  const IconButton = ({ onClick, icon: Icon, variant = "default", title }) => {
    const colors = {
      default: { bg: 'var(--color-bg-elevated)', hover: 'var(--color-accent-primary)', color: 'var(--color-text-secondary)' },
      success: { bg: 'var(--color-success)', hover: 'var(--color-success-hover)', color: 'white' },
      danger: { bg: 'var(--color-danger)', hover: 'var(--color-danger-hover)', color: 'white' },
      ghost: { bg: 'transparent', hover: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }
    };
    const c = colors[variant];

    return (
      <button
        onClick={onClick}
        title={title}
        className="p-1.5 rounded-lg transition-all duration-150"
        style={{ backgroundColor: c.bg, color: c.color }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = c.hover;
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = c.bg;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Icon size={16} />
      </button>
    );
  };

  return (
    <div
      className="relative flex flex-col gap-2"
      ref={listRef}
    >
      {hints.map((hint, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-light)',
            color: 'var(--color-text-primary)'
          }}
          onClick={() => onSelect(hint)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-light)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
          }}
        >
          {editingIndex === index ? (
            <>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    onUpdate(index, editValue);
                    setEditingIndex(null);
                  }
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    setEditingIndex(null);
                  }
                }}
                className="input flex-grow text-sm"
                autoFocus
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(index, editValue);
                  setEditingIndex(null);
                }}
                icon={Check}
                variant="success"
                title="Confirmer"
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIndex(null);
                }}
                icon={X}
                variant="ghost"
                title="Annuler"
              />
            </>
          ) : (
            <>
              <div className="flex-grow text-left text-sm">
                {hint}
              </div>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIndex(index);
                  setEditValue(hint);
                  setDeleteConfirmIndex(null);
                }}
                icon={Pencil}
                variant="default"
                title="Modifier"
              />

              {deleteConfirmIndex === index ? (
                <>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                      setDeleteConfirmIndex(null);
                    }}
                    icon={Check}
                    variant="danger"
                    title="Confirmer la suppression"
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmIndex(null);
                    }}
                    icon={X}
                    variant="ghost"
                    title="Annuler"
                  />
                </>
              ) : (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmIndex(index);
                    setEditingIndex(null);
                  }}
                  icon={Trash2}
                  variant="default"
                  title="Supprimer"
                />
              )}
            </>
          )}
        </div>
      ))}

      {addingNew ? (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-success)'
          }}
        >
          <input
            value={newHintValue}
            onChange={(e) => setNewHintValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newHintValue.trim()) {
                e.stopPropagation();
                onUpdate(hints.length, newHintValue.trim());
                setNewHintValue("");
                setAddingNew(false);
              }
              if (e.key === 'Escape') {
                e.stopPropagation();
                setAddingNew(false);
                setNewHintValue("");
              }
            }}
            className="input flex-grow text-sm"
            placeholder="Nouvel indice..."
            autoFocus
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (newHintValue.trim()) {
                onUpdate(hints.length, newHintValue.trim());
                setNewHintValue("");
                setAddingNew(false);
              }
            }}
            icon={Check}
            variant="success"
            title="Ajouter"
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setAddingNew(false);
              setNewHintValue("");
            }}
            icon={X}
            variant="ghost"
            title="Annuler"
          />
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAddingNew(true);
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-150 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
            e.currentTarget.style.color = 'var(--color-accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
          title="Ajouter indice"
        >
          <Plus size={18} />
          Ajouter un indice
        </button>
      )}
    </div>
  );
}
