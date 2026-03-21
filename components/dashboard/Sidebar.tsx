"use client";
import {
  Home,
  Star,
  Newspaper,
  Users,
  LogOut,
  Settings,
  ChevronRight,
  Sprout,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { growthProgress, growthStage, getActiveProject, getProjects, type Project } from '@/lib/projects';
import { logout, useAuthSession } from '@/lib/auth-client';

const Sidebar = () => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { user } = useAuthSession();

  // Load active project growth
  const loadGrowth = async () => {
    let project = await getActiveProject();

    // Override active project if navigating to a specific project dashboard
    if (pathname.startsWith('/dashboard/')) {
      const urlId = pathname.replace('/dashboard/', '');
      const projects = await getProjects();
      const found = projects.find(p => p.id === urlId);
      if (found) project = found;
    }

    if (project) {
      setActiveProject(project);
      setProgress(growthProgress(project.startDate, project.endDate));
    } else {
      setActiveProject(null);
      setProgress(0);
    }
  };


  useEffect(() => {
    loadGrowth();
    window.addEventListener('organiseed:projectsUpdated', loadGrowth);
    return () => window.removeEventListener('organiseed:projectsUpdated', loadGrowth);
  }, [pathname]);

  const getDaysRemainingText = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Cosecha pasada";
    if (diff === 0) return "¡Se cosecha hoy!";
    if (diff === 1) return "1 día para cosechar";
    return `${diff} días para cosechar`;
  };

  const navItems = [
    {
      icon: Home,
      label: 'Inicio',
      href: '/',
      isActive: pathname === '/'
    },
    {
      icon: Star,
      label: 'Apoyos',
      href: '/apoyos',
      isActive: pathname.startsWith('/apoyos')
    },
    {
      icon: Newspaper,
      label: 'Novedades',
      href: '/novedades',
      isActive: pathname.startsWith('/novedades')
    },
    {
      icon: Users,
      label: 'Nosotros',
      href: '/nosotros',
      isActive: pathname.startsWith('/nosotros')
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ left: expanded ? '188px' : '52px' }}
        className="fixed top-8 z-50 w-6 h-6 rounded-full bg-[#262626] border border-[#333] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333] transition-all duration-300"
      >
        <ChevronRight
          size={13}
          className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <aside
        className={`
        fixed left-0 top-0 h-screen z-40 border-r border-[#262626] flex flex-col py-6
        bg-[#0f0f0f] overflow-y-auto transition-all duration-300 ease-in-out
        ${expanded ? 'w-[200px]' : 'w-[64px]'}
      `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 mb-8 overflow-hidden">
          <Link href="/" className="flex items-center gap-2 text-[#4ade80] hover:opacity-80 transition-opacity shrink-0">
            <svg width="28" height="25" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M35.5583 7.11167V11.5565C35.5583 14.6214 34.3408 17.5609 32.1735 19.7281C30.0063 21.8954 27.0668 23.1129 24.0019 23.1129H19.5571V32.0025H16.0013V19.5571L16.035 17.7792C16.259 14.8766 17.5701 12.1655 19.7064 10.1878C21.8426 8.21014 24.6466 7.11155 27.5577 7.11167H35.5583ZM7.11167 4.60223e-09C9.72413 -7.10063e-05 12.2704 0.821616 14.3901 2.34873C16.5097 3.87585 18.0953 6.03101 18.9224 8.50911C17.5621 9.66221 16.4477 11.0771 15.6453 12.6696C14.8429 14.2622 14.369 15.9998 14.2518 17.7792H12.4454C9.14469 17.7792 5.97915 16.468 3.64518 14.134C1.31121 11.8 0 8.63448 0 5.33375V4.60223e-09H7.11167Z" fill="#88B76B" />
            </svg>
            {expanded && (
              <span className="text-white font-bold text-base tracking-wide whitespace-nowrap">Organiseed</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!expanded ? item.label : undefined}
                className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${expanded ? '' : 'justify-center'}
                ${item.isActive
                    ? 'text-[#4ade80] bg-[#4ade80]/10'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }
              `}
              >
                <Icon size={18} className="shrink-0" />
                {expanded && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── Plant Stem Widget — fills the dead space ── */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <PlantStem progress={progress} expanded={expanded} />

          {/* Active project label */}
          {activeProject && expanded && (
            <div className="mt-2 px-4 text-center animate-in fade-in slide-in-from-top-1">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Proyecto Activo</p>
              <p className="text-xs text-white font-bold truncate max-w-[160px] mx-auto opacity-80 mb-1">
                {activeProject.name}
              </p>
              <p className="text-[10px] text-[#4ade80] font-medium leading-none">
                {getDaysRemainingText(activeProject.endDate)}
              </p>
            </div>
          )}
        </div>

        {/* User Profile at Bottom */}
        <div className="px-2 border-t border-[#262626] pt-4">
          {expanded ? (
            <>
              <div className="flex items-center gap-3 px-2 py-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#4ade80]/20 border border-[#4ade80]/30 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-[#4ade80]">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{user?.name ?? 'Usuario'}</p>
                  <p className="text-gray-500 text-[10px] truncate">{user?.email ?? 'Sin sesion'}</p>
                </div>
              </div>
              <Link
                href="/ajustes"
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <Settings size={16} className="shrink-0" />
                <span>Ajustes</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm font-medium">
                <LogOut size={16} className="shrink-0" />
                <span>Cerrar sesión</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg bg-[#4ade80]/20 border border-[#4ade80]/30 flex items-center justify-center shrink-0 overflow-hidden mb-1 cursor-pointer hover:border-[#4ade80]/60 transition-all"
                title={user?.name ?? 'Usuario'}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[#4ade80]">{userInitial}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex items-center justify-center w-10 h-9 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// ── Leaf SVG: a simple rounded teardrop ──
const Leaf = ({ side, lit }: { side: "left" | "right"; lit: boolean }) => (
  <div
    className={`absolute transition-all duration-500 ${side === "left" ? "right-[calc(50%+5px)]" : "left-[calc(50%+5px)]"}`}
    style={{
      transform: side === "left" ? "scaleX(-1)" : "none",
      opacity: lit ? 1 : 0.18,
    }}
  >
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
      <path
        d="M7 19C7 19 1 13.5 1 7.5C1 3.9 3.7 1 7 1C10.3 1 13 3.9 13 7.5C13 13.5 7 19 7 19Z"
        fill={lit ? "#4ade80" : "#1a3329"}
        stroke={lit ? "#86efac" : "#2d5a3d"}
        strokeWidth="0.6"
      />
      {lit && (
        <line x1="7" y1="18" x2="7" y2="2" stroke="#86efac" strokeWidth="0.8"
          strokeLinecap="round" opacity="0.5" />
      )}
    </svg>
    {lit && (
      <div
        className="absolute inset-0 rounded-full blur-sm opacity-30"
        style={{ background: "#4ade80" }}
      />
    )}
  </div>
);

// ── The full plant stem widget ──
const PlantStem = ({ progress, expanded }: { progress: number; expanded: boolean }) => {
  // We show 5 nodes evenly spaced
  const nodes = [0.2, 0.4, 0.6, 0.8, 1.0];
  const pct = Math.round(progress * 100);
  const stage = growthStage(progress);

  return (
    <div className="flex flex-col items-center w-full py-4 select-none">
      {/* ── Percentage + stage label ── */}
      <div className="flex flex-col items-center mb-3 gap-0.5">
        <span className="text-[#4ade80] font-black text-base leading-none">{pct}%</span>
        {expanded && (
          <span className="text-[9px] text-[#4ade80]/50 font-medium tracking-wider uppercase">
            {stage.label}
          </span>
        )}
      </div>

      {/* ── Stem + leaves container ── */}
      <div className="relative flex flex-col items-center" style={{ width: 44, height: 160 }}>
        {/* Background track */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] rounded-full bg-[#1a2e1f]" />

        {/* Filled portion — grows from bottom to top */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[2px] rounded-full transition-all duration-700"
          style={{
            height: `${pct}%`,
            background: "linear-gradient(to top, #16a34a, #4ade80)",
            boxShadow: "0 0 6px #4ade8066",
          }}
        />

        {/* Nodes + leaves */}
        {nodes.map((threshold, i) => {
          const lit = progress >= threshold - 0.02;
          const side: "left" | "right" = i % 2 === 0 ? "right" : "left";
          const topPct = 100 - threshold * 100; // top of stem = low threshold, bottom = high

          return (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: `${topPct}%`, marginTop: -6 }}
            >
              {/* Node dot */}
              <div
                className="relative w-3 h-3 rounded-full border transition-all duration-500 z-10"
                style={{
                  backgroundColor: lit ? "#4ade80" : "#1a2e1f",
                  borderColor: lit ? "#86efac" : "#2d5a3d",
                  boxShadow: lit ? "0 0 8px #4ade8088" : "none",
                }}
              />
              {/* Leaf attached to node */}
              <Leaf side={side} lit={lit} />
            </div>
          );
        })}

        {/* Growing tip — pulse at current fill point */}
        {progress > 0 && progress < 0.98 && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: `${pct}%`, marginBottom: -4 }}
          >
            <span className="absolute w-4 h-4 rounded-full bg-[#4ade80]/20 animate-ping -translate-x-1/2 -translate-y-1/2 left-1.5 top-1.5" />
            <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] relative z-10" />
          </div>
        )}
      </div>

      {/* ── Seed label at bottom ── */}
      <div className="flex flex-col items-center mt-3 gap-1 opacity-40">
        <Sprout size={14} className="text-[#4ade80]" />
        {expanded && <span className="text-[9px] text-[#4ade80]/70 tracking-widest uppercase">Seed</span>}
      </div>
    </div>
  );
};

export default Sidebar;
