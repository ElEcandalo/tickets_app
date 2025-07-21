'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FuncionesList from '@/components/funciones/FuncionesList';
import InvitadosList from '@/components/invitados/InvitadosList';
import QRTest from '@/components/tickets/QRTest';
import Link from 'next/link';

export default function AdminPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'funciones' | 'invitados' | 'qr-test' | 'validator'>('funciones');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
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

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('funciones')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'funciones'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎪 Funciones
              </button>
              <button
                onClick={() => setActiveTab('invitados')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invitados'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Invitados
              </button>
              <button
                onClick={() => setActiveTab('qr-test')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'qr-test'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🧪 QR Test
              </button>
              {/* Tab de usuarios solo para el admin principal */}
              {profile?.email === 'elescandalo.info@gmail.com' && (
                <Link
                  href="/admin/usuarios"
                  className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  🧑‍💼 Usuarios
                </Link>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'funciones' && <FuncionesList />}
          {activeTab === 'invitados' && <InvitadosList />}
          {activeTab === 'qr-test' && <QRTest />}
        </div>
      </main>
    </div>
  );
} 