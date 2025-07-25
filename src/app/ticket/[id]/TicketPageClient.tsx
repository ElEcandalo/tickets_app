"use client";
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface TicketPageData {
  id: string;
  usado: boolean;
  invitado_id: string;
  funcion_id: string;
  invitados?: { nombre?: string; email?: string } | { nombre?: string; email?: string }[];
  funciones?: { nombre?: string; fecha?: string; ubicacion?: string; imagen_url?: string } | { nombre?: string; fecha?: string; ubicacion?: string; imagen_url?: string }[];
}

export default function TicketPageClient({ ticket, ticketId }: { ticket: TicketPageData; ticketId: string }) {
  const { profile } = useAuth();
  const [localTicket, setLocalTicket] = useState<TicketPageData>(ticket);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const invitado = Array.isArray(localTicket.invitados) ? localTicket.invitados[0] : localTicket.invitados;
  const funcion = Array.isArray(localTicket.funciones) ? localTicket.funciones[0] : localTicket.funciones;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/ticket/${ticketId}`;

  const canValidate = (profile?.role === 'admin' || profile?.role === 'colaborador') && !localTicket.usado;

  const handleValidateTicket = async () => {
    setValidating(true);
    const { error } = await supabase
      .from('tickets')
      .update({ usado: true })
      .eq('id', ticketId);
    setValidating(false);
    if (!error) {
      setLocalTicket({ ...localTicket, usado: true });
    } else {
      setError('Error al validar el ticket');
    }
  };

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

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
        <div className="mb-1 text-base text-gray-800 text-center">Estado: {localTicket.usado ? <span className="text-red-600 font-bold">USADO</span> : <span className="text-green-600 font-bold">VÁLIDO</span>}</div>
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