export default function ManageScreen({ openPlayerWindow, closePlayerWindow }) {
  return (
    <div className="mt-4 space-x-2 flex justify-center">
      <button
        onClick={openPlayerWindow}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Ouvrir Écran Secondaire
      </button>

      <button
        onClick={closePlayerWindow}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Fermer Écran Secondaire
      </button>
    </div>
  );
}
