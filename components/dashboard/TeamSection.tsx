import React from "react";

const TeamSection = () => {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Integrantes</h3>
      <div className="flex flex-wrap gap-4">
        {/* Avatares circulares */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-green to-emerald-700 border-2 border-card-bg shadow-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
