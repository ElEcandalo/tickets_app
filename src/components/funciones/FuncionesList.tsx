'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import FuncionModal from './FuncionModal';
import { Funcion } from '@/types/funciones';

export default function FuncionesList() {
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuncion, setSelectedFuncion] = useState<Funcion | null>(null);

  useEffect(() => {
    fetchFunciones();
  }, []);

  const fetchFunciones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funciones')
        .select('id, obra_id, nombre, descripcion, fecha, ubicacion, capacidad_total, precio_entrada, estado, created_by, updated_at')
        .order('fecha', { ascending: true });

      if (error) {
        setError(error.message);
        return;
      }

      setFunciones((data || []).map((f: {
        id: string;
        obra_id: string;
        nombre: string;
        descripcion: string | null;
        fecha: string;
        ubicacion: string;
        capacidad_total: number;
        precio_entrada: number;
        estado: string;
        created_by: string | null;
        updated_at: string;
      }) => ({
        ...f,
        precio_entrada: Number(f.precio_entrada),
        descripcion: f.descripcion || '',
        created_by: f.created_by || '',
        estado: f.estado as 'ACTIVA' | 'CANCELADA' | 'FINALIZADA',
      })));
    } catch (err) {
      setError('Error al cargar las funciones');
      console.error('Error fetching funciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta función?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('funciones')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
        return;
      }

      // Actualizar la lista
      setFunciones(funciones.filter(f => f.id !== id));
    } catch (err) {
      setError('Error al eliminar la función');
      console.error('Error deleting funcion:', err);
    }
  };

  const handleCreate = () => {
    setSelectedFuncion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (funcion: Funcion) => {
    setSelectedFuncion(funcion);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchFunciones();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return 'bg-green-100 text-green-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      case 'FINALIZADA':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Funciones</h2>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nueva Función
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {funciones.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No hay funciones registradas</div>
          <p className="text-gray-400 mt-2">Crea la primera función para comenzar</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {funciones.map((funcion) => (
              <li key={funcion.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {funcion.nombre}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(funcion.estado)}`}>
                            {funcion.estado}
                          </span>
                        </div>
                      </div>
                                             <div className="mt-2 flex">
                         <div className="flex items-center text-sm text-gray-500">
                           <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                           </svg>
                           {funcion.fecha ? formatDate(funcion.fecha) : ''}
                         </div>
                       </div>
                      {funcion.descripcion && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {funcion.descripcion}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="mr-4">Capacidad: {funcion.capacidad_total}</span>
                        <span>Precio: ${funcion.precio_entrada}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleEdit(funcion)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => funcion.id && handleDelete(funcion.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      <FuncionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        funcion={selectedFuncion}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
} 