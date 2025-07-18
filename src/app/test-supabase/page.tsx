'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Probando conexión...');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        // Probar conexión básica
        const { error: testError } = await supabase.from('user_profiles').select('*').limit(1);
        
        if (testError) {
          setStatus(`❌ Error de conexión: ${testError.message}`);
          return;
        }

        setStatus('✅ Conexión exitosa a Supabase');

        // Verificar que las tablas principales existen
        const tablesToCheck = [
          'user_profiles',
          'funciones', 
          'invitados',
          'entradas',
          'funcion_colaboradores'
        ];

        const existingTables: string[] = [];
        
        for (const table of tablesToCheck) {
          try {
            const { error } = await supabase.from(table).select('*').limit(1);
            if (!error || error.code === 'PGRST116') {
              existingTables.push(table);
            }
          } catch {
            console.log(`Tabla ${table} no encontrada`);
          }
        }

        setTables(existingTables);
        
        if (existingTables.length === tablesToCheck.length) {
          setStatus('✅ Conexión exitosa - Todas las tablas están disponibles');
        } else {
          setStatus(`⚠️ Conexión exitosa - ${existingTables.length}/${tablesToCheck.length} tablas disponibles`);
        }

      } catch (err) {
        setStatus(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Prueba de Conexión Supabase</h1>
            
            <div className="mb-8">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                status.includes('✅') ? 'bg-green-100 text-green-800' : 
                status.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {status}
              </div>
            </div>
            
            {tables.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tablas disponibles:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tables.map((table) => (
                    <div key={table} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-green-800 font-medium">{table}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Estado del Proyecto</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-blue-800">✅ Sistema de autenticación implementado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-blue-800">✅ Páginas de login y admin creadas</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-blue-800">🔄 CRUD de funciones (en progreso)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-blue-800">⏳ Gestión de invitados</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-blue-800">⏳ Sistema de códigos QR</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Ir al Login
              </Link>
              <Link 
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Panel Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 