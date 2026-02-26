import React from "react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-[calc(100vh-80px)] md:min-h-screen flex items-center justify-center py-16 md:py-24">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        <div className="hidden md:block">
          <div className="relative bg-[#1e1e1e] rounded-xl p-6 shadow-lg border border-white/10 h-[400px] flex items-center justify-center text-gray-400">
            <span className="text-xl">Dashboard Preview (Próximamente)</span>
          </div>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-tight">
            Organi
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              seed
            </span>
          </h1>

          <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-4 leading-tight">
            Nutre tus proyectos
          </h3>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md mx-auto md:mx-0">
            Quia autem vel eum iure reprehenderit qui in ea voluptate velit esse
            quam nihil molestiae consequatur.
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors duration-300 ease-in-out shadow-lg">
            Crear proyecto
          </button>
        </div>
      </div>

      {/* logo
      <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 opacity-70">
        <Image
          src="/plant-icon.png"
          alt="Organiseed Plant Icon"
          layout="fill"
          objectFit="contain"
          className="animate-pulse-slow"
        />
      </div> */}

      {/* fondo*/}
      <div className="absolute -bottom-10 left-10 w-24 h-24 bg-green-700 opacity-20 rounded-lg blur-xl animate-fade-in-up"></div>
      <div className="absolute top-20 right-1/4 w-32 h-32 bg-green-500 opacity-10 rounded-full blur-xl animate-fade-in"></div>
    </section>
  );
};

export default HeroSection;
