import { Monitor, MonitorOff } from "lucide-react";

export default function ManageScreen({ openPlayerWindow, closePlayerWindow }) {
  return (
    <div className="flex justify-center gap-3 mt-4">
      <button
        onClick={openPlayerWindow}
        className="btn btn-primary px-5 py-2.5 text-base font-semibold rounded-xl flex items-center gap-2"
      >
        <Monitor size={18} />
        Ouvrir Écran Secondaire
      </button>

      <button
        onClick={closePlayerWindow}
        className="btn btn-danger px-5 py-2.5 text-base font-semibold rounded-xl flex items-center gap-2"
      >
        <MonitorOff size={18} />
        Fermer Écran Secondaire
      </button>
    </div>
  );
}
