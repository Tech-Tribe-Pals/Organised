import { Plus, X as DeleteIcon } from "lucide-react";
import { type Note } from "@/lib/projects";

interface Props {
  notes?: Note[];
  onChange: (notes: Note[]) => void;
}

const NotesSection = ({ notes = [], onChange }: Props) => {
  const handleAdd = () => {
    const text = prompt("Nueva nota:");
    if (!text?.trim()) return;
    onChange([...notes, { id: Date.now(), text: text.trim() }]);
  };

  const handleRemove = (id: number) => {
    onChange(notes.filter(n => n.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">Notas</h3>
        <button
          onClick={handleAdd}
          className="w-6 h-6 rounded-md bg-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333] transition-all"
        >
          <Plus size={13} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {notes.length === 0 ? (
          <div className="col-span-2 py-6 text-center text-gray-600 text-[11px]">
            No hay notas.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex flex-col justify-between min-h-[70px] hover:border-[#333] transition-colors group relative"
            >
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-[90%]">{note.text}</p>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleRemove(note.id)} className="text-gray-600 hover:text-red-400 p-1">
                  <DeleteIcon size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;
