"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';

export default function TicketPage() {
  const params = useParams();
  const ticketId = typeof params.id === 'string' ? params.id : params.id?.[0];
  const { user, profile, loading } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!ticketId) {
      setError('ID de ticket inválido o no especificado.');
      return;
    }
    const fetchTicket = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, usado, invitado_id, funcion_id, invitados(nombre, email), funciones(nombre, fecha, ubicacion)')
        .eq('id', ticketId)
        .single();
      console.log('TicketId:', ticketId, 'Data:', data, 'Error:', error);
      if (error || !data) {
        setError('Ticket no encontrado o error de base de datos.');
      } else {
        setTicket(data);
      }
    };
    fetchTicket();
  }, [ticketId]);

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
  if (!ticket) {
    return <div className="p-8 text-center text-gray-600">Cargando ticket...</div>;
  }

  const invitado = Array.isArray(ticket.invitados) ? ticket.invitados[0] : ticket.invitados;
  const funcion = Array.isArray(ticket.funciones) ? ticket.funciones[0] : ticket.funciones;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/ticket/${ticketId}`;

  const canValidate = (profile?.role === 'admin' || profile?.role === 'colaborador') && !ticket.usado;

  const handleValidateTicket = async () => {
    setValidating(true);
    const { error } = await supabase
      .from('tickets')
      .update({ usado: true })
      .eq('id', ticketId);
    setValidating(false);
    if (!error) {
      setTicket({ ...ticket, usado: true });
    } else {
      alert('Error al validar el ticket');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">El escandalo - Artespacio</h1>
      <div className="mb-6 flex justify-center items-center">
        <QRCodeCanvas id="ticket-qr-canvas" value={ticketUrl} size={220} />
        <div className="mt-2 text-xs text-gray-500 text-center w-full">ID de ticket: ...{ticketId?.slice(-4)}</div>
        <button
          onClick={() => {
            const canvas = document.getElementById('ticket-qr-canvas')?.querySelector('canvas') || document.querySelector('#ticket-qr-canvas');
            if (canvas && canvas.toDataURL) {
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
      {canValidate && (
        <button onClick={handleValidateTicket} disabled={validating} className="bg-green-600 text-white px-4 py-2 rounded w-full mb-4 font-semibold text-lg">
          {validating ? 'Validando...' : 'Validar ticket'}
        </button>
      )}
      <div className="mt-6 text-center">
        <a href={`https://wa.me/?text=${encodeURIComponent('Te comparto tu invitación: ' + ticketUrl)}`} target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-medium">Compartir por WhatsApp</a>
      </div>
    </div>
  );
} 