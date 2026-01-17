import { useRef, useState } from "react";
import addIcon from '../assets/add.png'; // adjust path if needed
import closeImg from '../assets/close.png'; 
import checkImg from '../assets/check.png';
import delImg from "../assets/delete.png";
import editImg from "../assets/edit.png";

export default function HintList({ hints, onSelect, onUpdate, onDelete }) {
  const listRef = useRef(null);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newHintValue, setNewHintValue] = useState("");

  return (
    <div
      className="relative group mt-4 max-h-96 overflow-y-auto pr-1  text-teal-800 text-xl hover:outline-teal-500 flex justify-start items-stretch flex-col p-4 rounded-md gap-2 h-fit"
      ref={listRef}
    >
      {hints.map((hint, index) => (
        <div
          key={index}
          className="flex items-center px-4 py-2 bg-white shadow-sm hover:ring-2 hover:ring-sky-300 transition rounded-md cursor-pointer"
          onClick={() => onSelect(hint)}
        >
          <div className="flex-grow text-left">
            {hint}
          </div>

          {editingIndex === index ? (
            <>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-grow border px-2 py-1 rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(index, editValue);
                  setEditingIndex(null);
                }}
                className="text-green-600 font-bold cursor-pointer"
              >
                <img
                  src={checkImg}
                  alt="checkImg"
                  title="checkImg"
                  className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIndex(null);
                }}
                className="text-gray-500 font-bold cursor-pointer"
              >
                <img
                  src={closeImg}
                  alt="closeImg"
                  title="closeImg"
                  className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIndex(index);
                  setEditValue(hint);
                  setDeleteConfirmIndex(null);
                }}
                className="text-blue-600 cursor-pointer"
              >
                <img
                  src={editImg}
                  alt="editImg"
                  title="editImg"
                  className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                />
              </button>

              {deleteConfirmIndex === index ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                      setDeleteConfirmIndex(null);
                    }}
                    className="text-red-600 font-bold cursor-pointer"
                  >
                    <img
                      src={checkImg}
                      alt="checkImg"
                      title="checkImg"
                      className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmIndex(null);
                    }}
                    className="text-gray-500 font-bold cursor-pointer"
                  >
                    <img
                      src={closeImg}
                      alt="closeImg"
                      title="closeImg"
                      className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                    />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmIndex(index);
                    setEditingIndex(null);
                  }}
                  className="text-red-600 cursor-pointer"
                >
                  <img
                    src={delImg}
                    alt="delImg"
                    title="delImg"
                    className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
                  />
                </button>
              )}
            </>
          )}
        </div>
      ))}

      {addingNew ? (
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded shadow-sm">
          <input
            value={newHintValue}
            onChange={(e) => setNewHintValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="flex-grow border px-2 py-1 rounded"
            placeholder="Enter new hint..."
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (newHintValue.trim()) {
                onUpdate(hints.length, newHintValue.trim());
                setNewHintValue("");
                setAddingNew(false);
              }
            }}
            className="text-green-600 font-bold cursor-pointer"
          >
            <img
              src={checkImg}
              alt="checkImg"
              title="checkImg"
              className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddingNew(false);
              setNewHintValue("");
            }}
            className="text-gray-500 font-bold cursor-pointer"
          >
            <img
              src={closeImg}
              alt="closeImg"
              title="closeImg"
              className="w-6 h-6 cursor-pointer hover:bg-sky-300 bg-sky-200 rounded-sm"
            />
          </button>
        </div>
      ) : (
        <div className="flex justify-center pt-2 w-fit mx-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddingNew(true);
            }}
            className="p-2 outline outline-2 hover:outline-cyan-500 transition bg-slate-200 min-w-48 rounded-md flex justify-center"
            title="Ajouter indice"
          >
            <img src={addIcon} alt="Add new hint" className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
