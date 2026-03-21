"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthRequiredError, getProjects, updateProject, type Project, type Week, type Note } from "@/lib/projects";
import Sidebar from "@/components/dashboard/Sidebar";
import { WeeklyList } from "@/components/dashboard/WeeklyList";
import NotesSection from "@/components/dashboard/NotesSection";
import CommitsSection from "@/components/dashboard/CommitsSection";
import TeamSection from "@/components/dashboard/TeamSection";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!params.id) return;
      const projId = Array.isArray(params.id) ? params.id[0] : params.id;
      const all = await getProjects();
      const found = all.find(p => p.id === projId);
      if (!found) {
        router.push("/");
      } else {
        setProject(found);
      }
    };
    loadProject();
  }, [params.id, router]);

  if (!project) {
    return (
      <div className="flex min-h-screen bg-[#0f0f0f] text-white">
        <Sidebar />
        <div className="flex-1 pl-[80px]">
          <div className="max-w-7xl mx-auto px-6 py-8 lg:px-10 flex gap-10">
            <main className="flex-1 min-w-0">
              <header className="mb-8 space-y-4">
                <div className="h-8 bg-[#262626] rounded-lg w-1/3 animate-pulse" />
                <div className="h-4 bg-[#1a1a1a] rounded w-2/3 animate-pulse" />
              </header>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-40 bg-[#1a1a1a] rounded-2xl animate-pulse" />
                ))}
              </div>
            </main>
            <aside className="w-72 shrink-0">
              <div className="sticky top-8 space-y-8">
                <div className="h-48 bg-[#1a1a1a] rounded-2xl animate-pulse" />
                <div className="h-48 bg-[#1a1a1a] rounded-2xl animate-pulse" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  const handleWeeksChange = async (newWeeks: Week[]) => {
    setProject(prev => prev ? { ...prev, weeks: newWeeks } : prev);
    try {
      await updateProject(project.id, { weeks: newWeeks });
    } catch (error) {
      console.error(error);
      if (error instanceof AuthRequiredError) {
        router.push("/login");
      }
    }
  };

  const handleNotesChange = async (newNotes: Note[]) => {
    setProject(prev => prev ? { ...prev, notes: newNotes } : prev);
    try {
      await updateProject(project.id, { notes: newNotes });
    } catch (error) {
      console.error(error);
      if (error instanceof AuthRequiredError) {
        router.push("/login");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      <Sidebar />

      {/* Main content — offset for fixed sidebar (64px collapsed) */}
      <div className="flex-1 pl-[80px]">
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-10 flex gap-10">

          {/* ── COLUMNA PRINCIPAL (2/3) ── */}
          <main className="flex-1 min-w-0">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-white">{project.name}</h1>
              {project.description && (
                <p className="text-gray-400 mt-2 text-sm max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </header>
            <WeeklyList weeks={project.weeks ?? []} onChange={handleWeeksChange} />
          </main>

          {/* ── COLUMNA LATERAL (1/3) — sticky ── */}
          <aside className="w-72 shrink-0">
            <div className="sticky top-8 space-y-8">
              <NotesSection notes={project.notes} onChange={handleNotesChange} />
              <div className="h-px bg-[#1e1e1e]" />
              <CommitsSection repo={project.githubRepo} />
              <div className="h-px bg-[#1e1e1e]" />
              <TeamSection pm={project.pm} team={project.team} />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
