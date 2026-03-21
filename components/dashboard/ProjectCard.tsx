"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AuthRequiredError, deleteProject } from "@/lib/projects";

interface TeamMember {
    name: string;
    avatar?: string;
    color: string;
}

interface ProjectCardProps {
    id: string;
    name: string;
    image?: string;
    pm?: TeamMember;
    team: TeamMember[];
    status?: string;
    startDate?: string;   // ISO format: "YYYY-MM-DD"
    endDate?: string;     // ISO format: "YYYY-MM-DD"
}

/** Returns a 0–1 growth progress based on current date vs start/end */
function getGrowthProgress(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 1;
    return (now - start) / (end - start);
}

/** Returns growth stage label & accent color based on progress */
function getGrowthStage(progress: number): { label: string; color: string } {
    if (progress === 0) return { label: "Semilla", color: "#6b7280" };
    if (progress < 0.25) return { label: "Brote", color: "#86efac" };
    if (progress < 0.5) return { label: "Creciendo", color: "#4ade80" };
    if (progress < 0.85) return { label: "Madurando", color: "#22c55e" };
    return { label: "Establecido", color: "#16a34a" };
}

// ── Vertical growth bar rendered as a left-side "stem" on the card ──
const GrowthBar = ({ progress, color }: { progress: number; color: string }) => {
    const filledPct = Math.round(progress * 100);
    return (
        <div className="absolute left-2 top-3 bottom-3 w-[3px] rounded-full bg-[#1a1a1a] overflow-hidden">
            {/* Filled portion grows from bottom to top */}
            <div
                className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-700"
                style={{
                    height: `${filledPct}%`,
                    background: `linear-gradient(to top, ${color}, ${color}88)`,
                    boxShadow: progress > 0 ? `0 0 6px ${color}66` : "none",
                }}
            />
            {/* Tip dot — glows at the top of the fill */}
            {progress > 0 && progress < 1 && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full"
                    style={{
                        bottom: `calc(${filledPct}% - 3px)`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}`,
                    }}
                />
            )}
        </div>
    );
};

const ProjectCard = ({ id, name, image, pm, team, status, startDate, endDate }: ProjectCardProps) => {
    const progress = getGrowthProgress(startDate, endDate);
    const { label: stageLabel, color: stageColor } = getGrowthStage(progress);
    const hasGrowth = !!(startDate && endDate);

    return (
        <Link href={`/dashboard/${id}`} className="flex flex-col cursor-pointer group">
            {/* Thumbnail / Image area */}
            <div className="relative w-full aspect-video bg-[#101010] overflow-hidden rounded-2xl border border-[#2a2a2a] group-hover:border-[#4ade80]/40 transition-all shadow-lg">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d]" />
                )}

                {/* Growth bar — left side vertical stem */}
                {hasGrowth && <GrowthBar progress={progress} color={stageColor} />}

                {/* Status badge — top-left (shifted right if growth bar present) */}
                {status && (
                    <div className={`absolute top-2 ${hasGrowth ? "left-6" : "left-2"}`}>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-gray-300 border border-white/10 backdrop-blur-sm">
                            {status}
                        </span>
                    </div>
                )}

                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm("¿Estás seguro que querés podar definitivamente este proyecto?")) {
                            try {
                                await deleteProject(id);
                            } catch (error) {
                                console.error(error);
                                if (error instanceof AuthRequiredError) {
                                    alert("Necesitas iniciar sesion para eliminar proyectos.");
                                    window.location.href = "/login";
                                    return;
                                }

                                alert("No se pudo eliminar el proyecto.");
                            }
                        }
                    }}
                    className="absolute top-2 right-12 p-1.5 rounded-lg bg-black/60 text-red-400 border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-300 z-10"
                    title="Eliminar proyecto"
                >
                    <Trash2 size={15} />
                </button>

                {/* PM avatar — top-right */}
                {pm && (
                    <div className="absolute top-2 right-2">
                        <div
                            className="w-8 h-8 rounded-lg border-2 border-[#181818] flex items-center justify-center text-[11px] font-bold shadow-md overflow-hidden shrink-0"
                            style={{ backgroundColor: pm.color }}
                            title={`PM: ${pm.name}`}
                        >
                            {pm.avatar ? (
                                <img src={pm.avatar} alt={pm.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-black leading-none">{pm.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Card info */}
            <div className="px-1 pt-3 pb-1 space-y-2">
                {/* Project name */}
                <h4 className="text-white font-bold text-sm leading-tight group-hover:text-[#4ade80] transition-colors truncate">
                    {name}
                </h4>

                {/* Growth stage + date info */}
                {hasGrowth && (
                    <div className="space-y-1">
                        {/* Stage label + thin progress track */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold" style={{ color: stageColor }}>
                                {stageLabel}
                            </span>
                            <div className="flex-1 h-[2px] rounded-full bg-[#1e1e1e] overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.round(progress * 100)}%`,
                                        backgroundColor: stageColor,
                                    }}
                                />
                            </div>
                            <span className="text-[10px] text-gray-600 tabular-nums">
                                {Math.round(progress * 100)}%
                            </span>
                        </div>
                        {/* Dates */}
                        <div className="flex items-center justify-between text-[10px] text-gray-600">
                            <span>{startDate}</span>
                            <span>{endDate}</span>
                        </div>
                    </div>
                )}

                {/* Team avatars */}
                {team.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        {team.slice(0, 6).map((member, i) => (
                            <div
                                key={i}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 shadow-sm"
                                style={{ backgroundColor: member.color }}
                                title={member.name}
                            >
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-black leading-none">{member.name.charAt(0)}</span>
                                )}
                            </div>
                        ))}
                        {team.length > 6 && (
                            <div className="w-7 h-7 rounded-md bg-[#262626] flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden shrink-0">
                                +{team.length - 6}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProjectCard;
