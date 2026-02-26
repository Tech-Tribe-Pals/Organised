import "./globals.css";
import { Inter } from "next/font/google";
import AuthRedirectHandler from "@/components/auth/AuthRedirectHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Organiseed",
  description: "Nutre tus proyectos con Organiseed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#121212] text-white antialiased`}>
        {/* Ejecuta la limpieza de URL en segundo plano */}
        <AuthRedirectHandler />
        {children}
      </body>
    </html>
  );
}