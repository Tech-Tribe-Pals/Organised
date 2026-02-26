"use client";
import { useEffect, useState } from "react";

interface GHCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
    };
  };
  author?: {
    avatar_url?: string;
    login?: string;
  } | null;
}

interface Props {
  repo?: string;
}

const CommitsSection = ({ repo }: Props) => {
  const [commits, setCommits] = useState<GHCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!repo) return;
    const trimmedRepo = repo.trim();
    if (!trimmedRepo.includes('/')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    fetch(`/api/github/commits?repo=${encodeURIComponent(trimmedRepo)}`)
      .then(res => res.json())
      .then(data => {
        console.log("GitHub Commits API Response:", data);
        if (Array.isArray(data)) {
          setCommits(data);
        } else {
          setCommits([]);
          if (data.message && data.message.includes("API rate limit exceeded")) {
            setErrorMsg("Límite de la API de GitHub excedido (60 req/hora). Intentá más tarde.");
          } else if (data.message) {
            setErrorMsg(`Error de GitHub: ${data.message}`);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching commits:", err);
        setCommits([]);
        setErrorMsg("Error de red al conectar con GitHub.");
      })
      .finally(() => setLoading(false));
  }, [repo]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-white">Commits</h3>
      </div>

      {!repo ? (
        <div className="text-[11px] text-gray-500 bg-[#1e1e1e] p-3 rounded-xl border border-[#2a2a2a] text-center leading-relaxed">
          Vinculá un repositorio de GitHub para ver los últimos commits en tiempo real.
        </div>
      ) : errorMsg ? (
        <div className="text-[11px] text-red-400 bg-[#3a1a1a] p-3 rounded-xl border border-red-900/50 text-center leading-relaxed font-medium">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-lg shrink-0 bg-[#1e1e1e] border border-[#2a2a2a]" />
              <div className="flex-1 min-w-0 py-1 space-y-2">
                <div className="h-3 bg-[#2a2a2a] rounded w-1/3" />
                <div className="h-2.5 bg-[#1e1e1e] rounded w-3/4" />
                <div className="h-2.5 bg-[#1e1e1e] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : commits.length === 0 ? (
        <div className="text-[11px] text-gray-500 bg-[#1e1e1e] p-3 rounded-xl border border-[#2a2a2a] text-center leading-relaxed">
          No se encontraron commits o el repositorio no es público.
        </div>
      ) : (
        <div className="space-y-3">
          {commits.map((c) => {
            const authorName = c.author?.login || c.commit.author.name || "Unknown";
            const avatarUrl = c.author?.avatar_url;
            return (
              <div key={c.sha} className="flex items-start gap-3">
                {/* Avatar rectangular */}
                <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 text-xs font-bold">{authorName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold mb-0.5 truncate">{authorName}</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{c.commit.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommitsSection;
