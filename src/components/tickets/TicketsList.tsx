'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { TicketService, TicketWithDetails } from '@/services/ticketService';
import Image from 'next/image';
import TicketsCompactView from './TicketsCompactView';

interface TicketsListProps {
  invitadoId: string;
  invitadoNombre: string;
  invitadoEmail: string;
}

const TICKETS_PER_PAGE = 5;

export default function TicketsList({ invitadoId, invitadoNombre, invitadoEmail }: TicketsListProps) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'optimized'>('compact');

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando tickets para invitado:', invitadoId);
      const ticketsData = await TicketService.getTicketsByInvitado(invitadoId);
      console.log('📋 Tickets encontrados:', ticketsData.length);
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

  const handleResendEmail = async () => {
    try {
      setResendingEmail(true);
      await TicketService.resendTicketEmail(invitadoId);
      alert('Email reenviado exitosamente');
    } catch (err) {
      setError('Error al reenviar el email');
      console.error('Error resending email:', err);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleShowQR = async (ticketId: string) => {
    console.log('🔍 handleShowQR llamado con ticketId:', ticketId);
    console.log('🔍 showQR actual:', showQR);
    console.log('🔍 qrCodes en cache:', Object.keys(qrCodes));
    
    if (showQR === ticketId) {
      console.log('🔍 Ocultando QR para ticket:', ticketId);
      setShowQR(null);
      return;
    }

    try {
      console.log('🔍 Iniciando generación de QR para ticket:', ticketId);
      setGeneratingQR(ticketId);
      
      // Generar QR si no existe en cache
      if (!qrCodes[ticketId]) {
        console.log('🔍 QR no está en cache, generando...');
        const qrCode = await TicketService.generateQRForTicket(ticketId);
        console.log('🔍 QR generado exitosamente, longitud:', qrCode.length);
        setQrCodes(prev => ({ ...prev, [ticketId]: qrCode }));
      } else {
        console.log('🔍 QR encontrado en cache');
      }
      
      setShowQR(ticketId);
      console.log('🔍 QR mostrado para ticket:', ticketId);
    } catch (err) {
      console.error('❌ Error generating QR:', err);
      setError('Error al generar el código QR');
    } finally {
      setGeneratingQR(null);
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

  // Paginación
  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
  const endIndex = startIndex + TICKETS_PER_PAGE;
  const currentTickets = tickets.slice(startIndex, endIndex);

  // Auto-cambiar a vista optimizada si hay muchos tickets
  useEffect(() => {
    if (tickets.length > 10 && viewMode !== 'optimized') {
      setViewMode('optimized');
    }
  }, [tickets.length, viewMode]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = tickets.length;
    const usados = tickets.filter(t => t.usado).length;
    const disponibles = total - usados;
    return { total, usados, disponibles };
  }, [tickets]);

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

  return (
    <div className="space-y-4">
      {/* Header con información del invitado */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tickets de {invitadoNombre}</h3>
            <p className="text-sm text-gray-600">{invitadoEmail}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (viewMode === 'compact') setViewMode('detailed');
                else if (viewMode === 'detailed') setViewMode('optimized');
                else setViewMode('compact');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border"
            >
              {viewMode === 'compact' ? 'Vista Detallada' : 
               viewMode === 'detailed' ? 'Vista Optimizada' : 'Vista Compacta'}
            </button>
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
        <button
          onClick={handleResendEmail}
          disabled={resendingEmail || !invitadoEmail}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {resendingEmail ? 'Reenviando...' : 'Reenviar Email con Tickets'}
        </button>
      </div>

      {/* Lista de tickets */}
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tickets</h3>
          <p className="text-gray-500">Aún no se han generado tickets para este invitado.</p>
        </div>
      ) : (
        <>
          {/* Vista Optimizada */}
          {viewMode === 'optimized' && (
            <TicketsCompactView 
              invitadoId={invitadoId}
              invitadoNombre={invitadoNombre}
              invitadoEmail={invitadoEmail}
            />
          )}

          {/* Vista Compacta */}
          {viewMode === 'compact' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Función
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTickets.map((ticket, index) => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.funcion?.nombre}
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
                            onClick={() => handleShowQR(ticket.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            disabled={generatingQR === ticket.id}
                          >
                            {generatingQR === ticket.id ? 'Generando...' : 'Ver QR'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista Detallada */}
          {viewMode === 'detailed' && (
            <div className="grid gap-4">
              {currentTickets.map((ticket, index) => (
                <div key={ticket.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">
                        Ticket #{startIndex + index + 1}
                      </h4>
                      {ticket.funcion && (
                        <p className="text-sm text-gray-600">
                          {ticket.funcion.nombre} - {formatDate(ticket.funcion.fecha)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.usado 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.usado ? 'Usado' : 'Disponible'}
                      </span>
                      <button
                        onClick={() => handleShowQR(ticket.id)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        disabled={generatingQR === ticket.id}
                      >
                        {generatingQR === ticket.id ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-1"></div>
                            Generando...
                          </span>
                        ) : showQR === ticket.id ? 'Ocultar QR' : 'Ver QR'}
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  {showQR === ticket.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-center">
                        <div className="text-center">
                          <div className="bg-white p-2 rounded-lg inline-block">
                            <Image
                              src={qrCodes[ticket.id] || ''}
                              alt={`QR Code Ticket ${startIndex + index + 1}`}
                              width={150}
                              height={150}
                              className="rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Código QR único para validación
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Creado: {formatDate(ticket.created_at || '')}</p>
                    {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
                      <p>Actualizado: {formatDate(ticket.updated_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación - solo para vistas compact y detailed */}
          {totalPages > 1 && viewMode !== 'optimized' && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(endIndex, tickets.length)}</span> de{' '}
                    <span className="font-medium">{tickets.length}</span> tickets
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 