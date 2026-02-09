import React from "react";

const NoteSection = () => {
  {
    /* Sugerencia para notas

                <div className="flex justify-between items-start mb-2">
                  <StickyNote size={14} className="text-accent-green" />
                  <MoreVertical size={14} className="text-gray-600" />
                </div>

                */
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Notas</h3>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-16 bg-[#202020] rounded border border-card-border p-2 text-[10px] text-gray-400"
          >
            Consultar la font que vamos a usar...
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteSection;
