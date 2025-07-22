'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Funcion } from '@/types/funciones';
import ObraSelector from './ObraSelector';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface FuncionModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcion?: Funcion | null;
  onSuccess: () => void;
}

// Zod schema para validación de función
const funcionSchema = z.object({
  obra_id: z.string().uuid({ message: 'Debes seleccionar una obra válida.' }),
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, 'La fecha es obligatoria.'),
  ubicacion: z.string().min(1),
  capacidad_total: z.number().min(1, 'La capacidad debe ser mayor a 0.'),
  precio_entrada: z.number().min(1, 'El precio debe ser mayor a 0.'),
  estado: z.enum(['ACTIVA', 'CANCELADA', 'FINALIZADA']),
  created_by: z.string().uuid({ message: 'Usuario no válido.' }),
});

export default function FuncionModal({ isOpen, onClose, funcion, onSuccess }: FuncionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // RHF setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError: setFormError
  } = useForm<{
    obra_id: string;
    nombre: string;
    descripcion?: string;
    fecha: string;
    ubicacion: string;
    capacidad_total: number;
    precio_entrada: number;
    estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
    created_by: string;
  }>({
    resolver: zodResolver(funcionSchema),
    defaultValues: {
      obra_id: '',
      nombre: '',
      descripcion: '',
      fecha: '',
      ubicacion: 'El Escándalo',
      capacidad_total: 10,
      precio_entrada: 0,
      estado: 'ACTIVA',
      created_by: '',
    },
    mode: 'onTouched',
  });

  // Sincronizar datos iniciales si se edita
  useEffect(() => {
    if (funcion) {
      setValue('obra_id', funcion.obra_id || '');
      setValue('nombre', funcion.nombre || '');
      setValue('descripcion', funcion.descripcion || '');
      setValue('fecha', funcion.fecha ? new Date(funcion.fecha).toISOString().slice(0, 16) : '');
      setValue('ubicacion', funcion.ubicacion || 'El Escándalo');
      setValue('capacidad_total', funcion.capacidad_total || 10);
      setValue('precio_entrada', funcion.precio_entrada || 0);
      setValue('estado', funcion.estado || 'ACTIVA');
      setValue('created_by', funcion.created_by || user?.id || '');
      setSelectedObraId(funcion.obra_id);
    } else {
      setValue('obra_id', '');
      setValue('nombre', '');
      setValue('descripcion', '');
      setValue('fecha', '');
      setValue('ubicacion', 'El Escándalo');
      setValue('capacidad_total', 10);
      setValue('precio_entrada', 0);
      setValue('estado', 'ACTIVA');
      setValue('created_by', user?.id || '');
      setSelectedObraId(null);
    }
    setError('');
    setFieldErrors({});
  }, [funcion, setValue, user]);

  const handleObraSelect = (obraId: string | null, obraData: { nombre: string; descripcion: string | null }) => {
    setSelectedObraId(obraId);
    if (obraId) {
      setValue('obra_id', obraId);
      setValue('nombre', obraData.nombre);
      setValue('descripcion', obraData.descripcion || '');
    }
  };

  const onSubmit = async (data: { obra_id: string; nombre: string; descripcion?: string; fecha: string; ubicacion: string; capacidad_total: number; precio_entrada: number; estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA'; created_by: string; }) => {
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      // Validar que la fecha no sea anterior al día actual
      const fechaSeleccionada = new Date(data.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSeleccionada < hoy) {
        setFormError('fecha', { type: 'manual', message: 'La fecha de la función no puede ser anterior al día actual.' });
        setLoading(false);
        return;
      }
      // Validar que obra_id no sea vacío ni null
      if (!data.obra_id || data.obra_id === '') {
        setFormError('obra_id', { type: 'manual', message: 'Debes seleccionar una obra.' });
        setLoading(false);
        return;
      }
      // Preparar datos para Supabase (sin campos vacíos)
      const supabaseData = { ...data };
      if (!supabaseData.obra_id || supabaseData.obra_id === '') {
        delete (supabaseData as { obra_id?: string; }).obra_id;
      }
      // Convertir fecha a ISO si es necesario
      if (supabaseData.fecha) {
        supabaseData.fecha = new Date(supabaseData.fecha).toISOString();
      }
      let result;
      if (funcion && funcion.id) {
        // Actualizar función existente
        result = await supabase
          .from('funciones')
          .update(supabaseData)
          .eq('id', funcion.id);
      } else {
        // Crear nueva función
        result = await supabase
          .from('funciones')
          .insert([supabaseData]);
      }
      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError('Error inesperado al guardar la función');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {funcion?.id ? 'Editar Función' : 'Nueva Función'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-indigo-100 hover:bg-indigo-500 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              {/* Selector de Obra */}
              <ObraSelector
                selectedObraId={selectedObraId}
                onObraSelect={handleObraSelect}
                isEditing={!!funcion?.id}
                error={fieldErrors.obra_id}
              />

              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre de la obra *
                </label>
                <input
                  type="text"
                  id="nombre"
                  {...register('nombre')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 ${
                    selectedObraId ? 'bg-gray-50' : 'bg-white'
                  }`}
                  placeholder="Ej: Romeo y Julieta"
                  readOnly={!!selectedObraId}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  {...register('descripcion')}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 ${
                    selectedObraId ? 'bg-gray-50' : 'bg-white'
                  }`}
                  placeholder="Breve descripción de la obra..."
                  readOnly={!!selectedObraId}
                />
              </div>

                            {/* Fecha y Hora */}
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                  Fecha y Hora (formato 24h) *
                </label>
                <input
                  type="datetime-local"
                  id="fecha"
                  {...register('fecha')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                  step="900"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Formato 24h: 15:30 (3:30 PM)
                </p>
                {errors.fecha && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                )}
              </div>

                            {/* Ubicación fija */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <div className="mt-1 flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <span className="text-gray-900 font-medium">El Escándalo</span>
                </div>
              </div>

              {/* Capacidad y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capacidad_total" className="block text-sm font-medium text-gray-700">
                    Capacidad *
                  </label>
                  <select
                    id="capacidad_total"
                    {...register('capacidad_total', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                  >
                    <option value="">Seleccionar capacidad</option>
                    <option value="10">10 personas</option>
                    <option value="20">20 personas</option>
                    <option value="30">30 personas</option>
                    <option value="40">40 personas</option>
                    <option value="50">50 personas</option>
                    <option value="60">60 personas</option>
                    <option value="70">70 personas</option>
                    <option value="80">80 personas</option>
                    <option value="90">90 personas</option>
                    <option value="100">100 personas</option>
                  </select>
                  {errors.capacidad_total && (
                    <p className="mt-1 text-sm text-red-600">{errors.capacidad_total.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="precio_entrada" className="block text-sm font-medium text-gray-700">
                    Precio *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      id="precio_entrada"
                      {...register('precio_entrada', { valueAsNumber: true })}
                      className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                      placeholder="2500"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    {errors.precio_entrada && (
                      <p className="mt-1 text-sm text-red-600">{errors.precio_entrada.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="estado"
                  {...register('estado')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                >
                  <option value="ACTIVA">Activa</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="FINALIZADA">Finalizada</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto sm:text-sm"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  funcion?.id ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 