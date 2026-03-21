"use client";
import { useState } from "react";
import { Github } from "lucide-react";

import { login, lookupEmail, register } from "@/lib/auth-client";

const DEFAULT_AVATAR = "/avatars/mitchell.webp";

function formatNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "Organiseed";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();

  if (!cleaned) {
    return "Organiseed";
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  const [displayName, setDisplayName] = useState("Organiseed");
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "email") {
      if (email.includes("@")) {
        setCheckingEmail(true);

        try {
          const result = await lookupEmail(email);
          const nextMode = result.exists ? "login" : "register";

          setMode(nextMode);
          setDisplayName(result.user?.name ?? (result.exists ? formatNameFromEmail(email) : "Organiseed"));
          setAvatarSrc(result.user?.avatarUrl ?? DEFAULT_AVATAR);
          setGithubLogin(result.user?.githubLogin ?? null);
          setGithubUrl(result.user?.githubUrl ?? null);
          setPassword("");
          setStep("password");
        } catch (error) {
          const message = error instanceof Error ? error.message : "No se pudo verificar el email.";
          alert(message);
        } finally {
          setCheckingEmail(false);
        }
      }

      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }

      window.location.href = "/";
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : mode === "login"
          ? "No se pudo iniciar sesion."
          : "No se pudo crear la cuenta.";

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setMode("login");
    setPassword("");
    setAvatarSrc(DEFAULT_AVATAR);
    setDisplayName("Organiseed");
    setGithubLogin(null);
    setGithubUrl(null);
  };

  const isPasswordStep = step === "password";
  const isRegisterMode = mode === "register";
  const currentButtonLabel = isPasswordStep ? (isRegisterMode ? "Registrar" : "Ingresar") : (checkingEmail ? "Verificando..." : "Continuar");
  const currentHeading = isPasswordStep ? displayName : "Organiseed";

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center relative overflow-hidden p-6">
      {/* Cuadraditos verdes decorativos */}
      <div className="absolute top-20 left-10 w-6 h-6 bg-green-500/20 border border-green-500/40 rounded-sm animate-pulse-slow"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-sm"></div>
      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-green-500/30 rounded-sm blur-sm"></div>

      <div className="w-full max-w-[400px] z-10">
        <div className="flex flex-col items-center mb-10">
          <div className={`w-32 h-32 rounded-full border-4 border-[#181818] overflow-hidden mb-4 shadow-2xl transition-all duration-500 ${isPasswordStep ? 'scale-110 shadow-green-500/20' : 'grayscale opacity-50'}`}>
            <img
              src={avatarSrc}
              alt={currentHeading}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className={`text-xl font-medium tracking-wide transition-colors ${isPasswordStep ? 'text-white' : 'text-gray-500'}`}>
            {currentHeading}
          </h2>
          {isPasswordStep && (
            <div className="mt-3 min-h-10">
              {githubLogin ? (
                <a
                  href={githubUrl ?? `https://github.com/${githubLogin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[11px] text-green-200"
                >
                  <Github size={13} />
                  <span>GitHub detectado: @{githubLogin}</span>
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2b2b2b] bg-[#161616] px-3 py-1.5 text-[11px] text-gray-400">
                  <Github size={13} />
                  <span>{isRegisterMode ? "Sin perfil visible de GitHub. Se registra con avatar por defecto." : "Cuenta encontrada, pero GitHub no devolvio un perfil visible para este email."}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Campo de Email */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              readOnly={isPasswordStep}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-[#181818] border border-[#262626] rounded-md px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all ${isPasswordStep ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="tu@email.com"
            />
          </div>

          {isPasswordStep && (
            <div className="space-y-2 animate-fade-in-up">
              <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">
                Contraseña
              </label>
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-md px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all"
                placeholder="••••••••"
              />
              <p className="text-[11px] text-gray-500 ml-1">
                {isRegisterMode ? "No encontramos una cuenta. Creala con tu contraseña." : "Cuenta encontrada. Ingresá tu contraseña para continuar."}
              </p>
              <button 
                type="button"
                onClick={handleBackToEmail}
                className="text-[10px] text-gray-600 hover:text-green-500 block text-right mt-1 w-full text-right"
              >
                ¿No es tu cuenta? Cambiar email
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || checkingEmail}
            className="w-full bg-transparent border border-[#262626] hover:bg-white/5 text-gray-300 py-3 rounded-md transition-all font-medium mt-4 border-green-500/20"
          >
            {submitting ? "Procesando..." : currentButtonLabel}
          </button>
        </form>

        <div className="mt-20 flex justify-center opacity-40">
          <span className="font-bold text-2xl tracking-tighter">
            Organi<span className="text-green-500">seed</span>
          </span>
        </div>
      </div>
    </main>
  );
}