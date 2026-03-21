"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthSession } from "@/lib/auth-client";

export default function AuthRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, loading } = useAuthSession();

  useEffect(() => {
    if (loading) {
      return;
    }

    const isAuthRoute = pathname === "/login" || pathname === "/signup";

    if (!authenticated && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (authenticated && isAuthRoute) {
      router.replace("/");
    }
  }, [authenticated, loading, pathname, router]);

  return null;
}