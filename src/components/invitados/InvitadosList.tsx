'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import InvitadoModal from './InvitadoModal';
import TicketsList from '../tickets/TicketsList';
import { Invitado, InvitadoWithRelations, InvitadoStats } from '@/types/invitados';
import useSWR from 'swr';

interface FuncionOption {
  id: string;
  nombre: string;
  fecha: string;
}

interface InvitadosListProps {
  funcionId?: string; // Si se proporciona, solo muestra invitados de esa función
  showStats?: boolean; // Si mostrar estadísticas
}

// Helper para obtener la función relacionada
function getFuncion(obj: {
  funciones?: {
    id: string;
    nombre: string;
    fecha: string;
    capacidad_total: number;
    precio_entrada: number;
  } | {
    id: string;
    nombre: string;
    fecha: string;
    capacidad_total: number;
    precio_entrada: number;
  }[];
}) {
  if (!obj) return undefined;
  if (Array.isArray(obj.funciones)) return obj.funciones[0];
  if (typeof obj.funciones === 'object') return obj.funciones;
  return undefined;
}

// Helper para extraer colaborador del resultado de Supabase
function extractColaborador(i: InvitadoWithRelations & { colaboradores?: { id: string; nombre: string; email: string } | { id: string; nombre: string; email: string }[] }) {
  if (Array.isArray(i.colaboradores)) return i.colaboradores[0] || undefined;
  if (typeof i.colaboradores === 'object') return i.colaboradores;
  return undefined;
}

export default function InvitadosList({ funcionId: propFuncionId, showStats = true }: InvitadosListProps) {
  // Estados para modales y selección
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvitado, setSelectedInvitado] = useState<Invitado | null>(null);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [selectedInvitadoForTickets, setSelectedInvitadoForTickets] = useState<Invitado | null>(null);
  // Eliminar el estado y setStats
  // const [stats, setStats] = useState<InvitadoStats | null>(null);
  const [funcionId, setFuncionId] = useState<string | undefined>(propFuncionId);
  const [funciones, setFunciones] = useState<FuncionOption[]>([]);
  const [error, setError] = useState('');

  // Fetch funciones (sin SWR por ser pequeño y estático)
  useEffect(() => {
    fetchFunciones();
  }, []);
  const fetchFunciones = async () => {
    const { data, error } = await supabase
      .from('funciones')
      .select('id, nombre, fecha')
      .order('fecha', { ascending: true });
    if (!error && data) {
      setFunciones(data);
    }
  };

  // Helper para formatear fecha y hora
  function formatFechaHora(fechaString: string) {
    const date = new Date(fechaString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} de ${month} ${year} ${hours}:${minutes} hs`;
  }

  // Fetch invitados con SWR
  const fetchInvitados = async (funcionId?: string) => {
    let query = supabase
      .from('invitados')
      .select('id, funcion_id, colaborador_id, nombre, email, telefono, cantidad_tickets, created_at, updated_at, funciones (id, nombre, fecha, capacidad_total, precio_entrada), colaboradores (id, nombre, email)')
      .order('created_at', { ascending: false });
    if (funcionId) {
      query = query.eq('funcion_id', funcionId);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((i: InvitadoWithRelations & { colaboradores?: { id: string; nombre: string; email: string } | { id: string; nombre: string; email: string }[] }) => ({
      ...i,
      email: i.email || '',
      telefono: i.telefono || '',
      colaborador_id: i.colaborador_id || undefined,
      created_at: i.created_at || '',
      updated_at: i.updated_at || '',
      funciones: i.funciones,
      colaborador: extractColaborador(i),
    }));
  };
  const { data: invitados = [], isLoading, mutate } = useSWR(['invitados', funcionId], () => fetchInvitados(funcionId));

  // Mueve el useMemo aquí, después de invitados
  // Reemplazar el cálculo de stats por useMemo
  const stats = useMemo(() => {
    if (!showStats) return null;
    let totalInvitados = invitados.length;
    let totalTickets = invitados.reduce((sum, invitado) => sum + Number(invitado.cantidad_tickets), 0);
    let capacidadDisponible: number | null = null;
    let porcentajeOcupacion: number | null = null;
    let capacidadTotal: number | null = null;
    if (funcionId && invitados.length > 0 && invitados[0].funciones && invitados[0].funciones[0]) {
      capacidadTotal = Number(invitados[0].funciones[0].capacidad_total) || null;
    }
    if (funcionId && capacidadTotal !== null && capacidadTotal > 0) {
      capacidadDisponible = Math.max(0, capacidadTotal - totalTickets);
      porcentajeOcupacion = Math.round((totalTickets / capacidadTotal) * 100);
    }
    return {
      total_invitados: totalInvitados,
      total_tickets: totalTickets,
      capacidad_disponible: capacidadDisponible,
      porcentaje_ocupacion: porcentajeOcupacion
    };
  }, [invitados, funcionId, showStats]);

  // Calcular estadísticas si se solicita
  useEffect(() => {
    if (!showStats) return;
    if (funcionId && invitados.length === 0) {
      // Si no hay invitados pero hay funcionId, obtener la capacidad de la función
      (async () => {
        const { data: funcionData, error: funcionError } = await supabase
          .from('funciones')
          .select('capacidad_total')
          .eq('id', funcionId)
          .single();
        if (!funcionError && funcionData) {
          // calculateStats([], funcionData.capacidad_total); // This line is no longer needed
        } else {
          // calculateStats([], null); // This line is no longer needed
        }
      })();
    } else {
      // Si hay invitados, usa la capacidad de la función del primer invitado
      // const capacidad = funcionId && invitados.length > 0 && invitados[0].funciones && invitados[0].funciones[0]
      //   ? Number(invitados[0].funciones[0].capacidad_total) || null
      //   : null;
      // calculateStats(invitados, capacidad); // This line is no longer needed
    }
  }, [invitados, funcionId, showStats]); // Removed calculateStats from dependency array

  // Eliminar loading de invitados, ahora es isLoading de SWR

  // Eliminar fetchInvitados, setInvitados, setLoading, etc. (ya no se usan)

  // handleDelete debe mutar SWR
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este invitado?')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('invitados')
        .delete()
        .eq('id', id);
      if (error) {
        setError(error.message);
        return;
      }
      mutate(); // Refrescar lista
    } catch (err) {
      setError('Error al eliminar el invitado');
      console.error('Error deleting invitado:', err);
    }
  };

  const handleCreate = () => {
    setSelectedInvitado(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invitado: Invitado) => {
    setSelectedInvitado(invitado);
    setIsModalOpen(true);
  };

  // handleModalSuccess debe mutar SWR
  const handleModalSuccess = () => {
    mutate();
  };

  const handleViewTickets = (invitado: Invitado) => {
    setSelectedInvitadoForTickets(invitado);
    setIsTicketsModalOpen(true);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de función */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por función</label>
        <select
          value={funcionId || ''}
          onChange={e => setFuncionId(e.target.value || undefined)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
        >
          <option value="">Todas las funciones</option>
          {funciones.map(f => (
            <option key={f.id} value={f.id}>
              {f.nombre}, {f.fecha ? formatFechaHora(f.fecha) : ''}
            </option>
          ))}
        </select>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {funcionId ? (() => {
              const funcion = funciones.find(f => f.id === funcionId);
              return funcion ? `${funcion.nombre} - ${formatFechaHora(funcion.fecha)}` : 'Función';
            })() : 'Todos los Invitados'}
          </h2>
          <p className="text-gray-600">
            {funcionId ? 'Gestiona los invitados de esta función específica' : 'Gestiona todos los invitados del sistema'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Agregar Invitado
        </button>
      </div>

      {/* Estadísticas */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Invitados</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_invitados}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_tickets}</div>
          </div>
          {funcionId && (
            <>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Capacidad Disponible</div>
                <div className="text-2xl font-bold text-green-600">
                  {typeof stats.capacidad_disponible === 'number' && !isNaN(stats.capacidad_disponible)
                    ? stats.capacidad_disponible
                    : 'N/A'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Ocupación</div>
                <div className="text-2xl font-bold text-blue-600">
                  {typeof stats.porcentaje_ocupacion === 'number' && !isNaN(stats.porcentaje_ocupacion)
                    ? `${stats.porcentaje_ocupacion}%`
                    : 'N/A'}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Email Message */}
      {/* Eliminar: {emailMessage && ( */}
      {/* Eliminar:   <div className={`rounded-md p-4 ${emailMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}> */}
      {/* Eliminar:     <div className={`text-sm ${emailMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}> */}
      {/* Eliminar:       {emailMessage.message} */}
      {/* Eliminar:     </div> */}
      {/* Eliminar:   </div> */}
      {/* Eliminar: )} */}

      {/* Lista de invitados */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {invitados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay invitados</h3>
            <p className="text-gray-500 mb-4">
              {funcionId ? 'Aún no se han agregado invitados a esta función.' : 'Aún no se han agregado invitados al sistema.'}
            </p>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Agregar primer invitado
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {invitados.map((invitado) => (
              <li key={invitado.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {invitado.nombre}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {invitado.cantidad_tickets} ticket{invitado.cantidad_tickets !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          {invitado.email || 'Sin email'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-2 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          {invitado.telefono || 'Sin teléfono'}
                        </div>
                      </div>

                      {!funcionId && getFuncion(invitado) && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Función:</span> {getFuncion(invitado)?.nombre} - {formatDate(getFuncion(invitado)?.fecha || '')}
                          </p>
                        </div>
                      )}

                      {invitado.colaborador && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Colaborador:</span> {invitado.colaborador.nombre}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleEdit(invitado)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleViewTickets(invitado)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Ver Tickets
                      </button>
                      <button
                        onClick={() => handleDelete(invitado.id!)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de Invitado */}
      <InvitadoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invitado={selectedInvitado}
        onSuccess={handleModalSuccess}
        funcionId={funcionId}
      />

      {/* Modal de Tickets */}
      {isTicketsModalOpen && selectedInvitadoForTickets && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsTicketsModalOpen(false)}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Tickets de {selectedInvitadoForTickets.nombre}
                  </h3>
                  <button
                    onClick={() => setIsTicketsModalOpen(false)}
                    className="rounded-full p-1 text-blue-100 hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-96 overflow-y-auto">
                <TicketsList
                  invitadoId={selectedInvitadoForTickets.id!}
                  invitadoNombre={selectedInvitadoForTickets.nombre}
                  invitadoEmail={selectedInvitadoForTickets.email || ''}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 