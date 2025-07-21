'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import InvitadosList from '@/components/invitados/InvitadosList';

export default function ColaboradorPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'colaborador')) {
      router.push('/login');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'colaborador') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Colaborador
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenido, {profile?.full_name || profile?.email}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gestión de Invitados */}
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">👥 Gestionar Invitados</h2>
            <InvitadosList showStats={false} />
          </div>
        </div>
      </main>
    </div>
  );
} 