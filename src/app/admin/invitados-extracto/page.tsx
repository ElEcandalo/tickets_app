"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import type { InvitadoWithRelations } from '@/types/invitados';
import type { Funcion } from '@/types/funciones';

export default function InvitadosExtractoPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [invitados, setInvitados] = useState<InvitadoWithRelations[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user || profile?.email !== "elescandalo.info@gmail.com") {
        router.push("/login");
      } else {
        fetchInvitados();
      }
    }
  }, [user, profile, loading, router]);

  const fetchInvitados = async () => {
    setFetching(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("invitados")
        .select("id, nombre, email, cantidad_tickets, funcion_id, funciones(id, nombre, fecha, capacidad_total, precio_entrada)")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        return;
      }
      setInvitados(data || []);
    } catch (err) {
      setError("Error inesperado al cargar invitados");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Agrupar invitados por función con tipos explícitos
  const invitadosPorFuncion = invitados.reduce<Record<string, { funcion: Partial<Funcion> | undefined; invitados: InvitadoWithRelations[] }>>((acc, invitado) => {
    const funcion = Array.isArray(invitado.funciones) ? invitado.funciones[0] : invitado.funciones;
    const key = funcion ? `${funcion.nombre}__${funcion.fecha}` : 'Sin función';
    if (!acc[key]) acc[key] = { funcion, invitados: [] };
    acc[key].invitados.push(invitado);
    return acc;
  }, {});

  const handleCopyCSV = () => {
    const header = 'Función,Fecha,Nombre,Email,Cantidad Tickets';
    const rows: string[] = [];
    Object.values(invitadosPorFuncion).forEach(({ funcion, invitados }) => {
      invitados.forEach((i) => {
        rows.push([
          funcion?.nombre || '',
          funcion?.fecha ? new Date(funcion.fecha).toLocaleString('es-AR') : '',
          i.nombre,
          i.email,
          i.cantidad_tickets
        ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','));
      });
    });
    const csv = [header, ...rows].join('\n');
    navigator.clipboard.writeText(csv);
    alert('Extracto copiado al portapapeles');
  };

  const handleDownloadCSV = () => {
    const header = 'Función,Fecha,Nombre,Email,Cantidad Tickets';
    const rows: string[] = [];
    Object.values(invitadosPorFuncion).forEach(({ funcion, invitados }) => {
      invitados.forEach((i) => {
        rows.push([
          funcion?.nombre || '',
          funcion?.fecha ? new Date(funcion.fecha).toLocaleString('es-AR') : '',
          i.nombre,
          i.email,
          i.cantidad_tickets
        ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','));
      });
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invitados_extracto.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando invitados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Extracto de Invitados</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium print:hidden"
            >
              Imprimir / Guardar como PDF
            </button>
            <Link
              href="/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium print:hidden"
            >
              Volver al dashboard
            </Link>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium print:hidden"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 px-4 print:p-0 print:m-0 print:max-w-full">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleCopyCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Copiar extracto (CSV)
          </button>
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Descargar CSV
          </button>
        </div>
        <div className="print-area">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Extracto de Invitados</h1>
          {Object.entries(invitadosPorFuncion).map(([key, { funcion, invitados }]) => (
            <div key={key} className="mb-8">
              <div className="mb-2">
                <span className="font-semibold text-indigo-700">Función:</span> {funcion?.nombre || '-'}
                {funcion?.fecha && (
                  <span className="ml-4 text-gray-600">{new Date(funcion.fecha).toLocaleString('es-AR')}</span>
                )}
              </div>
              <table className="min-w-full divide-y divide-gray-200 mb-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitados.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{i.nombre}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{i.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{i.cantidad_tickets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {invitados.length === 0 && (
            <div className="text-center text-gray-500 py-8">No hay invitados registrados.</div>
          )}
        </div>
      </main>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            background: white;
            padding: 0;
            margin: 0;
          }
          .print-hidden, .print-hidden * {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
} 