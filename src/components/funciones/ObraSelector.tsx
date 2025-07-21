'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Obra } from '@/types/obras';
import useSWR from 'swr';

interface ObraSelectorProps {
  selectedObraId: string | null;
  onObraSelect: (obraId: string | null, obraData: { nombre: string; descripcion: string | null }) => void;
  isEditing: boolean;
  error?: string;
}

export default function ObraSelector({ selectedObraId, onObraSelect, isEditing, error }: ObraSelectorProps) {
  const { user } = useAuth();
  const [showNewObra, setShowNewObra] = useState(false);
  const [newObraNombre, setNewObraNombre] = useState('');
  const [newObraDescripcion, setNewObraDescripcion] = useState('');

  // Fetch obras con SWR
  const fetchObras = async () => {
    const { data, error } = await supabase
      .from('obras')
      .select('id, nombre, descripcion, created_by')
      .order('nombre', { ascending: true });
    if (error) throw new Error(error.message);
    return (data as Obra[]) || [];
  };
  const { data: obras = [], isLoading, mutate } = useSWR('obras', fetchObras);

  const handleCreateObra = async () => {
    if (!newObraNombre.trim()) return;
    if (!user?.id) {
      console.error('No user found');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('obras')
        .insert([{
          nombre: newObraNombre.trim(),
          descripcion: newObraDescripcion.trim() || null,
          created_by: user.id
        }])
        .select('id, nombre, descripcion, created_by')
        .single();
      if (error) {
        console.error('Error creating obra:', error);
        return;
      }
      if (!data) {
        console.error('No data returned from obra creation');
        return;
      }
      mutate(); // Refrescar lista
      onObraSelect(data.id, {
        nombre: data.nombre,
        descripcion: data.descripcion
      });
      setNewObraNombre('');
      setNewObraDescripcion('');
      setShowNewObra(false);
    } catch (err) {
      console.error('Error creating obra:', err);
    }
  };

  const handleObraSelect = (obraId: string) => {
    if (!obraId) return;
    const obra = obras.find(o => o.id === obraId);
    if (obra) {
      onObraSelect(obraId, {
        nombre: obra.nombre,
        descripcion: obra.descripcion
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de obra existente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Obra
        </label>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <select
              value={selectedObraId || ''}
              onChange={(e) => handleObraSelect(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
              disabled={isEditing}
              required
            >
              <option value="" disabled hidden>Seleccionar una obra existente</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Botón para crear nueva obra */}
      {!isEditing && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowNewObra(!showNewObra)}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            {showNewObra ? 'Cancelar nueva obra' : '+ Crear nueva obra'}
          </button>
        </div>
      )}

      {/* Formulario para nueva obra */}
      {showNewObra && !isEditing && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Nueva Obra</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="newObraNombre" className="block text-xs font-medium text-gray-700">
                Nombre de la obra *
              </label>
              <input
                type="text"
                id="newObraNombre"
                value={newObraNombre}
                onChange={(e) => setNewObraNombre(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                placeholder="Ej: Romeo y Julieta"
              />
            </div>
            <div>
              <label htmlFor="newObraDescripcion" className="block text-xs font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="newObraDescripcion"
                value={newObraDescripcion}
                onChange={(e) => setNewObraDescripcion(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                placeholder="Breve descripción de la obra..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCreateObra}
                disabled={!newObraNombre.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Crear Obra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 