'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mis Funciones */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">F</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Mis Funciones
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Ver funciones asignadas
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-700 hover:text-blue-900">
                    Ver mis funciones
                  </a>
                </div>
              </div>
            </div>

            {/* Gestión de Invitados */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">I</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Invitados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Gestionar invitados
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-700 hover:text-green-900">
                    Ver invitados
                  </a>
                </div>
              </div>
            </div>

            {/* Escáner QR */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">QR</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Escáner QR
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Validar entradas
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-orange-700 hover:text-orange-900">
                    Abrir escáner
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información del Colaborador
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{profile?.full_name || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <p className="text-sm text-gray-900 capitalize">{profile?.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Funciones asignadas</p>
                  <p className="text-sm text-gray-900">0 funciones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 