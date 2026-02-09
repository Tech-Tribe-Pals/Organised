"use client"; // <--- Importante: esto lo hace Client Component
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // <--- Usa siempre 'next/navigation'

export default function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Si detecta el token en el hash, limpia la URL y redirige
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  return null; // Este componente no renderiza nada visual
}