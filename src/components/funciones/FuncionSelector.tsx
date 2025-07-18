'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Funcion } from '@/types/funciones';

interface FuncionSelectorProps {
  selectedFuncionId: string | null;
  onFuncionSelect: (funcionId: string | null, funcionData: { nombre: string; capacidad_total: number; precio_entrada: number }) => void;
  isEditing: boolean;
}

export default function FuncionSelector({ selectedFuncionId, onFuncionSelect, isEditing }: FuncionSelectorProps) {
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunciones();
  }, []);

  const fetchFunciones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funciones')
        .select('id, nombre, fecha, capacidad_total, precio_entrada, estado, obra_id')
        .eq('estado', 'ACTIVA')
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching funciones:', error);
        return;
      }

      setFunciones((data as Funcion[]) || []);
    } catch (err) {
      console.error('Error fetching funciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFuncionSelect = (funcionId: string) => {
    const funcion = funciones.find(f => f.id === funcionId);
    if (funcion) {
      onFuncionSelect(funcionId, {
        nombre: funcion.nombre,
        capacidad_total: funcion.capacidad_total,
        precio_entrada: funcion.precio_entrada
      });
    }
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

  return (
    <div className="space-y-4">
      {/* Selector de función existente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Función
        </label>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <select
            value={selectedFuncionId || ''}
            onChange={(e) => handleFuncionSelect(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            disabled={isEditing}
          >
            <option value="">Seleccionar una función</option>
            {funciones.map((funcion) => (
              <option key={funcion.id} value={funcion.id}>
                {funcion.nombre} - {formatDate(funcion.fecha)} (Cap: {funcion.capacidad_total})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Mensaje si no hay funciones activas */}
      {!loading && funciones.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No hay funciones activas disponibles</p>
        </div>
      )}
    </div>
  );
} 