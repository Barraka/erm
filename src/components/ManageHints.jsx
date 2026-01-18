import { useState, useRef } from "react";
import { Lightbulb, Send, Eraser, ChevronRight } from "lucide-react";
import HintList from "./HintList";
import { useToast } from "./ToastProvider";

export default function ManageHints({
  inputValue,
  setInputValue,
  hint,
  setHint,
  predefinedHints,
  updateHints,
  deleteHint,
  hintSound,
  defaultSound,
  onHintSent
}) {
  const { showToast } = useToast?.() ?? { showToast: () => {} };
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    const text = (inputValue ?? "").trim();
    if (!text) {
      showToast("Veuillez saisir un indice avant d'envoyer.");
      return;
    }
    setHint(text);
    showToast("Indice envoyé !");
    onHintSent && onHintSent();
    try {
      const url = hintSound || defaultSound;
      if (url) {
        const a = new Audio(url);
        a.play().catch(() => {});
      }
    } catch (_) {}
  };

  const handleClear = () => {
    setHint("");
    showToast("Indice effacé.");
    setInputValue("");
  };

  const handleHintSelect = (text) => {
    setInputValue(text);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="card w-full p-4 mt-6">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 cursor-pointer rounded-lg p-2 -m-2 transition-all duration-200 hover:bg-[var(--color-bg-tertiary)]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <Lightbulb size={20} style={{ color: 'var(--color-warning)' }} />
          </div>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Indices
          </h2>
        </div>

        {/* Toggle indicator */}
        <div
          className="p-2 rounded-lg transition-all duration-200"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`}
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </div>
      </div>

      {/* Composer */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Écrire un indice…"
          className="input min-w-0 text-base px-4 py-2.5"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        <button
          onClick={handleSend}
          className="btn btn-success px-4 py-2.5 text-base font-semibold rounded-lg flex items-center gap-2"
        >
          <Send size={16} />
          Envoyer Indice
        </button>

        <button
          onClick={handleClear}
          className="btn btn-ghost px-4 py-2.5 text-base font-semibold rounded-lg flex items-center gap-2"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <Eraser size={16} />
          Effacer Indice
        </button>
      </div>

      {/* Collapsible Hint List (animated) */}
      <div
        className={[
          "mt-4 overflow-hidden rounded-xl",
          "transition-[max-height] duration-300 ease-in-out",
          open ? "max-h-96" : "max-h-0"
        ].join(" ")}
        style={{ border: open ? `1px solid var(--color-border-light)` : 'none' }}
      >
        <div
          className="max-h-96 overflow-y-auto p-3"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
          <HintList
            hints={predefinedHints}
            onUpdate={updateHints}
            onSelect={handleHintSelect}
            onDelete={deleteHint}
          />
        </div>
      </div>
    </div>
  );
}
