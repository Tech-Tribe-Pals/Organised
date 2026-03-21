"use client";
import { useState, useEffect, useRef } from "react";
import { X, Search, UserPlus, Loader2, Github, Sprout, TreePine, Flower2, Check } from "lucide-react";
import { addProject, AuthRequiredError, generateId, type Priority, type Seed, type TeamMember } from "@/lib/projects";
import { useAuthSession } from "@/lib/auth-client";

// ── Seed type config ──────────────────────────────────────────────────────────
const SEEDS: { id: Seed; emoji: React.ReactNode; label: string; desc: string; color: string }[] = [
    {
        id: "Roble",
        emoji: <TreePine size={26} />,
        label: "Roble",
        desc: "Crecimiento lento y firme. Ideal para hitos largos.",
        color: "#22c55e",
    },
    {
        id: "Bambú",
        emoji: <Sprout size={26} />,
        label: "Bambú",
        desc: "Explosivo y flexible. Perfecto para sprints.",
        color: "#4ade80",
    },
    {
        id: "Girasol",
        emoji: <Flower2 size={26} />,
        label: "Girasol",
        desc: "Radiante y visible. Proyectos creativos.",
        color: "#facc15",
    },
];

const CATEGORIES = ["Desarrollo", "Diseño", "Marketing", "Operaciones", "Investigación", "Otro"];

const AVATAR_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#a855f7",
];

// ── GitHub user lookup ────────────────────────────────────────────────────────
interface GHUser {
    login: string;
    name: string | null;
    avatar_url: string;
}

async function fetchGHUser(login: string): Promise<GHUser | null> {
    try {
        const res = await fetch(`https://api.github.com/users/${login}`);
        if (!res.ok) return null;
        const data = await res.json();
        return { login: data.login, name: data.name, avatar_url: data.avatar_url };
    } catch {
        return null;
    }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    onClose: () => void;
    onCreated: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NewProjectModal({ onClose, onCreated }: Props) {
    const { user } = useAuthSession();
    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Desarrollo");
    const [priority, setPriority] = useState<Priority>("Media");
    const [seed, setSeed] = useState<Seed>("Roble");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [githubRepo, setGithubRepo] = useState("");

    // Team panel state
    const [ghInput, setGhInput] = useState("");
    const [ghResult, setGhResult] = useState<GHUser | null>(null);
    const [ghLoading, setGhLoading] = useState(false);
    const [ghError, setGhError] = useState("");
    const [team, setTeam] = useState<TeamMember[]>([]);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce GitHub search
    useEffect(() => {
        setGhResult(null);
        setGhError("");
        if (!ghInput.trim() || ghInput.length < 2) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setGhLoading(true);
            const user = await fetchGHUser(ghInput.trim());
            setGhLoading(false);
            if (!user) setGhError("Usuario no encontrado en GitHub.");
            else setGhResult(user);
        }, 600);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [ghInput]);

    function addTeamMember(user: GHUser) {
        if (team.find(m => m.username === user.login)) return;
        const color = AVATAR_COLORS[team.length % AVATAR_COLORS.length];
        setTeam(prev => [...prev, {
            name: user.name ?? user.login,
            username: user.login,
            avatar: user.avatar_url,
            color,
            fromGithub: true,
        }]);
        setGhInput("");
        setGhResult(null);
    }



    function removeMember(idx: number) {
        setTeam(prev => prev.filter((_, i) => i !== idx));
    }

    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (!name.trim() || !startDate || !endDate) return;
        if (!user) {
            alert("Necesitas iniciar sesion para crear proyectos.");
            window.location.href = "/login";
            return;
        }

        setSubmitting(true);
        try {
            await addProject({
                id: generateId(),
                name: name.trim(),
                description: description.trim(),
                category,
                priority,
                seed,
                status: "En proceso",
                startDate,
                endDate,
                pm: {
                    name: user.name,
                    username: user.email.split("@")[0],
                    avatar: user.avatarUrl ?? undefined,
                    color: "#4ade80"
                },
                team,
                githubRepo,
                createdAt: new Date().toISOString().slice(0, 10),
            });
            onCreated();
            onClose();
        } catch (error) {
            console.error(error);
            if (error instanceof AuthRequiredError) {
                alert("Necesitas iniciar sesion para crear proyectos.");
                window.location.href = "/login";
                return;
            }

            alert("Error al crear el proyecto");
        } finally {
            setSubmitting(false);
        }
    }


    const canSubmit = name.trim().length > 0 && startDate && endDate;

    return (
        // ── Backdrop ──
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* ── Modal shell ── */}
            <div
                className="relative w-full max-w-5xl rounded-2xl border border-[#2a3a2a] overflow-hidden flex shadow-2xl"
                style={{ background: "#141a14", maxHeight: "92vh" }}
            >

                {/* ════════════════════════════════ LEFT — FORM ════════════════════════════════ */}
                <div className="flex-1 overflow-y-auto p-8 min-w-0">
                    {/* Header */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-black text-white">Crear Nuevo Proyecto</h2>
                        <p className="text-sm text-gray-500 mt-1">Siembra las bases de tu próximo gran éxito.</p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Nombre */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                            Nombre del Proyecto
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="ej. Rediseño de App Móvil"
                            className="w-full bg-[#1c241c] border border-[#2d3d2d] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                            Descripción
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Define el propósito y metas de este crecimiento..."
                            rows={3}
                            className="w-full bg-[#1c241c] border border-[#2d3d2d] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/50 transition-colors resize-none"
                        />
                    </div>

                    {/* Categoría + Prioridad */}
                    <div className="flex gap-4 mb-5">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Categoría
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full appearance-none bg-[#1c241c] border border-[#2d3d2d] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors cursor-pointer pr-9"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Prioridad
                            </label>
                            <div className="flex gap-1.5">
                                {(["Baja", "Media", "Alta"] as Priority[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${priority === p
                                            ? "bg-[#4ade80] text-black border-[#4ade80]"
                                            : "bg-transparent text-gray-400 border-[#2d3d2d] hover:border-[#4ade80]/40 hover:text-white"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Repo GitHub */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Github size={13} className="text-gray-500" />
                            Repositorio de GitHub <span className="text-gray-600 font-normal normal-case">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            value={githubRepo}
                            onChange={e => setGithubRepo(e.target.value)}
                            placeholder="ej. facebook/react"
                            className="w-full bg-[#1c241c] border border-[#2d3d2d] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                        />
                    </div>

                    {/* Elegir Semilla */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Elegir Semilla
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block" />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {SEEDS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSeed(s.id)}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-left ${seed === s.id
                                        ? "border-[#4ade80]/60 bg-[#4ade80]/8"
                                        : "border-[#2d3d2d] bg-[#1c241c] hover:border-[#4ade80]/30"
                                        }`}
                                >
                                    {seed === s.id && (
                                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#4ade80] flex items-center justify-center">
                                            <Check size={10} className="text-black" />
                                        </span>
                                    )}
                                    <div style={{ color: seed === s.id ? s.color : "#4b5563" }}>{s.emoji}</div>
                                    <span className={`text-sm font-bold ${seed === s.id ? "text-white" : "text-gray-400"}`}>
                                        {s.label}
                                    </span>
                                    <span className="text-[10px] text-gray-600 text-center leading-tight">{s.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="flex gap-4 mb-7">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Fecha de inicio
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-[#1c241c] border border-[#2d3d2d] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Finalización estimada
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-[#1c241c] border border-[#2d3d2d] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-[#1e2e1e]">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Sprout size={13} className="text-[#4ade80]/60" />
                            <span>Este proyecto otorgará <strong className="text-[#4ade80]/80">+250 EXP</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="text-sm text-gray-500 hover:text-white transition-colors px-4 py-2">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit || submitting}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${canSubmit && !submitting
                                    ? "bg-[#4ade80] text-black hover:bg-[#22c55e] shadow-[0_0_16px_#4ade8044]"
                                    : "bg-[#4ade80]/20 text-[#4ade80]/40 cursor-not-allowed"
                                    }`}
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : "Plantar Proyecto"}
                                <Sprout size={14} />
                            </button>

                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════ RIGHT — TEAM ════════════════════════════════ */}
                <div
                    className="w-72 shrink-0 border-l border-[#2a3a2a] flex flex-col overflow-y-auto"
                    style={{ background: "#111911" }}
                >
                    <div className="p-6 border-b border-[#1e2e1e]">
                        <h3 className="text-sm font-bold text-white mb-0.5">Equipo del Proyecto</h3>
                        <p className="text-[11px] text-gray-600">Buscá por usuario de GitHub</p>
                    </div>

                    <div className="p-5 flex-1 flex flex-col gap-4">
                        {/* Search input */}
                        <div>
                            <div className="relative">
                                <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={ghInput}
                                    onChange={e => setGhInput(e.target.value)}

                                    placeholder="usuario de GitHub..."
                                    className="w-full bg-[#1c241c] border border-[#2d3d2d] rounded-xl pl-9 pr-3 py-2.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                                />
                                {ghLoading && (
                                    <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4ade80] animate-spin" />
                                )}
                            </div>

                            {/* GitHub result */}
                            {ghResult && (
                                <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-[#1c241c] border border-[#2d3d2d]">
                                    <img src={ghResult.avatar_url} alt={ghResult.login} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-semibold truncate">{ghResult.name ?? ghResult.login}</p>
                                        <p className="text-gray-500 text-[10px] truncate">@{ghResult.login}</p>
                                    </div>
                                    <button
                                        onClick={() => addTeamMember(ghResult)}
                                        className="shrink-0 w-7 h-7 rounded-lg bg-[#4ade80] text-black flex items-center justify-center hover:bg-[#22c55e] transition-colors"
                                    >
                                        <UserPlus size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Not found on GH */}
                            {ghError && ghInput.trim().length > 1 && (
                                <div className="mt-2 p-3 rounded-xl bg-[#1c241c] border border-[#2d3d2d] flex items-center justify-between">
                                    <p className="text-[11px] text-[#ef4444] font-medium">{ghError}</p>
                                </div>
                            )}
                        </div>

                        {/* Team members list */}
                        <div className="flex flex-col gap-2">
                            {team.length === 0 ? (
                                <p className="text-[11px] text-gray-700 text-center py-6">Aún no hay miembros en el equipo</p>
                            ) : (
                                team.map((m, i) => (
                                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1c241c] border border-[#2a3a2a] group">
                                        {m.avatar ? (
                                            <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-md object-cover shrink-0" />
                                        ) : (
                                            <div
                                                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                                                style={{ backgroundColor: m.color }}
                                            >
                                                <span className="text-black">{m.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium truncate">{m.name}</p>
                                            <p className="text-[10px] text-gray-600">@{m.username}</p>
                                        </div>
                                        <button
                                            onClick={() => removeMember(i)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Disclaimer at bottom */}
                        <div className="mt-auto pt-4 border-t border-[#1e2e1e]">
                            <p className="text-[10px] text-gray-700 leading-relaxed">
                                🌱 Solo se pueden agregar usuarios existentes y validados de GitHub.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
