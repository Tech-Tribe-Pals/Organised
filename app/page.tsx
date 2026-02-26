"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ProjectCardSkeleton from "@/components/dashboard/ProjectCardSkeleton";
import NewProjectModal from "@/components/dashboard/NewProjectModal";
import { getProjects, type Project } from "@/lib/projects";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load projects on mount & when updated
  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
    // Listen for updates from other components (e.g. modal)
    window.addEventListener('organiseed:projectsUpdated', loadProjects);
    return () => window.removeEventListener('organiseed:projectsUpdated', loadProjects);
  }, []);


  // Filter projects by status
  const pendingProjects = projects.filter(p => p.status === 'En proceso');
  const finishedProjects = projects.filter(p => p.status === 'Finalizado');
  const newProjects = projects.filter(p => p.status === 'Sin iniciar');

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      <Sidebar />

      {/* pl-[64px] compensa el sidebar colapsado (64px fijo) */}
      <main className="flex-1 py-8 px-8 overflow-y-auto pl-[80px]">

        {/* Loading Skeletons Section */}
        {loading && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-[#262626] mb-6 flex items-center gap-3 animate-pulse bg-[#262626]/20 rounded w-48 h-8"></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </section>
        )}

        {/* En Proceso Section */}
        {!loading && pendingProjects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              En Proceso
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
                {pendingProjects.length}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {pendingProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </section>
        )}

        {/* Novedades / Sin Iniciar Section */}
        {!loading && newProjects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              Por Iniciar
              <span className="size-1.5 rounded-full bg-blue-500" />
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </section>
        )}

        {/* Finalizados Section */}
        {!loading && finishedProjects.length > 0 && (
          <section className="mb-12 opacity-80 hover:opacity-100 transition-opacity">
            <h2 className="text-2xl font-black text-gray-400 mb-6 flex items-center gap-3">
              Cosechados
              <span className="size-1.5 rounded-full bg-gray-600" />
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {finishedProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </section>
        )}

        {/* ── FAB: Add Project ── */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-full shadow-[0_4px_20px_rgba(74,222,128,0.4)] flex items-center justify-center transition-all hover:scale-110 z-30 group"
          title="Crear Nuevo Proyecto"
        >
          <Plus size={28} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* ── Modal ── */}
        {showModal && (
          <NewProjectModal
            onClose={() => setShowModal(false)}
            onCreated={loadProjects}
          />
        )}

      </main>
    </div>
  );
}