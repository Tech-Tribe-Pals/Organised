import React from "react";

const CommitsSection = () => {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Commits</h3>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/10" />
            <div className="h-2 w-full bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitsSection;
