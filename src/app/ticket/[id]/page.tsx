import { supabase } from '@/lib/supabaseClient';
import { Metadata } from 'next';
import TicketPageClient from './TicketPageClient';

// Definir tipo TicketPageData para el estado ticket
interface TicketPageData {
  id: string;
  usado: boolean;
  invitado_id: string;
  funcion_id: string;
  invitados?: { nombre?: string; email?: string } | { nombre?: string; email?: string }[];
  funciones?: { nombre?: string; fecha?: string; ubicacion?: string; imagen_url?: string } | { nombre?: string; fecha?: string; ubicacion?: string; imagen_url?: string }[];
}

// Función para obtener datos del ticket desde el servidor (SSR)
async function getTicketData(ticketId: string): Promise<TicketPageData | null> {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, usado, invitado_id, funcion_id, invitados(nombre, email), funciones(nombre, fecha, ubicacion, imagen_url)')
    .eq('id', ticketId)
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { id: string | string[] } }): Promise<Metadata> {
  const ticketId = typeof params.id === 'string' ? params.id : params.id?.[0];
  if (!ticketId) {
    return {
      title: 'Ticket no encontrado',
      description: 'No se encontró el ticket solicitado.',
    };
  }
  const ticket = await getTicketData(ticketId);
  if (!ticket) {
    return {
      title: 'Ticket no encontrado',
      description: 'No se encontró el ticket solicitado.',
    };
  }
  const invitado = Array.isArray(ticket.invitados) ? ticket.invitados[0] : ticket.invitados;
  const funcion = Array.isArray(ticket.funciones) ? ticket.funciones[0] : ticket.funciones;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/ticket/${ticketId}`;
  return {
    title: `Invitación para ${invitado?.nombre || 'Invitado'} - ${funcion?.nombre || 'Función'}`,
    description: `Invitación para ${invitado?.nombre || 'Invitado'} a la función "${funcion?.nombre || ''}" el ${funcion?.fecha ? new Date(funcion.fecha).toLocaleString('es-AR') : '-'} en ${funcion?.ubicacion || ''}.`,
    openGraph: {
      title: `Invitación para ${invitado?.nombre || 'Invitado'} - ${funcion?.nombre || 'Función'}`,
      description: `Invitación para ${invitado?.nombre || 'Invitado'} a la función "${funcion?.nombre || ''}" el ${funcion?.fecha ? new Date(funcion.fecha).toLocaleString('es-AR') : '-'} en ${funcion?.ubicacion || ''}.`,
      url: ticketUrl,
      images: [
        {
          url: funcion?.imagen_url || `${baseUrl}/logo.png`,
          width: 800,
          height: 600,
          alt: funcion?.nombre || 'Función',
        },
      ],
    },
  };
}

// Componente server que obtiene los datos y renderiza el cliente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function TicketPage(props: any) {
  const { params } = props;
  const ticketId = params.id;
  if (!ticketId) {
    return <div className="p-8 text-center text-red-600">ID de ticket inválido o no especificado.</div>;
  }
  const ticket = await getTicketData(ticketId);
  if (!ticket) {
    return <div className="p-8 text-center text-red-600">Ticket no encontrado o error de base de datos.</div>;
  }
  return <TicketPageClient ticket={ticket} ticketId={ticketId} />;
} 