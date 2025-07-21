'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { InvitadoWithRelations } from '@/types/invitados';
import FuncionSelector from '../funciones/FuncionSelector';
import { z } from 'zod';
import { TicketService } from '@/services/ticketService';
import type { Invitado } from '@/types/invitados';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquema de validación para Invitado
const invitadoSchema = z.object({
  funcion_id: z.string().uuid({ message: 'Debes seleccionar una función válida.' }),
  nombre: z.string().min(2, 'El nombre es obligatorio').max(100, 'El nombre es demasiado largo'),
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
  telefono: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Solo números, espacios, guiones y paréntesis').optional().or(z.literal('')),
  cantidad_tickets: z.number().int().min(1, 'Debe ser al menos 1').max(100, 'Máximo 100 tickets'),
  colaborador_id: z.string().uuid().optional().or(z.literal('')).or(z.null()),
  created_at: z.string().optional().or(z.literal('')),
  updated_at: z.string().optional().or(z.literal('')),
});

interface InvitadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitado?: InvitadoWithRelations | null;
  onSuccess: () => void;
  funcionId?: string; // Si se proporciona, fija la función
}

export default function InvitadoModal({ isOpen, onClose, invitado, onSuccess, funcionId }: InvitadoModalProps) {
  const { profile } = useAuth();
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFuncionId, setSelectedFuncionId] = useState<string | null>(null);
  const [selectedFuncionData, setSelectedFuncionData] = useState<{ nombre: string; capacidad_total: number; precio_entrada: number; tickets_vendidos: number }>({
    nombre: '',
    capacidad_total: 0,
    precio_entrada: 0,
    tickets_vendidos: 0
  });
  const [colaboradores, setColaboradores] = useState<Array<{ id: string; nombre: string; email: string }>>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);

  const isEditing = !!invitado?.id;
  const funcionSeleccionada = !!selectedFuncionId;

  // RHF setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError: setFormError,
    clearErrors
  } = useForm<{
    funcion_id: string;
    nombre: string;
    email: string;
    telefono?: string;
    cantidad_tickets: number;
    colaborador_id?: string | null;
    created_at?: string;
    updated_at?: string;
  }>({
    resolver: zodResolver(invitadoSchema),
    defaultValues: {
      funcion_id: funcionId || '',
      nombre: '',
      email: '',
      telefono: '',
      cantidad_tickets: 1,
      colaborador_id: null,
      created_at: undefined,
      updated_at: undefined,
    },
    mode: 'onTouched',
  });

  // Sincronizar datos iniciales si se edita
  useEffect(() => {
    if (invitado) {
      setValue('funcion_id', invitado.funcion_id || '');
      setValue('nombre', invitado.nombre || '');
      setValue('email', invitado.email || '');
      setValue('telefono', invitado.telefono || '');
      setValue('cantidad_tickets', invitado.cantidad_tickets || 1);
      setValue('colaborador_id', invitado.colaborador_id || null);
      setSelectedFuncionId(invitado.funcion_id || null);
      if (invitado.funciones && invitado.funciones[0]) {
        setSelectedFuncionData({
          nombre: invitado.funciones[0].nombre,
          capacidad_total: invitado.funciones[0].capacidad_total,
          precio_entrada: invitado.funciones[0].precio_entrada,
          tickets_vendidos: 0
        });
      }
    } else {
      setValue('funcion_id', funcionId || '');
      setValue('nombre', '');
      setValue('email', '');
      setValue('telefono', '');
      setValue('cantidad_tickets', 1);
      setValue('colaborador_id', null);
      setSelectedFuncionId(funcionId || null);
      if (funcionId) {
        (async () => {
          const { data: funcionData, error } = await supabase
            .from('funciones')
            .select('nombre, capacidad_total, precio_entrada')
            .eq('id', funcionId)
            .single();
          if (!error && funcionData) {
            setSelectedFuncionData({
              nombre: funcionData.nombre,
              capacidad_total: Number(funcionData.capacidad_total) || 0,
              precio_entrada: Number(funcionData.precio_entrada) || 0,
              tickets_vendidos: 0
            });
          } else {
            setSelectedFuncionData({
              nombre: '',
              capacidad_total: 0,
              precio_entrada: 0,
              tickets_vendidos: 0
            });
          }
        })();
      } else {
        setSelectedFuncionData({
          nombre: '',
          capacidad_total: 0,
          precio_entrada: 0,
          tickets_vendidos: 0
        });
      }
    }
    setError('');
  }, [invitado, funcionId, setValue]);

  // Si el usuario es colaborador (no admin), autocompletar y bloquear el campo
  useEffect(() => {
    if (profile && profile.role === 'colaborador') {
      setValue('colaborador_id', profile.id);
    }
  }, [profile, setValue]);

  useEffect(() => {
    if (isOpen) {
      fetchColaboradores();
    }
  }, [isOpen]);

  const fetchColaboradores = async () => {
    try {
      setLoadingColaboradores(true);
      const { data, error } = await supabase
        .from('colaboradores')
        .select('id, nombre, email')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching colaboradores:', error);
        return;
      }

      setColaboradores(data || []);
    } catch (err) {
      console.error('Error fetching colaboradores:', err);
    } finally {
      setLoadingColaboradores(false);
    }
  };

  const fetchFuncionStats = async (funcionId: string) => {
    try {
      // Obtener estadísticas de la función
      const { data: invitadosData, error } = await supabase
        .from('invitados')
        .select('cantidad_tickets')
        .eq('funcion_id', funcionId);

      if (error) {
        console.error('Error fetching funcion stats:', error);
        return 0;
      }

      const ticketsVendidos = invitadosData?.reduce((sum, invitado) => sum + invitado.cantidad_tickets, 0) || 0;
      return ticketsVendidos;
    } catch (err) {
      console.error('Error fetching funcion stats:', err);
      return 0;
    }
  };

  const handleFuncionSelect = async (funcionId: string | null, funcionData: { nombre: string; capacidad_total: number; precio_entrada: number }) => {
    setSelectedFuncionId(funcionId);
    setSelectedFuncionData({
      ...funcionData,
      tickets_vendidos: 0
    });
    if (funcionId) {
      const ticketsVendidos = await fetchFuncionStats(funcionId);
      setSelectedFuncionData(prev => ({
        ...prev,
        tickets_vendidos: ticketsVendidos
      }));
      setValue('funcion_id', funcionId);
    }
  };

  const onSubmit = async (data: { funcion_id: string; nombre: string; email: string; telefono?: string; cantidad_tickets: number; colaborador_id?: string | null; created_at?: string; updated_at?: string; }) => {
    setFormLoading(true);
    setError('');
    // Calcular variables de capacidad antes de la validación
    const capacidadDisponible = selectedFuncionData.capacidad_total - selectedFuncionData.tickets_vendidos;
    const ticketsActuales = isEditing ? (invitado?.cantidad_tickets || 0) : 0;
    const maxTickets = capacidadDisponible + ticketsActuales;
    if (data.cantidad_tickets > maxTickets) {
      setFormError('cantidad_tickets', { type: 'manual', message: `Máximo disponible: ${maxTickets} tickets` });
      setFormLoading(false);
      return;
    }
    try {
      // Filtrar solo los campos válidos para la tabla 'invitados'
      const invitadoPayload: Omit<Invitado, 'id'> & Partial<Pick<Invitado, 'id'>> = {
        funcion_id: data.funcion_id,
        colaborador_id: data.colaborador_id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || '',
        cantidad_tickets: data.cantidad_tickets,
      };
      if (isEditing && invitado?.id) {
        invitadoPayload.id = invitado.id;
      }
      let result;
      if (isEditing && invitado?.id) {
        result = await supabase
          .from('invitados')
          .update(invitadoPayload)
          .eq('id', invitado.id);
      } else {
        result = await supabase
          .from('invitados')
          .insert([invitadoPayload])
          .select();
      }
      if (result.error) {
        setError(result.error.message);
        setFormLoading(false);
        return;
      }
      // Generar tickets automáticamente si se creó exitosamente
      if (!isEditing && result.data && Array.isArray(result.data) && result.data.length > 0) {
        try {
          const invitadoId = result.data[0].id;
          if (data.funcion_id) {
            await TicketService.createTicketsForInvitado(
              invitadoId,
              data.funcion_id,
              data.cantidad_tickets
            );
          }
        } catch {
          // No fallar el proceso si hay error en tickets, solo log
        }
      }
      onSuccess();
      onClose();
    } catch {
      setError('Error inesperado al guardar el invitado');
    } finally {
      setFormLoading(false);
    }
  };

  if (!isOpen) return null;

  const capacidadDisponible = selectedFuncionData.capacidad_total - selectedFuncionData.tickets_vendidos;
  const ticketsActuales = isEditing ? (invitado?.cantidad_tickets || 0) : 0;
  const ticketsNuevos = watch('cantidad_tickets') - ticketsActuales;
  const capacidadSuficiente = ticketsNuevos <= capacidadDisponible;

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
                {isEditing ? 'Editar Invitado' : 'Nuevo Invitado'}
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
              {/* Selector de Función */}
              {!funcionId && (
                <div>
                  <FuncionSelector
                    selectedFuncionId={selectedFuncionId}
                    onFuncionSelect={handleFuncionSelect}
                    isEditing={isEditing}
                  />
                </div>
              )}

              {/* Información de la función seleccionada */}
              {selectedFuncionId && selectedFuncionData.nombre && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Información de la Función</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Obra:</strong> {selectedFuncionData.nombre}</p>
                    <p><strong>Capacidad total:</strong> {selectedFuncionData.capacidad_total} personas</p>
                    <p><strong>Precio:</strong> ${selectedFuncionData.precio_entrada}</p>
                    <p><strong>Capacidad disponible:</strong> {capacidadDisponible} tickets</p>
                  </div>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del invitado *
                </label>
                <input
                  type="text"
                  id="nombre"
                  {...register('nombre')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white ${!funcionSeleccionada ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  placeholder="Ej: Juan Pérez"
                  disabled={!funcionSeleccionada}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="text"
                  id="email"
                  {...register('email')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white ${!funcionSeleccionada ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  placeholder="juan@ejemplo.com"
                  disabled={!funcionSeleccionada}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  {...register('telefono')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white ${!funcionSeleccionada ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  placeholder="+54 9 11 1234-5678"
                  disabled={!funcionSeleccionada}
                />
              </div>

              {/* Cantidad de tickets */}
              <div>
                <label htmlFor="cantidad_tickets" className="block text-sm font-medium text-gray-700">
                  Cantidad de tickets *
                </label>
                <input
                  type="number"
                  id="cantidad_tickets"
                  {...register('cantidad_tickets', { valueAsNumber: true })}
                  required
                  min="1"
                  max={capacidadDisponible + ticketsActuales}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white ${!capacidadSuficiente ? 'border-red-300' : ''} ${!funcionSeleccionada ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  disabled={!funcionSeleccionada}
                />
                {!capacidadSuficiente && (
                  <p className="mt-1 text-sm text-red-600">
                    No hay suficiente capacidad. Máximo disponible: {capacidadDisponible + ticketsActuales}
                  </p>
                )}
                {/* Solo mostrar el máximo disponible si hay función seleccionada */}
                {selectedFuncionId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Máximo disponible: {capacidadDisponible + ticketsActuales} tickets
                  </p>
                )}
                {errors.cantidad_tickets && (
                  <p className="mt-1 text-sm text-red-600">{errors.cantidad_tickets.message}</p>
                )}
              </div>

              {/* Colaborador */}
              <div>
                <label htmlFor="colaborador_id" className="block text-sm font-medium text-gray-700">
                  Colaborador (opcional)
                </label>
                {profile?.role === 'colaborador' ? (
                  <>
                    <input type="hidden" {...register('colaborador_id')} value={profile.id} />
                    <div className="mt-1 text-gray-800 bg-gray-100 rounded px-3 py-2">
                      {profile.full_name || ''} ({profile.email})
                    </div>
                  </>
                ) : (
                  <select
                    id="colaborador_id"
                    {...register('colaborador_id')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white ${!funcionSeleccionada ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                    disabled={!funcionSeleccionada}
                  >
                    <option value="">Sin colaborador</option>
                    {colaboradores.map((colaborador) => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nombre} ({colaborador.email})
                      </option>
                    ))}
                  </select>
                )}
                {loadingColaboradores && (
                  <p className="mt-1 text-xs text-gray-500">Cargando colaboradores...</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading || !capacidadSuficiente}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium"
              >
                {formLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 