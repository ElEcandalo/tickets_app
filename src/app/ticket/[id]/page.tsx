'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

interface TicketPageData {
  id: string;
  usado: boolean;
  invitado_id: string;
  funcion_id: string;
  invitados?: { nombre?: string; email?: string } | { nombre?: string; email?: string }[];
  funciones?: { nombre?: string; fecha?: string; ubicacion?: string; imagen_url?: string } | { nombre?: string; fecha?: string; ubicacion?: string; imagen_url?: string }[];
}

const fetchTicket = async (id: string): Promise<TicketPageData | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, usado, invitado_id, funcion_id, invitados(nombre, email), funciones(nombre, fecha, ubicacion, imagen_url)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
};

export default function TicketPage() {
  const params = useParams();
  const ticketId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { data: ticket, error, isLoading } = useSWR(ticketId ? ['ticket', ticketId] : null, () => fetchTicket(ticketId));

  if (!ticketId) {
    return <div className="p-8 text-center text-red-600">ID de ticket inválido o no especificado.</div>;
  }
  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Cargando ticket...</div>;
  }
  if (error || !ticket) {
    return <div className="p-8 text-center text-red-600">Ticket no encontrado o error de base de datos.</div>;
  }

  const invitado = Array.isArray(ticket.invitados) ? ticket.invitados[0] : ticket.invitados;
  const funcion = Array.isArray(ticket.funciones) ? ticket.funciones[0] : ticket.funciones;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/ticket/${ticketId}`;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">El escandalo - Artespacio</h1>
      <div className="mb-6 flex justify-center items-center">
        <QRCodeCanvas id="ticket-qr-canvas" value={ticketUrl} size={220} />
        <div className="mt-2 text-xs text-gray-500 text-center w-full">ID de ticket: ...{ticketId?.slice(-4)}</div>
        <button
          onClick={() => {
            const canvas = document.getElementById('ticket-qr-canvas')?.querySelector('canvas') || document.querySelector('#ticket-qr-canvas');
            if (canvas && canvas instanceof HTMLCanvasElement) {
              const link = document.createElement('a');
              link.download = `ticket_qr_${ticketId}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
            } else {
              alert('No se encontró el QR para descargar');
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mt-2 mx-auto block"
        >
          Descargar QR
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 mb-4">
        <div className="mb-2 text-lg font-bold text-gray-900 text-center">Invitado: <span className="font-semibold">{invitado?.nombre || 'Desconocido'}</span></div>
        <div className="mb-1 text-base text-gray-800 text-center">Obra: <span className="font-semibold">{funcion?.nombre}</span></div>
        <div className="mb-1 text-base text-gray-800 text-center">Fecha: <span className="font-semibold">{funcion?.fecha ? new Date(funcion.fecha).toLocaleString('es-AR') : '-'}</span></div>
        <div className="mb-1 text-base text-gray-800 text-center">Lugar: <span className="font-semibold">{funcion?.ubicacion}</span></div>
        <div className="mb-1 text-base text-gray-800 text-center">Estado: {ticket.usado ? <span className="text-red-600 font-bold">USADO</span> : <span className="text-green-600 font-bold">VÁLIDO</span>}</div>
      </div>
      <div className="mt-6 text-center">
        <a href={`https://wa.me/?text=${encodeURIComponent('Te comparto tu invitación: ' + ticketUrl)}`} target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-medium">Compartir por WhatsApp</a>
      </div>
      <div className="mt-4 text-center">
        <a href="/admin/invitados-extracto" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold inline-block">Ir a impresión de invitados</a>
      </div>
    </div>
  );
}
