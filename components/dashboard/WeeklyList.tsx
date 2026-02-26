"use client";
import { useState } from "react";
import { Plus, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";

import { type Week, type Task } from "@/lib/projects";
// ── Bud: the active/current growing tip ──
const Bud = () => (
  <div className="relative flex items-center justify-center">
    {/* Pulsing glow ring */}
    <span className="absolute w-5 h-5 rounded-full bg-[#4ade80]/20 animate-ping" />
    <span className="w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] z-10" />
  </div>
);

// ── Seed: the bottom-most node (week 1) ──
const SeedNode = () => (
  <div className="w-3 h-3 rounded-full bg-[#2d5a3d] border border-[#4ade80]/40" />
);

interface Props {
  weeks: Week[];
  onChange: (weeks: Week[]) => void;
}

export const WeeklyList = ({ weeks, onChange }: Props) => {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleTask = (weekId: number, taskId: number) => {
    onChange(
      weeks.map(w =>
        w.id === weekId
          ? { ...w, tasks: w.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
          : w
      )
    );
  };

  const addTask = (weekId: number) => {
    const text = prompt("Nueva tarea:");
    if (!text?.trim()) return;
    const newTask: Task = { id: Date.now(), text: text.trim(), completed: false };
    onChange(weeks.map(w => w.id === weekId ? { ...w, tasks: [...w.tasks, newTask] } : w));
  };

  const finishWeek = (weekId: number) => {
    const weekToFinish = weeks.find(w => w.id === weekId);
    if (!weekToFinish) return;

    const completedTasks = weekToFinish.tasks.filter(t => t.completed);
    const pendingTasks = weekToFinish.tasks.filter(t => !t.completed);
    const nextActiveWeekId = weekToFinish.id + 1;

    let nextWeeks = weeks.map(w => {
      if (w.id === weekId) {
        return { ...w, finished: true, completedCount: completedTasks.length, tasks: completedTasks };
      }
      if (!w.finished && w.id === nextActiveWeekId && pendingTasks.length > 0) {
        return { ...w, tasks: [...pendingTasks, ...w.tasks] };
      }
      return w;
    });

    // If there is no next active week, create one
    if (!nextWeeks.find(w => w.id === nextActiveWeekId)) {
      nextWeeks.push({
        id: nextActiveWeekId,
        finished: false,
        tasks: pendingTasks.map(t => ({ ...t })) // deep copy pending tasks into new week
      });
    }

    onChange(nextWeeks);
  };

  const toggleCollapse = (weekId: number) => {
    setCollapsed(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  // Weeks ordered: highest id first (current at top), lowest at bottom
  const sortedWeeks = [...weeks].sort((a, b) => b.id - a.id);
  const maxWeekId = Math.max(...weeks.map(w => w.id));

  return (
    <div className="relative">
      {/* ── Vertical stem line ── */}
      <div
        className="absolute left-[11px] top-[28px] bottom-6 w-[2px] rounded-full"
        style={{
          background: "linear-gradient(to bottom, #4ade80 0%, #2d5a3d 60%, #1a3329 100%)",
          opacity: 0.5,
        }}
      />

      <div className="space-y-0">
        {sortedWeeks.map((week, idx) => {
          // Si no está explícitamente en el state, colapsamos las cerradas por defecto
          const isCollapsed = collapsed[week.id] ?? week.finished;
          const activeWeek = !week.finished;
          const completedInWeek = week.tasks.filter(t => t.completed).length;
          const isLast = idx === sortedWeeks.length - 1;
          // Leaves alternate sides: even index → right, odd → left


          return (
            <div key={week.id} className="relative pl-10">

              {/* ── Stem node (bud / leaf / seed) ── */}
              <div className="absolute left-0 top-[22px] flex items-center" style={{ width: 44 }}>
                {/* Node on the stem */}
                <div className="absolute left-[5px] flex items-center justify-center z-10">
                  {activeWeek ? (
                    <Bud />
                  ) : isLast ? (
                    <SeedNode />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-[#4ade80]/70 border border-[#4ade80]/40" />
                  )}
                </div>
              </div>

              {/* ── Week content ── */}
              <div className="pb-8">
                {/* Header */}
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer group"
                  onClick={() => week.finished && toggleCollapse(week.id)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">Semana {week.id}</h3>
                    {week.finished && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
                        {week.completedCount ?? completedInWeek} completadas
                      </span>
                    )}
                    {activeWeek && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#4ade80]/5 text-[#4ade80]/70 border border-[#4ade80]/10 animate-pulse">
                        En curso
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeWeek && (
                      <button
                        onClick={(e) => { e.stopPropagation(); finishWeek(week.id); }}
                        className="text-xs text-gray-500 hover:text-[#4ade80] transition-colors px-2 py-1 rounded-lg hover:bg-[#4ade80]/10 border border-transparent hover:border-[#4ade80]/20"
                      >
                        Terminar semana
                      </button>
                    )}
                    {week.finished && (
                      <span className="text-gray-600">
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tasks */}
                {!isCollapsed && (
                  <div className="space-y-0">
                    {week.tasks.map((task, tidx) => (
                      <div key={task.id}>
                        <div className="flex items-start gap-3 py-3 group/task">
                          <button
                            onClick={() => !week.finished && toggleTask(week.id, task.id)}
                            className={`mt-0.5 shrink-0 transition-colors ${week.finished ? 'cursor-default text-[#4ade80]' : task.completed ? 'text-[#4ade80]' : 'text-gray-600 hover:text-gray-400'}`}
                          >
                            {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                          <p className={`text-sm leading-relaxed flex-1 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                            {task.text}
                          </p>
                        </div>
                        {tidx < week.tasks.length - 1 && <div className="h-px bg-[#222]" />}
                      </div>
                    ))}

                    {/* Add task button — active week only */}
                    {activeWeek && (
                      <>
                        <div className="h-px bg-[#222]" />
                        <button
                          onClick={() => addTask(week.id)}
                          className="flex items-center gap-2 text-gray-600 hover:text-[#4ade80] transition-colors text-sm font-medium py-3"
                        >
                          <Plus size={14} />
                          <span>Agregar tarea</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};