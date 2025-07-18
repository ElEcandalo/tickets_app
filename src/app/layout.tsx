import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gestión de Teatro",
  description: "App interna para gestión de entradas de teatro",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}
