'use client';

import { useState, useEffect, useCallback } from 'react';
import { TicketService, TicketWithDetails } from '@/services/ticketService';

interface TicketsCompactViewProps {
  invitadoId: string;
  invitadoNombre: string;
  invitadoEmail: string;
}

export default function TicketsCompactView({ invitadoId, invitadoNombre, invitadoEmail }: TicketsCompactViewProps) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const ticketsData = await TicketService.getTicketsByInvitado(invitadoId);
      setTickets(ticketsData);
    } catch (err) {
      console.error('❌ Error al cargar los tickets:', err);
      setError('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  }, [invitadoId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const generateTicketLink = (ticketId: string) => {
    // Generar un enlace que se puede usar para validar el ticket
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/validate-ticket/${ticketId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  const stats = {
    total: tickets.length,
    usados: tickets.filter(t => t.usado).length,
    disponibles: tickets.filter(t => !t.usado).length
  };

  return (
    <div className="space-y-4">
      {/* Header con información del invitado */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tickets de {invitadoNombre}</h3>
            <p className="text-sm text-gray-600">{invitadoEmail}</p>
          </div>
          <div className="text-sm text-gray-500">
            Vista Optimizada
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.disponibles}</div>
            <div className="text-xs text-gray-500">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.usados}</div>
            <div className="text-xs text-gray-500">Usados</div>
          </div>
        </div>
        
        {/* Botón de reenvío */}
        {/* Eliminar resendingEmail, handleResendEmail y el botón de reenviar email */}
      </div>

      {/* Lista de tickets optimizada */}
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tickets</h3>
          <p className="text-gray-500">Aún no se han generado tickets para este invitado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Función
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enlace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{ticket.funcion?.nombre}</div>
                        <div className="text-xs text-gray-400">
                          {ticket.funcion?.fecha ? formatDate(ticket.funcion.fecha) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.usado 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.usado ? 'Usado' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          const link = generateTicketLink(ticket.id);
                          navigator.clipboard.writeText(link);
                          alert('Enlace copiado al portapapeles');
                        }}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        title="Copiar enlace de validación"
                      >
                        Copiar Enlace
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.created_at ? formatDate(ticket.created_at) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Vista Optimizada</h4>
        <p className="text-sm text-blue-700">
          Esta vista está optimizada para mostrar muchos tickets sin generar códigos QR. 
          Puedes copiar los enlaces de validación para compartir con los invitados.
        </p>
      </div>
    </div>
  );
} 