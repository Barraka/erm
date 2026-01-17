import { useState, useRef } from "react";
import HintList from "./HintList";
import { useToast } from "./ToastProvider";
import arrowImg from "../assets/arrow.png";

export default function ManageHints({
  inputValue,
  setInputValue,
  hint,
  setHint,
  predefinedHints,
  updateHints,
  deleteHint,          // ✅ added
  hintSound,
  defaultSound
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
    // Optional: play a sound if you wire one here
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
    // focus the input for quick edits
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="w-full rounded-xl bg-slate-200 p-4 ring-1 ring-white/10 backdrop-blur mt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold bg-slate-200 text-teal-800 text-xl hover:outline-teal-500">
          Indices
        </h2>

        {/* Toggle collapse */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-slate-400 text-white outline outline-2 outline-transparent hover:outline-cyan-400"
        >
          <img
            src={arrowImg}
            alt=""
            className={[
              "h-4 w-4 transition-transform",
              open ? "rotate-90" : ""
            ].join(" ")}
          />
          {open ? "Masquer la liste" : "Afficher la liste"}
        </button>
      </div>

      {/* Composer */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] text-white ">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Écrire un indice…"
          className="min-w-0 rounded-lg border border-white/10 placeholder-white text-lg bg-slate-500 px-3 py-2  placeholder-white/50 outline-none focus:ring-2 focus:ring-teal-400/60"
        />

        <button
          onClick={handleSend}
          className="rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
        >
          Envoyer Indice
        </button>

        <button
          onClick={handleClear}
          className="rounded-lg bg-slate-300 px-4 py-2 text-black transition hover:bg-slate-400"
        >
          Effacer Indice
        </button>
      </div>

      {/* Collapsible Hint List (animated) */}
      <div
        className={[
          "mt-4 overflow-hidden rounded-lg ring-1 ring-white/10",
          "transition-[max-height] duration-300 ease-in-out",
          open ? "max-h-96" : "max-h-0"
        ].join(" ")}
      >
        {/* Keep the scroll INSIDE the collapsing box */}
        <div className="max-h-96 overflow-y-auto bg-slate-700/40 p-2">
          <HintList
            hints={predefinedHints}
            onUpdate={updateHints}
            onSelect={handleHintSelect}
            onDelete={deleteHint}  
          />
        </div>
      </div>

      {/* Current hint preview (optional) */}
      {/* {hint ? (
        <div className="mt-4 rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-200 ring-1 ring-emerald-400/20">
          <span className="text-sm font-medium">Indice actif : </span>
          <span className="text-sm">{hint}</span>
        </div>
      ) : null} */}
    </div>
  );
}
