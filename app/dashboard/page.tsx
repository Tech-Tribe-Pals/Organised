"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { WeeklyList } from "@/components/dashboard/WeeklyList";
import { TaskView } from "@/components/dashboard/TaskView";
import LineChartDashboard from "@/components/dashboard/LineChartDashboard";
import NotesSection from "@/components/dashboard/NotesSection"; // Opcional: modularizar estos también
import CommitsSection from "@/components/dashboard/CommitsSection";
import TeamSection from "@/components/dashboard/TeamSection";
// import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [semanaActiva, setSemanaActiva] = useState<number | null>(null);

  // const fetchTareas = async (semanaId: string) => {
  //   const { data, error } = await supabase
  //     .from("tareas")
  //     .select("*")
  //     .eq("semana_id", semanaId)
  //     .order("creado_en", { ascending: true });

  //   if (error) console.error("Error cargando tareas:", error);
  //   return data;
  // };

  return (
    <div className="flex min-h-screen bg-dash-bg text-white">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-8">
            {!semanaActiva ? (
              <>
                <header>
                  <h1 className="text-3xl font-bold">Don Remolo</h1>
                </header>
                <div className="bg-card-bg border border-card-border rounded-xl p-6 h-72">
                  <LineChartDashboard />
                </div>
                <WeeklyList onSelectSemana={setSemanaActiva} />
              </>
            ) : (
              <TaskView
                semana={semanaActiva}
                onBack={() => setSemanaActiva(null)}
              />
            )}
          </div>

          {/* COLUMNA LATERAL (SIEMPRE VISIBLE) */}
          <aside className="space-y-8">
            <NotesSection />
            <CommitsSection />
            <TeamSection />
          </aside>
        </div>
      </main>
    </div>
  );
}
