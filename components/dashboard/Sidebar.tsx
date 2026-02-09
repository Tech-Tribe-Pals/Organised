import { 
  Leaf, 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-16 md:w-20 border-r border-card-border flex flex-col items-center py-8 justify-between bg-dash-bg">
      {/* Logo Superior */}
      <div className="flex flex-col items-center gap-10">
        <div className="text-accent-green hover:scale-110 transition-transform cursor-pointer">
          <Leaf size={28} fill="currentColor" fillOpacity={0.2} />
        </div>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-8 text-gray-500">
          <button className="p-2 hover:text-accent-green hover:bg-white/5 rounded-xl transition-all group relative">
            <LayoutDashboard size={24} />
            <span className="absolute left-16 bg-card-bg border border-card-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">Dashboard</span>
          </button>
          <button className="p-2 hover:text-accent-green hover:bg-white/5 rounded-xl transition-all">
            <BarChart3 size={24} />
          </button>
          <button className="p-2 hover:text-accent-green hover:bg-white/5 rounded-xl transition-all">
            <Calendar size={24} />
          </button>
          <button className="p-2 hover:text-accent-green hover:bg-white/5 rounded-xl transition-all">
            <Users size={24} />
          </button>
        </nav>
      </div>

      {/* Acciones Inferiores */}
      <div className="flex flex-col gap-6 text-gray-500">
        <button className="p-2 hover:text-white transition-colors">
          <Settings size={22} />
        </button>
        <button className="p-2 hover:text-red-400 transition-colors">
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;