"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types/user_profiles";
import Link from 'next/link';

const ADMIN_EMAIL = "elescandalo.info@gmail.com";

export default function UsuariosAdminPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || profile?.email !== ADMIN_EMAIL) {
        router.push("/login");
      } else {
        fetchUsuarios();
      }
    }
    // eslint-disable-next-line
  }, [user, profile, loading]);

  const fetchUsuarios = async () => {
    setFetching(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, role, created_at, updated_at")
        .neq("email", ADMIN_EMAIL)
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        return;
      }
      setUsuarios(data || []);
    } catch (err) {
      setError("Error inesperado al cargar usuarios");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    setActionLoading(id);
    setError("");
    try {
      // 1. Eliminar de Supabase Auth (auth.users) vía API
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Error eliminando usuario de Auth");
        setActionLoading(null);
        return;
      }
      // 2. Eliminar de user_profiles
      const { error } = await supabase.from("user_profiles").delete().eq("id", id);
      if (error) {
        setError(error.message);
        setActionLoading(null);
        return;
      }
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError("Error inesperado al eliminar usuario");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Eliminar o comentar la declaración de handleChangeRole si no se usa
  // const handleChangeRole = async (id: string, newRole: UserRole) => {
  //   setActionLoading(id + newRole);
  //   setError("");
  //   try {
  //     const { error } = await supabase
  //       .from("user_profiles")
  //       .update({ role: newRole })
  //       .eq("id", id);
  //     if (error) {
  //       setError(error.message);
  //       return;
  //     }
  //     setUsuarios((prev) =>
  //       prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
  //     );
  //   } catch (err) {
  //     setError("Error inesperado al cambiar rol");
  //     console.error(err);
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Volver al panel
            </Link>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 px-4">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.full_name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.role}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      disabled={actionLoading === u.id}
                    >
                      {actionLoading === u.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && (
            <div className="text-center text-gray-500 py-8">No hay usuarios registrados.</div>
          )}
        </div>
      </main>
    </div>
  );
} 