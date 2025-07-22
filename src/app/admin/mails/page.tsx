"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useSWR from 'swr';
import Link from 'next/link';

export default function MailsAdminPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || profile?.email !== "elescandalo.info@gmail.com")) {
      router.push("/login");
    }
  }, [user, profile, loading, router]);

  const fetchMails = async () => {
    const { data, error } = await supabase
      .from("mailing_list")
      .select("id, email, nombre, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  };
  const { data: mails = [], isLoading, mutate } = useSWR(
    profile?.email === "elescandalo.info@gmail.com" ? 'mailing_list' : null,
    fetchMails
  );

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este mail?')) return;
    const { error } = await supabase.from('mailing_list').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    mutate();
  };

  if (!user || profile?.email !== "elescandalo.info@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lista de Emails de Invitados</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Volver al dashboard
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mails.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{m.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{m.nombre || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(m.created_at).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mails.length === 0 && (
            <div className="text-center text-gray-500 py-8">No hay emails registrados.</div>
          )}
        </div>
      </main>
    </div>
  );
} 