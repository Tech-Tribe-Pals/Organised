import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo e Iconos Izquierda */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-green-500 rounded-sm"></div>
            <div className="w-6 h-6 border border-white/20 rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Organiseed
          </span>
        </div>

        {/* Links Derecha */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link href="#nosotros" className="hover:text-white transition-colors">Nosotros</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-md border border-white/10 transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;